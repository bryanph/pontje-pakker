#!/bin/bash

# Pontje Pakker Daily Data Extraction Scheduler
# Runs the data extraction script daily at 8:00 AM

echo "🚢 Pontje Pakker Daily Scheduler Started"
echo "Running from current directory"
echo "Script: src/extract-data.ts"
echo "Will run daily at 8:00 AM"
echo "Press Ctrl+C to stop"
echo ""

# Function to calculate seconds until 8am tomorrow
calculate_sleep_seconds() {
    # Get tomorrow's date at 8:00 AM
    tomorrow_8am=$(date -d "tomorrow 08:00" +%s)
    # Get current time in seconds
    current_time=$(date +%s)
    # Calculate difference
    echo $((tomorrow_8am - current_time))
}

# Function to run the data extraction
run_extraction() {
    echo "$(date): Starting data extraction..."
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

    # Calculate how long to sleep until 8am tomorrow
    sleep_seconds=$(calculate_sleep_seconds)
    
    echo "$(date): Sleeping for $sleep_seconds seconds until 8:00 AM tomorrow"
    sleep "$sleep_seconds"
done