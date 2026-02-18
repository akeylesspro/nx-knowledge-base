# Local-Documentation-Sync vs Sync Agent

1. Advantages of `sync-agent` over `Local-Documentation-Sync`
   1. Native CI/CD trigger support via `repository_dispatch` after merges.
   2. Full Git automation flow (branch, commit, push, one PR per sync).
   3. Diff/patch-driven selective updates instead of full-tree-only behavior.
   4. Better handling of renames and file moves in incremental sync scenarios.
   5. Built-in operational command surface (`sync`, `sync:file`, `sync:validate`, `sync:override-check`, `sync:meta-update`, `sync:cleanup`).
   6. Automatic `meta.json` recalculation and update in workflow.
   7. Dedicated `overrides/` merge-patch strategy (RFC 7386) with conflict reporting.
   8. Swagger generation capabilities from route analysis.
   9. More explicit output formatting constraints (UTF-8 no BOM, indentation, trailing comma rules, timestamp format).
   10. Explicit link requirements and validation focus (GitHub permalink with SHA, internal KB links).
   11. Broader ignore coverage (`*.d.ts`, `.env*`, `*.config.*`, binaries/fonts, etc.).
   12. PR summary conventions designed for repository-level auditability.

2. Advantages of `Local-Documentation-Sync` over `sync-agent`
   1. Strong fail-fast precondition validation before any sync work starts.
   2. Mandatory absolute-path validation and existence checks for source/target/schema.
   3. Strict execution sandbox (no access outside defined source and target roots).
   4. Deterministic folder-by-folder linear processing order.
   5. “Do not advance” gating until current folder is fully processed and validated.
   6. Folder completion checklist that enforces operational discipline.
   7. Per-folder metrics/reporting in processing order (not just aggregate summary).
   8. Strict preservation rules for schema-defined human-maintained/manual sections.
   9. Explicit rule that `file_path` must exclude the `src/` prefix.
   10. Strong non-partial-completion policy (stop when unrepairable).
   11. Prohibition on guessing/auto-discovery of missing paths or schemas.
   12. Clear local-first execution model suitable for controlled/manual sync runs.
