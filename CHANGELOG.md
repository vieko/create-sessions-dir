# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.6] - 2024-12-08

### Changed
- Updated README.md to accurately describe git hook workflow for archiving
- Updated templates/sessions/README.md with git hook documentation
- Clarified that `/end-session` updates context and commits (archiving prompted by git hook after merge)

### Added
- CHANGELOG.md with complete version history

## [0.3.5] - 2024-12-08

### Changed
- **Git hook workflow**: Replaced script-based archive detection with interactive git hook
  - Added `.git/hooks/post-merge` that prompts to archive after merging to main
  - Removed `should-archive.sh` script (deprecated)
  - Simplified `/end-session` command to just update notes and commit
- **Permission system**: Changed from `allow` to `ask` mode for better UX
  - Scripts now show approval prompts instead of blocking errors
  - Improved permission troubleshooting documentation

### Fixed
- Permission errors with `/end-session` in monorepos
- False positives from archive detection on long-running branches
- Command expansion permission incompatibilities

### Removed
- `.claude/scripts/should-archive.sh` (replaced by git hook)

## [0.3.4] - 2024-12-07

### Fixed
- Permission system using relative paths for portability across machines
- Updated documentation with context engineering best practices

## [0.3.3] - 2024-12-07

### Fixed
- Permission patterns to use relative paths instead of absolute paths
- Settings.json generation for consistent permission handling

## [0.3.2] - 2024-12-07

### Added
- Context engineering best practices documented in CLAUDE.md
- Length targets and anti-patterns for effective documentation

## [0.3.1] - 2024-12-08

### Fixed
- Shell redirection error when parsing GitHub/Linear URLs
- Made WORKSPACE.md check graceful (no error if missing)

### Changed
- Simplified `/start-session` to only fetch new issues (trust session context)
- Made CLAUDE.md creation/update optional during install

## [0.3.0] - 2024-12-08

### Added
- **Sub-agent architecture**: Commands can launch specialized agents
  - `/plan` command with Plan agent integration
  - `/document` command with Explore agent integration
- **Monorepo support**: Auto-detection and workspace-specific directories
  - Detects pnpm, yarn, npm, Turborepo, and Lerna workspaces
  - Creates `.sessions/packages/` and `WORKSPACE.md`
- **Script integration pattern**: Helper scripts in `.claude/scripts/`
  - `should-archive.sh` for PR detection (deprecated in v0.3.5)
  - `untrack-sessions.sh` for changing git strategies
- **Issue integration**: GitHub and Linear support in `/start-session`
  - Fetch GitHub PRs/issues via `gh` CLI
  - Fetch Linear issues via `linearis` CLI (optional)
  - Store context in `.sessions/prep/`
- **Interactive git strategy selection**: Choose how .sessions/ is tracked
  - Ignore all (default) - privacy by default
  - Hybrid - commit docs/plans, keep notes private
  - Commit all - share everything with team
- **Smart update path**: Preserves user work when updating from v0.1-0.2
  - Version detection via files (not directories)
  - Creates missing directories
  - Updates commands while preserving content
- **CLAUDE.md integration**: Optional context file creation/update

### Changed
- Enhanced `/end-session` with automatic archive detection (simplified in v0.3.5)
- Created `.sessions/plans/` directory for implementation plans
- Created `.sessions/prep/` directory for pre-session context

### Improved
- Documentation with comprehensive workflow guide
- Template system with better variable substitution

## [0.2.0] - 2024-12-07

### Added
- `/archive-session` command for moving completed work
- `/change-git-strategy` command for switching git handling
- Documentation structure with `.sessions/docs/`

### Changed
- Improved session workflow with clearer commands
- Enhanced context engineering patterns

## [0.1.0] - 2024-12-07

### Added
- Initial release of Sessions Directory Pattern
- `.sessions/` directory structure
- `.sessions/index.md` living context document
- `.sessions/archive/` for completed work
- `.sessions/README.md` workflow guide
- `.claude/commands/` with basic slash commands:
  - `/start-session`
  - `/end-session`
- Basic git integration
- Color-coded terminal output
- Project name detection (package.json, git remote, directory)

[0.3.6]: https://github.com/vieko/create-sessions-dir/compare/v0.3.5...v0.3.6
[0.3.5]: https://github.com/vieko/create-sessions-dir/compare/v0.3.4...v0.3.5
[0.3.4]: https://github.com/vieko/create-sessions-dir/compare/v0.3.3...v0.3.4
[0.3.3]: https://github.com/vieko/create-sessions-dir/compare/v0.3.2...v0.3.3
[0.3.2]: https://github.com/vieko/create-sessions-dir/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/vieko/create-sessions-dir/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/vieko/create-sessions-dir/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/vieko/create-sessions-dir/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/vieko/create-sessions-dir/releases/tag/v0.1.0
