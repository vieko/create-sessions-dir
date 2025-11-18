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
  README.md         # Workflow guide and examples

.claude/
  commands/
    start-session.md    # /start-session command
    end-session.md      # /end-session command
    document.md         # /document <topic> command
    archive-session.md  # /archive-session command
```

## Usage

### Start a Session
```
/start-session
```
Claude reads your context and asks what you want to work on.

### End a Session
```
/end-session
```
Claude updates your context with what happened and commits the changes.

### Document a Topic
```
/document architecture
```
Claude creates topic-specific documentation in `.sessions/docs/`. Use this for architectural decisions, API patterns, testing strategies, or other deep context.

### Archive Completed Work
```
/archive-session
```
Claude moves finished work to the archive to keep your context file clean.

## Requirements

- Any project (works with any language/framework)
- Claude Code CLI (optional but recommended for slash commands)

## Why This Works

AI coding agents are stateless - they don't remember previous sessions. The Sessions Directory Pattern solves this by:

1. **Externalizing memory** - Context lives in files, not the agent's "memory"
2. **Progressive documentation** - You document as you build, not after
3. **Continuity across sessions** - Each session starts with full context
4. **Proof of decisions** - Everything is written down and committed

Read the full story: [vieko.dev/sessions](https://vieko.dev/sessions)

## License

MIT © [Vieko Franetovic](https://vieko.dev)
