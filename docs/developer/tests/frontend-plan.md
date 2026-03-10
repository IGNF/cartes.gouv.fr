# Plan de tests frontend — Cypress E2E

## Résumé

Le projet a un dossier cypress parce qu'à moment donnée, cypress y était installé avant d'être retiré. Réinstaller cypress dans le projet et récupérer des anciens fichiers si nécessaire, supprimer le reste. Moderniser les fixtures et custom commands pour refléter l'état actuel de l'application, puis écrire des tests E2E pour le **Dashboard** comme premier exemple extensible à d'autres pages.

## État des lieux

### Ce qui existe déjà

| Élément                          | État             | Détails                                                                                                                                     |
| -------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `cypress.config.ts`              | ✅ Présent       | `baseUrl: "http://localhost:9092"`                                                                                                          |
| `cypress/e2e/*.cy.ts`            | ⚠️ Obsolète      | 3 fichiers (`home`, `dashboard`, `me`) — routes et sélecteurs périmés                                                                       |
| `cypress/support/commands.ts`    | ⚠️ Partiel       | `fakeLogin()` / `fakeLogout()` via cookie `MOCKSESSID`                                                                                      |
| `cypress/fixtures/users/me.json` | ⚠️ Format ancien | camelCase (`firstName`, `communitiesMember`) — le sérialiseur Symfony produit maintenant du snake_case (`first_name`, `communities_member`) |
| `cypress` dans `package.json`    | ❌ Retiré        | Plus dans les dépendances                                                                                                                   |
| Scripts npm de test              | ❌ Absents       | Aucun script `cypress:*`                                                                                                                    |

### Comment l'app fonctionne (pertinent pour les tests)

1. **Injection des données utilisateur** : le template Twig `app.html.twig` injecte un `<div id="user" data-user="{{ app.user|serialize('json') }}">` dans le HTML
2. **Hydratation côté React** : le store Zustand `AuthStore` parse ce JSON au chargement pour peupler l'état `user`
3. **Configuration frontend** : les attributs `data-*` du `<div id="root">` (ex: `data-api-espaceco-url`, `data-config-community-id`) sont lus par `env.ts` et conditionnent l'affichage de certains éléments
4. **Authentification** : Keycloak OAuth2 — la commande `fakeLogin` existante utilise un cookie `MOCKSESSID` qui suppose un mécanisme de session mock côté backend

### Conditions d'affichage du Dashboard (cas de test cible)

Le composant `Dashboard.tsx` affiche :

- **Toujours** : tuiles "Mes données", "Mes clés d'accès", "Mon compte", bandeau questionnaire
- **Conditionnel — tuile "Mes guichets"** : visible uniquement si `data-api-espaceco-url` est défini sur `#root` (lu par `ApiEspaceCoStore.isUrlDefined()`)
- **Conditionnel — tuile "Alertes"** : visible uniquement si l'utilisateur possède le droit `ANNEX` dans la communauté dont l'`_id` correspond à `configCommunityId` (lu depuis `data-config-community-id` sur `#root`)

---

## Plan de mise en œuvre

### Phase 1 — Installation et configuration

> Bloquant pour toutes les phases suivantes.

#### 1.1 Installer Cypress

```bash
npm install --save-dev cypress
```

#### 1.2 Ajouter les scripts npm

Dans `package.json`, section `scripts` :

```json
{
    "cypress:open": "cypress open",
    "cypress:run": "cypress run"
}
```

#### 1.3 Mettre à jour `cypress.config.ts`

```ts
import { defineConfig } from "cypress";

export default defineConfig({
    e2e: {
        baseUrl: "http://localhost:9092",
        viewportWidth: 1280,
        viewportHeight: 720,
        video: false,
    },
});
```

- `viewportWidth/Height` : taille desktop pour que les composants DSFR s'affichent en mode desktop (pas mobile)
- `video: false` : évite de générer des artefacts vidéo volumineux en CI

#### 1.4 Mettre à jour `cypress/tsconfig.json`

Passer le target de `es5` à `es2020` pour cohérence avec le projet :

```json
{
    "compilerOptions": {
        "target": "es2020",
        "lib": ["es2020", "dom"],
        "types": ["cypress", "node"]
    },
    "include": ["**/*.ts"]
}
```

---

### Phase 2 — Infrastructure de test réutilisable

> Bloquant pour la Phase 3. Les patterns établis ici serviront pour tous les futurs tests.

#### 2.1 Stratégie d'authentification

**Deux approches possibles**, selon que le mécanisme `MOCKSESSID` fonctionne toujours côté backend :

