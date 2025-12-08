---
description: Change how .sessions/ is handled in git
---

Change the git strategy for .sessions/ directory.

**Current Strategies:**

1. **Hybrid (recommended)**
   - Commits: docs/, plans/, packages/, README.md, WORKSPACE.md
   - Ignores: index.md, archive/, prep/, data/, scratch/
   - Use case: Share architecture/decisions, keep personal notes private

2. **Commit all (team-shared)**
   - Commits: Everything except data/, scratch/
   - Ignores: Only temporary data
   - Use case: Full team collaboration, shared session history

3. **Ignore all (personal)**
   - Commits: Nothing in .sessions/
   - Ignores: Everything
   - Use case: Solo dev or completely private workflow

**Steps:**

1. Ask: "Which git strategy do you want?"
   - Show current strategy if detectable from .sessions/.gitignore
   - Options: hybrid, commit, ignore

2. Based on choice, update .sessions/.gitignore:

   **For hybrid:**
   ```
   # Personal working notes (not committed)
   index.md
   archive/
   prep/

   # Temporary data
   data/
   scratch/
   *.tmp
   *.local

   # Team documentation (committed)
   !docs/
   !plans/
   !packages/
   !README.md
   !WORKSPACE.md
   !.gitignore
   ```

   **For commit:**
   ```
   # Temporary and local data
   data/
   scratch/
   *.tmp
   *.local
   ```

   **For ignore:**
   ```
   # Keep all sessions local (not committed)
   # Remove this file if you want to commit sessions to git
   *
   ```

3. Show what changed:
   - "Changed from [old strategy] to [new strategy]"
   - "Run 'git status .sessions/' to see current state"

4. Check if any .sessions/ files are already tracked in git:
   ```bash
   git ls-files .sessions/
   ```

   If files are found AND new strategy is more restrictive:
   - **Switching to "ignore all"**: Warn that previously committed files are still tracked
   - **Switching to "hybrid"**: Warn that personal files (index.md, archive/) are still tracked

   Provide the command to untrack them:
   ```bash
   # For ignore all:
   git rm --cached -r .sessions/

   # For hybrid (untrack personal files only):
   git rm --cached .sessions/index.md .sessions/archive/ .sessions/prep/
   ```

   **Important**: This removes files from git tracking but keeps them on disk.

   Provide two options:

   **Option A: Use helper script (recommended)**
   ```bash
   .claude/scripts/untrack-sessions.sh [ignore|hybrid]
   ```

   **Option B: Manual git command**
   ```bash
   git rm --cached -r .sessions/                    # For ignore all
   git rm --cached .sessions/index.md ...           # For hybrid
   ```

   Ask user: "Do you want me to run the helper script now? [y/N]"
   - If yes: Run `.claude/scripts/untrack-sessions.sh [strategy]`, show result
   - If no: Show both options they can run manually

5. Remind user to commit the .gitignore change:
   ```bash
   git add .sessions/.gitignore
   git commit -m "Change sessions git strategy to [new strategy]"
   ```
