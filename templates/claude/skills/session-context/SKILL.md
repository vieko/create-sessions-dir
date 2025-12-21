---
name: session-context
description: Read project session context from .sessions/index.md to understand ongoing work, previous decisions, blockers, and history. Use when the user asks about project context, previous sessions, what was worked on before, architectural decisions, blockers, or when they reference "last time", "previously", "the session", or "what we decided".
allowed-tools: Read, Glob
---

# Session Context

This project uses the Sessions Directory Pattern to maintain continuity across AI coding sessions. Context is stored in `.sessions/index.md` rather than relying on conversation memory.

## When to Use This Skill

Read session context when the user:
- Asks about previous work or decisions
- References "last time", "previously", "before"
- Wants to know about blockers or pending issues
- Asks what the project status is
- Starts a significant task that might have prior context

## Instructions

1. Read `.sessions/index.md` to understand:
   - Current project status and recent work
   - Active decisions and their rationale
   - Known blockers or pending issues
   - Links to relevant plans or documentation

2. Check `.sessions/plans/` if the user asks about implementation plans

3. Check `.sessions/docs/` if the user asks about documented topics

4. For monorepos, check `.sessions/packages/` for package-specific context

## File Structure

```
.sessions/
├── index.md          # Main session context (read this first)
├── archive/          # Completed work history
├── docs/             # Topic documentation
├── plans/            # Implementation plans
├── prep/             # Pre-session context
└── packages/         # Monorepo package notes (if applicable)
```

## Important

- This skill is for **reading** context, not updating it
- Session updates happen via `/end-session` slash command
- Don't modify `.sessions/index.md` unless explicitly asked
