# Review & Merge Agent — Skills

## JSON Schema Validation
- Validate JSON files against JSON Schema Draft-07.
- Report detailed error paths and messages.
- Differentiate between missing required fields and type mismatches.

## Link Validation
- Verify NX-KB internal paths map to existing documentation files.
- Verify GitHub URLs are well-formed (correct org, repo, SHA format).
- Check for stale links (SHA no longer exists on the remote).

## Override Protection
- Read override patches from `repos/<repo>/overrides/`.
- Diff generated content against override patches.
- Detect when generated content would overwrite human-edited fields.
- Report conflict details with field-level granularity.

## Auto-Fix
- Fix JSON formatting issues (indentation, trailing commas).
- Populate missing optional fields with defaults.
- Normalize date formats and timezone issues.
- Ensure `repos/<repo>/meta.json` exists (create if missing).
- Validate `repos/<repo>/meta.json` against `schemas/repo-meta.schema.json`.
- Recalculate and update all relevant metadata fields after each documentation file add/update/delete (all schema-impacted fields, including at minimum):
  - `file_count`
  - `symbol_count`
  - `last_synced_at` (ISO UTC)
  - `last_synced_commit` (if available)

## PR Management
- Read and analyze PR diffs.
- Add inline review comments on specific files.
- Apply labels (ready-to-merge, needs-human-review, validation-failed).
- Merge PRs using squash merge strategy.

## Quality Assessment
- Evaluate documentation completeness per file.
- Flag low-confidence documentation.
- Verify code examples are syntactically valid.
