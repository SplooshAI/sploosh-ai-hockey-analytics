# Seattle Kraken Game Examples

This document provides quick access to Seattle Kraken games
with different outcomes for testing and demonstration purposes.

## Game Outcome Examples

### Regular Season Games (gameType: 2)

| Outcome | Game ID | Description | Local URL | Production URL |
| ------- | ------- | ----------- | --------- | -------------- |
| **Win** | `2024020053` | Seattle Kraken 7-3 vs Nashville Predators | `http://localhost:3000/?gameId=2024020053` | `https://sploosh-ai-hockey-analytics.vercel.app/?gameId=2024020053` |
| **Loss** | `2024020003` | Seattle Kraken 2-3 vs St. Louis Blues | `http://localhost:3000/?gameId=2024020003` | `https://sploosh-ai-hockey-analytics.vercel.app/?gameId=2024020003` |
| **OT Win** | `2024020087` | Seattle Kraken 2-1 OT vs Calgary Flames | `http://localhost:3000/?gameId=2024020087` | `https://sploosh-ai-hockey-analytics.vercel.app/?gameId=2024020087` |
| **OT Loss** | `2024010068` | Seattle Kraken 3-4 OTL vs Calgary Flames | `http://localhost:3000/?gameId=2024010068` | `https://sploosh-ai-hockey-analytics.vercel.app/?gameId=2024010068` |
| **SO Win** | `2024020033` | Seattle Kraken 5-4 SO vs Minnesota Wild | `http://localhost:3000/?gameId=2024020033` | `https://sploosh-ai-hockey-analytics.vercel.app/?gameId=2024020033` |
| **SO Loss** | `2024020456` | Seattle Kraken 1-2 SO vs Florida Panthers | `http://localhost:3000/?gameId=2024020456` | `https://sploosh-ai-hockey-analytics.vercel.app/?gameId=2024020456` |

### Postseason Games (gameType: 3)

| Outcome | Game ID | Description | Local URL | Production URL |
| ------- | ------- | ----------- | --------- | -------------- |
| **OT Win** | `2025030175` | Example postseason OT game (MIN @ VGK) | `http://localhost:3000/?gameId=2025030175` | `https://sploosh-ai-hockey-analytics.vercel.app/?gameId=2025030175` |
| **2OT/3OT+** | `TODO_FIND_GAME_ID` | Multiple overtime periods | `http://localhost:3000/?gameId=TODO_FIND_GAME_ID` | `https://sploosh-ai-hockey-analytics.vercel.app/?gameId=TODO_FIND_GAME_ID` |

## How to Find Game IDs

### Method 1: NHL.com Game URLs

1. Go to [NHL.com](https://www.nhl.com)
2. Navigate to a Seattle Kraken game
3. The URL will be something like: `https://www.nhl.com/game/cgy/vs/sea/2024020755`
4. Extract the game ID: `2024020755`

### Method 2: API Exploration

```bash
# Test a game ID locally
curl -s "http://localhost:3000/api/nhl/game-center?gameId=2024020755" | \
  jq '. | {id: .id, gameType: .gameType, awayTeam: .awayTeam.abbrev, \
  homeTeam: .homeTeam.abbrev, awayScore: .awayTeam.score, \
  homeScore: .homeTeam.score, gameState: .gameState}'
```

### Method 3: Schedule API

```bash
# Get games for a specific date (if schedule API is available)
curl -s "http://localhost:3000/api/nhl/schedule?date=2024-02-07" | \
  jq '.games[] | select(.awayTeam.abbrev == "SEA" or .homeTeam.abbrev == "SEA")'
```

## Game ID Format

NHL game IDs follow this pattern: `YYYYMMDDNN`

- `YYYY`: Season year (e.g., 2024)
- `MM`: Month (e.g., 02 for February)
- `DD`: Day (e.g., 07)
- `NN`: Game number for the day (01-99)

Seattle Kraken's team abbreviation is `SEA` and their team ID is `55`.

## Testing Scenarios

### Shot Chart Period Filtering

- **Regular Season**: Verify SO appears in period dropdown for games
  that went to shootout
- **Postseason**: Verify 2OT, 3OT, etc. appear correctly for multiple overtime games

### Game State Display

- Test different `gameState` values: `LIVE`, `FINAL`, `OFF`, `FUT`, `PRE`
- Verify score display works correctly for all outcomes

### Animation Testing

- Test play-by-play animation for different game types
- Verify overtime periods display correctly in animations

## Quick Launch Scripts

### Using NPM Scripts (Recommended)

Use the provided npm scripts to quickly open these games in your browser:

```bash
# Launch all Kraken game examples (local)
npm run kraken:launch:all

# Launch specific outcome types (local)
npm run kraken:launch:win          # Regulation win
npm run kraken:launch:loss         # Regulation loss
npm run kraken:launch:ot-win       # Overtime win
npm run kraken:launch:ot-loss      # Overtime loss
npm run kraken:launch:so-win       # Shootout win
npm run kraken:launch:so-loss      # Shootout loss
npm run kraken:launch:postseason   # Postseason OT game

# Launch in production environment
npm run kraken:launch:prod

# Find more Kraken games
npm run kraken:find-games
```

### Using Shell Scripts Directly

You can also use the shell scripts directly:

```bash
# Launch all Kraken game examples
./scripts/launch-kraken-games.sh

# Launch specific outcome type
./scripts/launch-kraken-games.sh --outcome=win

# Launch in production instead of localhost
./scripts/launch-kraken-games.sh --production
```

## Additional Resources

- **NHL API Documentation**: [NHL Edge API](https://api.nhle.com/)
- **Seattle Kraken Schedule**: [Kraken Schedule](https://www.nhl.com/seattlekraken/schedule)
- **Game Data Format**: See `lib/api/nhl-edge/types/nhl-edge.ts`
  for complete type definitions

## Contributing

When adding new game examples:

1. Test the game ID works with both local and production URLs
2. Verify the game type and outcome are correct
3. Add appropriate comments describing the game significance
4. Update this documentation with the new examples
5. Test the launch scripts with the new game IDs
