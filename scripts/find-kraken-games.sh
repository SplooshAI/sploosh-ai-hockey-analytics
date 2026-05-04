#!/bin/bash

# Seattle Kraken Game Finder Script
# Helps find Seattle Kraken game IDs for different outcomes. See docs/SEATTLE_KRAKEN_GAME_EXAMPLES.md for more information

set -e

# Default values
START_DATE="2024-10-01"
END_DATE="2024-12-31"
ENVIRONMENT="local"

# URLs
LOCAL_BASE="http://localhost:3000"
PROD_BASE="https://sploosh-ai-hockey-analytics.vercel.app"

# Help function
show_help() {
    cat << EOF
Seattle Kraken Game Finder

Usage: $0 [OPTIONS]

OPTIONS:
    --start-date=DATE    Start date for search (YYYY-MM-DD) [default: 2024-10-01]
    --end-date=DATE      End date for search (YYYY-MM-DD) [default: 2024-12-31]
    --environment=ENV    Environment to use (local|production) [default: local]
    --help               Show this help message

DESCRIPTION:
    This script searches for Seattle Kraken games within a date range and
    categorizes them by outcome (win, loss, OT, SO, etc.) to help populate
    the game examples documentation.

EXAMPLES:
    $0                                    # Search 2024-25 season first half
    $0 --start-date=2024-01-01 --end-date=2024-04-30  # Search 2023-24 season
    $0 --environment=production           # Use production API

NOTES:
    - Requires local server to be running if using local environment
    - Outputs game IDs that can be used in the launch script
    - Results are saved to kraken-games-found.txt for reference

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --start-date=*)
            START_DATE="${1#*=}"
            shift
            ;;
        --end-date=*)
            END_DATE="${1#*=}"
            shift
            ;;
        --environment=*)
            ENVIRONMENT="${1#*=}"
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Validate environment
if [[ "$ENVIRONMENT" != "local" && "$ENVIRONMENT" != "production" ]]; then
    echo "Error: Environment must be 'local' or 'production'"
    exit 1
fi

# Set base URL
if [[ "$ENVIRONMENT" == "local" ]]; then
    BASE_URL="$LOCAL_BASE"
    echo "🏠 Using local environment: $BASE_URL"
else
    BASE_URL="$PROD_BASE"
    echo "🌐 Using production environment: $BASE_URL"
fi

# Check if server is accessible
if ! curl -s "$BASE_URL/api/nhl/game-center?gameId=2024020175" > /dev/null 2>&1; then
    echo "❌ Cannot access API at $BASE_URL"
    if [[ "$ENVIRONMENT" == "local" ]]; then
        echo "💡 Start local server with: npm run docker:up:detach"
    fi
    exit 1
fi

echo "🔍 Searching for Seattle Kraken games from $START_DATE to $END_DATE..."
echo ""

