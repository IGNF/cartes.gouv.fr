# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**cartes.gouv.fr** is a full-stack Symfony + React application — the main portal for the French Géoplateforme. It provides a back-office for uploading data, publishing OGC services (WFS, WMS, WMTS, TMS), managing communities, and configuring map styles.

External API references:

- Entrepôt docs: https://geoplateforme.github.io/entrepot/production
- OpenAPI: https://data.geopf.fr/api/v3/api-docs

## Development Commands

### Docker (recommended)

```bash
docker compose up -d --build
docker exec -it cartesgouvfr-app-1 bash
# Inside container:
composer install
npm clean-install
npm run dev          # or npm run build for production build
php bin/console cache:clear
```

App is available at `http://localhost:9092` (or `https://cartesgouvfr-dev.docker.localhost` via Traefik).

### Frontend

```bash
npm run dev          # Vite dev server with hot-reload (port 5173)
npm run build        # Production build with TypeScript check
npm run build:dev    # Dev build (non-optimized)
npm run lint         # ESLint (0 warnings tolerated)
npm run format       # Prettier check
npm run format:fix   # Auto-fix Prettier
npm run type-check   # TypeScript compile check
```

### Backend

```bash
composer check-rules                  # Full PHP validation (PHPStan, PHPMD, twig, YAML)
composer fix-style                    # Fix PHP & Twig code style
composer symfony-routing-dump         # Regenerate JS routing file to var/cache/fosRoutes.json
php bin/console cache:clear
```

Node version: **24.14.0** (see `.nvmrc`)

## Architecture

### Backend (Symfony 6.4, PHP 8.2+)

**Controller → Service → External API** pattern. All controllers are in `src/Controller/` (grouped under `Entrepot/` and `EspaceCo/`), use attribute-based routing with OpenAPI annotations, and delegate to services via constructor injection.

**API Service architecture (composition via `ApiClient`):**

- `ApiClient` (`src/ApiClient/ApiClient.php`) — HTTP client with async/parallel request support
    - `get()`, `post()`, `patch()`, `put()`, `delete()`, `sendFile()` — standard HTTP verbs returning `ResponsePromise`
    - `requestAll()` — automatic pagination using parallel requests for subsequent pages, returns `PaginatedPromise`
    - `fetchAllDetailsAsync()` — batch detail fetching
    - `resolveAll()` — parallel resolution of multiple `ResponsePromise`
- `ResponsePromise` — lazy single-response wrapper; consumed via `->array()`, `->text()`, `->arrayWithHeaders()`, `->await()` (alias of `array()`)
- `PaginatedPromise` — lazy all-pages wrapper; consumed via `->resolve()`; supports lazy transforms via `->then()`
- `PaginatedResponse` — wraps paginated results + headers; `getPageCount(int $limit)` calculates page count from `Content-Range`
- `ApiClientFactory` — creates pre-configured `ApiClient` instances per API (Entrepôt, EspaceCo, EspaceCo Style)
- Specialized domain services inject `ApiClient` via `#[Autowire(service: 'app.api_client.*')]`:
    - Entrepôt: `ConfigurationApiService`, `StoredDataApiService`, `UploadApiService`, `UserApiService`, `ProcessingApiService`, etc.
    - EspaceCo: `CommunityApiService`, `GridApiService`, `StyleApiService`, `UserApiService`, etc.

HTTP retry is configured in `config/packages/framework.yaml` (max 3 retries, 500/502/503/504 status codes).

Authentication uses Keycloak OAuth2; tokens are stored in the PHP session. Always handle `AuthenticationExpiredException`.

### Frontend (React 18, TypeScript, Vite)

**Data flow:** React component → `useQuery` hook → typed API client → `jsonFetch()` wrapper → Symfony route → Controller → Service → External API.

**Key layers:**

- `assets/main.tsx` / `assets/App.tsx` — entry point; providers nested: QueryClient → RouteProvider → ErrorBoundary → AlertProvider → AuthProvider
- `assets/router/` — **type-route** library for type-safe routing; URLs generated via `SymfonyRouting.generate()` from `var/cache/fosRoutes.json`
- `assets/modules/jsonFetch.ts` — core fetch wrapper (401 session expiry detection, CSRF header injection)
- `assets/entrepot/api/` — structured API clients per resource using `jsonFetch`
- `assets/hooks/queries/` — React Query hooks for all server state
- `assets/stores/` — **Zustand** for client state (auth, alerts, snackbar)
- `assets/contexts/` — React Context for feature-specific state (style forms, datastore, community)
- `assets/components/` — shared components (Layout, Input, Modal, Provider, Utils)
- `assets/entrepot/` and `assets/espaceco/` — domain feature modules with pages, forms, hooks

React Query is persisted to localStorage (24h TTL). `@/*` aliases map to `assets/*`.

## Code Conventions

### TypeScript/React

- Functional components with explicit prop types (`interface` or `type`). Default `function` exports for new components.
- Import order: third-party → project (`@/` / relative) → static data/images → CSS/SCSS.
- Use strict equality (`===`). Unused vars/params prefixed with `_unused`. No `console.log` in commits.
- Use `useQuery`/`useMutation` for server state. Use `useState` or Context for UI state.
- Forms: React Hook Form + Yup resolver. `Controller` for complex inputs.
- Styling: DSFR utility classes first via **`fr.cx(...)`** (from `@codegouvfr/react-dsfr`). For component-scoped custom CSS, use **`tss-react`** (`tss.create`) which supports runtime-dynamic values too (computed colors, JS-sized dimensions).
- Translation files end with `.locale.ts` or `.locale.tsx`. Support French and English.

### PHP/Symfony

- Inject `ApiClient` (via `#[Autowire]`) in domain services.
- Use constructor injection. Use typed DTOs for request/response models.
- Comments in French; code identifiers in English.

### Language

- All comments (PHP, JS/TS), docblocks, and documentation files (`docs/`) must be written in French.

## Testing

- Cypress E2E tests are **paused** — ignore unless explicitly reactivated.
- PHP tests in `tests/`. Developer docs in `docs/developer/`.

## Profileur Symfony (debug)

Le profileur stocke ses données dans `var/cache/dev/profiler/` dans le conteneur :

```bash
docker exec cartesgouvfr-app_dev-1 php -r "
require 'vendor/autoload.php';
use Symfony\Component\HttpKernel\Profiler\FileProfilerStorage;
\\\$storage = new FileProfilerStorage('file:'.getcwd().'/var/cache/dev/profiler');
\\\$profile = \\\$storage->read('TOKEN'); // remplacer TOKEN par le token du profiler
if (!\\\$profile) { echo 'Non trouvé'; exit; }
echo 'URL: '.\\\$profile->getUrl().PHP_EOL;
\\\$time = \\\$profile->getCollector('time');
echo 'Durée: '.\\\$time->getDuration().' ms'.PHP_EOL;
foreach (\\\$time->getEvents() as \\\$name => \\\$event) {
    printf('  %-60s %6.1f ms'.PHP_EOL, \\\$name, \\\$event->getDuration());
}
"
```

Autres collectors utiles : `http_client`, `db`, `logger`, `request`, `security`, `exception`.

## Autres

- Apostrophe : dans les textes visibles par l'utilisateur, toujours utiliser le caractère `’` (`U+2019`)
