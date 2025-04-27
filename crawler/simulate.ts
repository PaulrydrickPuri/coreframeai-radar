/**
 * Trend-Crawler Simulator (Simplified Version)
 * 
 * This script:
 * 1. Reads seeds.sample.json
 * 2. Generates 20 random trend rows
 * 3. Saves to data/fake_trends.json
 */

import fs from 'fs';
import path from 'path';
import { DeepResearchInput, TrendItem, TrendOutput } from './deepresearch_schema';

// Paths
const SEEDS_PATH = path.join(process.cwd(), 'crawler', 'seeds.sample.json');
const OUTPUT_JSON_PATH = path.join(process.cwd(), 'data', 'fake_trends.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
  fs.mkdirSync(path.join(process.cwd(), 'data'));
}

// Read seed data
const seedData: DeepResearchInput = JSON.parse(
  fs.readFileSync(SEEDS_PATH, 'utf-8')
);

// Generate random trend data
function generateTrendData(): TrendItem[] {
  const trends: TrendItem[] = [];
  const now = new Date().toISOString();
  
  // Generate 10 surface-level trends
  for (let i = 0; i < 10; i++) {
    const randomHashtag = seedData.seed_hashtags[Math.floor(Math.random() * seedData.seed_hashtags.length)];
    trends.push({
      tag: randomHashtag,
      surface_level: "mass",
      count: Math.floor(Math.random() * 10000) + 1000,
      velocity: Math.floor(Math.random() * 200) - 100, // Can be negative
      ts: now
    });
  }
  
  // Generate 10 deep-level trends
  for (let i = 0; i < 10; i++) {
    // Mix hashtags with keywords for deep trends
    const useKeyword = Math.random() > 0.5;
    let tag: string;
    
    if (useKeyword) {
      const keyword = seedData.target_keywords[Math.floor(Math.random() * seedData.target_keywords.length)];
      tag = "#" + keyword.toLowerCase().replace(/\s+/g, '');
    } else {
      // Create compound hashtags for deep trends
      const baseTag = seedData.seed_hashtags[Math.floor(Math.random() * seedData.seed_hashtags.length)];
      const suffix = seedData.target_keywords[Math.floor(Math.random() * seedData.target_keywords.length)];
      tag = baseTag + suffix.toLowerCase().replace(/\s+/g, '');
    }
    
    trends.push({
      tag,
      surface_level: "deep",
      count: Math.floor(Math.random() * 1000) + 100, // Deep trends have lower counts
      velocity: Math.floor(Math.random() * 200) - 50, // More likely to be positive
      ts: now
    });
  }
  
  return trends;
}

// Format data for API response
function formatTrendsForApi(trends: TrendItem[]): TrendOutput {
  const surface = trends
    .filter(t => t.surface_level === "mass")
    .map(({ tag, count, velocity }) => ({ tag, count, velocity }))
    .sort((a, b) => b.count - a.count);
    
  const deep = trends
    .filter(t => t.surface_level === "deep")
    .map(({ tag, count, velocity }) => ({ tag, count, velocity }))
    .sort((a, b) => b.count - a.count);
  
  return {
    generated_at: new Date().toISOString(),
    surface,
    deep
  };
}

// Main function
function main() {
  try {
    console.log("Generating trend data...");
    const trends = generateTrendData();
    
    console.log("Formatting for API...");
    const apiData = formatTrendsForApi(trends);
    
    console.log("Writing to JSON file...");
    fs.writeFileSync(OUTPUT_JSON_PATH, JSON.stringify(apiData, null, 2));
    
    console.log("Simulation complete!");
    console.log(`- Generated ${trends.length} trend items`);
    console.log(`- JSON snapshot saved to ${OUTPUT_JSON_PATH}`);
    
  } catch (error) {
    console.error("Error in simulation:", error);
    process.exit(1);
  }
}

// Run the simulation
main();