# Function to test a game ID
test_game_id() {
    local game_id="$1"
    local result=$(curl -s "$BASE_URL/api/nhl/game-center?gameId=$game_id" 2>/dev/null)
    
    if [[ -z "$result" || "$result" == *"Not Found"* ]]; then
        return 1
    fi
    
    # Extract game info
    local game_info=$(echo "$result" | jq -r '
        if .id then
            {
                id: .id,
                gameType: .gameType,
                awayTeam: .awayTeam.abbrev,
                homeTeam: .homeTeam.abbrev,
                awayScore: .awayTeam.score,
                homeScore: .homeTeam.score,
                gameState: .gameState,
                isKraken: (.awayTeam.abbrev == "SEA" or .homeTeam.abbrev == "SEA")
            }
        else
            empty
        end
    ' 2>/dev/null)
    
    if [[ -n "$game_info" && $(echo "$game_info" | jq -r '.isKraken') == "true" ]]; then
        echo "$game_info"
        return 0
    fi
    
    return 1
}

# Function to determine game outcome
determine_outcome() {
    local away_team="$1"
    local away_score="$2"
    local home_team="$3"
    local home_score="$4"
    local game_state="$5"
    local game_type="$6"
    
    # Skip if game isn't final
    if [[ "$game_state" != "OFF" && "$game_state" != "FINAL" ]]; then
        echo "IN_PROGRESS"
        return
    fi
    
    local kraken_score=""
    local opponent_score=""
    local kraken_is_home=""
    
    if [[ "$home_team" == "SEA" ]]; then
        kraken_score="$home_score"
        opponent_score="$away_score"
        kraken_is_home="true"
    else
        kraken_score="$away_score"
        opponent_score="$home_score"
        kraken_is_home="false"
    fi
    
    # Handle null scores (game not completed)
    if [[ "$kraken_score" == "null" || "$opponent_score" == "null" ]]; then
        echo "NO_SCORE"
        return
    fi
    
    # Determine outcome
    if [[ "$kraken_score" -gt "$opponent_score" ]]; then
        echo "WIN"
    elif [[ "$kraken_score" -lt "$opponent_score" ]]; then
        echo "LOSS"
    else
        # Tie game - determine based on game type and period count
        echo "TIE"  # Will be further analyzed
    fi
}

# Generate game IDs to test
echo "📋 Testing game ID patterns..."
echo ""

# Convert dates to timestamps for easier iteration
start_timestamp=$(date -j -f "%Y-%m-%d" "$START_DATE" +%s 2>/dev/null || date -d "$START_DATE" +%s)
end_timestamp=$(date -j -f "%Y-%m-%d" "$END_DATE" +%s 2>/dev/null || date -d "$END_DATE" +%s)

current_timestamp="$start_timestamp"
found_games=()

echo "Searching game IDs..."
while [[ $current_timestamp -le $end_timestamp ]]; do
    current_date=$(date -r $current_timestamp +%Y-%m-%d 2>/dev/null || date -d "@$current_timestamp" +%Y-%m-%d)
    
    # Generate game IDs for this date (try first 10 games)
    for game_num in {01..10}; do
        game_id="${current_date//-/}${game_num}"
        
        game_info=$(test_game_id "$game_id")
        if [[ -n "$game_info" ]]; then
            found_games+=("$game_info")
        fi
    done
    
    # Move to next day
    current_timestamp=$((current_timestamp + 86400))
done

echo ""
echo "📊 Search Results:"
echo ""

if [[ ${#found_games[@]} -eq 0 ]]; then
    echo "❌ No Seattle Kraken games found in the specified date range."
    echo ""
    echo "💡 Suggestions:"
    echo "   - Try a wider date range"
    echo "   - Check if the date format is correct"
    echo "   - Verify the API is accessible"
    exit 0
fi

# Categorize games
echo "Found ${#found_games[@]} Seattle Kraken games:"
echo ""

declare -a wins losses ot_games so_games postseason_games other_games

for game in "${found_games[@]}"; do
    id=$(echo "$game" | jq -r '.id')
    away_team=$(echo "$game" | jq -r '.awayTeam')
    home_team=$(echo "$game" | jq -r '.homeTeam')
    away_score=$(echo "$game" | jq -r '.awayScore')
    home_score=$(echo "$game" | jq -r '.homeScore')
    game_state=$(echo "$game" | jq -r '.gameState')
    game_type=$(echo "$game" | jq -r '.gameType')
    
    outcome=$(determine_outcome "$away_team" "$away_score" "$home_team" "$home_score" "$game_state" "$game_type")
    
    game_line="  $id: $away_team $away_score @ $home_team $home_score ($game_state, Type: $game_type)"
    
    case "$outcome" in
        "WIN")
            if [[ "$game_type" == "3" ]]; then
                postseason_games+=("$game_line (POSTSEASON WIN)")
            else
                wins+=("$game_line")
            fi
            ;;
        "LOSS")
            if [[ "$game_type" == "3" ]]; then
                postseason_games+=("$game_line (POSTSEASON LOSS)")
            else
                losses+=("$game_line")
            fi
            ;;
        "TIE"|"IN_PROGRESS")
            # These could be OT/SO games - check period count if available
            if [[ "$game_type" == "3" ]]; then
                postseason_games+=("$game_line (POSTSEASON - likely OT)")
            else
                ot_games+=("$game_line (likely OT/SO)")
            fi
            ;;
        *)
            other_games+=("$game_line")
            ;;
    esac
done

# Display results
if [[ ${#wins[@]} -gt 0 ]]; then
    echo "🏆 REGULATION WINS:"
    printf '%s\n' "${wins[@]}"
    echo ""
fi

if [[ ${#losses[@]} -gt 0 ]]; then
    echo "💔 REGULATION LOSSES:"
    printf '%s\n' "${losses[@]}"
    echo ""
fi

if [[ ${#ot_games[@]} -gt 0 ]]; then
    echo "⚡ OVERTIME/SHOOTOUT GAMES:"
    printf '%s\n' "${ot_games[@]}"
    echo ""
fi

if [[ ${#postseason_games[@]} -gt 0 ]]; then
    echo "🎯 POSTSEASON GAMES:"
    printf '%s\n' "${postseason_games[@]}"
    echo ""
fi

if [[ ${#other_games[@]} -gt 0 ]]; then
    echo "📋 OTHER GAMES:"
    printf '%s\n' "${other_games[@]}"
    echo ""
fi

# Save results to file
output_file="kraken-games-found.txt"
echo "💾 Saving results to $output_file..."

cat > "$output_file" << EOF
# Seattle Kraken Games Found
# Search date range: $START_DATE to $END_DATE
# Environment: $ENVIRONMENT
# Generated: $(date)

EOF

if [[ ${#wins[@]} -gt 0 ]]; then
    echo "## Regulation Wins" >> "$output_file"
    printf '%s\n' "${wins[@]}" >> "$output_file"
    echo "" >> "$output_file"
fi

if [[ ${#losses[@]} -gt 0 ]]; then
    echo "## Regulation Losses" >> "$output_file"
    printf '%s\n' "${losses[@]}" >> "$output_file"
    echo "" >> "$output_file"
fi

if [[ ${#ot_games[@]} -gt 0 ]]; then
    echo "## Overtime/Shootout Games" >> "$output_file"
    printf '%s\n' "${ot_games[@]}" >> "$output_file"
    echo "" >> "$output_file"
fi

if [[ ${#postseason_games[@]} -gt 0 ]]; then
    echo "## Postseason Games" >> "$output_file"
    printf '%s\n' "${postseason_games[@]}" >> "$output_file"
    echo "" >> "$output_file"
fi

echo "✅ Search complete! Results saved to $output_file"
echo ""
echo "💡 Next steps:"
echo "   1. Review the found games in $output_file"
echo "   2. Update the launch script with specific game IDs"
echo "   3. Test the games using: ./scripts/launch-kraken-games.sh"
