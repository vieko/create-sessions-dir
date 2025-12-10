---
description: Create topic-specific documentation
---

**First**: Find the git root to locate session files (supports monorepos):
- Run: `git rev-parse --show-toplevel` to get the repository root path
- Session files live at `<git-root>/.sessions/`

Create or update documentation for a specific topic in `<git-root>/.sessions/docs/`

The user will provide a topic name (e.g., "authentication", "api-design", "testing-strategy").

Steps:
1. If `<git-root>/.sessions/docs/` doesn't exist, create it first
2. Ask: "What should be documented about [topic]?"
3. Launch an Explore agent with:
   "Thoroughly explore the codebase to understand [topic].

   Focus on:
   - Architecture and patterns
   - Key implementation details
   - Important decisions and trade-offs
   - Critical files and code locations

   Return a structured summary suitable for documentation."

4. Use the agent's findings to create `<git-root>/.sessions/docs/<topic>.md` with:
   - Overview of the topic
   - Current decisions and rationale
   - Implementation details or patterns
   - Key files and code references (use file:line format)
   - Open questions or considerations

5. Add reference to this doc in `<git-root>/.sessions/index.md` under relevant section

Keep documentation scannable with clear headings and bullet points.
