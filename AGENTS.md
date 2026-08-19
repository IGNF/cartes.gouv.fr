# AGENTS.md

Instructions for AI coding agents working on this repository. This is the single source of truth: `CLAUDE.md` and `.github/copilot-instructions.md` defer to this file.

## Project

**cartes.gouv.fr** is the main portal of the French Géoplateforme: a Symfony 6.4 + React (Vite) application with a back-office for uploading data, publishing OGC services (WFS, WMS, WMTS, TMS), managing communities and configuring map styles.

External API references:

- Entrepôt docs: https://geoplateforme.github.io/entrepot/production
- OpenAPI: https://data.geopf.fr/api/v3/api-docs

## Language

- Code identifiers in English (file names, components, props, types, fields), even when the domain vocabulary is French (`producers`, not `producteurs`).
- Comments, docblocks and everything under `docs/` in French.
- UI text supports French and English via translation files ending in `.locale.ts` / `.locale.tsx`.
- User-visible French text uses the typographic apostrophe `’` (U+2019), never `'`.
- Never use the em dash "—" anywhere (comments, docs, PR descriptions/comments, UI text): use a simple "-".

## Git

- Commit messages: simple French, conventional-commit style (`feat:`, `fix:`, `chore:`...), one line, no body unless truly necessary.
- Small atomic commits: one logical concern per commit.
- AI-assisted commits end with the trailer `Assisted-by: <model name and version> <noreply@anthropic.com>`, naming the model that actually generated the code (e.g. `Assisted-by: Claude Fable 5 <noreply@anthropic.com>`). Do NOT add `Co-Authored-By: Claude...` or a "Generated with..." line.
- Never commit on `main`: create a branch first. Branch names are short, in conventional-commit type/scope style, with the issue number when relevant (`feat/charts`, `fix/articles-scraper-1098-1089`).
- Never commit, push, or post PR descriptions/comments without a human explicitly validating the content first.
- PR titles: conventional-commit style, issue number when relevant. PR descriptions in French: concise, simple wording, no AI-sounding or corporate jargon. Don't repeat what the linked issue already says. Structure: `Closes #N`, a short "Changements" bullet list, "Validation" when relevant, and an explicit call-out for any deliberate behavior change.

## Agent workflow

- Do not modify infrastructure files (Dockerfile, compose, CI) beyond the agreed scope; surface the need and ask first.
- Any deviation from an approved design or plan must be validated before coding. Factual corrections are fine; behavior choices (error paths, cache keys, scope changes) are not.

## Comments

- Comment only where the code is not self-explanatory: one line max, plain French stating the intent, no jargon. No descriptive docblocks that paraphrase a component or attribute name.
- Avoid "chrome"/"shell" UI jargon: name the thing (en-tête, pied de page, navigation, fil d'Ariane).
- When a change alters a documented contract (laziness, nullability, thrown exceptions), update the docblock/doc in the same change.

## Frontend (React, TypeScript, Vite)

- Styling: DSFR classes first via `fr.cx()` from `@codegouvfr/react-dsfr` - DSFR styling, `fr-icon-*`/remix icons, and utilities (spacing, use-case-based colors). When DSFR CSS isn't enough, use `tss-react`, which also takes dynamic values. Inline `style` only for a very small override on a component that isn't already using tss-react. Do not create CSS modules or new SCSS files.
- SVG illustrations using DSFR CSS variables must be inlined (`import svg from "@/img/....svg?raw"` + `dangerouslySetInnerHTML`), never loaded via `<img src>`: an external SVG document doesn't resolve the page's CSS variables and falls back to fixed light-theme colors.
- Name hooks/components by the artifact they produce, not their current usage role: `usePlanIgnWmtsLayer`, not `useBackgroundLayer`.
- Forms: React Hook Form + yup resolver; `Controller` for complex controlled inputs.
- Guard optional inputs: yup `.test()` callbacks must handle `undefined` values; route/search param parsing must handle `NaN`/empty values and validate against an enum with a fallback.
- Never pass a state setter/toggle directly as a DOM event handler (it would receive the event object): write `onClick={() => toggle()}`. Buttons inside forms that don't submit need `type="button"`.
- React Query cache: don't build query keys from possibly-undefined ids; don't seed `setQueryData` with placeholder data when the cache is empty; in mutation `onSuccess`, use `variables` when the API returns no body.
- Import order: third-party, then project (`@/` aliases and relative), then static data/images, then CSS/SCSS.
- npm dependencies go to `devDependencies` (the front is fully bundled by Vite at build time); `dependencies` is reserved for packages loaded at runtime by the Node cron jobs.

## Backend (Symfony 6.4, PHP 8.2+)

- External APIs are called through `ApiClient` (`src/ApiClient/`), composed into domain services via `#[Autowire(service: 'app.api_client.*')]`. `ResponsePromise` and `PaginatedPromise` are lazy: nothing is sent until consumed (`->array()`, `->resolve()`).
- Always handle `AuthenticationExpiredException`.
- Authentication is stateless: Keycloak tokens live in the encrypted `__Host-CGAUTH` cookie; there is no PHP session.

## Commands

Run inside the Docker container (`docker exec -it cartesgouvfr-app-1 bash`):

- `composer check-rules` - full PHP validation (twig/container/yaml lint, PHPMD, PHPStan)
- `composer fix-style` - fix PHP & Twig code style
- `composer symfony-routing-dump` - REQUIRED after adding or changing routes (regenerates `var/cache/fosRoutes.json`, used by the front to build URLs)
- `npm run lint` / `npm run type-check` / `npm run format`

Pitfalls:

- A newly used `fr-icon-*` icon renders as a filled square in dev until `react-dsfr update-icons` runs (triggered by `npm run dev`) and the page is reloaded without cache.
- Cypress E2E tests are paused: ignore them unless explicitly reactivated.
- Symfony profiler data can be read directly from the container: see `docs/developer/profiler.md`.
