# Copilot Instructions

Read `AGENTS.md` at the repository root and follow it. It is the single source of truth for conventions in this repository; this file only adds rules specific to Copilot code review, which does not read `AGENTS.md`.

The `code-review` skill in `.github/skills/code-review/` holds the detailed checklist.

## Code review priorities

Prioritize correctness, regressions and security over style preferences. Style is already enforced by Oxlint, Prettier, php-cs-fixer, twig-cs-fixer and CI.

## Do not flag

- Language or library behavior claims not checked against the documentation of the version pinned in `composer.lock` / `package-lock.json`.
- Findings a human already dismissed in a previous review round of the same PR. Re-raising them adds noise without new information.
- `public readonly ApiClient` properties on Entrepôt/EspaceCo services. Exposing the client is intentional: callers compose parallel requests through it.
- Route loaders prefetching data before front-end rights checks. Front-end gating is UX only; authorization is enforced by the backend API.
