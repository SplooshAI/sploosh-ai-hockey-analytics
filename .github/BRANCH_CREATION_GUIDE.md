# Branch Creation Guide

## Automated Date-Based Branch Creation

This guide provides methods for creating branches with the correct date prefix.

### Method 1: Extract Date from Metadata (Recommended for AI Assistants)

When using AI assistants like Cascade, the date should be extracted from the metadata timestamp:

```text
The USER presented this request to you on Oct 22, 2025 at 4:16pm
```

Convert to: `2025.10.22/description`

### Method 2: Using the `date` Command (For Manual/Script Use)

For manual branch creation or in scripts, use the `date` command to automatically generate the correct date prefix:

```bash
# Create a branch with today's date
git checkout -b $(date +%Y.%m.%d)/your-feature-description

# Example: Creates branch like "2025.10.22/add-new-feature"
git checkout -b $(date +%Y.%m.%d)/add-new-feature

# Push and set upstream tracking
git push -u origin $(git branch --show-current)
```

### Complete Branch Creation Script

Here's a complete script you can use:

```bash
#!/bin/bash
# Usage: ./create-branch.sh "feature-description"

if [ -z "$1" ]; then
  echo "Error: Please provide a branch description"
  echo "Usage: ./create-branch.sh \"feature-description\""
  exit 1
fi

# Generate branch name with current date
BRANCH_NAME="$(date +%Y.%m.%d)/$1"

# Ensure we're on main and up to date
git checkout main
git pull origin main

# Create and checkout new branch
git checkout -b "$BRANCH_NAME"

# Push and set upstream tracking
git push -u origin "$BRANCH_NAME"

echo "✅ Created and pushed branch: $BRANCH_NAME"
```

### Date Format Explanation

The `date +%Y.%m.%d` command produces:

- `%Y` = 4-digit year (e.g., 2025)
- `%m` = 2-digit month (e.g., 10 for October)
- `%d` = 2-digit day (e.g., 22)
- Result: `2025.10.22`

### Examples

```bash
# On October 22, 2025:
git checkout -b $(date +%Y.%m.%d)/add-player-stats
# Creates: 2025.10.22/add-player-stats

git checkout -b $(date +%Y.%m.%d)/fix-animation-bug
# Creates: 2025.10.22/fix-animation-bug

git checkout -b $(date +%Y.%m.%d)/update-documentation
# Creates: 2025.10.22/update-documentation
```

### Integration with Existing Workflow

This approach complements the existing branch naming convention documented in `.github/BRANCH_NAMING.md` and `.windsurf/rules/git_workflow_rules.md`.

**When to use each method:**

- **AI Assistants (Cascade)**: Extract date from metadata timestamp
- **Manual CLI**: Use `date` command
- **Scripts/Automation**: Use `date` command
- **Team Members**: Use the provided script above

### Adding to Your Shell Profile

Add this function to your `~/.zshrc` or `~/.bashrc` for quick access:

```bash
# Create a dated feature branch
create-branch() {
  if [ -z "$1" ]; then
    echo "Usage: create-branch <description>"
    return 1
  fi
  
  local branch_name="$(date +%Y.%m.%d)/$1"
  git checkout main && \
  git pull origin main && \
  git checkout -b "$branch_name" && \
  git push -u origin "$branch_name"
}
```

Then use it like:

```bash
create-branch add-new-feature
```
