# Review & Merge Agent — Style Guide

## Review Comments
- Be concise and actionable.
- Reference specific fields and line numbers.
- Use emoji prefixes for severity:
  - ❌ **Blocker**: Must fix before merge.
  - ⚠️ **Warning**: Should fix, can be deferred.
  - 💡 **Suggestion**: Nice to have, optional.
  - ✅ **Pass**: Validation passed.

## PR Labels
- `sync-validated` — All gates passed, ready to merge.
- `needs-human-review` — Unfixable issues require human attention.
- `validation-failed` — Schema or link validation failed.
- `override-conflict` — Manual edits at risk of being overridden.

## Merge Commit Messages
```
docs(merge): <repo-name> @ <short-sha>

Synced documentation for <N> files.
Added: <N> | Modified: <N> | Deleted: <N>
```

## Gate Report Format
```
## Review Gate Results

| Gate              | Status | Details        |
|-------------------|--------|----------------|
| Schema Validation | ✅/❌  | N files valid  |
| Link Validation   | ✅/❌  | N links valid  |
| Override Safety   | ✅/⚠️  | N conflicts    |
| Completeness      | ✅/⚠️  | N files complete |
| Meta Consistency  | ✅/❌  | Counts match   |
```
