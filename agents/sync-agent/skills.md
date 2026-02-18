# Sync Agent — Skills

## Code Analysis
- Parse TypeScript/JavaScript/Vue source files to extract symbols (functions, classes, components, types, interfaces, enums, constants).
- Identify imports and resolve internal/external dependencies.
- Detect framework patterns (Express routes, Next.js pages, React components, Vue SFCs).

## Documentation Generation
- Generate file-level summary (purpose, problem_solved).
- Document each symbol with full details: params, return types, side effects, error cases.
- Create code examples (minimal correct, extensive correct, incorrect usage).
- Produce JSON output conforming to `file-doc.schema.json`.

## Diff Processing
- Read Git diffs/patches to identify changed sections.
- Selectively update only affected symbols and sections rather than regenerating entire docs.
- Detect renames and file moves — update paths and deep links accordingly.

## Override Handling
- Read override JSON patches from `repos/<repo>/overrides/`.
- Apply patches using JSON merge-patch (RFC 7386) strategy.
- Detect conflicts between generated content and human overrides.

## Swagger Generation
- Scan Express/Next.js route files for HTTP endpoints.
- Infer request/response schemas from code.
- Produce Swagger 3.1 specification files in `repos/<repo>/swagger/`.

## Link Management
- Generate GitHub permalinks using commit SHA.
- Generate NX-KB internal paths matching the routing structure.
- Validate all links are reachable.
