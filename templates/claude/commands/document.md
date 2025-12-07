---
description: Create topic-specific documentation
---

Create or update documentation for a specific topic in .sessions/docs/

The user will provide a topic name (e.g., "authentication", "api-design", "testing-strategy").

Steps:
1. If .sessions/docs/ doesn't exist, create it first
2. Ask: "What should be documented about [topic]?"
3. Launch an Explore agent with:
   "Thoroughly explore the codebase to understand [topic].

   Focus on:
   - Architecture and patterns
   - Key implementation details
   - Important decisions and trade-offs
   - Critical files and code locations

   Return a structured summary suitable for documentation."

4. Use the agent's findings to create .sessions/docs/<topic>.md with:
   - Overview of the topic
   - Current decisions and rationale
   - Implementation details or patterns
   - Key files and code references (use file:line format)
   - Open questions or considerations

5. Add reference to this doc in index.md under relevant section

Keep documentation scannable with clear headings and bullet points.
