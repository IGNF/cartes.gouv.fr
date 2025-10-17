# Tests avec Cypress

> [!WARNING]
> Cypress n'est plus installé dans le projet.

### Prérequis

Activer l'environnement de test :

```ini
# .env.local
APP_ENV=test
```

```sh
php bin/console cache:clear
```

Configurer le `baseUrl` dans [cypress.config.js](../../cypress.config.js) specifique à votre installation :

```js
baseUrl: "https://cartesgouvfr-dev.docker.localhost",
```

Lancer si première utilisation de cypress :

```sh
npx cypress install
```

> Configuration supplémentaire pour Linux sous WSL2 : https://nickymeuleman.netlify.app/blog/gui-on-wsl2-cypress

### Lancement des tests

> Vous trouverez les commandes complètes de cypress ci-après et des commandes raccourcies dans le package.json

Ouvrir l'interface de pilotage de cypress :

```sh
npx cypress open
```

Lancer les tests (mode `headless`, sans visuel) :

```sh
# le mode headless (--headless) est activé par défaut
npx cypress run --browser firefox
```

Lancer les tests (mode `headed`, avec visuel) :

```sh
npx cypress run --browser firefox --headed
```

> Le navigateur sur lequel on souhaite exécuter les tests doit être installé sur votre machine.
>
> Liste de navigateurs supportés : https://docs.cypress.io/guides/guides/launching-browsers#Browsers

### Astuces

Structure des tests :

```js
// cypress/e2e/example.cy.js

describe("Description d'une suite de tests", () => {
    context("Un ensemble de tests qui sont regroupés par un contexte particulier (par ex. utilisateur connecté ou non) (optionnel)", () => {
        it("(it ou specify) un scenario représenté par une suite de tâches et vérification d'un comportement attendu (quelque chose qui se passe quand l'utilisateur effectue une action)", () => {
            ...
        })
    })
})
```

Voir les exemples dans [/cypress/e2e](../../cypress/e2e/)

> En savoir plus : https://docs.cypress.io/guides/core-concepts/writing-and-organizing-tests#Test-Structure
