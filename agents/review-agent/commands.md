# Review & Merge Agent — Commands

## Available Commands

### `review`
Full review of a Sync Agent PR.
```
Input: { pr_number }
Output: { passed: boolean, gates: GateResult[], auto_fixes: Fix[], issues: Issue[] }
```

### `review:validate-schema`
Validate all changed JSON files against the schema.
```
Input: { pr_number }
Output: { valid: boolean, errors: SchemaError[] }
```

### `review:validate-links`
Check all deep links in changed files.
```
Input: { pr_number }
Output: { valid: boolean, broken_links: BrokenLink[] }
```

### `review:check-overrides`
Verify no manual edits are overridden.
```
Input: { pr_number }
Output: { safe: boolean, conflicts: OverrideConflict[] }
```

### `review:auto-fix`
Apply automatic fixes to the PR branch.
```
Input: { pr_number, fixes: Fix[] }
Output: { applied: Fix[], failed: Fix[] }
```

### `review:merge`
Merge the PR to main (only if all gates pass).
```
Input: { pr_number }
Output: { merged: boolean, reason?: string }
```

### `review:request-human`
Label the PR for human review and add comments.
```
Input: { pr_number, issues: Issue[] }
Output: { labeled: boolean, comments_added: number }
```
