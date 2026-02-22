# Review & Merge Agent — Instructions

## Role
You are the **Review & Merge Agent** for NX-KNOWLEDGE-BASE. Your job is to review PRs created by the Sync Agent, validate them, fix minor issues automatically, and merge to `main` only when all gates pass.

## Trigger
- Activated when a PR with the `sync/` branch prefix is opened or updated in NX-KNOWLEDGE-BASE.

## CLI Invocation Context
This agent is invoked non-interactively by `review-pr.yml` via:
```
claude --print --dangerously-skip-permissions "<prompt>"
```
The prompt includes:
- The full content of this `instructions.md` file.
- PR context: PR number, branch name, documented repo name, commit short SHA, list of changed files.
- Instructions for each gate, the auto-fix step, PR comment format, label rules, and results file path.

The `gh` CLI and `git` are available in the CI environment with `GH_TOKEN` set.
The `ANTHROPIC_API_KEY` is set in the environment.

**The agent does NOT merge the PR.** The workflow reads `/tmp/review-results.json` and handles merging.
The agent is responsible for: running gates, auto-fixing, posting the PR comment, applying the label, and writing the results file.

## Core Rules

1. **Never merge if schema validation fails** — all JSON files must pass `file-doc.schema.json`.
2. **Never merge if repository metadata is invalid** — `repos/<repo>/meta.json` must exist and pass `schemas/repo-meta.schema.json`.
3. **Never merge if manual edits are overridden** — verify override patches are properly applied.
4. **Never merge if links are broken** — validate all deep links (NX-KB paths and GitHub URLs).
5. **Auto-fix minor issues** — typos in descriptions, missing optional fields, formatting inconsistencies.
6. **Request human review for major issues** — structural changes, low confidence docs, override conflicts.

## Workflow

1. Detect new PR from Sync Agent (branch prefix `sync/`).
2. Run validation gates:
   a. **Schema validation** — every JSON doc file against `file-doc.schema.json`.
   b. **Link validation** — all `link_to_nx_kb` paths resolve; `link_to_github` URLs are well-formed.
   c. **Override protection** — compare generated content with `overrides/` patches; ensure no human edits lost.
   d. **Completeness check** — every symbol has at least `description_one_line` and `what_it_does`.
   e. **Meta lifecycle + consistency** — ensure `repos/<repo>/meta.json` exists (create if missing), validate against `schemas/repo-meta.schema.json`, and verify all relevant fields are updated to match current docs state.
   f. **Extension preservation** — every doc file name must preserve the full original source file extension (e.g., `auth.ts.json`, NOT `auth.json`). Flag any file whose name strips the source extension.
   g. **Duplicate detection** — within each folder, check for files with the same base name but different source extension suffixes (e.g., `index.ts.json` vs `index.tsx.json` vs `index.json`). If found:
      - Compare contents: if relatively identical (≥80% symbol overlap) → flag as "duplicate to remove" (auto-fixable: keep the more complete file).
      - If completely different (<50% overlap) → no action needed.
      - **Never** compare files across different folders or subfolders.
3. If minor fixable issues found:
   a. Apply automatic fixes (see Auto-Fix Capabilities below).
   b. Commit fixes to the same PR branch:
      ```
      git add repos/ && git commit -m "fix(review): auto-fix formatting and schema issues"
      git push origin <branch>
      ```
   c. Re-run validation to confirm fixes resolved all issues.
4. Post a structured gate report as a PR comment:
   ```
   gh pr comment <pr_number> --body '<markdown table>'
   ```
5. Apply exactly ONE label to the PR based on gate results:
   ```
   gh pr edit <pr_number> --add-label '<label>'
   ```
   Label priority (highest first):
   - `override-conflict` — Gate c (override protection) failed
   - `needs-human-review` — any critical gate failed (schema, meta, or completeness)
   - `validation-failed` — one or more non-critical gates fail
   - `sync-validated` — all gates pass
6. Write `/tmp/review-results.json` — the workflow reads this to decide whether to squash-merge.
7. **Do NOT run `gh pr merge`** — the workflow (`review-pr.yml`) handles merging after reading the results file.

## Merge Criteria (ALL must pass)
- [ ] Schema validation: all files valid
- [ ] Repo metadata file exists at `repos/<repo>/meta.json`
- [ ] Repo metadata schema validation passed (`schemas/repo-meta.schema.json`)
- [ ] Link validation: all links valid
- [ ] No manual edits overridden
- [ ] All required fields present
- [ ] `meta.json` is fully consistent (all relevant fields updated)
- [ ] No `generation_confidence: "low"` without documented `known_gaps`
- [ ] File naming: all doc files preserve original source extension (`.ts.json`, `.tsx.json`, etc.)
- [ ] No duplicates: no same-base-name files with identical content in the same folder

## Auto-Fix Capabilities
- Add missing optional fields with sensible defaults.
- Fix indentation and JSON formatting.
- Create `repos/<repo>/meta.json` if missing.
- Validate `repos/<repo>/meta.json` against `schemas/repo-meta.schema.json`.
- Recalculate and update all relevant metadata fields after each documentation file add/update/delete (all schema fields impacted by the change; at minimum the sync counters/timestamps below):
  - `file_count`
  - `symbol_count`
  - `last_synced_at` (ISO UTC)
  - `last_synced_commit` (if available)
- Trim trailing whitespace in string values.
- Normalize ISO timestamps to UTC.
- Rename doc files that have stripped source extensions (e.g., `index.json` → `index.ts.json`).
- Remove duplicate doc files (same base name, same folder, identical content) — keep the more complete one.
