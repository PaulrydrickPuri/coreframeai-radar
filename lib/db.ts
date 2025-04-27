/**
 * Database Utility Module
 * 
 * Provides reusable database queries and functions for the trend data
 */

import BetterSqlite3 from 'better-sqlite3';
type Database = BetterSqlite3.Database;
import fs from 'fs';
import path from 'path';

// Database path
const DB_PATH = path.join(process.cwd(), 'data', 'trends.sqlite');
const FALLBACK_JSON_PATH = path.join(process.cwd(), 'data', 'latest_trends.json');

// Interface for trend data
export interface TrendItem {
  tag: string;
  count: number;
  velocity: number;
}

export interface TrendData {
  generated_at: string;
  surface: TrendItem[];
  deep: TrendItem[];
}

/**
 * Initialize database connection
 */
export function getDb(): Database | null {
  try {
    if (!fs.existsSync(DB_PATH)) {
      console.warn('Database file does not exist');
      return null;
    }
    
    return new BetterSqlite3(DB_PATH, { readonly: true });
  } catch (error) {
    console.error('Error connecting to database:', error);
    return null;
  }
}

/**
 * Get the latest timestamp from the database
 */
export function getLatestTimestamp(db: Database): string | null {
  try {
    const result = db.prepare(`
      SELECT MAX(ts) as latest_ts FROM trends
    `).get() as { latest_ts: string };
    
    return result?.latest_ts || null;
  } catch (error) {
    console.error('Error getting latest timestamp:', error);
    return null;
  }
}

/**
 * Get surface trends (most popular)
 */
export function getSurfaceTrends(db: Database, timestamp: string): TrendItem[] {
  try {
    return db.prepare(`
      SELECT tag, 
             SUM(count) as count,
             (SELECT SUM(count) FROM trends 
              WHERE tag = t.tag 
              AND ts = ? ) - 
             (SELECT COALESCE(SUM(count), 0) FROM trends 
              WHERE tag = t.tag 
              AND ts < ? 
              ORDER BY ts DESC LIMIT 1) as velocity
      FROM trends t
      WHERE ts = ?
      GROUP BY tag
      ORDER BY count DESC
      LIMIT 10
    `).all(timestamp, timestamp, timestamp)
    .map(row => ({
      tag: (row as any).tag,
      count: (row as any).count,
      velocity: (row as any).velocity || 0
    }));
  } catch (error) {
    console.error('Error getting surface trends:', error);
    return [];
  }
}

/**
 * Get deep trends (more niche, related to target keywords)
 */
export function getDeepTrends(db: Database, timestamp: string, keywords: string[]): TrendItem[] {
  try {
    if (keywords.length === 0) {
      return [];
    }
    
    const placeholders = keywords.map(() => 'tag LIKE ?').join(' OR ');
    const params = [
      timestamp, 
      timestamp, 
      timestamp, 
      ...keywords.map(keyword => `%${keyword.toLowerCase().replace(/\s+/g, '')}%`)
    ];
    
    return db.prepare(`
      SELECT tag, 
             SUM(count) as count,
             (SELECT SUM(count) FROM trends 
              WHERE tag = t.tag 
              AND ts = ? ) - 
             (SELECT COALESCE(SUM(count), 0) FROM trends 
              WHERE tag = t.tag 
              AND ts < ? 
              ORDER BY ts DESC LIMIT 1) as velocity
      FROM trends t
      WHERE ts = ?
      AND (${placeholders})
      GROUP BY tag
      ORDER BY count DESC
      LIMIT 10
    `).all(...params)
    .map(row => ({
      tag: (row as any).tag,
      count: (row as any).count,
      velocity: (row as any).velocity || 0
    }));
  } catch (error) {
    console.error('Error getting deep trends:', error);
    return [];
  }
}

/**
 * Get trend data from fallback JSON if database is not available
 */
export function getFallbackTrendData(): TrendData | null {
  try {
    if (fs.existsSync(FALLBACK_JSON_PATH)) {
      return JSON.parse(fs.readFileSync(FALLBACK_JSON_PATH, 'utf-8'));
    }
    return null;
  } catch (error) {
    console.error('Error reading fallback JSON:', error);
    return null;
  }
}

/**
 * Get the complete trend data (surface and deep trends)
 */
export function getTrendData(): TrendData | null {
  const db = getDb();
  
  if (!db) {
    return getFallbackTrendData();
  }
  
  try {
    const timestamp = getLatestTimestamp(db);
    
    if (!timestamp) {
      db.close();
      return getFallbackTrendData();
    }
    
    const surfaceTrends = getSurfaceTrends(db, timestamp);
    
    // Get keywords from the first few surface trends if we don't have any
    const keywords = surfaceTrends
      .slice(0, 3)
      .map(trend => trend.tag.replace('#', ''));
    
    const deepTrends = getDeepTrends(db, timestamp, keywords);
    
    const result: TrendData = {
      generated_at: timestamp,
      surface: surfaceTrends,
      deep: deepTrends
    };
    
    db.close();
    return result;
  } catch (error) {
    console.error('Error getting trend data:', error);
    if (db) db.close();
    return getFallbackTrendData();
  }
}
