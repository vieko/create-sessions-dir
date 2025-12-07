---
allowed-tools: Bash(gh:*), Bash(linearis:*)
description: Start a new session
---

Read .sessions/index.md and report when ready.

If .sessions/WORKSPACE.md exists, mention that monorepo support is active.

Summarize:
- Current state
- Recent work
- Next priorities

Then ask: "What do you want to work on this session?"

If user provides a URL or issue ID:
  - **GitHub PR/Issue**: Use gh CLI to fetch details
    - PR: !`gh pr view <URL|number> --json title,body,state,labels`
    - Issue: !`gh issue view <URL|number> --json title,body,state,labels`
  - **Linear Issue**: Use linearis CLI to fetch details (if available)
    - Issue: !`linearis issues read <ID>` (e.g., DEV-456)
  - Parse the JSON output and summarize: title, description, key points, acceptance criteria, labels/status
  - Create .sessions/prep/YYYY-MM-DD-<topic>.md with structured context
  - Update index.md with reference: "Working on: [Description] (see prep/YYYY-MM-DD-<topic>.md)"

If user provides description or says "continue":
  - Proceed with that context

Confirm understanding and ask how to proceed.
