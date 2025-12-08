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
   - "Run 'git status .sessions/' to see what will be committed"

4. Remind user to review git status and commit if needed
