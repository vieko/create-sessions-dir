# Workspace Configuration

**Detected Monorepo Packages:**
{{PACKAGES}}

## Monorepo Sessions Pattern

This repository uses a shared sessions directory at the root level.

### Structure

- `.sessions/index.md` - Main session context (cross-package work)
- `.sessions/packages/<name>.md` - Package-specific notes (optional)
- `.sessions/plans/` - Implementation plans (can span packages)
- `.sessions/archive/` - Completed work from all packages

### Usage

**Starting a session:**
```bash
/start-session
# Claude reads root index.md and asks what you're working on
```

**Working across packages:**
Reference related work in your session notes:
```markdown
## Current Work
- Working on auth in app-a
- Related: API changes in app-b (see .sessions/packages/app-b.md)
```

**Ending a session:**
```bash
/end-session
# Updates root index.md with work across all packages
```

### Package-Specific Notes (Optional)

Create `.sessions/packages/<package-name>.md` for detailed package context:
- Deep technical decisions specific to that package
- Package-specific architecture notes
- Dependencies and interactions with other packages

The root `index.md` ties everything together at a high level.