##### Option A — Cookie `MOCKSESSID` (si le backend le supporte encore)

La commande `fakeLogin()` existante suffit. Le backend reconnaît le cookie et injecte les données utilisateur dans le HTML Twig.

##### Option B — Interception HTML (fallback robuste, recommandé)

Créer une commande `fakeLoginWithUser(fixturePath)` qui :

1. Intercepte la réponse HTML du serveur avec `cy.intercept()`
2. Injecte un `<div id="user" data-user="...">` avec les données utilisateur mockées
3. Permet de contrôler aussi les attributs `data-*` du `#root` (ex: `data-api-espaceco-url`)

Cette approche est plus robuste car :

- Indépendante du backend (pas besoin du mécanisme `MOCKSESSID`)
- Contrôle total des données injectées (profils différents par test)
- Reflète exactement le mécanisme d'hydratation de l'`AuthStore`

**Exemple d'implémentation** (`cypress/support/commands.ts`) :

```ts
Cypress.Commands.add("fakeLoginWithUser", (fixturePath: string, rootDataAttrs?: Record<string, string>) => {
    cy.fixture(fixturePath).then((userData) => {
        cy.intercept("GET", "**", (req) => {
            // N'intercepter que les requêtes HTML (pas les assets, API, etc.)
            if (req.headers["accept"]?.includes("text/html")) {
                req.continue((res) => {
                    // Injecter le div utilisateur
                    const userDiv = `<div id="user" data-user='${JSON.stringify(userData)}'></div>`;
                    res.body = res.body.replace("</body>", `${userDiv}</body>`);

                    // Injecter les data-attributes sur #root si fournis
                    if (rootDataAttrs) {
                        const attrs = Object.entries(rootDataAttrs)
                            .map(([key, value]) => `data-${key}="${value}"`)
                            .join(" ");
                        res.body = res.body.replace('<div id="root"', `<div id="root" ${attrs}`);
                    }
                });
            }
        }).as("htmlIntercept");
    });
});
```

#### 2.2 Mettre à jour les fixtures

##### `cypress/fixtures/users/me.json` — Utilisateur basique (sans communautés)

```json
{
    "id": "fc5a7948-142a-4dae-b24e-5550fe7183f9",
    "email": "test@test.com",
    "user_name": "test@test.com",
    "first_name": "Test",
    "last_name": "User",
    "roles": ["ROLE_USER"],
    "communities_member": [],
    "account_creation_date": "2023-06-26T11:52:25+00:00",
    "last_login_date": "2023-08-01T14:09:41+00:00"
}
```

##### `cypress/fixtures/users/me-with-config-access.json` — Utilisateur avec droit Alertes

```json
{
    "id": "fc5a7948-142a-4dae-b24e-5550fe7183f9",
    "email": "admin@test.com",
    "user_name": "admin@test.com",
    "first_name": "Admin",
    "last_name": "Config",
    "roles": ["ROLE_USER"],
    "communities_member": [
        {
            "community": {
                "_id": "test-config-community-id"
            },
            "rights": ["COMMUNITY", "ANNEX"]
        }
    ],
    "account_creation_date": "2023-06-26T11:52:25+00:00",
    "last_login_date": "2023-08-01T14:09:41+00:00"
}
```

> **Note** : la valeur `"test-config-community-id"` doit correspondre au `data-config-community-id` injecté sur `#root` dans le test.

#### 2.3 Mettre à jour les types (`cypress/index.d.ts`)

```ts
declare namespace Cypress {
    interface Chainable {
        fakeLogin(): Chainable;
        fakeLogout(): Chainable;
        fakeLoginWithUser(fixturePath: string, rootDataAttrs?: Record<string, string>): Chainable;
    }
}
```

---

### Phase 3 — Tests du Dashboard

> Le Dashboard comme premier exemple. Un test par scénario conditionnel.

#### 3.1 Structure du fichier `cypress/e2e/dashboard.cy.ts`

