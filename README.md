# cartes.gouv.fr

[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-blue.svg)](LICENSE)
[![Docker build & publish](https://github.com/IGNF/cartes.gouv.fr/actions/workflows/docker-build-publish.yml/badge.svg)](https://github.com/IGNF/cartes.gouv.fr/actions/workflows/docker-build-publish.yml)

**cartes.gouv.fr** est le portail principal d'accès à la Géoplateforme, son entrepôt et son catalogue.

Ce dépôt ne concerne pas l'intégralité des fonctionnalités de cartes.gouv.fr mais essentiellement l'espace connecté : le back-office d'alimentation et de configuration des services de diffusion.

Il prend la suite de la préfiguration que constituait le [Géotuileur](https://github.com/IGNF/geotuileur-site/) en étendant ses possibilités d'alimentation aux données vecteur et raster et ses possibilités de diffusion à d'autres flux que les seules tuiles vectorielles.

Les autres briques de cartes.gouv.fr sont :

- rechercher une donnée [IGNF/geonetwork-ui](https://github.com/IGNF/geonetwork-ui) (déployé depuis le 28 juin 2024)
- explorer les données [IGNF/cartes.gouv.fr-entree-carto](https://github.com/IGNF/cartes.gouv.fr-entree-carto) (déployée depuis le 28 juin 2024)
- l'aide [IGNF/cartes.gouv.fr-documentation](https://github.com/IGNF/cartes.gouv.fr-documentation)

## Fonctionnalités

- Gestion des **clés d'accès** aux services restreints
- Formulaire de demande pour rejoindre une communauté publique
- Formulaire de contact, en particulier pour demander la création d'un nouvel espace de travail
- Processus d'alimentation et diffusion de données vecteur :
    - Livraison de données avec intégration en base de données
    - Publication de services **WFS** puis ajout (optionnel) de **styles** associés
    - Publication de services **WMS-vecteur** (WMS "à la volée", il s'agit bien d'un flux image mais les images ne sont pas précalculées)
    - Génération de **pyramides de tuiles vectorielles** et publication de services **TMS** puis ajout (optionnel) de styles associés
    - Génération de **pyramides de tuiles d'images** et publications de services **WMS-raster** et **WMTS**
    - Publication de **métadonnées** sur le catalogue, obligatoire dès le premier service publié
    - Ajout de documents associés à une fiche de données
- Gestion des entrepôts et communautés :
    - Gestion des membres et de leurs droits
    - Visualisation de l'utilisation des quotas alloués pour chaque service et type de stockage
    - Gestion des **permissions** associées aux services publiés sur des points d'accès restreints
- Espace **Découverte** pour tester les fonctionnalités

À venir :

- Mise à jour des données diffusées
- Interface de configuration de style

## ⚠ Point d'attention

cartes.gouv.fr n'utilise pas de stockage propre. Toutes les informations visibles proviennent de l'[API Entrepôt](https://data.geopf.fr/api/swagger-ui/index.html). Mais pour obtenir un affichage cohérent, cartes.gouv.fr utilise des étiquettes (`tags`) sur les entités de l'entrepôt.

Si vous avez utilisé l'API Entrepôt directement ou avec une autre application cliente, vous ne verrez pas vos données sur cartes.gouv.fr si vous n'avez pas utilisé le tag `datasheet_name` pour associer livraisons (`upload`), données stockées (`stored_data`) et services de diffusion (`configuration`) derrière le concept virtuel de **fiche de données**. Une fiche de données correspond à plusieurs livraisons, données stockées et services de diffusion mais à une seule métadonnée.

Pour en savoir plus, consultez la [documentation développeur sur l'utilisation de l'API Entrepôt par cartes.gouv.fr](docs/developer/entrepot/README.md).

## Développement

Voir la [documentation développeur](docs/developer/README.md).
