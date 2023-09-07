# Documentation développeur

## Installation et configuration

Le portail est construit sur le framework PHP Symfony. Il nécessite l'installation d'un moteur php >=8.0 avec les extensions `xsl` et `intl`, composer et yarn.

1. S'assurer que le proxy est correctement configuré (par exemple au moyen des variables d'environnement `http_proxy` et `https_proxy`)

2. Clôner le dépôt!

3. Créer à la racine du projet un fichier nommé `.env.local` pour surcharger les informations du fichier `.env`. Se référer au fichier `.env` pour le compléter.

4. Installer les dépendances php (`composer install`)

5. Installer les dépendances Javascript (`yarn install`)

6. Compiler les assets (`yarn encore [dev|production]`)

### Spécificités de l'installation avec Docker

-   Lancer les conteneurs docker : `docker compose -f docker-compose[.dev].yml up [-d] [--build]`

> `-f` permet de spécifier le fichier docker-compose.yml à utiliser (il y a plusieurs fichiers, chaque fichier correspondant à un environnement)
>
> `-d` permet de créer le conteneur docker en mode "détaché"
>
> `--build` permet de demander la création/mise à jour de l'image docker

## Tests avec Cypress

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
yarn cypress install
```

> Configuration supplémentaire pour Linux sous WSL2 : https://nickymeuleman.netlify.app/blog/gui-on-wsl2-cypress

### Lancement des tests

> Vous trouverez les commandes complètes de cypress ci-après et des commandes raccourcies dans le package.json

Ouvrir l'interface de pilotage de cypress :

```sh
yarn cypress open
```

Lancer les tests (mode `headless`, sans visuel) :

```sh
# le mode headless (--headless) est activé par défaut
yarn cypress run --browser firefox
```

Lancer les tests (mode `headed`, avec visuel) :

```sh
yarn cypress run --browser firefox --headed
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

## Commandes utiles

Quelques commandes composer et yarn ont été configurées comme raccourcis pour certaines tâches courantes. Voir [composer.json](./../../composer.json) et [package.json](./../../package.json) à la racine du projet.
