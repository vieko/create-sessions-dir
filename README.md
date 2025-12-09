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
- `.claude/scripts/` with helper scripts
- Templates and workflow guide
- Optionally creates or updates CLAUDE.md to document the pattern

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
    untrack-sessions.sh # Git strategy helper
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
Claude updates your context with session accomplishments and commits the changes.

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

**Automatic Prompts**: After merging to main, a git hook automatically prompts whether to archive completed sessions - archiving happens at the right moment without manual tracking.

### Change Git Strategy
```
/change-git-strategy
```
Change how .sessions/ is handled in git (hybrid, commit all, or ignore all). Useful if you want to share more/less with your team.

## Requirements

- Any project (works with any language/framework)
- Claude Code CLI (optional but recommended for slash commands)

## Updating

Already have a Sessions Directory from v0.1 or v0.2? Just run:

```bash
npx create-sessions-dir
```

It will detect your existing setup and update it to v0.3.0 **without touching your work**. All your session notes, archive, and docs are preserved. Only the commands and structure are updated.

## Interactive Setup

During installation, you'll be prompted for:

1. **Git strategy** - How .sessions/ should be handled in git
   - **Ignore all** (default) - Keep sessions completely local
   - **Hybrid** - Commit docs/plans, keep notes private
   - **Commit all** - Share everything with team

2. **CLAUDE.md documentation** - Document the pattern for your team
   - Creates new CLAUDE.md if none exists
   - Appends to existing CLAUDE.md if detected
   - Skips if Sessions Pattern already documented

## Troubleshooting

### Permission Errors with Slash Commands

If you get **"This command requires approval"** errors when running `/end-session` or other slash commands:

**Cause**: Mismatch between frontmatter `allowed-tools` and `.claude/settings.json` permissions. The permission system uses literal string matching, so relative vs absolute paths are treated as different patterns.

**Solution**:

1. **Check `.claude/settings.json` exists** at project root
2. **Verify patterns use relative paths**: `Bash(.claude/scripts/*:*)`
3. **Check `.claude/settings.local.json`** (if exists) also uses relative paths
4. **Ensure patterns match** between frontmatter and settings files
5. **Restart Claude** - quit completely and start fresh

**Correct configuration example**:

`.claude/settings.json`:
```json
{
  "permissions": {
    "allow": [
      "Bash(.claude/scripts/*:*)",
      "Bash(git:*)",
      "Bash(gh:*)"
    ]
  }
}
```

`.claude/commands/end-session.md`:
```markdown
---
allowed-tools: Bash(git:*), Bash(.claude/scripts/*:*)
---
```

**Note**: Both files must use the same path format (relative: `.claude/scripts/*` NOT absolute: `/Users/you/project/.claude/scripts/*`)

### Updating from Older Versions

If you installed before v0.3.5 and have permission issues:

```bash
npx create-sessions-dir
```

This will automatically detect and fix absolute paths in your `.claude/settings.json`. You may need to manually update `.claude/settings.local.json` if it exists.

## Why This Works

AI coding agents are stateless - they don't remember previous sessions. The Sessions Directory Pattern solves this by:

1. **Externalizing memory** - Context lives in files, not the agent's "memory"
2. **Progressive documentation** - You document as you build, not after
3. **Continuity across sessions** - Each session starts with full context
4. **Proof of decisions** - Everything is written down and committed

Read the full story: [vieko.dev/sessions](https://vieko.dev/sessions)

## References

The Sessions Directory Pattern is informed by research and best practices in AI agent context management:

- [Effective Context Engineering for AI Agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) - Anthropic's engineering guide on context engineering patterns, including structured note-taking, just-in-time context, and sub-agent architectures
- [Writing a good CLAUDE.md](https://www.humanlayer.dev/blog/writing-a-good-claude-md) - HumanLayer's practical guide to effective context files, including length targets, the WHY/WHAT/HOW framework, and anti-patterns to avoid

## Acknowledgments

Thanks to [Aman Azad](https://github.com/namadaza) for the nudge to turn the pattern into a tool.

## License

MIT © [Vieko Franetovic](https://vieko.dev)
