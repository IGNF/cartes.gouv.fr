# cartes.gouv.fr - Copilot Instructions

## Project Overview

**cartes.gouv.fr** is the main portal for accessing the Géoplateforme using its Entrepôt API, featuring:

- User space (back-office) for data upload and service configuration
- Publishing of vector/raster data, OGC services, vector/raster tile pyramids
- Community and workspace management
- Integration with Keycloak authentication

References:

- Entrepôt docs: https://geoplateforme.github.io/entrepot/production
- OpenAPI: https://data.geopf.fr/api/v3/api-docs

## Instruction Priority

When instructions conflict, apply this order:

1. Existing patterns in the touched file/folder
2. Repository configs and scripts (`eslint.config.ts`, `tsconfig*.json`, `package.json`, `composer.json`)
3. This instruction file
4. Generic framework conventions

## Copilot Contexts

- **Autocomplete**: prioritize local file consistency and minimal edits
- **Agent/Plan mode**: propose focused steps, then implement with smallest safe change set
- **PR review**: prioritize correctness, regressions, security, and repo conventions over style preferences

## Tech Stack

### Frontend

- React 18 + TypeScript
- Vite
- Node.js version from `.nvmrc`
- DSFR (`@codegouvfr/react-dsfr`) + custom CSS/SCSS
- Material-UI with DSFR theme
- React Query (TanStack), React Context, Zustand
- React Hook Form (+ resolvers)
- ESLint + Prettier

### Backend

- Symfony 6.4.\*
- Service-based architecture
- Symfony Form & Validation
- Keycloak OAuth2
- Runtime requirement: PHP 8.2+

## Core Coding Rules

- Keep changes minimal and consistent with existing code.
- No unused imports.
- Unused variables/params must be prefixed with `_unused`.
- Use strict equality (`===` / `!==`) in TypeScript.
- Ensure array callbacks return a value when required.
- Respect accessibility rules (DSFR + jsx-a11y).
- Do not leave `console.log`/debug code in commits.

## Frontend Conventions

### Components

- Functional components only.
- File names in PascalCase (example: `AutocompleteSelect.tsx`).
- Prefer default `function` exports for new components. Keep existing `const` export style in legacy files when already established.
- Keep props typed (`interface` or `type`).

### Imports order (TypeScript)

In `.ts` and `.tsx` files, order imports as follows:

1. Third-party imports
2. Imports from this project (`@/` aliases and relative project modules)
3. Static data and image/url imports
4. Global CSS/SCSS imports

Preferred shape:

```tsx
interface MyComponentProps {
    label: string;
    disabled?: boolean;
}

export default function MyComponent(props: PropsWithChildren<MyComponentProps>) {
    const { label, disabled } = props;

    return <div aria-disabled={disabled}>{label}</div>;
}
```

### Forms

- Use React Hook Form.
- Use `Controller` for complex controlled inputs.
- Use yup resolver for validation.
- Do not mix controller-based and state-only patterns in the same component unless required.

### Styling

- Prefer DSFR classes/utilities first (the `fr` object from `@codegouvfr/react-dsfr`).
- New styles should favor CSS/CSS modules and inline styles for dynamic values.
- Keep SCSS for legacy areas already using it.
- Keep component-specific styles near the component.

### State & i18n

- Server state: React Query (`useQuery`, `useMutation`).
- UI state: `useState` or Context; use existing provider patterns for cross-cutting concerns.
- Translation files end with `.locale.ts` or `.locale.tsx`.
- Support French and English.
- Unused locale identifiers should be prefixed with `_unused`.

### TypeScript & lint references

- Keep TypeScript typings explicit on public interfaces.
- ESLint source of truth: `eslint.config.ts`.
- TypeScript source of truth: `tsconfig*.json`.
- TS aliases: `@/*` maps to `assets/*`.

## Backend Conventions (PHP/Symfony)

### Services & API

- Namespace: `App\Services\`.
- Prefer constructor dependency injection.
- For API clients, extend `AbstractApiService`.
- Use `AbstractApiService` helpers (`get()`, `post()`, `sendFiles()`, etc.).
- Handle authentication expiration (`AuthenticationExpiredException`) gracefully.
- Validate API responses and return user-friendly errors.

### Validation, DTOs, constants

- Use Symfony validation constraints and forms.
- Use typed DTOs for request/response models.
- Use class constants for configuration values (example: `FILE_UPLOAD_MAX_DURATION_SECONDS`).

## Project Patterns

### Error handling

- Frontend: expose errors through Alert components.
- Backend: throw appropriate Symfony exceptions with clear messages.

### Authentication and uploads

- Keycloak token stored in session (`KeycloakToken`).
- Unauthenticated requests must fail gracefully.
- Use `FileUploader` service for uploads.
- Support multi-file uploads and respect configured timeout constraints.

### Search/filtering

- Prefer accent/case-insensitive filtering for French text where relevant.
- Limit autocomplete result count when the existing feature already applies a limit.

## Validation Commands

Use repository scripts as the source of truth:

- Frontend lint: `npm run lint`
- Frontend types: `npm run type-check`
- Frontend format check: `npm run format`
- Backend checks: `composer check-rules`

If using Docker, run commands in the appropriate container context.

## Testing Notes

- Cypress tests are currently paused and should be ignored unless explicitly reactivated.

## Documentation & Language

- Project context is French.
- Comments should be in French.
- Variables and code identifiers should remain in English.
- Refer to developer docs in `docs/developer/**` for architecture and workflows. Suggest improvements to those docs when relevant.

## Key Directories

- `assets/` - Frontend React/TypeScript
- `assets/components/` - Reusable components
- `assets/pages/` - Page-level components
- `assets/hooks/` - Custom hooks
- `assets/i18n/` - Translation files
- `assets/sass/` - Global/component styles
- `assets/stores/` - State management
- `src/` - Backend PHP
- `src/Services/` - Business logic services
- `src/Entity/` and `src/Dto/` - Entities and DTOs

## Pre/Post Change Checklist

Before coding:

1. Check similar existing components/services.
2. Verify lint/type rules (`eslint.config.ts`, TS types, and project scripts).
3. Ensure DSFR and a11y compliance.

After coding:

1. Run relevant lint/type/check scripts.
2. Run targeted tests if available for the touched area.
3. If using Docker, run checks inside the proper container context.

## Common Mistakes to Avoid

- Do not export unnamed components.
- Do not ignore TypeScript strictness.
- Do not skip DSFR usage when relevant.
- Do not mix incompatible form patterns without reason.
- Do not commit with lint/test failures.
