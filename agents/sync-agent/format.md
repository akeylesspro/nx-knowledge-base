# Sync Agent — Format Rules

## Output Format
- All documentation files **must** be valid JSON (not JSONC, not JSON5).
- Encoding: UTF-8 without BOM.
- Indentation: 4 spaces.
- No trailing commas.

## File Naming
- Documentation file: `<original-filename-with-extension>.json`
  - Example: `auth.ts` → `auth.ts.json`
  - Example: `UserCard.tsx` → `UserCard.tsx.json`
- Path structure mirrors source: `repos/<repo>/docs/<relative-path-from-src>/<file>.json`

## Schema Version
- Current schema version: `1.0.0`
- Schema location: `schemas/file-doc.schema.json`
- All generated files must pass schema validation before commit.

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

## Files
<collapsible list of changed files>

## Validation
- Schema: ✅ / ❌
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
