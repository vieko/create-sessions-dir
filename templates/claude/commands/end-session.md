---
allowed-tools: Bash(git:*), Bash(.claude/scripts/*:*)
description: End session and update context
---

## Context

- Current git status: !`git status --short`
- Archive recommendation: !`.claude/scripts/should-archive.sh`

## Your task

Update .sessions/index.md with session accomplishments.

Include:
- Today's date
- What we built/fixed/decided
- Any blockers or open questions
- Next session priorities

Check the archive recommendation output above.

If the script output contains "ARCHIVE_RECOMMENDED":
  - The listed PRs have been merged
  - Ask: "Archive this session's work? [Y/n]"
  - If yes:
    - Move relevant session notes to .sessions/archive/YYYY-MM-DD-<description>.md
    - Remove completed items from index.md
    - Keep ongoing/next work in place

If the script output is "NO_ARCHIVE":
  - Skip archiving (no merged PRs detected)

Commit changes with a descriptive message about the session.
