# Sync Agent — Format Rules

## Output Format
- All documentation files **must** be valid JSON (not JSONC, not JSON5).
- Encoding: UTF-8 without BOM.
- Indentation: 4 spaces.
- No trailing commas.

## File Naming
- Documentation file: `<original-filename-with-extension>.json`
  - The full original file name INCLUDING its extension MUST be preserved, with `.json` appended.
  - Example: `auth.ts` → `auth.ts.json` ✅
  - Example: `UserCard.tsx` → `UserCard.tsx.json` ✅
  - Example: `index.ts` → `index.json` ❌ (extension stripped — WRONG)
- Path structure mirrors source: `repos/<repo>/docs/<relative-path-from-src>/<file>.json`
- In JSON content, `file_path` MUST be relative to the source root and MUST NOT start with `src/`.
  - Correct: `components/Button.tsx`
  - Wrong: `src/components/Button.tsx`

## Duplicate File Prevention
- Before writing a doc file, check the **same target folder** for existing files with the same base name but a different source extension suffix (e.g., `index.ts.json` vs `index.tsx.json` vs `index.json`).
- If duplicates are found:
  - **Relatively identical content** (≥80% symbol overlap) → keep only the more complete file, delete the rest.
  - **Completely different content** (<50% overlap) → keep all files.
- **Never** compare files across different folders or subfolders — only within the exact same folder.
- Report any deduplication actions in the PR summary.

## Schema Version
- Current schema version: `1.0.1`
- Schema location: `schemas/file-doc.schema.json`
- All generated files must pass schema validation before commit.
- Repo metadata schema location: `schemas/repo-meta.schema.json`

## Repository Metadata (`meta.json`)
- Location: `repos/<repo>/meta.json` (sibling of `docs`).
- If missing, create it before processing documentation changes.
- Validate `meta.json` against `schemas/repo-meta.schema.json`.
- After every doc add/update/delete, update all relevant metadata fields and re-validate.
- At minimum keep these fields accurate:
  - `file_count`
  - `symbol_count`
  - `last_synced_at` (ISO UTC)
  - `last_synced_commit` (if available)

## Timestamps
- All timestamps in ISO 8601 format: `YYYY-MM-DDTHH:mm:ss.sssZ`
- Always use UTC.

## Links
- GitHub links must include commit SHA: `https://github.com/<org>/<repo>/blob/<sha>/<path>`
- NX-KB links use internal routing: `/repos/<repo>/docs/<path>`

## PR Format
```
Title: docs(sync): <repo-name> @ <7-char-sha>

Body:
## Sync Summary
- **Repo**: <repo-name>
- **Commit**: <full-sha>
- **Timestamp**: <ISO>

## Changes
| Action   | Count |
|----------|-------|
| Added    | N     |
| Modified | N     |
| Deleted  | N     |

## Per-Folder Breakdown (processing order)
components/  — touched: N | added: N | updated: N | deleted: N | skipped: N
hooks/       — touched: N | added: N | updated: N | deleted: N | skipped: N

## Files
<collapsible list of changed files>

## Validation
- Schema: ✅ / ❌
- Repo Meta Schema: ✅ / ❌
- Links: ✅ / ❌
- Overrides: ✅ No conflicts / ⚠️ N conflicts
```

## Ignore Patterns
Do not generate documentation for:
- `node_modules/`
- `dist/`, `build/`, `.next/`
- `*.test.*`, `*.spec.*`, `__tests__/`
- `*.d.ts` (type declaration files)
- `.env*`, `*.config.*` (config files, unless they contain route definitions)
- Binary files, images, fonts
