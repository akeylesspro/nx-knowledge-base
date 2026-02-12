# Sync Agent — Commands

## Available Commands

### `sync`
Full sync for a repository based on dispatch payload.
```
Input: { repo, files[], diffs[], commit_sha, branch, timestamp }
Output: Branch with updated docs + PR
```

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
Recalculate and update the repo meta.json (file counts, symbol counts).
```
Input: { repo }
Output: Updated meta.json
```

### `sync:cleanup`
Remove documentation files for source files that no longer exist.
```
Input: { repo, existing_source_files[] }
Output: { removed: string[] }
```
