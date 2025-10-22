# Branch Naming Convention

## CRITICAL: Date Extraction for Branch Names

**ALWAYS follow this process when creating a new branch:**

1. **Extract the date from the current timestamp** in the format "MMM D, YYYY" (e.g., "Oct 8, 2025")
2. **Convert the month abbreviation to its numeric value:**
   - Jan=01, Feb=02, Mar=03, Apr=04, May=05, Jun=06
   - Jul=07, Aug=08, Sep=09, Oct=10, Nov=11, Dec=12
3. **Format as YYYY.MM.DD/** for the branch prefix
4. **NEVER guess the date**
5. **NEVER use "today's date" without verification - ONLY use the actual current date**

## Example

**Current timestamp:** "Oct 8, 2025 at 5:45pm"

- Month conversion: Oct = 10
- Branch prefix: `2025.10.08/`
- Full branch: `2025.10.08/feature-name`

## Rules

- Always prefix new branch names with the date in YYYY.MM.DD/ format
- Never use plain 'git checkout -b' without the date prefix
- Always track main by default when creating new branches

## Month Conversion Reference

| Abbreviation | Number | Full Name |
|--------------|--------|-----------|
| Jan | 01 | January |
| Feb | 02 | February |
| Mar | 03 | March |
| Apr | 04 | April |
| May | 05 | May |
| Jun | 06 | June |
| Jul | 07 | July |
| Aug | 08 | August |
| Sep | 09 | September |
| Oct | 10 | October |
| Nov | 11 | November |
| Dec | 12 | December |
