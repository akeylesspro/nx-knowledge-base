# NXKB Schema Guardian - Audit & Repair Log

## COMPLETED: akeyless-client-commons Audit (2026-02-15)

**Final Status**: ✅ 100% COMPLETE (63/63 files valid)

## Audit Summary
- **Total doc files**: 63
- **Final valid**: 63 (100%)
- **Total symbols documented**: 157
- **Repair passes**: 4 (3 automated + 1 manual)
- **Result**: Full schema compliance achieved

## Repair Approach (Successful Pattern)

### Phase 1: Foundation Repairs
- File: repair-docs.js
- Fixes: symbol_id naming, locations objects, enum normalization, details.what_it_does
- Result: 43 files repaired

### Phase 2: Legacy Format + Field Names
- File: repair-docs-v2.js
- Fixes: old hooks/functions formats, removed legacy fields, import_path conversion
- Result: 21 files repaired

### Phase 3: Complex Enum & Structure Issues
- File: repair-docs-v3.js
- Fixes: misplaced dependencies, wildcard_reexport → value, module → import_path
- Result: 14 files repaired

### Phase 4: Manual Edge Cases
- Files: 6 manually edited
- Fixes: snapshotWorker conversion, missing resolved_file_path, export kind fixes
- Result: All remaining issues resolved

## Key Patterns Learned

### Common Validation Issues (Ranked by Frequency)
1. Missing internal dependency fields: resolved_file_path, link_to_github, link_to_nx_kb
2. External deps using wrong field names or invalid "kind" values
3. Symbols missing locations or details.what_it_does
4. Old format files with "hooks" or "functions" arrays instead of symbols
5. Field name mismatches (id vs symbol_id, module vs import_path, optional vs required)

### Invalid Export Kinds Seen
- "hook" (should be function in exports, hook in symbols)
- "re-export", "wildcard_reexport", "named_reexport" (should be value/component)
- "context", "variable" (should be type or value)

### External Deps with "internal" Kind
- These belong in internal[] array, not external[]
- Need to restructure and add proper fields

### Old Snapshot Format
- Use: "fileName", "hooks"/"functions" arrays with {name, description, args, return}
- Convert to: full schema with repo, file_name, source, summary, symbols

## Critical File Categories & Fixes

### UI Components (input.json, label.json, multiselect.json, popover.json)
- Missing: resolved_file_path and link_to_github for @/lib/utils dependency
- Fixed by: Adding full paths and GitHub links

### Barrel Files (components/index.tsx.json)
- Issue: Invalid export kinds (wildcard_reexport, named_reexport)
- Fix: Change to "value" and "component" respectively

### Table Components
- Issue: External deps using "module", "imports" fields, missing "name"
- Fix: Rename "module" → "name", remove "imports" field

### Snapshot Hooks
- Issue: Old format with hooks/functions arrays
- Fix: Full schema conversion with proper structure

## Repository Info
- Source: https://github.com/akeylesspro/akeyless-client-commons
- Commit: 844185137ce1390e1c325518f954aaf0e22f09ff
- Default branch: main
- Language: typescript, framework: react

## Key Paths (Windows Style)
- Schema: C:/work/akeyless/client-side/nx-kb/schemas/file-doc.schema.json
- Docs: C:/work/akeyless/client-side/nx-kb/repos/akeyless-client-commons/docs
- Meta: C:/work/akeyless/client-side/nx-kb/repos/akeyless-client-commons/meta.json
- Report: C:/work/akeyless/client-side/nx-kb/AUDIT_REPORT.md
- Scripts: repair-docs.js, repair-docs-v2.js, repair-docs-v3.js, audit-docs.js

## Meta.json Updated
```json
{
  "file_count": 63,
  "symbol_count": 157,
  "last_synced_at": "2026-02-15T12:00:00.000Z"
}
```

## Schema Version & Requirements
- Schema version: 1.0.0
- All required fields implemented
- All enum values valid
- All URI/timestamp formats correct
- No additional properties violations
