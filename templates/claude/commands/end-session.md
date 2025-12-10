---
allowed-tools: Bash(git:*), Bash(.claude/scripts/*:*)
description: End session and update context
---

**First**: Find the git root to locate session files (supports monorepos):
- Run: `git rev-parse --show-toplevel` to get the repository root path
- Session files live at `<git-root>/.sessions/`

## Your task

Update `<git-root>/.sessions/index.md` with session accomplishments.

Include:
- Today's date
- What we built/fixed/decided
- Any blockers or open questions
- Next session priorities

Then commit changes with a descriptive message about the session.
