#!/bin/bash
# GitHub Actions entrypoint for running the trend scraper

set -e

# Navigate to project root
cd "$(dirname "$0")/.."

# Run the real trend scraper
echo "Running trend data scraper..."
npx tsx crawler/realScrape.ts

echo "Scraping completed successfully!"
