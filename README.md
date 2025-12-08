# create-sessions-dir

Scaffold a Sessions Directory for working with AI coding agents.

## What is this?

`create-sessions-dir` sets up the **Sessions Directory Pattern** in your project - a workflow for maintaining context across sessions with stateless AI agents like Claude Code.

Instead of relying on the agent to "remember" previous conversations, you maintain a living document that gets read at session start and updated at session end. Simple, effective, and surprisingly powerful.

**Learn more**: [Pairing with a Partner Who Forgets Everything](https://vieko.dev/sessions)

## Quick Start

Run this in any project directory:

```bash
npx create-sessions-dir
```

This creates:
- `.sessions/` directory with context files
- `.claude/commands/` with slash commands for Claude Code
- Templates and workflow guide

Then start your first session:
```bash
/start-session
```

## What Gets Created

```
.sessions/
  index.md          # Your living context document
  archive/          # For completed work
  plans/            # Implementation plans
  prep/             # Pre-session context
  README.md         # Workflow guide and examples
  .gitignore        # Ignores data/, scratch/ directories
  WORKSPACE.md      # Monorepo guide (if detected)

.claude/
  commands/
    start-session.md    # /start-session command
    end-session.md      # /end-session command
    document.md         # /document <topic> command
    plan.md             # /plan command
    archive-session.md  # /archive-session command
  scripts/
    should-archive.sh   # PR detection for smart archiving
```

## Usage

### Start a Session
```
/start-session
```
Claude reads your context and asks what you want to work on. You can provide a GitHub/Linear URL and Claude will fetch details automatically.

### End a Session
```
/end-session
```
Claude updates your context with what happened. If you referenced PRs (like #123) and they're merged, Claude will offer to archive automatically. Then commits the changes.

### Plan Implementation
```
/plan
```
Claude launches a planning agent to design your implementation, creating a structured plan in `.sessions/plans/`.

### Document a Topic
```
/document architecture
```
Claude launches an exploration agent to understand the topic, then creates documentation in `.sessions/docs/`.

### Archive Completed Work
```
/archive-session
```
Claude moves finished work to the archive to keep your context file clean.

## Requirements

- Any project (works with any language/framework)
- Claude Code CLI (optional but recommended for slash commands)

## Updating

Already have a Sessions Directory from v0.1 or v0.2? Just run:

```bash
npx create-sessions-dir
```

It will detect your existing setup and update it to v0.3.0 **without touching your work**. All your session notes, archive, and docs are preserved. Only the commands and structure are updated.

## Why This Works

AI coding agents are stateless - they don't remember previous sessions. The Sessions Directory Pattern solves this by:

1. **Externalizing memory** - Context lives in files, not the agent's "memory"
2. **Progressive documentation** - You document as you build, not after
3. **Continuity across sessions** - Each session starts with full context
4. **Proof of decisions** - Everything is written down and committed

Read the full story: [vieko.dev/sessions](https://vieko.dev/sessions)

## Acknowledgments

Thanks to [Aman Azad](https://github.com/namadaza) for the nudge to turn the pattern into a tool.

## License

MIT © [Vieko Franetovic](https://vieko.dev)
