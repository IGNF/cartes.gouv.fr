---
name: code-review
description: Project review checklist for cartes.gouv.fr pull requests (Symfony BFF + React). Use for every code review in this repository.
---

# Code review checklist

## Before claiming a language or library behavior

- Read the exact version in `composer.lock` / `package-lock.json` first.
- Claim nothing without the documentation of that version.
- Past mistakes: a nonexistent `hash_hkdf()` `$binary` parameter, an `ArgumentCountError` on closures called with extra arguments (legal in PHP), TypeScript features "unsupported" by a version that was not the installed one.

## Backend checks

- Upstream calls go through `ApiClient`. `ResponsePromise` and `PaginatedPromise` are lazy: nothing is sent before `->array()` / `->resolve()`.
- `AuthenticationExpiredException` is handled.
- No `access_control` or voter for Entrepôt rights: the Entrepôt enforces them with the user's token. Only the service-account client may bypass this, with an explicit membership check.
- No `GET` route with side effects.
- Every API route lives under `/api`.
- A route change comes with `composer symfony-routing-dump`: `assets/modules/symfony-routes.json` is up to date.
- API errors are returned as Problem Details.
- No PHP session: authentication is stateless.

## Frontend checks

- Styling: `fr.cx()` first, then `tss-react`. No new CSS module or SCSS file.
- SVG files using DSFR CSS variables are inlined (`?raw`), never loaded via `<img src>`.
- Hooks and components are named after the artifact they produce, not their usage role.
- Forms use React Hook Form + yup. Each `.test()` handles `undefined`.
- Route and search params are validated against an enum with a fallback; `NaN` and empty values are handled.
- No state setter passed directly as a DOM event handler. Non-submit buttons inside forms have `type="button"`.
- React Query: no query key built from a possibly-`undefined` id; no `setQueryData` on an empty cache; `onSuccess` uses `variables` when the API returns no body.
- npm dependencies go to `devDependencies`, except packages used at runtime by the Node cron jobs.
- UI text lives in `.locale.ts(x)` files. French text uses the typographic apostrophe `’`. No em dash anywhere.

## Tests and docs

- New logic comes with a test that fails if the logic breaks.
- A changed contract (laziness, nullability, thrown exceptions) updates its docblock or doc.
- `docs/` and comments are in French; code identifiers are in English.

## How to comment

- Write review comments in the language that prevails in the pull request description.
- One sentence per finding, on the line concerned, with the minimal fix.
- No empty approval comment.
