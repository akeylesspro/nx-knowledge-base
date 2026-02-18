You are a Design/Architecture Agent (AI Agent). Your task: to build a complete work plan to establish a central “NX-KNOWLEDGE-BASE Repository” that contains documentation for all my GitHub Repositories, including UI for humans and also built-in access for AI agents.

===========================
0) Facts and Assumptions (Locked)
===========================
- Initial scope: 2 projects, each with approximately 50+ src files.
- Project types: Node.js servers, React / Next.js / Vue web apps — all TypeScript.
- NX-KNOWLEDGE-BASE will have a new Repository called “NX-KNOWLEDGE-BASE” and it will be Next.js + TypeScript.
- Allowed and desired: Manual editing of documentation within NX-KNOWLEDGE-BASE. The system must preserve manual edits and not overwrite them.
- Creation approach: File-level documentation will be Fully AI-generated from code and diffs (Approach A), with PR review before merge.
- Deep links: Both the NX-KNOWLEDGE-BASE view and the original file on GitHub should be supported (default: display within NX-KNOWLEDGE-BASE, with “Open in GitHub” button).
- Branching in NX-KNOWLEDGE-BASE: There is only main (no develop docs).
- API docs: The system must automatically generate Swagger (from scans/inference from code/Routes) and integrate into NX-KNOWLEDGE-BASE.
- NX-KNOWLEDGE-BASE will be Public for reading (open internet).
- Agents will only run within GitHub Actions.
- Machine-readable docs: “Single source of truth” in rigid JSON format with a fixed schema for each code file.
No manual MDX maintenance in parallel. If you need MDX/HTML, it's just Generated from JSON.
- No monorepos.
- No special need for exceptions beyond the standard (but still suggest default ignore: tests/build/dist/node_modules etc.).

============================
1) The goal
==========================
To establish an NX-KNOWLEDGE-BASE Repository that contains documentation for each Repo:
- Inside NX-KNOWLEDGE-BASE there will be a folder for each existing Repo (according to the name of the Repo).
- Each folder will have a docs subfolder that maps the src structure one-to-one (mirroring):
Each file under src will have a corresponding JSON documentation file under docs at the same relative path.
- NX-KNOWLEDGE-BASE will contain a UI (Next.js) that renders the documentation from the JSON, including search, navigation, and deep links.
- NX-KNOWLEDGE-BASE will also contain an “AI access” layer — an API/endpoint or file structure that allows AI agents to consume the documentation in a consistent manner.

==========================
2) Documentation Rules
==============================
A) Folder Mapping
- docs is a “mirror” of src.
- Documentation file format: JSON strict only.
- If documentation needs to be split into one code file:
- Do this as generated outputs and not as two manual source codes.

B) The three components of documentation
1) Project-level summary:
- Broad summary
- Short summary
2) File-level documentation:
- Documentation for each code file according to the schema (below)
3) API Documentation:
- For each Node/Next with endpoints: Full Swagger, generated, displayed in the UI.

===========================
3) JSON schema required for every documentation file (File Doc Spec)
=============================
Every JSON documentation for a file must include:

(1) A clear summary: What is in the file and what need/problem does it address.
(2) Dependencies:
- Details of dependencies + a brief explanation of each dependency.
- For internal dependencies: Fields that allow deep linking are required:
- linkToNxKnowledgeBase (path within NX-KNOWLEDGE-BASE)
- linkToGitHub (URL to the original file; prefer a commit SHA link if possible)
(3) Symbols:
- functions / classes / components
- variables only if they are global at the file level.
(4) Exports:
- A list of everything the file exports.
(5) Next to each Symbol/Export:
- A brief one-line description.
(6) Extensive details for each Symbol:
- What it does
- Parameters/props (including mandatory/optional)
- Return value (all return options)
- For classes: Methods + what they return
- For components: Short description of the returned UI
- Code examples:
- Minimal correct usage
- “Extensive” correct usage (if applicable)
- Example of incorrect usage

In addition, you should propose an accurate JSON schema (with fields, types, examples), including schema versioning and validation in CI.

============================
4) Format and UI decisions
============================
You should recommend:
- A complete NX-KNOWLEDGE-BASE folder structure (including /repos/<name>/docs, /repos/<name>/swagger , /ui, /schemas, etc.).
- How Next.js renders JSON to pages:
- routing by repo/path
- search index
- symbol pages + deep links
- How to implement deep links:
- In NX-KNOWLEDGE-BASE: to file/symbol
- In GitHub: to the original file (preferably by commit SHA from which the documentation was created)
- How to manage “manual edits” without overriding:
- Patch/overrides mechanism
- “generated vs human” marking
- merge strategy and conflict handling

=========================
5) Two Agents in NX-KNOWLEDGE-BASE
===============================
Agent #1: Sync Agent
- Listens to changes in other Repos (trigger from GitHub Actions in each Repo on merge to develop).
- Updates documentation in NX-KNOWLEDGE-BASE: add/update/delete.
- Always works in a separate branch.
- When finished, a PR is opened for NX-KNOWLEDGE-BASE with all changes.
- Must avoid overriding manual edits; Combine overrides/patches.

Agent #2: Review & Merge Agent
- Reviews the Sync Agent PR.
- Fixes if needed (automatically).
- Merges to main only if:
- Valid schema
- Valid links
- No manual edits overridden
- Passed tests

Requirement: Both agents will have separate (editable) settings/instructions files without code changes:
- instructions/
- skills/
- commands/
- style/
- format/
You must propose a concrete structure and content for these files.


==========================
6) CI/CD in each Repo is documented (GitHub Actions)
=============================
In each Repo:
- Action that runs on merge to branch develop
- Sends to NX-KNOWLEDGE-BASE/Sync Agent the changes:
- List of changed files + diff/patch
- Metadata: repo, branch, commit SHA, timestamp
- Suggest the best way: dispatch event / repository_dispatch / workflow_call / artifacts, etc.

============================
7) Security and permissions
==========================
- NX-KNOWLEDGE-BASE public: Protect secrets, prevent leaks.
- Define minimum scopes for tokens:
- Accurate repo permissions
- Permissions for PR creation, contents write, actions read, etc.
- Suggest a basic threat model: Who can stream payloads to sync, how to verify a source.

===========================
8) QA and Testing
= Review/Merge Agent + gates
- Step 4: Swagger generation + UI
- Step 5: hardening (security/QA/perf)

C) Distribution of responsibilities between components:
- NX-KNOWLEDGE-BASE UI
- Doc store & schema
- Agents
- GitHub Actions in each Repo

D) Risks and solutions (Risk register):
- drift between code/docs
- manual edits override
- NX-KNOWLEDGE-BASE public security
- Actions costs/runtime
- AI documentation quality + hallucinations
- deep links stability

===========================
10) Style rules for your answer
===========================
- Give sharp decisions (not “it depends”), with a recommended default.
- Also give alternatives when it is critical, but choose one as a recommendation.
- Use tables where it helps: milestones, tasks, permissions, risks.
- Each section should be actionable and at the application level.

Start now and return the plan in an organized format according to the sections above.