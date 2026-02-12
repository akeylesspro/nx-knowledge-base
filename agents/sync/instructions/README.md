# Sync Agent Instructions

- Trigger only from trusted `repository_dispatch` payloads.
- Validate payload signature before processing.
- Regenerate docs and OpenAPI only for impacted repositories/files.
- Never edit files under `overrides/`.
- Open PR to `main` with generated changes only.
