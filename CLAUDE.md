# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`create-sessions-dir` is an npm package that scaffolds the Sessions Directory Pattern for projects using AI coding agents. It creates a directory structure and slash commands that enable continuity across sessions with stateless AI agents by maintaining context in files rather than relying on agent memory.

**Core concept**: Instead of AI agents trying to "remember" previous conversations, this pattern externalizes memory into `.sessions/index.md` which gets read at session start and updated at session end.

## Build Commands

```bash
# Development
npm run build        # Compile TypeScript to dist/
npm run dev          # Watch mode compilation
npm run prepublishOnly  # Pre-publish build step (runs automatically)

# Testing
npm run build && cd /tmp/test-project && npx /path/to/create-sessions-dir
```

## External Dependencies (Optional)

- **gh CLI**: Required for GitHub PR/issue integration in `/start-session` and `/end-session`
- **linearis CLI**: Optional for Linear issue integration (`npm install -g linearis`)

## Project Architecture

### Entry Point (`src/index.ts`)

Single-file CLI tool that:
1. **Checks prerequisites** - Verifies no existing `.sessions/` directory exists
2. **Detects monorepo** - Checks for pnpm-workspace.yaml, package.json workspaces, or lerna.json
3. **Creates directory structure**:
   - `.sessions/` - Main session context directory
   - `.sessions/archive/` - For completed work
   - `.sessions/plans/` - Implementation plans (new)
   - `.sessions/prep/` - Pre-session context (new)
   - `.sessions/packages/` - Package-specific notes (monorepos only)
   - `.claude/commands/` - Slash commands for Claude Code
   - `.claude/scripts/` - Bash scripts for automation (new)
4. **Populates templates** - Copies and customizes template files with project-specific data
5. **Sets executable permissions** - Makes scripts like `should-archive.sh` executable
6. **Detects project context** - Infers project name from package.json → git remote → directory name
7. **Checks for Claude CLI** - Provides installation instructions if not found

### Template System

Templates live in `templates/` and are copied to target project:

**Session files** (`templates/sessions/`):
- `index.md` - Main session context file (gets date and project name injected)
- `README.md` - Complete workflow guide for using the pattern

**Claude commands** (`templates/claude/commands/`):
- `start-session.md` - Read context, optionally fetch GitHub/Linear issues, ask what to work on
- `end-session.md` - Run PR detection script, update context, offer to archive if PRs merged, commit
- `document.md` - Launch Explore agent to understand topic, create docs in `.sessions/docs/`
- `plan.md` - Launch Plan agent to design implementation, create structured plan in `.sessions/plans/`
- `archive-session.md` - Move completed work to archive

**Claude scripts** (`templates/claude/scripts/`):
- `should-archive.sh` - Bash script that parses session notes for PR references, checks if merged via gh CLI, outputs recommendation

### Template Variable Substitution

The tool replaces placeholders in templates:
- `{{PROJECT_NAME}}` → Project name (from package.json, git, or directory)
- `{{CURRENT_DATE}}` / `{{CURRENT_DATE_2}}` → Current date in "Month Day, Year" format

### Color-Coded Terminal Output

Uses ANSI color codes for CLI feedback:
- Green: Success messages
- Yellow: Warnings
- Cyan: Headers and info
- Blue: Separators

## TypeScript Configuration

- **Target**: ES2022 with ESNext modules
- **Output**: `dist/` directory (gitignored)
- **Mode**: `moduleResolution: "bundler"` for modern bundler compatibility
- Includes declaration files and source maps

## Package Configuration

- **Type**: ES module (`"type": "module"`)
- **Bin**: `create-sessions-dir` command → `dist/index.js`
- **Published files**: `dist/` and `templates/` only
- **Dependencies**: `prompts` (for potential interactive prompts, currently unused)

## Development Workflow

1. **Local testing**: Run `npm run build` then `npx .` in a test project directory
2. **Making template changes**: Edit files in `templates/`, they're copied verbatim (except variable substitution)
3. **Modifying CLI logic**: Edit `src/index.ts` and rebuild
4. **Publishing**: Version bump → `npm publish` (prepublishOnly hook runs build automatically)

## Important Patterns

### Script Integration Pattern

**New in v0.3.0**: Slash commands can invoke Bash scripts for deterministic logic.

**Example**: `/end-session` calls `should-archive.sh`
```markdown
---
allowed-tools: Bash(.claude/scripts/*:*)
---

Archive recommendation: !`.claude/scripts/should-archive.sh`
```

**Benefits**:
- Reproducible detection logic (can test independently)
- Consistent behavior across sessions
- Offloads uncertainty from Claude to deterministic code
- Version-controlled and debuggable

**Script requirements**:
- Executable permissions (set via `chmodSync` during scaffold)
- Clear output format (e.g., "ARCHIVE_RECOMMENDED" or "NO_ARCHIVE")
- Graceful error handling (exit 0 even on failure with helpful message)

### Sub-Agent Pattern

**New in v0.3.0**: Commands can launch specialized agents for complex tasks.

**Example**: `/document` launches Explore agent
```markdown
3. Launch an Explore agent with:
   "Thoroughly explore the codebase to understand [topic]..."
```

**Benefits**:
- Keeps main session context clean
- Enables parallel work
- Specialized agents for specific tasks (Explore for discovery, Plan for design)

### Monorepo Detection

**New in v0.3.0**: Auto-detects monorepo structure and creates workspace-specific directories.

**Detection order**:
1. `pnpm-workspace.yaml` → Parse YAML for packages array
2. `package.json` → Check for `workspaces` field
3. `lerna.json` → Check for `packages` field

**If detected**:
- Creates `.sessions/packages/` directory
- Generates `WORKSPACE.md` with detected packages list
- Slash commands become workspace-aware

### Error Handling
- Exits with error if `.sessions/` already exists (prevents overwriting)
- Gracefully handles missing package.json or git remote when detecting project name
- Uses try-catch with fallbacks for external command execution
- Scripts fail gracefully with helpful messages (e.g., "gh CLI not found")

### File Operations
- Uses synchronous fs operations for simplicity (appropriate for short-running CLI)
- Creates directories with `{ recursive: true }` to avoid errors if parent exists
- Template loading goes through `getTemplateContent()` helper for consistent path resolution
- Sets executable permissions on scripts using `chmodSync(path, 0o755)`

### Cross-Platform Considerations
- Uses `path.join()` for all path construction
- Handles shebang (`#!/usr/bin/env node`) for CLI execution
- ANSI colors work on macOS/Linux (Windows support via modern terminals)
- Bash scripts require Unix-like environment (macOS, Linux, WSL)
