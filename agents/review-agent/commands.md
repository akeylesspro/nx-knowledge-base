# Review & Merge Agent — Commands

## Invocation Note
These commands describe the logical operations the agent performs. They are **not** CLI arguments.
When invoked via `claude --print --dangerously-skip-permissions "<prompt>"`, all context (PR number,
branch, repo, changed files) is passed inside the prompt text. The agent reads this context and
executes the gate sequence described below using `gh` CLI and `git` commands available in the CI runner.

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

### `review:validate-repo-meta`
Validate repository metadata file and location.
```
Input: { pr_number, repo_name }
Output: {
  valid: boolean,
  exists: boolean,
  file: "repos/<repo>/meta.json",
  schema: "schemas/repo-meta.schema.json",
  errors: SchemaError[]
}
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

### `review:post-comment`
Post the gate results table as a PR comment.
```
Command: gh pr comment <pr_number> --body '<markdown>'
Output: PR comment with gate results table, auto-fix summary, and merge decision
```

### `review:label`
Apply a label to the PR based on gate results.
```
Command: gh pr edit <pr_number> --add-label '<label>'
Labels: sync-validated | validation-failed | needs-human-review | override-conflict
```

### `review:write-results`
Write the gate results to /tmp/review-results.json for the workflow to read.
```
Output file: /tmp/review-results.json
  { all_pass, critical_failure, override_conflict, gates: { schema, links, overrides,
    completeness, meta, naming, duplicates } }
Note: The workflow (not the agent) runs gh pr merge --squash based on this file.
```

### `review:request-human`
Label the PR for human review (used as a fallback if critical gates fail).
```
Command: gh pr edit <pr_number> --add-label 'needs-human-review'
Output: { labeled: boolean }
Note: The workflow also applies this label as a safety fallback.
```
