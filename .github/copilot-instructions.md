# Copilot Instructions

Read `AGENTS.md` at the repository root and follow it. It is the single source of truth for conventions in this repository; this file only adds rules specific to Copilot code review, which does not read `AGENTS.md`.

## Code review priorities

Prioritize correctness, regressions and security over style preferences. Style is already enforced by ESLint, Prettier, php-cs-fixer, twig-cs-fixer and CI.

## Do not flag

- Language or stdlib behavior claims without verifying against the official documentation for the exact version pinned in `composer.lock` / `package-lock.json`. Past reviews asserted a nonexistent `hash_hkdf()` `$binary` parameter, an `ArgumentCountError` when calling closures with extra arguments (legal in PHP), and TypeScript features "unsupported" by a version that was not the installed one.
- Findings a human already dismissed in a previous review round of the same PR. Re-raising them adds noise without new information.
- `public readonly ApiClient` properties on Entrepôt/EspaceCo services. Exposing the client is intentional: callers compose parallel requests through it.
- Route loaders prefetching data before front-end rights checks. Front-end gating is UX only; authorization is enforced by the backend API.
