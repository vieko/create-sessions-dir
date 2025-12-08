#!/bin/bash

# untrack-sessions.sh
# Helper script to untrack .sessions/ files from git after changing strategy

set -euo pipefail

strategy="${1:-}"

if [ -z "$strategy" ]; then
  echo "Usage: .claude/scripts/untrack-sessions.sh [ignore|hybrid]"
  echo ""
  echo "  ignore  - Untrack all .sessions/ files"
  echo "  hybrid  - Untrack only personal files (index.md, archive/, prep/)"
  exit 1
fi

# Check if in git repo
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  echo "[ERROR] Not in a git repository"
  exit 1
fi

# Check if .sessions/ exists
if [ ! -d ".sessions" ]; then
  echo "[ERROR] .sessions/ directory not found"
  exit 1
fi

# Check what's currently tracked
tracked_files=$(git ls-files .sessions/ | wc -l | tr -d ' ')

if [ "$tracked_files" -eq 0 ]; then
  echo "[OK] No .sessions/ files are tracked in git"
  exit 0
fi

echo "[INFO] Found $tracked_files tracked files in .sessions/"
echo ""

case "$strategy" in
  ignore)
    echo "Untracking ALL .sessions/ files..."
    git rm --cached -r .sessions/ 2>/dev/null || true
    echo "[OK] All .sessions/ files untracked"
    echo ""
    echo "Files removed from git but kept on disk."
    echo "Run 'git status' to see changes."
    ;;

  hybrid)
    echo "Untracking personal files (index.md, archive/, prep/)..."

    # Untrack specific files/directories
    git rm --cached .sessions/index.md 2>/dev/null || true
    git rm --cached -r .sessions/archive/ 2>/dev/null || true
    git rm --cached -r .sessions/prep/ 2>/dev/null || true
    git rm --cached -r .sessions/data/ 2>/dev/null || true
    git rm --cached -r .sessions/scratch/ 2>/dev/null || true

    echo "[OK] Personal files untracked"
    echo ""
    echo "Kept tracked: docs/, plans/, packages/"
    echo "Files removed from git but kept on disk."
    echo "Run 'git status' to see changes."
    ;;

  *)
    echo "[ERROR] Unknown strategy: $strategy"
    echo "Use 'ignore' or 'hybrid'"
    exit 1
    ;;
esac

echo ""
echo "Next steps:"
echo "  1. Review: git status .sessions/"
echo "  2. Commit: git commit -m 'Change sessions strategy to $strategy'"
