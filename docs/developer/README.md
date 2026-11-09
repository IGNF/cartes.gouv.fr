# Documentation développeur

## Guides généraux

- [Installation et configuration](install.md)
- [Glossaire](glossaire.md)
- [Implémentation et exécution des tests](test.md)
- [Internationalisation](i18n.md)
- [Optimisation des images (génération des variantes WebP)](images.md)
- [Explication des workflows](workflows.md)
- [Utilisation de l'API Entrepôt](./entrepot/README.md)
- [Symfony AI Mate](https://symfony.com/doc/current/ai/components/mate.html) : profileur, journaux et conteneur de services en ligne de commande (`vendor/bin/mate`). Depuis l’hôte, passer par le conteneur : `docker exec cartesgouvfr-app_dev-1 vendor/bin/mate tools:list`.

## Implémentations et features spécifiques à ce projet

- [ApiClient (requêtes HTTP, parallélisme, pagination)](./api-client/README.md)
- [File Uploader](./file-uploader/README.md)
- Explication des workflows :
    - [Workflow d'intégration d'un upload vecteur](./workflows/upload-integration-vector/README.md)
- [Authentification](./auth/README.md)
- [Erreurs de l’API (Problem Details, validation 422)](./erreurs-api.md)
- [Routage (TanStack Router)](./routing/README.md)

## Commandes utiles

Quelques commandes composer et npm ont été configurées comme raccourcis pour certaines tâches courantes. Voir [composer.json](./../../composer.json) et [package.json](./../../package.json) à la racine du projet.
