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

## Commandes utiles

Quelques commandes composer et yarn ont été configurées comme raccourcis pour certaines tâches courantes. Voir [composer.json](./../../composer.json) et [package.json](./../../package.json) à la racine du projet.

## Divers

### Extensions VSCode

Voici une liste d'extensions VSCode recommandées qui permettent une bonne expérience développeur.

**PHP** :

-   **PHP Intelephense** : https://marketplace.visualstudio.com/items?itemName=bmewburn.vscode-intelephense-client
-   **PHP Debug** : https://marketplace.visualstudio.com/items?itemName=xdebug.php-debug
-   **PHP Namespace Resolver** : https://marketplace.visualstudio.com/items?itemName=MehediDracula.php-namespace-resolver
-   **PHP DocBlocker** : https://marketplace.visualstudio.com/items?itemName=neilbrayfield.php-docblocker
-   **PHP Mess Detector** : https://marketplace.visualstudio.com/items?itemName=ecodes.vscode-phpmd
-   **php cs fixer** : https://marketplace.visualstudio.com/items?itemName=junstyle.php-cs-fixer
-   **PHP Getters & Setters** : https://marketplace.visualstudio.com/items?itemName=phproberto.vscode-php-getters-setters
-   **PHP Constructor** : https://marketplace.visualstudio.com/items?itemName=MehediDracula.php-constructor
-   **Composer** : https://marketplace.visualstudio.com/items?itemName=DEVSENSE.composer-php-vscode

**JavaScript** :

-   **ESLint** : https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint
-   **Prettier - Code formatter** : https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode
-   **Version Lens** : https://marketplace.visualstudio.com/items?itemName=pflannery.vscode-versionlens
