# Sync Agent — Logical Operations

## Invocation Note
These operations describe the logical phases the agent performs. They are **not** CLI commands or arguments.
When the agent is invoked via `claude --print --dangerously-skip-permissions "<prompt>"`, all context
(payload, repo, branch, files list) is passed inside the prompt text. The agent reads this context
and executes the appropriate operation sequence described below.

## Operations

### `sync`
Full sync for a repository based on dispatch payload.
```
Input: { repo, files[], commit_sha, branch, timestamp }  ← from prompt context
Output: Updated docs files + meta.json committed to the current branch
```
Note: Process ONLY the files listed in `files[]`. Source files are at `_source/<repo>/`.
The workflow creates the branch and opens the PR — the agent only writes files and commits.

### `sync:file`
Generate or update documentation for a single file.
```
Input: { repo, file_path, file_content, commit_sha }
Output: JSON documentation file
```

### `sync:validate`
Validate all documentation files in a repo against the schema.
```
Input: { repo }
Output: { valid: boolean, errors: ValidationError[] }
```

### `sync:override-check`
Check if any overrides exist for a set of files and report potential conflicts.
```
Input: { repo, file_paths[] }
Output: { conflicts: ConflictReport[] }
```

### `sync:meta-update`
Ensure and update repository metadata:
- Create `repos/<repo>/meta.json` if missing.
- Validate against `schemas/repo-meta.schema.json`.
- Update all relevant metadata fields after each doc add/update/delete.
```
Input: { repo }
Output: Updated `repos/<repo>/meta.json`
```

### `sync:cleanup`
Remove documentation files for source files that no longer exist.
```
Input: { repo, existing_source_files[] }
Output: { removed: string[] }
```
