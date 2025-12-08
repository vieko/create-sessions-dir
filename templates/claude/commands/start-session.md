---
allowed-tools: Bash(gh:*), Bash(linearis:*)
description: Start a new session
---

Read .sessions/index.md and report when ready.

Check if .sessions/WORKSPACE.md exists (don't error if missing). If it exists, mention that monorepo support is active and show detected packages.

Summarize:
- Current state
- Recent work
- Next priorities

Then ask: "What do you want to work on this session?"

**Only fetch external context if user provides a new URL or issue ID:**

If user provides a GitHub/Linear URL or issue ID:
  - **GitHub**: gh pr view [URL] --json title,body,state,labels
  - **GitHub**: gh issue view [URL] --json title,body,state,labels
  - **Linear**: linearis issues read [ID] (e.g., DEV-456, GTMENG-304)
  - Summarize the fetched context
  - Store in .sessions/prep/YYYY-MM-DD-topic.md
  - Add reference to index.md

Otherwise (continuing work, ad-hoc task, etc.):
  - Proceed with existing session context
  - Session notes are the source of truth for ongoing work

Confirm understanding and ask how to proceed.
