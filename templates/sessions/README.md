# Sessions Directory Pattern

This directory implements the **Sessions Directory Pattern** for working with AI coding agents like Claude Code.

## What is this?

The Sessions Directory Pattern creates continuity across sessions with stateless AI agents. Instead of the agent trying to remember context, you maintain a living document that gets read at the start of each session and updated at the end.

**Learn more**: [Pairing with a Partner Who Forgets Everything](https://vieko.dev/sessions)

---

## Quick Start

### 1. Start a Session

Use the slash command:
```
/start-session
```

Or prompt Claude directly:
> "Read .sessions/index.md and report when ready. Summarize the current state and ask what I want to work on."

### 2. Work Together

As you work, document important decisions, architecture choices, and progress:
> "Add this to .sessions/index.md under Current State"
> "Document this API decision in .sessions/"

### 3. End the Session

**End frequently** (every 20-30 minutes is fine). Think of it like saving your game - save often!

Use the slash command:
```
/end-session
```

Or prompt Claude directly:
> "Update .sessions/index.md with what we accomplished this session. Include today's date, what we built, any decisions made, and next priorities. Then commit the changes."

---

## Workflow

```
┌─────────────────────────────────────────────────┐
│ Start Session                                   │
│ → Read .sessions/index.md                       │
│ → Understand current context                    │
│ → Ask what to work on                           │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│ During Session                                  │
│ → Build features                                │
│ → Make decisions                                │
│ → Document as you go                            │
└─────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│ End Session                                     │
│ → Update .sessions/index.md                     │
│ → Record what happened                          │
│ → Set next priorities                           │
│ → Commit changes                                │
└─────────────────────────────────────────────────┘
```

---

## Slash Commands

This setup includes four slash commands for Claude Code:

### `/start-session`
Reads your session context and gets you oriented. Claude will:
- Load `.sessions/index.md`
- Summarize current state
- Ask what you want to work on

### `/end-session`
Updates your session context with what happened. Claude will:
- Document accomplishments
- Record decisions and blockers
- Set next session priorities
- Commit the changes

**Note**: Archiving is prompted automatically by a git hook after merging to main - you don't need to manually track when to archive.

### `/document <topic>`
Creates topic-specific documentation as your project grows. Claude will:
- Create `.sessions/docs/` folder (first time only)
- Create or update `.sessions/docs/<topic>.md`
- Ask what should be documented
- Structure it with clear headings and context

**Use this when:** You have architectural decisions, API patterns, testing strategies, or other deep context worth its own document.

### `/archive-session`
Archives completed work to keep your context file clean. Claude will:
- Move finished notes to `.sessions/archive/`
- Clean up completed items from index.md

**When to archive**: A git hook automatically prompts you after merging to main. This ensures archiving happens at the right moment (when work is complete and merged) without manual tracking.

---

## Conversational Prompts

Prefer typing to slash commands? Here are copy-paste prompts for each step:

### Starting a Session
```
Read .sessions/index.md and report when ready.

Summarize:
- Current state
- Recent work
- Next priorities

Then ask what I want to work on this session.
```

### During a Session
```
Document this in .sessions/ under [section name]
```

```
Add this decision to .sessions/index.md: [your note]
```

### Ending a Session
```
Update .sessions/index.md with what we accomplished this session.

Include:
- Today's date
- What we built/fixed/decided
- Any blockers or open questions
- Next session priorities

Then commit the changes with a descriptive message.
```

### Archiving Work
```
Review completed work in .sessions/ and archive it.

Move finished session notes to .sessions/archive/ organized by date or topic.
Clean up .sessions/index.md by removing completed items.
```

---

## Writing Effective Context

**Keep it concise**: Target <300 lines for your session index. If notes grow beyond this, archive completed work or move detailed topics to `.sessions/docs/`.

**Use file references**: Link to code with `file:line` format (e.g., `src/auth.ts:42`) instead of copying code snippets. This prevents outdated duplication.

**Separate facts from rules**: Session notes should contain *context* (what was built, decisions made, current state) not *instructions* (code style rules, best practices). Use linters and formatters for code style instead of writing rules.

**Focus on the "why"**: Document *why* decisions were made, not just *what* was done. "Switched to JWT because session storage caused issues in mobile Safari" beats "Added JWT auth".

**Avoid behavioral hotfixes**: Don't add one-off instructions to work around Claude's behavior. If something needs fixing, address the root cause or use deterministic tools (scripts, hooks, linters).

**Progressive disclosure**: Keep `index.md` high-level and scannable. Move deep technical details to topic-specific files in `.sessions/docs/`:
- Architecture decisions: `docs/architecture.md`
- API patterns: `docs/api-design.md`
- Testing strategies: `docs/testing.md`

## Tips

1. **End sessions frequently** - Sessions can be 20-30 minutes. Think of `/end-session` like saving your game - save often. It's better to end and start fresh than to keep a session open all day.

2. **Update as you go** - Don't wait until the end. Document decisions as you make them.

3. **Be specific** - "Fixed auth bug" is less useful than "Fixed token refresh race condition in AuthProvider"

4. **Track blockers** - Note what's blocking progress so the next session can pick up smoothly

5. **Commit often** - Each session should have at least one commit updating `.sessions/index.md`

6. **Archive completed work** - Once a feature is done, move detailed notes to `.sessions/archive/` to keep your index file scannable

---

## Optional Directories

The Sessions Directory supports extensions:

- `docs/` - Topic-specific documentation (use `/document`)
- `plans/` - Implementation plans (use `/plan`)
- `prep/` - Pre-session context gathering (created by `/start-session`)
- `archive/` - Completed work (use `/end-session` auto-detect)
- `data/` - Sample/test data for tasks (git-ignored)
- `scratch/` - Temporary experiments (git-ignored)

A `.gitignore` is included to exclude temporary directories.

## Customizing

This structure is a starting point. Adapt it to your needs:

- Add more topic-specific docs in `.sessions/docs/`
- Create templates for recurring documentation
- Structure the archive however makes sense for your project
- Modify slash commands in `.claude/commands/` to match your workflow

## Monorepo Support

If you're in a monorepo, check for `.sessions/WORKSPACE.md` which provides guidance on:
- Shared sessions at the root level
- Package-specific notes in `.sessions/packages/`
- Cross-package work tracking

---

## Why This Works

AI coding agents are stateless - they don't remember previous sessions. The Sessions Directory Pattern solves this by:

1. **Externalizing memory** - Context lives in files, not the agent's "memory"
2. **Progressive documentation** - You document as you build, not after
3. **Continuity across sessions** - Each session starts with full context
4. **Proof of decisions** - Everything is written down and committed

Read the full story: [vieko.dev/sessions](https://vieko.dev/sessions)

---

**Questions or feedback?** Open an issue at [github.com/vieko/create-sessions-dir](https://github.com/vieko/create-sessions-dir)
