#!/bin/bash

# should-archive.sh
# Detects merged PRs referenced in session notes and recommends archiving

set -euo pipefail

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
  echo "NO_ARCHIVE: gh CLI not found (install: brew install gh)"
  exit 0
fi

# Check if .sessions/index.md exists
if [ ! -f ".sessions/index.md" ]; then
  echo "NO_ARCHIVE: .sessions/index.md not found"
  exit 0
fi

# Extract PR numbers from session notes (#xxx format)
pr_numbers=$(grep -oE '#[0-9]+' .sessions/index.md 2>/dev/null | grep -oE '[0-9]+' | sort -u || true)

if [ -z "$pr_numbers" ]; then
  echo "NO_ARCHIVE: No PR references found in session notes"
  exit 0
fi

merged_prs=()

# Check each PR's status
for pr in $pr_numbers; do
  # Query PR state, handle errors gracefully
  state=$(gh pr view "$pr" --json state --jq '.state' 2>/dev/null || echo "NOT_FOUND")

  if [ "$state" = "MERGED" ]; then
    title=$(gh pr view "$pr" --json title --jq '.title' 2>/dev/null || echo "Unknown")
    merged_prs+=("#$pr: $title")
  fi
done

# Output recommendation
if [ ${#merged_prs[@]} -eq 0 ]; then
  echo "NO_ARCHIVE: No merged PRs found"
else
  echo "ARCHIVE_RECOMMENDED: Found merged PRs:"
  for pr in "${merged_prs[@]}"; do
    echo "  - $pr"
  done
fi
