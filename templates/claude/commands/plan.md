---
description: Create implementation plan
---

**First**: Find the git root to locate session files (supports monorepos):
- Run: `git rev-parse --show-toplevel` to get the repository root path
- Session files live at `<git-root>/.sessions/`

Create or update a plan in `<git-root>/.sessions/plans/`

Steps:
1. If `<git-root>/.sessions/plans/` doesn't exist, create it first
2. Ask: "What are you planning to implement?"
3. Launch a Plan agent with:
   "Help design the implementation for [description].

   Analyze the codebase and provide:
   - Requirements breakdown
   - Architecture decisions and trade-offs
   - Files that need changes (with file:line references)
   - Implementation steps
   - Risks and open questions"

4. Create `<git-root>/.sessions/plans/YYYY-MM-DD-<name>.md` with structured plan:

```markdown
# Plan: [Feature Name]
**Date**: YYYY-MM-DD
**Status**: Draft

## Goal
[What we're building and why]

## Requirements
- [ ] Requirement 1
- [ ] Requirement 2

## Architecture Decisions
- **Decision**: Choice made
- **Rationale**: Why we chose this approach
- **Trade-offs**: What we're optimizing for

## Implementation Steps
1. [ ] Step 1 (file:line references)
2. [ ] Step 2 (file:line references)

## Risks & Open Questions
- What we're unsure about
- What could go wrong

## Related
- Links to issues, PRs, other plans
```

5. Add reference to plan in `<git-root>/.sessions/index.md`: "Planning: [Feature] (see plans/YYYY-MM-DD-<name>.md)"

Then ask: "Ready to start implementing?"
