# Sync Agent — Style Guide

## Language
- Write all documentation in **English**.
- Use clear, concise, technical language.
- Avoid marketing or filler words.

## Summaries
- `purpose`: One sentence, starts with a verb (e.g., "Handles authentication...", "Renders the user profile...").
- `problem_solved`: One sentence explaining the business/technical need.
- `description_one_line`: Max 120 characters. Starts with a verb.

## Symbol Documentation
- `what_it_does`: 2-4 sentences. Be specific. Mention inputs, outputs, side effects.
- Parameters: Always include type, required flag, and a description.
- Return values: Describe all possible return scenarios (success, error, null).
- Side effects: List any mutations, network calls, file I/O, state changes.

### Completeness Rules by Symbol Kind

**For `function`, `class`, `component`, `hook`, `interface`, `enum`, `value`:**
- `signature` — REQUIRED. Must include `params` and `returns`.
- `details` — REQUIRED. Must include `what_it_does` at minimum.
- `examples` — REQUIRED. Must include at least `minimal_correct`.

**For `type` symbols:**
- `details` — REQUIRED. Must include `what_it_does` AND `type_definition`.
  - `type_definition` must contain the full TypeScript type definition exactly as it appears in source code (e.g., `type UserRole = 'admin' | 'editor' | 'viewer'`).
- `examples` — REQUIRED. Must include at least `minimal_correct` showing how to use the type.
- `signature` — NOT required (types don't have params/returns).

**For `constant` symbols:**
- `details` — REQUIRED. Must include `what_it_does`.
- `signature` — NOT required.
- `examples` — NOT required (but encouraged for complex constants).

## Code Examples
- **Minimal correct**: Shortest working usage. Include required imports.
- **Extensive correct**: Real-world usage with error handling and options. Only include if the symbol is complex enough.
- **Incorrect**: Common mistake. Always explain `why_incorrect`.

## Naming Conventions
- `symbol_id`: Format `<kind>_<name>` in snake_case (e.g., `function_get_user`, `component_login_form`).
- File doc path: Mirror src path exactly, append `.json` (e.g., `src/routes/auth.ts` → `docs/routes/auth.ts.json`).
- Repo metadata path: `repos/<repo>/meta.json` (documentation root, sibling of `docs`).

## Quality Markers
- Set `generation_confidence` to `"high"` only when all symbols are fully documented with examples.
- Set to `"medium"` when documentation is complete but examples may be incomplete.
- Set to `"low"` when significant gaps exist. Always populate `known_gaps[]`.
