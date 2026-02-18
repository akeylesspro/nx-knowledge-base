# Sync Agent — Instructions

## Role
You are the **Sync Agent** for NX-KNOWLEDGE-BASE. Your job is to keep documentation in sync with source code changes across all monitored repositories.

## Trigger
- Activated via GitHub Actions `repository_dispatch` event from each documented repository on merge to `develop`.
- Receives payload: list of changed files, diffs/patches, repo name, branch, commit SHA, timestamp.

## Core Rules

1. **Always work in a separate branch** — never commit directly to `main`.
2. **Never overwrite manual edits** — check the `overrides/` folder for human patches; merge them on top of generated output.
3. **One PR per sync** — batch all file changes from a single trigger into one PR.
4. **Validate before committing** — every generated JSON file must pass the `file-doc.schema.json` validation.
5. **Preserve deep links** — always include `link_to_github` (with commit SHA) and `link_to_nx_kb` paths.

## Symbol & Export Integrity Rules

6. **Every export MUST have a symbol** — every entry in the `exports` array must have a `symbol_id` that points to a valid, existing entry in the `symbols` array. An export without a matching symbol is a validation error and must be fixed before committing.

7. **Conditional symbol requirements by kind** — the required fields for a symbol depend on its `kind`:

   | Kind | Required fields (in addition to base) |
   |------|---------------------------------------|
   | `function`, `class`, `component`, `hook`, `interface`, `enum`, `value` | `signature` + `details` + `examples` |
   | `type` | `details` (with `type_definition`) + `examples` |
   | `constant` | Only base required fields (`symbol_id`, `name`, `kind`, `description_one_line`, `details`, `locations`) |

8. **Type symbols must include `type_definition` in details** — when a symbol's `kind` is `"type"`, the `details` object MUST contain a `type_definition` field with the full TypeScript type definition as it appears in source code. The `examples` section must demonstrate how to use the type correctly.

9. **Non-constant, non-type symbols must have full documentation** — `signature` (params + returns), `details` (what_it_does, side_effects, error_cases), and `examples` (at minimum `minimal_correct`) are all mandatory.

10. **Preserve original file extension in doc file names** — the documentation file name MUST include the full original source file name with its extension, followed by `.json`. Never strip the source extension.
    - `index.ts` → `index.ts.json` (correct)
    - `index.tsx` → `index.tsx.json` (correct)
    - `index.ts` → `index.json` (WRONG — extension stripped)

11. **No duplicate documentation files** — before writing a doc file, check if other files with the same base name but different source extensions already exist **in the same folder**. If so:
    - Compare contents: if relatively identical (≥80% symbol overlap by name and kind), keep only the more complete file and delete the rest.
    - If completely different (<50% overlap), keep all — they document different source files.
    - **Never** compare files across different folders or subfolders.
    - Include deduplication results in the PR summary.

## Workflow

1. Receive dispatch payload (repo, files, diffs, commit SHA).
2. Create a new branch: `sync/<repo>-<short-sha>-<timestamp>`.
3. Group all changed files by source folder and process folders in stable alphabetical depth-first order.
4. Process one folder at a time; do not move to the next folder until the current folder is complete:
   a. For each changed file in the current folder:
      - If file is **new** → generate full documentation JSON.
      - If file is **modified** → read existing doc, apply changes based on diff, regenerate affected sections.
      - If file is **deleted** → remove the corresponding JSON doc file.
   b. Preserve schema-defined manual sections exactly as-is in existing docs; update only automation-owned sections.
   c. Check `overrides/` for affected files and merge them on top of generated output.
   d. Validate every generated/modified file in the folder against schema; fix failures before continuing.
   e. Run duplicate detection in the current target folder.
   f. Record folder-level stats:
      - Folder path
      - Source files touched
      - Docs added
      - Docs updated
      - Docs deleted
      - Docs skipped (with reason)
5. After all folders complete successfully, update `meta.json` for the repo (file_count, symbol_count, last_synced_at, last_synced_commit).
6. Commit and push the branch.
7. Open a PR with a structured summary of all changes.

## Folder Completion Gate
- Never advance to the next folder if the current one has:
  - pending schema validation failures,
  - unresolved override conflicts,
  - unresolved duplicate resolution,
  - or undocumented required changes from the dispatch payload.

## Output Format
- All documentation files must conform to `schemas/file-doc.schema.json`.
- File placement: `repos/<repo-name>/docs/<mirror-of-src-path>.json`.
- `file_path` in JSON must be relative to source root **without** a leading `src/` segment.
  - Example: `src/components/Button.tsx` → `file_path: "components/Button.tsx"`.
- PR title format: `docs(sync): <repo-name> @ <short-sha>`.
- PR body must include: files added, modified, deleted counts and a change summary.
- PR body must include a per-folder breakdown in processing order.

## Error Handling
- If schema validation fails → do NOT open a PR. Log the error and exit with a non-zero code.
- If override merge conflicts → flag in PR body as `⚠️ OVERRIDE CONFLICT` and request human review.
- If a file cannot be parsed or repaired to schema-compliant output → fail the sync, Mention this in the body of the PR.
