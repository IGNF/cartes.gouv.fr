# Installation et configuration

Le portail est construit sur le framework PHP Symfony. Il nécessite l'installation d'un moteur php >=8.2 avec les extensions `xsl` et `intl`, composer et yarn.

1. Si nécessaire, s'assurer que le proxy est correctement configuré (par exemple au moyen des variables d'environnement `http_proxy` et `https_proxy`)

2. Cloner le dépôt

3. Créer à la racine du projet un fichier nommé `.env.local` pour surcharger les informations du fichier `.env`. Se référer au fichier `.env` pour le compléter.

4. Installer les dépendances php (`composer install`)

5. Installer les dépendances Javascript (`yarn install`)

6. Compiler les assets (voir détails des commandes suivantes dans le fichier [package.json](./../../package.json)) :
    - `yarn dev` : lancer le serveur de développement vite avec hot-reload, pour le développement en local
    - `yarn build` : générer les assets en mode production
    - `yarn build:dev` : générer les assets en mode développement

### Spécificités de l'installation avec Docker

- Lancer les conteneurs docker : `docker compose -f compose[.prod].yml up [-d] [--build]`

> `-f` permet de spécifier le fichier compose.yml à utiliser (il y a plusieurs fichiers, chaque fichier correspondant à un environnement)
>
> `-d` permet de créer le conteneur docker en mode "détaché"
>
> `--build` permet de demander la création/mise à jour de l'image docker
