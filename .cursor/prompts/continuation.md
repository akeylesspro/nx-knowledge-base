# Task: Create a Work Plan for Completing NX-KNOWLEDGE-BASE Automation

## Context

You previously parsed and implemented the initial instructions located at:

C:\work\akeyless\client-side\nx-kb\.cursor\prompts\init.md

Most of the required implementation is complete, but several components are still missing.

Your goal is to analyze the current state of the project, compare it against the original requirement file, identify missing components, and generate a structured work plan.

---

## Output Requirement

Create a file named:

.claude/todos.md

This file must contain a structured TODO list describing all remaining tasks required to fully complete the program.

---

## Project Context

### Main Documentation Project
C:\work\akeyless\client-side\nx-kb

### Agents Directory
C:\work\akeyless\client-side\nx-kb\agents

These agents are already configured to:
- Work with documentation
- Review pull requests

There are already 4 documented projects.  
You do **not** need to read them. This information is provided for broader context only.

---

## Special Focus: Automation for client_commons

For this task, focus specifically on automation for the project located at:

C:\work\akeyless\commons\client_commons

### Required Automation Flow

Implement and describe what is missing to support the following workflow:

1. A merge occurs into the `main` branch of `client_commons`.
2. A GitHub automation triggers the Documentation Agent.
3. The Documentation Agent updates the relevant documentation files in NX-KNOWLEDGE-BASE.
4. The Documentation Agent creates a Pull Request.
5. Once that PR is created, a second Agent is triggered to review the PR.

You must:
- Identify what is currently missing to support this flow.
- Specify whether the changes belong in:
  - `client_commons`
  - `nx-kb`
  - GitHub configuration (e.g., workflows, webhooks, CI)
- Break everything into actionable TODO items.

---

## Requirements for todos.md

- Use clear sections
- Group tasks logically (Automation, GitHub Actions, Agent Changes, Repo Updates, etc.)
- Make tasks implementation-ready
- Be explicit about file locations when relevant
- Do not include explanations — only actionable TODO items

Your final output must be the full content of `.claude/todos.md`.