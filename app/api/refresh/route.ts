/**
 * API endpoint for manual refresh of trend data
 * Triggers a manual scrape of trend data when called
 */

import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

// Promisify exec for async/await usage
const execAsync = promisify(exec);

export async function GET() {
  try {
    // Immediately capture the current timestamp
    const currentTimestamp = new Date().toISOString();
    console.log('Manual refresh triggered at', currentTimestamp);
    
    // Return success response with current timestamp immediately
    // This ensures the UI updates right away
    const response = NextResponse.json({
      success: true,
      message: 'Manual refresh initiated',
      timestamp: currentTimestamp,
    });
    
    // Start the scraping process in the background
    // This won't block the response
    (async () => {
      try {
        // Get the project root path
        const projectRoot = process.cwd();
        
        // Path to the scraper script
        const scraperPath = path.join(projectRoot, 'crawler', 'realScrape.ts');
        
        console.log('Starting scraper in background...');
        
        // Execute the scraper script
        // Note: This requires the BLOB_READ_WRITE_TOKEN env variable to be set
        const { stdout, stderr } = await execAsync(`npx tsx ${scraperPath}`, {
          env: {
            ...process.env,
            // Add any additional environment variables needed
            NODE_ENV: 'production',
            USER_AGENT: 'CoreframeAI-Radar/1.0 (https://coreframeai.com/radar; radar@coreframeai.com)',
            REQUEST_DELAY_MS: '1000', // Faster for manual refresh
          },
        });
        
        if (stderr) {
          console.error('Scraper stderr:', stderr);
        }
        
        console.log('Scraper stdout:', stdout);
        console.log('Background scraping completed');
      } catch (bgError) {
        console.error('Error in background scraping:', bgError);
      }
    })();
    
    return response;
  } catch (error) {
    console.error('Error in manual refresh:', error);
    
    // Return error response
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to refresh trend data',
        message: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
