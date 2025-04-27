/**
 * Vercel Blob Storage utility for CoreframeAI Radar
 * Handles storing and retrieving trend data from Vercel Blob Storage
 */

import { put, list, del, PutBlobResult } from '@vercel/blob';

// Constants
const TRENDS_BLOB_PREFIX = 'trends/';
const LATEST_TRENDS_FILENAME = 'latest_trends.json';

/**
 * Uploads trend data to Vercel Blob Storage
 * @param data The trend data to upload
 * @returns The blob URL
 */
export async function uploadTrendData(data: any): Promise<string> {
  try {
    // Convert data to JSON string
    const jsonData = JSON.stringify(data, null, 2);
    
    // Create a blob with the current timestamp and also update the latest file
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const filename = `${TRENDS_BLOB_PREFIX}trends_${timestamp}.json`;
    
    // Upload the timestamped version
    const blob = await put(filename, jsonData, {
      access: 'public',
      contentType: 'application/json',
    });
    
    // Also upload as latest_trends.json (overwriting previous version)
    await put(`${TRENDS_BLOB_PREFIX}${LATEST_TRENDS_FILENAME}`, jsonData, {
      access: 'public',
      contentType: 'application/json',
    });
    
    console.log(`Uploaded trend data to ${blob.url}`);
    return blob.url;
  } catch (error) {
    console.error('Error uploading trend data to Blob storage:', error);
    throw error;
  }
}

/**
 * Gets the latest trend data from Vercel Blob Storage
 * @returns The trend data as a JSON object
 */
export async function getLatestTrendData(): Promise<any> {
  try {
    // Fetch the latest trends file - we need a full URL here
    const blobList = await list({ prefix: TRENDS_BLOB_PREFIX });
    const latestBlob = blobList.blobs.find(blob => 
      blob.pathname === `${TRENDS_BLOB_PREFIX}${LATEST_TRENDS_FILENAME}`
    );
    
    if (!latestBlob) {
      console.warn('Latest trends blob not found');
      return null;
    }
    
    const response = await fetch(latestBlob.url);
    
    if (!response.ok) {
      console.error(`Failed to fetch latest trend data: ${response.status} ${response.statusText}`);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting latest trend data from Blob storage:', error);
    return null;
  }
}

/**
 * Lists all trend data blobs
 * @returns Array of blob info
 */
export async function listTrendDataBlobs() {
  try {
    const blobs = await list({ prefix: TRENDS_BLOB_PREFIX });
    return blobs.blobs;
  } catch (error) {
    console.error('Error listing trend data blobs:', error);
    return [];
  }
}

/**
 * Deletes old trend data blobs, keeping only the most recent ones
 * @param keepCount Number of recent blobs to keep
 */
export async function cleanupOldTrendData(keepCount: number = 24) {
  try {
    const blobs = await list({ prefix: TRENDS_BLOB_PREFIX });
    
    // Sort by timestamp (newest first)
    const sortedBlobs = blobs.blobs.sort((a, b) => 
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
    
    // Keep the latest file and the most recent N timestamped files
    const blobsToKeep = new Set([
      `${TRENDS_BLOB_PREFIX}${LATEST_TRENDS_FILENAME}`,
      ...sortedBlobs.slice(0, keepCount).map(blob => blob.pathname)
    ]);
    
    // Delete older blobs
    const deletionPromises = sortedBlobs
      .filter(blob => !blobsToKeep.has(blob.pathname))
      .map(blob => del(blob.url));
    
    await Promise.all(deletionPromises);
    
    console.log(`Cleaned up old trend data, kept ${keepCount} most recent entries`);
  } catch (error) {
    console.error('Error cleaning up old trend data:', error);
  }
}
