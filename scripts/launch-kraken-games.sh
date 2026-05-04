#!/bin/bash

# Seattle Kraken Game Launcher Script
# Launches Seattle Kraken games in the browser for testing

set -e

# Default values
ENVIRONMENT="local"
OUTCOME="all"
BROWSER="open"  # macOS open command

# Game examples - Updated with actual Seattle Kraken game IDs
# Format: outcome:game_id
win="2024020053"           # Regular season regulation win (SEA vs NSH 7-3)
loss="2024020003"          # Regular season regulation loss (STL vs SEA 3-2)
ot_win="2024020087"        # Regular season overtime win (CGY vs SEA 2-1 OT)
ot_loss="2024010068"       # Regular season overtime loss (SEA vs CGY 4-3 OTL)
so_win="2024020033"        # Regular season shootout win (SEA vs MIN 5-4 SO)
so_loss="2024020456"       # Regular season shootout loss (FLA vs SEA 2-1 SO)
postseason_ot="2025030175" # Postseason OT game (MIN @ VGK 2OT)
postseason_2ot="2025030175" # Postseason multiple OT (same game - 2OT)

# URLs
LOCAL_BASE="http://localhost:3000"
PROD_BASE="https://sploosh-ai-hockey-analytics.vercel.app"

# Help function
show_help() {
    cat << EOF
Seattle Kraken Game Launcher

Usage: $0 [OPTIONS]

OPTIONS:
    --environment=ENV    Environment to use (local|production) [default: local]
    --outcome=TYPE       Game outcome to launch (win|loss|ot_win|ot_loss|so_win|so_loss|postseason_ot|postseason_2ot|all) [default: all]
    --browser=CMD       Browser command to use [default: open]
    --help              Show this help message

EXAMPLES:
    $0                                    # Launch all games locally
    $0 --outcome=win                    # Launch only regulation wins
    $0 --environment=production           # Launch in production
    $0 --outcome=so_win --production    # Launch shootout wins in production

NOTES:
    - Most game IDs need to be updated with actual Seattle Kraken games
    - Use the docs/SEATTLE_KRAKEN_GAME_EXAMPLES.md file for reference
    - Script will skip games with empty IDs

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --environment=*)
            ENVIRONMENT="${1#*=}"
            shift
            ;;
        --outcome=*)
            OUTCOME="${1#*=}"
            shift
            ;;
        --browser=*)
            BROWSER="${1#*=}"
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

# Check if local server is running (if local environment)
if [[ "$ENVIRONMENT" == "local" ]]; then
    if ! curl -s "$BASE_URL" > /dev/null 2>&1; then
        echo "❌ Local server is not running at $BASE_URL"
        echo "💡 Start it with: npm run docker:up:detach"
        exit 1
    else
        echo "✅ Local server is running"
    fi
fi

# Function to launch a game
launch_game() {
    local outcome="$1"
    local game_id=""
    
    # Get game ID based on outcome
    case "$outcome" in
        "win") game_id="$win" ;;
        "loss") game_id="$loss" ;;
        "ot_win") game_id="$ot_win" ;;
        "ot_loss") game_id="$ot_loss" ;;
        "so_win") game_id="$so_win" ;;
        "so_loss") game_id="$so_loss" ;;
        "postseason_ot") game_id="$postseason_ot" ;;
        "postseason_2ot") game_id="$postseason_2ot" ;;
        *) echo "❌ Unknown outcome: $outcome"; return ;;
    esac
    
    if [[ -z "$game_id" ]]; then
        echo "⚠️  No game ID set for outcome: $outcome"
        return
    fi
    
    local url="$BASE_URL/?gameId=$game_id"
    echo "🚀 Launching $outcome: $url"
    
    if command -v "$BROWSER" > /dev/null 2>&1; then
        "$BROWSER" "$url"
    else
        echo "❌ Browser command '$BROWSER' not found"
        echo "🔗 Manual URL: $url"
    fi
}

# Launch games based on outcome selection
echo ""
echo "🏒 Launching Seattle Kraken Games..."
echo ""

if [[ "$OUTCOME" == "all" ]]; then
    echo "📋 Launching all game outcomes:"
    outcomes=("win" "loss" "ot_win" "ot_loss" "so_win" "so_loss" "postseason_ot" "postseason_2ot")
    for outcome in "${outcomes[@]}"; do
        echo ""
        launch_game "$outcome"
        sleep 1  # Small delay between launches
    done
else
    # Check if outcome is valid
    valid_outcomes=("win" "loss" "ot_win" "ot_loss" "so_win" "so_loss" "postseason_ot" "postseason_2ot")
    if [[ ! " ${valid_outcomes[@]} " =~ " ${OUTCOME} " ]]; then
        echo "❌ Unknown outcome: $OUTCOME"
        echo "📋 Available outcomes: win, loss, ot_win, ot_loss, so_win, so_loss, postseason_ot, postseason_2ot, all"
        exit 1
    fi
    
    echo "📋 Launching outcome: $OUTCOME"
    launch_game "$OUTCOME"
fi

echo ""
echo "✅ Launch complete!"
echo ""
echo "💡 To update game IDs, edit the GAMES array in this script"
echo "📖 See docs/SEATTLE_KRAKEN_GAME_EXAMPLES.md for more information"
