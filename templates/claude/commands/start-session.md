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

Handle user response:

**If user provides a GitHub/Linear URL or issue ID:**
  - **GitHub PR/Issue**: Use gh CLI to fetch details
    - For PRs: gh pr view [URL] --json title,body,state,labels
    - For issues: gh issue view [URL] --json title,body,state,labels
  - **Linear Issue**: Use linearis CLI to fetch details (if available)
    - For Linear IDs (e.g., DEV-456, GTMENG-304): linearis issues read [ID]
  - Parse the JSON output and summarize: title, description, key points, acceptance criteria, labels/status
  - Create .sessions/prep/YYYY-MM-DD-topic.md with structured context
  - Update index.md with reference: "Working on: [Description] (see prep/YYYY-MM-DD-topic.md)"

**If user selects from next priorities or says "continue":**
  - If they reference a PR/issue number from the context (e.g., "#234" or "GTMENG-304"), offer to fetch current status
  - Otherwise proceed with existing context

**If user provides a description:**
  - Proceed with that context

Confirm understanding and ask how to proceed.
