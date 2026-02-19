# Review & Merge Agent — Format Rules

## Validation Output Format
All validation results must be structured JSON for programmatic consumption.

```json
{
    "gate": "schema_validation",
    "passed": true,
    "timestamp": "2026-01-01T00:00:00.000Z",
    "details": {
        "files_checked": 10,
        "files_valid": 10,
        "files_invalid": 0,
        "errors": []
    }
}
```

## Repo Meta Validation Output
```json
{
    "gate": "repo_meta_validation",
    "passed": true,
    "timestamp": "2026-01-01T00:00:00.000Z",
    "details": {
        "repo": "my-repo",
        "meta_file": "repos/my-repo/meta.json",
        "schema": "schemas/repo-meta.schema.json",
        "exists": true,
        "schema_valid": true,
        "fields_updated": [
            "file_count",
            "symbol_count",
            "last_synced_at",
            "last_synced_commit"
        ]
    }
}
```

## Error Report Format
```json
{
    "file": "repos/my-repo/docs/routes/auth.ts.json",
    "field": "symbols[0].details.what_it_does",
    "error": "required_field_missing",
    "message": "Field 'what_it_does' is required in symbol details",
    "severity": "blocker",
    "auto_fixable": false
}
```

## Auto-Fix Record Format
```json
{
    "file": "repos/my-repo/docs/routes/auth.ts.json",
    "field": "quality.known_gaps",
    "action": "set_default",
    "old_value": null,
    "new_value": [],
    "reason": "Missing optional field, set to empty array default"
}
```

For `meta.json` auto-fixes, use:
- `file`: `repos/<repo>/meta.json`
- `action`: one of `create_missing_file`, `set_value`, `recalculate`
- `reason`: include whether the fix was triggered by doc add/update/delete
- `fields_updated`: include all schema-relevant fields affected by the doc change (not only counters)

## Merge Strategy
- Use **squash merge** for Sync Agent PRs.
- Commit message must follow the template in `style.md`.
- Delete the source branch after merge.
