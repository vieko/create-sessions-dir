#!/usr/bin/env node

import { existsSync, mkdirSync, writeFileSync, readFileSync, chmodSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

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

function detectVersion(): string | null {
  // Try to detect version from existing setup
  if (!existsSync('.sessions')) return null;

  // v0.1.x-0.2.x: Has .sessions but no plans/ or prep/
  const hasPlans = existsSync('.sessions/plans');
  const hasPrep = existsSync('.sessions/prep');
  const hasScripts = existsSync('.claude/scripts');

  if (!hasPlans && !hasPrep && !hasScripts) {
    return 'v0.1-0.2'; // Old version
  }

  return 'v0.3+'; // Current or newer
}

function updateExistingSetup() {
  log('\n📦 Updating existing Sessions Directory...', colors.cyan);

  const version = detectVersion();

  if (version === 'v0.3+') {
    log('✓ Already on latest version', colors.green);
    return;
  }

  // Create new directories (safe - won't overwrite)
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

  // Create .gitignore if missing
  if (!existsSync('.sessions/.gitignore')) {
    const gitignoreContent = getTemplateContent('sessions/.gitignore');
    writeFileSync('.sessions/.gitignore', gitignoreContent);
    log('✓ Created .sessions/.gitignore', colors.green);
  }

  // Update or create commands
  const commands = ['start-session', 'end-session', 'document', 'archive-session'];
  for (const cmd of commands) {
    const content = getTemplateContent(`claude/commands/${cmd}.md`);
    writeFileSync(`.claude/commands/${cmd}.md`, content);
    log(`✓ Updated .claude/commands/${cmd}.md`, colors.green);
  }

  // Create new plan command
  if (!existsSync('.claude/commands/plan.md')) {
    const planContent = getTemplateContent('claude/commands/plan.md');
    writeFileSync('.claude/commands/plan.md', planContent);
    log('✓ Created .claude/commands/plan.md', colors.green);
  }

  // Create script
  if (!existsSync('.claude/scripts/should-archive.sh')) {
    const shouldArchiveScript = getTemplateContent('claude/scripts/should-archive.sh');
    writeFileSync('.claude/scripts/should-archive.sh', shouldArchiveScript);
    chmodSync('.claude/scripts/should-archive.sh', 0o755);
    log('✓ Created .claude/scripts/should-archive.sh', colors.green);
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

  log('\n✓ Created .sessions/ directory', colors.green);
  log('✓ Created .sessions/archive/ directory', colors.green);
  log('✓ Created .sessions/plans/ directory', colors.green);
  log('✓ Created .sessions/prep/ directory', colors.green);
  log('✓ Created .claude/commands/ directory', colors.green);
  log('✓ Created .claude/scripts/ directory', colors.green);

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

  // Create .gitignore
  const gitignoreContent = getTemplateContent('sessions/.gitignore');
  writeFileSync('.sessions/.gitignore', gitignoreContent);
  log('✓ Created .sessions/.gitignore', colors.green);

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

  // Create scripts
  const shouldArchiveScript = getTemplateContent('claude/scripts/should-archive.sh');
  writeFileSync('.claude/scripts/should-archive.sh', shouldArchiveScript);
  chmodSync('.claude/scripts/should-archive.sh', 0o755);
  log('✓ Created .claude/scripts/should-archive.sh', colors.green);
}

function main() {
  log('\n✨ create-sessions-dir', colors.cyan + colors.bright);
  log('   Setting up Sessions Directory Pattern\n', colors.cyan);

  // Check for existing .sessions directory
  if (checkExistingSessions()) {
    const version = detectVersion();
    if (version === 'v0.3+') {
      log('✓ Sessions Directory already exists and is up to date', colors.green);
      log('   No updates needed.\n', colors.cyan);
      process.exit(0);
    } else {
      log('📦 Existing Sessions Directory detected (older version)', colors.cyan);
      log('   Updating to v0.3.0 with new features...\n', colors.cyan);
      updateExistingSetup();

      // Check for Claude CLI
      const hasClaudeCLI = checkClaudeCLI();

      log('\n' + '─'.repeat(50), colors.blue);
      log('\n🎉 Update complete!\n', colors.green + colors.bright);

      log('What\'s new in v0.3.0:', colors.bright);
      log('  • Smart PR detection and archiving (.claude/scripts/should-archive.sh)');
      log('  • GitHub/Linear issue integration (/start-session)');
      log('  • Implementation planning (/plan)');
      log('  • Enhanced documentation with sub-agents (/document)');
      log('  • Monorepo support (auto-detected)');
      log('  • New directories: plans/, prep/\n');

      if (!hasClaudeCLI) {
        log('⚠️  Claude CLI not detected', colors.yellow);
        log('   Install it to use slash commands:', colors.yellow);
        log('   npm install -g @anthropic-ai/claude-code\n', colors.cyan);
      }

      log('Next steps:', colors.bright);
      log('  1. Check updated commands in .claude/commands/');
      log('  2. Try /plan to create an implementation plan');
      log('  3. Learn more: https://vieko.dev/sessions\n');
      return;
    }
  }

  // Create the structure (fresh install)
  createSessionsDirectory();

  // Check for Claude CLI
  const hasClaudeCLI = checkClaudeCLI();

  log('\n' + '─'.repeat(50), colors.blue);
  log('\n🎉 Sessions Directory created successfully!\n', colors.green + colors.bright);

  if (!hasClaudeCLI) {
    log('⚠️  Claude CLI not detected', colors.yellow);
    log('   Install it to use slash commands:', colors.yellow);
    log('   npm install -g @anthropic-ai/claude-code\n', colors.cyan);
  }

  log('Next steps:', colors.bright);
  log('  1. Read the guide: .sessions/README.md');
  log('  2. Start your first session with: /start-session');
  log('  3. Learn more: https://vieko.dev/sessions\n');
}

main();
