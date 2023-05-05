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
