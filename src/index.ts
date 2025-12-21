#!/usr/bin/env node

import { existsSync, mkdirSync, writeFileSync, readFileSync, chmodSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import prompts from 'prompts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkExistingSessions(): boolean {
  return existsSync('.sessions');
}

// Version tracking
function getPackageVersion(): string {
  const pkgPath = join(__dirname, '..', 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  return pkg.version;
}

function getInstalledVersion(): string | null {
  const versionFile = '.sessions/.version';
  if (existsSync(versionFile)) {
    return readFileSync(versionFile, 'utf-8').trim();
  }
  return null;
}

function writeInstalledVersion(version: string): void {
  writeFileSync('.sessions/.version', version + '\n');
}

function parseVersion(version: string): { major: number; minor: number; patch: number } {
  const [major, minor, patch] = version.replace(/^v/, '').split('.').map(Number);
  return { major: major || 0, minor: minor || 0, patch: patch || 0 };
}

function compareVersions(a: string, b: string): number {
  const vA = parseVersion(a);
  const vB = parseVersion(b);

  if (vA.major !== vB.major) return vA.major - vB.major;
  if (vA.minor !== vB.minor) return vA.minor - vB.minor;
  return vA.patch - vB.patch;
}

function isVersionLessThan(installed: string, target: string): boolean {
  return compareVersions(installed, target) < 0;
}

// Changelog entries by version
interface ChangelogEntry {
  version: string;
  changes: string[];
}

const CHANGELOG: ChangelogEntry[] = [
  {
    version: '0.3.9',
    changes: [
      'Session context skill (Claude auto-reads .sessions/index.md)',
      'Robust version tracking with .sessions/.version',
    ]
  },
  {
    version: '0.3.8',
    changes: [
      'Linear MCP integration (replaced linearis CLI)',
    ]
  },
  {
    version: '0.3.5',
    changes: [
      'Git hook for archive reminders (post-merge)',
      'Ask mode for script permissions (better UX)',
      'Permission system overhaul',
    ]
  },
  {
    version: '0.3.0',
    changes: [
      'GitHub integration via gh CLI (/start-session)',
      'Implementation planning (/plan)',
      'Enhanced documentation with sub-agents (/document)',
      'Monorepo support (auto-detected)',
      'Interactive git strategy selection',
      'New directories: plans/, prep/',
    ]
  },
];

function getChangesFromVersion(installedVersion: string | null): string[] {
  if (!installedVersion) {
    // Legacy install without version file - show all changes from 0.3.0+
    return CHANGELOG.flatMap(entry => entry.changes);
  }

  const changes: string[] = [];
  for (const entry of CHANGELOG) {
    if (isVersionLessThan(installedVersion, entry.version)) {
      changes.push(...entry.changes);
    }
  }
  return changes;
}

function detectVersion(): string | null {
  if (!existsSync('.sessions')) return null;

  // Check for explicit version file first
  const installedVersion = getInstalledVersion();
  if (installedVersion) {
    return installedVersion;
  }

  // Legacy detection for pre-0.3.9 installs (no version file)
  const hasPlanCommand = existsSync('.claude/commands/plan.md');
  const hasHybridGitignore = existsSync('.sessions/.gitignore') &&
    readFileSync('.sessions/.gitignore', 'utf-8').includes('!docs/');
  const hasGitHook = existsSync('.git/hooks/post-merge');

  // Estimate version based on features present
  if (hasGitHook) return '0.3.5'; // Git hooks added in 0.3.5
  if (hasPlanCommand || hasHybridGitignore) return '0.3.0';

  return '0.1.0'; // Very old version
}

async function promptGitStrategy(): Promise<string> {
  const response = await prompts({
    type: 'select',
    name: 'strategy',
    message: 'How should .sessions/ be handled in git?',
    choices: [
      {
        title: 'Ignore all (recommended)',
        value: 'ignore',
        description: 'Keep sessions completely local (start solo, share later if needed)'
      },
      {
        title: 'Hybrid',
        value: 'hybrid',
        description: 'Commit docs/plans, keep working notes private'
      },
      {
        title: 'Commit all',
        value: 'commit',
        description: 'Share session notes with team, preserve history'
      }
    ],
    initial: 0
  });

  return response.strategy || 'ignore';
}

async function promptClaudeMdUpdate(): Promise<boolean> {
  // Check if CLAUDE.md exists
  if (!existsSync('CLAUDE.md')) {
    const response = await prompts({
      type: 'confirm',
      name: 'create',
      message: 'Create CLAUDE.md to document Sessions Pattern for your team?',
      initial: true
    });
    return response.create ?? false;
  }

  // CLAUDE.md exists - check if Sessions Pattern already documented
  const existing = readFileSync('CLAUDE.md', 'utf-8');
  if (existing.includes('Sessions Pattern') || existing.includes('.sessions/')) {
    log('✓ CLAUDE.md already mentions Sessions Pattern', colors.green);
    return false;
  }

  // Ask to append
  const response = await prompts({
    type: 'confirm',
    name: 'append',
    message: 'Add Sessions Pattern documentation to existing CLAUDE.md?',
    initial: true
  });

  return response.append ?? false;
}

function createOrUpdateClaudeMd(isNew: boolean) {
  const sessionsSection = `
## Sessions Pattern (Optional)

If you've set up the Sessions Directory Pattern (\`npx create-sessions-dir\`):

- \`/start-session\` - Read context, fetch GitHub/Linear issues
- \`/end-session\` - Update context, detect merged PRs, auto-archive
- \`/plan\` - Create structured implementation plans
- \`/document\` - Topic-specific documentation with sub-agents
- \`/change-git-strategy\` - Change git strategy for .sessions/

Learn more: https://vieko.dev/sessions

## External Tools (Optional)

**For GitHub integration:**
\`\`\`bash
gh auth login    # Required for PR/issue fetching
\`\`\`

**For Linear integration:**
Configure the Linear MCP server in your Claude settings.
See: https://github.com/anthropics/claude-code/blob/main/docs/mcp.md

Commands will gracefully handle missing tools and prompt for manual input.
`;

  const templateContent = `# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**WHY**: [Brief 1-2 sentence project purpose]

**WHAT**:
- Tech stack: [e.g., TypeScript, React, Node.js]
- Architecture: [e.g., monorepo, microservices, CLI tool]

**HOW**:
\`\`\`bash
# Build
npm run build

# Test
npm test

# Development
npm run dev
\`\`\`
${sessionsSection}`;

  if (isNew) {
    // Create new CLAUDE.md with template
    writeFileSync('CLAUDE.md', templateContent);
    log('✓ Created CLAUDE.md with WHY/WHAT/HOW template', colors.green);
  } else {
    // Append to existing CLAUDE.md
    const existing = readFileSync('CLAUDE.md', 'utf-8');
    const updated = existing + '\n' + sessionsSection;
    writeFileSync('CLAUDE.md', updated);
    log('✓ Added Sessions Pattern section to CLAUDE.md', colors.green);
  }
}

function createGitignore(strategy: string) {
  const templateMap: Record<string, string> = {
    commit: 'sessions/.gitignore-commit',
    ignore: 'sessions/.gitignore-ignore',
    hybrid: 'sessions/.gitignore-hybrid'
  };

  const template = templateMap[strategy] || templateMap.hybrid;
  const gitignoreContent = getTemplateContent(template);
  writeFileSync('.sessions/.gitignore', gitignoreContent);

  const strategyLabels: Record<string, string> = {
    commit: 'commit strategy (team-shared)',
    ignore: 'ignore strategy (personal)',
    hybrid: 'hybrid strategy (docs committed, notes private)'
  };

  log(`✓ Created .sessions/.gitignore (${strategyLabels[strategy]})`, colors.green);
}

function updateExistingSetup() {
  log('\n[*] Updating existing Sessions Directory...', colors.cyan);

  const version = detectVersion();

  // Always update commands (they're templates, safe to overwrite)
  // Only skip directory creation if already on v0.3+
  const skipDirectoryCreation = version === 'v0.3+';

  // Create new directories (safe - won't overwrite)
  if (!skipDirectoryCreation) {
    if (!existsSync('.sessions/plans')) {
      mkdirSync('.sessions/plans', { recursive: true });
      log('✓ Created .sessions/plans/', colors.green);
    }

    if (!existsSync('.sessions/prep')) {
      mkdirSync('.sessions/prep', { recursive: true });
      log('✓ Created .sessions/prep/', colors.green);
    }

    if (!existsSync('.claude/scripts')) {
      mkdirSync('.claude/scripts', { recursive: true });
      log('✓ Created .claude/scripts/', colors.green);
    }

    if (!existsSync('.claude/skills')) {
      mkdirSync('.claude/skills/session-context', { recursive: true });
      log('✓ Created .claude/skills/', colors.green);
    }
  }

  // Update .gitignore to ignore if it only has basic content
  if (!skipDirectoryCreation) {
    if (existsSync('.sessions/.gitignore')) {
      const existing = readFileSync('.sessions/.gitignore', 'utf-8');
      // If it's the old basic version, update to ignore (safest for updates)
      if (existing.includes('data/') && existing.includes('scratch/') && existing.split('\n').length < 10) {
        createGitignore('ignore');
        log('✓ Updated .sessions/.gitignore to ignore strategy', colors.cyan);
      }
    } else {
      // No gitignore exists, create ignore (safest for updates - prevents accidental commits)
      createGitignore('ignore');
    }
  }

  // Update or create commands
  const commands = ['start-session', 'end-session', 'document', 'archive-session'];
  for (const cmd of commands) {
    const content = getTemplateContent(`claude/commands/${cmd}.md`);
    writeFileSync(`.claude/commands/${cmd}.md`, content);
    log(`✓ Updated .claude/commands/${cmd}.md`, colors.green);
  }

  // Create new v0.3 commands
  const newCommands = ['plan', 'change-git-strategy'];
  for (const cmd of newCommands) {
    if (!existsSync(`.claude/commands/${cmd}.md`)) {
      const content = getTemplateContent(`claude/commands/${cmd}.md`);
      writeFileSync(`.claude/commands/${cmd}.md`, content);
      log(`✓ Created .claude/commands/${cmd}.md`, colors.green);
    }
  }

  // Create or update skills
  if (!existsSync('.claude/skills/session-context')) {
    mkdirSync('.claude/skills/session-context', { recursive: true });
  }
  const sessionContextSkill = getTemplateContent('claude/skills/session-context/SKILL.md');
  writeFileSync('.claude/skills/session-context/SKILL.md', sessionContextSkill);
  log('✓ Updated .claude/skills/session-context/SKILL.md', colors.green);

  // Always create or update settings.json for permissions
  if (!existsSync('.claude/settings.json')) {
    const settingsContent = getTemplateContent('claude/settings.json');
    writeFileSync('.claude/settings.json', settingsContent);
    log('✓ Created .claude/settings.json', colors.green);
  } else {
    // Fix absolute paths in existing settings.json
    try {
      const settings = JSON.parse(readFileSync('.claude/settings.json', 'utf-8'));
      let updated = false;

      if (settings.permissions?.allow) {
        settings.permissions.allow = settings.permissions.allow.map((perm: string) => {
          // Convert absolute .claude/scripts paths to relative
          if (perm.match(/Bash\(\/.*\/.claude\/scripts\/.*:\*\)/)) {
            updated = true;
            // Extract just the relative path pattern
            if (perm.includes('*:*')) {
              return 'Bash(.claude/scripts/*:*)';
            }
            // For specific script permissions, preserve the script name
            const scriptName = perm.match(/\/([^/]+):\*\)$/)?.[1];
            if (scriptName) {
              return `Bash(.claude/scripts/${scriptName}:*)`;
            }
          }
          return perm;
        });

        if (updated) {
          writeFileSync('.claude/settings.json', JSON.stringify(settings, null, 2) + '\n');
          log('✓ Updated .claude/settings.json to use relative paths', colors.green);
        }
      }
    } catch (e) {
      // Silently skip if there's an error parsing settings
    }
  }

  // Warn about settings.local.json
  if (existsSync('.claude/settings.local.json')) {
    log('[!] Note: .claude/settings.local.json detected', colors.yellow);
    log('  You may need to manually update it to use relative paths:', colors.yellow);
    log('  Change: Bash(/full/path/.claude/scripts/*:*)', colors.cyan);
    log('  To:     Bash(.claude/scripts/*:*)', colors.cyan);
  }

  // Create scripts
  if (!skipDirectoryCreation) {
    if (!existsSync('.claude/scripts/untrack-sessions.sh')) {
      const untrackScript = getTemplateContent('claude/scripts/untrack-sessions.sh');
      writeFileSync('.claude/scripts/untrack-sessions.sh', untrackScript);
      chmodSync('.claude/scripts/untrack-sessions.sh', 0o755);
      log('✓ Created .claude/scripts/untrack-sessions.sh', colors.green);
    }

    // Check for monorepo and add workspace support if needed
    const monorepo = detectMonorepo();
    if (monorepo.isMonorepo && !existsSync('.sessions/WORKSPACE.md')) {
      mkdirSync('.sessions/packages', { recursive: true });
      log('✓ Detected monorepo - created .sessions/packages/', colors.cyan);

      const workspaceContent = getTemplateContent('sessions/WORKSPACE.md')
        .replace('{{PACKAGES}}', monorepo.packages.map(p => `- ${p}`).join('\n'));
      writeFileSync('.sessions/WORKSPACE.md', workspaceContent);
      log('✓ Created .sessions/WORKSPACE.md', colors.green);
    }
  }

  // Remove deprecated should-archive.sh script (replaced by git hook in v0.3.5)
  if (existsSync('.claude/scripts/should-archive.sh')) {
    unlinkSync('.claude/scripts/should-archive.sh');
    log('✓ Removed deprecated should-archive.sh script', colors.yellow);
  }

  // Set up git post-merge hook for archive reminders (always check, even for v0.3+ users)
  if (existsSync('.git/hooks') && !existsSync('.git/hooks/post-merge')) {
    const hookPath = '.git/hooks/post-merge';
    const hookContent = getTemplateContent('git/hooks/post-merge');
    writeFileSync(hookPath, hookContent);
    chmodSync(hookPath, 0o755);
    log('✓ Created git post-merge hook for archive reminders', colors.green);
  }

  // Write version file for future update tracking
  const packageVersion = getPackageVersion();
  writeInstalledVersion(packageVersion);
  log(`✓ Updated .sessions/.version (${packageVersion})`, colors.green);

  log('\n✓ Update complete! Your existing work is preserved.', colors.green + colors.bright);
}

