#!/bin/bash
# GitHub Actions entrypoint for running the crawler simulation

set -e

# Navigate to project root
cd "$(dirname "$0")/.."

# Run the crawler simulation
echo "Running trend crawler simulation..."
npx tsx crawler/simulate.ts

echo "Simulation completed successfully!"
