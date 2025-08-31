#!/bin/bash

# Pontje Pakker Daily Data Extraction Scheduler
# Runs the data extraction script daily at 6:00 AM UTC

echo "🚢 Pontje Pakker Daily Scheduler Started"
echo "Running from current directory"
echo "Script: src/extract-data.ts"
echo "Will run daily at 6:00 AM UTC"
echo "Press Ctrl+C to stop"
echo ""

# Function to calculate seconds until 6am tomorrow
calculate_sleep_seconds() {
    # Get tomorrow's date at 6:00 AM UTC
    tomorrow_6am=$(date -u -d "tomorrow 06:00" +%s)
    # Get current time in seconds
    current_time=$(date -u +%s)
    # Calculate difference
    echo $((tomorrow_6am - current_time))
}

# Function to run the data extraction
run_extraction() {
    echo "$(date): Starting import and data extraction..."
    npx tsx src/import.ts
    npx tsx src/extract-data.ts
    
    if [ $? -eq 0 ]; then
        echo "$(date): Data extraction completed successfully"
    else
        echo "$(date): Data extraction failed!"
    fi
    echo ""
}

# Main loop
while true; do
    # Run the extraction
    run_extraction

    # Calculate how long to sleep until 6am tomorrow
    sleep_seconds=$(calculate_sleep_seconds)
    
    echo "$(date): Sleeping for $sleep_seconds seconds until 6:00 AM UTC tomorrow"
    sleep "$sleep_seconds"
done