function checkClaudeCLI(): boolean {
  try {
    execSync('which claude', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function getProjectName(): string {
  // Try to get from package.json
  if (existsSync('package.json')) {
    try {
      const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
      if (pkg.name) return pkg.name;
    } catch {
      // Fall through
    }
  }

  // Try to get from git
  try {
    const gitRemote = execSync('git remote get-url origin', { encoding: 'utf-8' }).trim();
    const match = gitRemote.match(/\/([^\/]+?)(?:\.git)?$/);
    if (match) return match[1];
  } catch {
    // Fall through
  }

  // Use directory name
  return process.cwd().split('/').pop() || 'My Project';
}

function getCurrentDate(): string {
  const date = new Date();
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  return date.toLocaleDateString('en-US', options);
}

function getTemplateContent(filename: string): string {
  const templatesDir = join(__dirname, '..', 'templates');
  const filePath = join(templatesDir, filename);
  return readFileSync(filePath, 'utf-8');
}

interface MonorepoInfo {
  isMonorepo: boolean;
  root: string;
  packages: string[];
}

function detectMonorepo(): MonorepoInfo {
  // Check for pnpm workspace
  if (existsSync('pnpm-workspace.yaml')) {
    try {
      const yaml = readFileSync('pnpm-workspace.yaml', 'utf-8');
      // Simple YAML parsing for packages array
      const packagesMatch = yaml.match(/packages:\s*\n((?:\s*-\s*.+\n?)+)/);
      if (packagesMatch) {
        const packages = packagesMatch[1]
          .split('\n')
          .filter(line => line.trim().startsWith('-'))
          .map(line => line.trim().substring(1).trim());
        return { isMonorepo: true, root: process.cwd(), packages };
      }
    } catch {
      // Fall through
    }
  }

  // Check for npm/yarn/bun workspaces (also used by Turborepo)
  if (existsSync('package.json')) {
    try {
      const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
      if (pkg.workspaces) {
        const packages = Array.isArray(pkg.workspaces)
          ? pkg.workspaces
          : pkg.workspaces.packages || [];
        return { isMonorepo: true, root: process.cwd(), packages };
      }
    } catch {
      // Fall through
    }
  }

  // Check for Lerna
  if (existsSync('lerna.json')) {
    try {
      const lerna = JSON.parse(readFileSync('lerna.json', 'utf-8'));
      const packages = lerna.packages || ['packages/*'];
      return { isMonorepo: true, root: process.cwd(), packages };
    } catch {
      // Fall through
    }
  }

  // Check for Turborepo (fallback if no workspace config found yet)
  // Turborepo uses underlying workspace configs, so this is a hint to check deeper
  if (existsSync('turbo.json') || existsSync('turbo.jsonc')) {
    // Turborepo detected but no workspace config - might be misconfigured or minimal setup
    // Default to common patterns
    return { isMonorepo: true, root: process.cwd(), packages: ['apps/*', 'packages/*'] };
  }

  return { isMonorepo: false, root: process.cwd(), packages: [] };
}

function createSessionsDirectory() {
  const projectName = getProjectName();
  const currentDate = getCurrentDate();
  const monorepo = detectMonorepo();

  // Create base directories
  mkdirSync('.sessions', { recursive: true });
  mkdirSync('.sessions/archive', { recursive: true });
  mkdirSync('.sessions/plans', { recursive: true });
  mkdirSync('.sessions/prep', { recursive: true });
  mkdirSync('.claude', { recursive: true });
  mkdirSync('.claude/commands', { recursive: true });
  mkdirSync('.claude/scripts', { recursive: true });
  mkdirSync('.claude/skills/session-context', { recursive: true });

  log('\n✓ Created .sessions/ directory', colors.green);
  log('✓ Created .sessions/archive/ directory', colors.green);
  log('✓ Created .sessions/plans/ directory', colors.green);
  log('✓ Created .sessions/prep/ directory', colors.green);
  log('✓ Created .claude/commands/ directory', colors.green);
  log('✓ Created .claude/scripts/ directory', colors.green);
  log('✓ Created .claude/skills/ directory', colors.green);

  // Handle monorepo setup
  if (monorepo.isMonorepo) {
    mkdirSync('.sessions/packages', { recursive: true });
    log('✓ Detected monorepo - created .sessions/packages/', colors.cyan);

    const workspaceContent = getTemplateContent('sessions/WORKSPACE.md')
      .replace('{{PACKAGES}}', monorepo.packages.map(p => `- ${p}`).join('\n'));
    writeFileSync('.sessions/WORKSPACE.md', workspaceContent);
    log('✓ Created .sessions/WORKSPACE.md', colors.green);
  }

  // Create index.md
  const indexContent = getTemplateContent('sessions/index.md')
    .replace('{{PROJECT_NAME}}', projectName)
    .replace(/\{\{CURRENT_DATE(_\d+)?\}\}/g, currentDate);
  writeFileSync('.sessions/index.md', indexContent);
  log('✓ Created .sessions/index.md', colors.green);

  // Create README.md
  const readmeContent = getTemplateContent('sessions/README.md');
  writeFileSync('.sessions/README.md', readmeContent);
  log('✓ Created .sessions/README.md', colors.green);

  // Git strategy will be set in main() after user prompt

  // Create slash commands
  const startSessionContent = getTemplateContent('claude/commands/start-session.md');
  writeFileSync('.claude/commands/start-session.md', startSessionContent);
  log('✓ Created .claude/commands/start-session.md', colors.green);

  const endSessionContent = getTemplateContent('claude/commands/end-session.md');
  writeFileSync('.claude/commands/end-session.md', endSessionContent);
  log('✓ Created .claude/commands/end-session.md', colors.green);

  const archiveSessionContent = getTemplateContent('claude/commands/archive-session.md');
  writeFileSync('.claude/commands/archive-session.md', archiveSessionContent);
  log('✓ Created .claude/commands/archive-session.md', colors.green);

  const documentContent = getTemplateContent('claude/commands/document.md');
  writeFileSync('.claude/commands/document.md', documentContent);
  log('✓ Created .claude/commands/document.md', colors.green);

  const planContent = getTemplateContent('claude/commands/plan.md');
  writeFileSync('.claude/commands/plan.md', planContent);
  log('✓ Created .claude/commands/plan.md', colors.green);

  const changeGitStrategyContent = getTemplateContent('claude/commands/change-git-strategy.md');
  writeFileSync('.claude/commands/change-git-strategy.md', changeGitStrategyContent);
  log('✓ Created .claude/commands/change-git-strategy.md', colors.green);

  // Create skills
  const sessionContextSkill = getTemplateContent('claude/skills/session-context/SKILL.md');
  writeFileSync('.claude/skills/session-context/SKILL.md', sessionContextSkill);
  log('✓ Created .claude/skills/session-context/SKILL.md', colors.green);

  // Create scripts
  const untrackScript = getTemplateContent('claude/scripts/untrack-sessions.sh');
  writeFileSync('.claude/scripts/untrack-sessions.sh', untrackScript);
  chmodSync('.claude/scripts/untrack-sessions.sh', 0o755);
  log('✓ Created .claude/scripts/untrack-sessions.sh', colors.green);

  // Create settings.json for tool permissions
  const settingsContent = getTemplateContent('claude/settings.json');
  writeFileSync('.claude/settings.json', settingsContent);
  log('✓ Created .claude/settings.json', colors.green);

  // Set up git post-merge hook for archive reminders
  if (existsSync('.git/hooks')) {
    const hookPath = '.git/hooks/post-merge';
    const hookContent = getTemplateContent('git/hooks/post-merge');
    writeFileSync(hookPath, hookContent);
    chmodSync(hookPath, 0o755);
    log('✓ Created git post-merge hook for archive reminders', colors.green);
  }

  // Write version file for future update tracking
  const packageVersion = getPackageVersion();
  writeInstalledVersion(packageVersion);
  log(`✓ Created .sessions/.version (${packageVersion})`, colors.green);
}

async function main() {
  log('\n[*] create-sessions-dir', colors.cyan + colors.bright);
  log('   Setting up Sessions Directory Pattern\n', colors.cyan);

  // Check for existing .sessions directory
  if (checkExistingSessions()) {
    const installedVersion = detectVersion();
    const packageVersion = getPackageVersion();
    const changes = getChangesFromVersion(installedVersion);
    const hasChanges = changes.length > 0;

    if (installedVersion) {
      log(`[i] Existing Sessions Directory detected (v${installedVersion})`, colors.cyan);
    } else {
      log('[i] Existing Sessions Directory detected (legacy)', colors.cyan);
    }

    if (hasChanges) {
      log(`   Updating to v${packageVersion}...\n`, colors.cyan);
    } else {
      log(`   Already at v${packageVersion}, refreshing templates...\n`, colors.cyan);
    }

    updateExistingSetup();

    // Check for Claude CLI
    const hasClaudeCLI = checkClaudeCLI();

    log('\n' + '─'.repeat(50), colors.blue);
    log('\n[OK] Update complete!\n', colors.green + colors.bright);

    if (hasChanges) {
      log(`What's new since v${installedVersion || 'legacy'}:`, colors.bright);
      for (const change of changes) {
        log(`  - ${change}`);
      }
      log('');
    }

    if (!hasClaudeCLI) {
      log('[!] Claude CLI not detected', colors.yellow);
      log('    Install it to use slash commands:', colors.yellow);
      log('    npm install -g @anthropic-ai/claude-code\n', colors.cyan);
    }

    log('Next steps:', colors.bright);
    log('  1. Check updated commands in .claude/commands/');
    log('  2. Try /plan to create an implementation plan');
    log('  3. Learn more: https://vieko.dev/sessions\n');
    return;
  }

  // Create the structure (fresh install)
  createSessionsDirectory();

  // Prompt for git strategy
  log('');
  const gitStrategy = await promptGitStrategy();
  createGitignore(gitStrategy);

  // Prompt for CLAUDE.md documentation
  log('');
  const shouldUpdateClaudeMd = await promptClaudeMdUpdate();
  if (shouldUpdateClaudeMd) {
    const isNew = !existsSync('CLAUDE.md');
    createOrUpdateClaudeMd(isNew);
  }

  // Check for Claude CLI
  const hasClaudeCLI = checkClaudeCLI();

  log('\n' + '─'.repeat(50), colors.blue);
  log('\n[OK] Sessions Directory created successfully!\n', colors.green + colors.bright);

  if (!hasClaudeCLI) {
    log('[!] Claude CLI not detected', colors.yellow);
    log('    Install it to use slash commands:', colors.yellow);
    log('    npm install -g @anthropic-ai/claude-code\n', colors.cyan);
  }

  log('Next steps:', colors.bright);
  log('  1. Read the guide: .sessions/README.md');
  log('  2. Start your first session with: /start-session');
  log('  3. Learn more: https://vieko.dev/sessions\n');
}

main();
