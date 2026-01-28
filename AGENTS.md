# AGENTS.md

This document defines **project-specific assumptions, restrictions, and priorities** for AI agents working in this repository.
It is intended to be read by both human contributors and AI assistants.

---

## 1. Communication

- **Language**
  - Conversations, explanations, and review comments may be in Japanese or English depending on the user’s preference.
  - Code comments and documentation should follow the existing style in the repo and are **primarily written in English** (e.g. `README.md`).
- **Tone**
  - Keep explanations **concise and information-dense**.
  - Always leave at least a short note about the motivation or background of non-trivial changes.

---

## 2. Project Overview (for AI)

- This package is a **CLI tool to keep git commit messages consistent**.
- Entry point: `lib/index.js` (wired via `bin.git-consistent`).
- Main tech stack:
  - Node.js ESM (`"type": "module"`)
  - CLI: `commander`, `inquirer`, `prompt-sync`
  - Configuration: `.git_consistent.yaml` (YAML) and `.gitcommit_template`
  - Tests: `ava`
  - Lint / formatting: `eslint` + `prettier`

**Key files / directories**

- `lib/` – CLI implementation
- `.git_consistent.yaml` – sample configuration for user projects
- `.gitcommit_template` – commit template
- `test/` – AVA tests
- `.github/workflows/main.yml` – CI (lint + test)

---

## 3. Change Policy and Priorities

- **Do not break existing CLI behavior**
  - When changing flags, prompts, or interactive flows, **update tests and documentation** accordingly.
- **Treat user-facing surfaces as public API**
  - Command-line options, configuration file format, and template variable names are de facto public API.
  - If compatibility is intentionally broken, update `CHANGELOG.md` and the relevant sections of `README.md`.
- **Prefer small and safe steps**
  - Before large refactors, introduce internal helpers and additional tests to create a safety net.

---

## 4. Coding Guidelines (for AI-generated code)

- **Style**
  - Use **ES Modules** (`import` / `export`) to match existing code.
  - Follow eslint/prettier for details like semicolons and indentation; do not introduce a custom manual style.
- **Lint / Format**
  - Write code with `npm run lint` in mind; avoid patterns that will obviously violate rules.
  - Assume `npm run fix` exists for auto-fixes, but do not rely on it to hide poor structure.
- **Tests**
  - When adding or changing logic, usually add or update **AVA tests in `test/`**.
  - Read existing test names and assertions carefully to avoid breaking their intent.

---

## 5. `.git_consistent.yaml` and `.gitcommit_template`

- These files directly affect users’ commit workflows, so **prioritize compatibility and clarity**.
- When changing samples:
  - Ensure the examples are consistent with explanations in `README.md`.
  - Ensure the configuration actually works with `git consistent` and produces sensible commit messages.

---

## 6. Documentation Rules

- When changing CLI options or behavior:
  - Update the relevant sections in `README.md` (for example the **Command Reference**).
  - Add a short note to `CHANGELOG.md` describing the change (in English).
- If only internal implementation details change and behavior stays the same:
  - README updates are usually unnecessary, but you may add comments or tests to clarify intent.

---

## 7. Special Instructions for AI Agents

- Avoid asking the user for clarification more than necessary; instead, **infer reasonable assumptions** from existing code and `README.md`.
- For changes that might be controversial or breaking, leave clear reasoning:
  - Potentially breaking changes in behavior or semantics
  - Modifications to CLI interface or configuration format
- When reasonable, add 1–2 lines explaining **why** a change was made, either here in `AGENTS.md`, in commit messages, or in code comments.
