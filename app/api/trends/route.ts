/**
 * API Route for Trend Data
 * 
 * Reads latest JSON from fake_trends.json
 */

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { TrendOutput } from '@/crawler/deepresearch_schema';

// Path to the JSON data file
const JSON_PATH = path.join(process.cwd(), 'data', 'fake_trends.json');

export async function GET() {
  try {
    // Check if the JSON file exists
    if (fs.existsSync(JSON_PATH)) {
      // Read and parse the JSON file
      const trendData: TrendOutput = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'));
      return NextResponse.json(trendData);
    } else {
      // Return a 404 if the file doesn't exist
      return NextResponse.json(
        { error: 'No trend data available. Run the crawler first.' },
        { status: 404 }
      );
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