```ts
describe("Tableau de bord", () => {
    describe("Éléments toujours visibles", () => {
        beforeEach(() => {
            cy.fakeLoginWithUser("users/me", {
                "api-espaceco-url": "https://espaceco.test",
            });
            cy.visit("/tableau-de-bord");
        });

        it("affiche le titre et le message de bienvenue", () => {
            cy.get("h1").should("contain", "Tableau de bord");
            cy.get("main").should("contain", "Bienvenue Test");
        });

        it("affiche la tuile 'Mes données'", () => {
            cy.contains(".fr-tile", "Mes données").should("exist");
        });

        it("affiche la tuile 'Mes clés d'accès'", () => {
            cy.contains(".fr-tile", "Mes clés d'accès").should("exist");
        });

        it("affiche la tuile 'Mon compte'", () => {
            cy.contains(".fr-tile", "Mon compte").should("exist");
        });

        it("affiche le bandeau questionnaire", () => {
            cy.get(".fr-notice").should("exist");
            cy.contains("Votre avis compte").should("exist");
        });
    });

    describe("Tuile 'Mes guichets' (conditionnelle)", () => {
        it("visible quand api-espaceco-url est défini", () => {
            cy.fakeLoginWithUser("users/me", {
                "api-espaceco-url": "https://espaceco.test",
            });
            cy.visit("/tableau-de-bord");
            cy.contains(".fr-tile", "Mes guichets").should("exist");
        });

        it("absente quand api-espaceco-url n'est pas défini", () => {
            cy.fakeLoginWithUser("users/me");
            cy.visit("/tableau-de-bord");
            cy.contains(".fr-tile", "Mes guichets").should("not.exist");
        });
    });

    describe("Tuile 'Alertes' (conditionnelle)", () => {
        it("visible quand l'utilisateur a le droit ANNEX dans la communauté config", () => {
            cy.fakeLoginWithUser("users/me-with-config-access", {
                "config-community-id": "test-config-community-id",
            });
            cy.visit("/tableau-de-bord");
            cy.contains(".fr-tile", "Alertes").should("exist");
        });

        it("absente quand l'utilisateur n'a pas le droit ANNEX", () => {
            cy.fakeLoginWithUser("users/me", {
                "config-community-id": "test-config-community-id",
            });
            cy.visit("/tableau-de-bord");
            cy.contains(".fr-tile", "Alertes").should("not.exist");
        });
    });
});
```

#### 3.2 Adapter les tests existants

- **`home.cy.ts`** : vérifier que les sélecteurs DSFR (`.fr-header__service`, `.fr-header__tools-links`) sont toujours valides avec la version actuelle de `@codegouvfr/react-dsfr`
- **`me.cy.ts`** : mettre à jour les sélecteurs et les champs de fixture (passage au snake_case)

---

### Phase 4 — Documentation et CI

#### 4.1 Retirer la mention "tests pausés"

Dans `.github/copilot-instructions.md`, supprimer :

```
- Cypress tests are currently paused and should be ignored unless explicitly reactivated.
```

#### 4.2 Documenter la procédure

Ajouter dans `docs/developer/` les instructions pour lancer les tests :

```bash
# Démarrer l'application (Docker)
docker compose up -d

# Lancer les tests en mode interactif
npm run cypress:open

# Lancer les tests en headless (CI)
npm run cypress:run
```

---

## Fichiers concernés

| Fichier                                             | Action                                                                    |
| --------------------------------------------------- | ------------------------------------------------------------------------- |
| `package.json`                                      | Ajouter `cypress` en devDependency + scripts `cypress:open`/`cypress:run` |
| `cypress.config.ts`                                 | Ajouter `viewportWidth`, `viewportHeight`, `video: false`                 |
| `cypress/tsconfig.json`                             | Target `es5` → `es2020`                                                   |
| `cypress/support/commands.ts`                       | Ajouter `fakeLoginWithUser()` avec interception HTML                      |
| `cypress/index.d.ts`                                | Ajouter types pour `fakeLoginWithUser()`                                  |
| `cypress/fixtures/users/me.json`                    | Mettre à jour au format snake_case actuel                                 |
| `cypress/fixtures/users/me-with-config-access.json` | Créer — utilisateur avec droit ANNEX                                      |
| `cypress/e2e/dashboard.cy.ts`                       | Réécrire avec les cas conditionnels                                       |
| `cypress/e2e/home.cy.ts`                            | Adapter aux sélecteurs actuels                                            |
| `cypress/e2e/me.cy.ts`                              | Adapter au format de fixture actuel                                       |
| `.github/copilot-instructions.md`                   | Retirer "Cypress tests are currently paused"                              |

## Vérification

- [ ] `npm run cypress:run` passe en headless (tous les tests green)
- [ ] `npm run cypress:open` ouvre l'interface interactive
- [ ] Les 4 cas conditionnels du Dashboard sont couverts (guichets ✓/✗, alertes ✓/✗)
- [ ] `npm run lint` et `npm run type-check` passent toujours

## Point de vigilance

Le mécanisme `MOCKSESSID` (cookie de session mock) doit être vérifié côté backend. S'il ne fonctionne plus, l'approche par interception HTML (Option B, section 2.1) est le fallback recommandé — elle est indépendante du backend et offre un contrôle total sur les données injectées.
