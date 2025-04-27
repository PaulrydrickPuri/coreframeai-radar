/**
 * API Route for Trend Data
 * 
 * Retrieves trend data from SQLite database with aggregation and velocity calculations
 * Falls back to latest_trends.json if database is unavailable
 */

import { NextResponse } from 'next/server';
import { getLatestTrendData } from '@/lib/blob';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Get trend data from Vercel Blob storage
    let trendData = await getLatestTrendData();
    
    // If no data in Blob storage, try to read from local JSON file
    if (!trendData) {
      const localJsonPath = path.join(process.cwd(), 'latest_trends.json');
      if (fs.existsSync(localJsonPath)) {
        try {
          const jsonData = fs.readFileSync(localJsonPath, 'utf-8');
          trendData = JSON.parse(jsonData);
          console.log('Using local JSON fallback for trend data');
        } catch (jsonError) {
          console.error('Error reading local JSON fallback:', jsonError);
        }
      }
    }
    
    if (trendData) {
      return NextResponse.json(trendData);
    } else {
      // Return sample data for initial deployment
      const sampleData = {
        generated_at: new Date().toISOString(),
        surface: [
          { tag: '#AI', count: 100, velocity: 5 },
          { tag: '#MachineLearning', count: 90, velocity: 3 },
          { tag: '#DataScience', count: 80, velocity: -2 },
          { tag: '#Python', count: 70, velocity: 1 },
          { tag: '#JavaScript', count: 60, velocity: 0 }
        ],
        deep: [
          { tag: '#Transformers', count: 50, velocity: 10 },
          { tag: '#NeuralNetworks', count: 40, velocity: 5 },
          { tag: '#DeepLearning', count: 30, velocity: 2 },
          { tag: '#ComputerVision', count: 20, velocity: -1 },
          { tag: '#NLP', count: 10, velocity: -3 }
        ]
      };
      
      console.log('Using sample data for initial deployment');
      return NextResponse.json(sampleData);
    }
  } catch (error) {
    // Return a 500 if there's an error
    console.error('Error in trends API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trend data' },
      { status: 500 }
    );
  }
}
