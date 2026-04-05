---
name: verify
description: Run the full project check suite (lint + format check + tsc) and report results. Use before committing or when you want to confirm the codebase is clean.
---

Run the following command and report the results clearly:

```bash
bun run check
```

This runs `oxlint && oxfmt --check && tsc` in sequence.

If any step fails:

1. Report which step failed and show the error output
2. Suggest the fix command: `bun run fix` (auto-fixes lint + format) or `bun run tsc` to isolate type errors
3. Do NOT automatically run fixes — wait for the user to confirm

If all steps pass, confirm: "✓ check passed: lint, format, and types are clean."
