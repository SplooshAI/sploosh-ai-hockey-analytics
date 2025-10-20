# UX Improvements for Team Selection and Period Formatting

## Summary

Improved the user experience for team selection in the shot chart by displaying full team names (e.g., "Seattle Kraken") instead of abbreviations (e.g., "SEA"). Also created a centralized formatting library for consistent team name and period display across the application.

## Changes Made

### 1. Created Formatting Utilities Library

**File:** `apps/sploosh-ai-hockey-analytics/lib/utils/formatters.ts`

Created a new formatting utilities module with the following functions:

- `formatTeamFullName()` - Formats team names as "Place Name + Common Name" (e.g., "Seattle Kraken")
- `formatTeamAbbrev()` - Returns team abbreviation (e.g., "SEA")
- `formatPeriodLabel()` - Formats period numbers to display labels:
  - Period 1 → "1st"
  - Period 2 → "2nd"
  - Period 3 → "3rd"
  - Period 4 → "OT"
  - Period 5 → "SO"
  - Period 6+ → "2OT", "3OT", etc.
- `formatPeriodDescription()` - Full period descriptions (e.g., "1st Period", "Overtime", "Shootout")

### 2. Updated Type Definitions

**File:** `apps/sploosh-ai-hockey-analytics/lib/api/nhl-edge/types/nhl-edge.ts`

Updated `NHLEdgePlayByPlay` interface to use full `NHLEdgeTeam` type instead of just `{ abbrev: string }`, matching the actual API response structure.

### 3. Updated Shot Chart Component

**File:** `apps/sploosh-ai-hockey-analytics/components/features/shot-chart/shot-chart.tsx`

- Imported and used `formatTeamFullName()` for team dropdown options
- Imported and used `formatPeriodLabel()` for period dropdown options
- Team selection now shows full names like "Seattle Kraken" and "Ottawa Senators"
- Period selection now shows "1st", "2nd", "3rd", "OT", "SO" instead of "Period 1", "Period 2", etc.

### 4. Updated Game Header Component

**File:** `apps/sploosh-ai-hockey-analytics/components/features/game-header/game-header.tsx`

- Imported formatting utilities
- Updated type definitions to include `placeName` and `commonName` fields
- Used `formatTeamFullName()` for team name display (with fallback to abbreviation)
- Used `formatPeriodLabel()` for period display in game status

## Benefits

1. **Improved UX**: Users can now see full team names in dropdowns, making it easier to identify teams
2. **Consistency**: Centralized formatting logic ensures consistent display across the application
3. **Maintainability**: Future changes to formatting can be made in one place
4. **Extensibility**: The formatting library is ready for future enhancements (e.g., localization)

## Future Enhancements

The formatting library is designed to be extended with additional formatting functions as needed:

- Player name formatting
- Score formatting
- Time formatting
- Localization support

## Testing

The changes have been tested with the development server running on port 3001. The shot chart team selection dropdown now displays full team names, and period labels are properly formatted throughout the application.
