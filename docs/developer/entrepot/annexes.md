# Utilisation des fichiers annexes

Il s'agit d'une [entité](https://geoplateforme.github.io/entrepot/production/concepts/) de l'API qui représente des fichiers librement déposés et utilisés par les utilisateurs de l'API Entrepôt.

## un fichier de style individuel (par ex. contenu du SLD, QML etc)

Un fichier de style déposé via cartes.gouv.fr est stocké d'abord dans un annexe avant d'être référencé dans la propriété `extra` de la configuration décrite [ici](./extra.md#un-ensemble-de-fichiers-de-style-associés-à-une-configuration)

Labels :

| label            | description               |        |
| ---------------- | ------------------------- | ------ |
| `datasheet_name` | nom de la fiche de donnée | string |
| `type`           | valeur fixe : "style"     | string |

## un document lié à une fiche de donnée

Un document du type fichier est stocké d'abord dans un annexe avant d'être référencé dans l'annexe "chapeau" décrit ci-dessous.

Labels :

| label            | description               |        |
| ---------------- | ------------------------- | ------ |
| `datasheet_name` | nom de la fiche de donnée | string |
| `type`           | valeur fixe : "document"  | string |

## un ensemble de documents liés à une fiche de donnée

Syntaxe du path :

```
/documents/[datasheet_name].json
```

| variable         | description               |        |
| ---------------- | ------------------------- | ------ |
| `datasheet_name` | nom de la fiche de donnée | string |

Labels :

| label            | description                   |        |
| ---------------- | ----------------------------- | ------ |
| `datasheet_name` | nom de la fiche de donnée     | string |
| `type`           | valeur fixe : "document-list" | string |

Structure de cet annexe json :

```ts
export type DatasheetDocument = {
    type: "link" | "file";
    url: string;
    name: string;
    description?: string;
    id: string;
};
```

```json
[
    {
        "type": "link",
        "name": "test lien",
        "description": "test lien desc",
        "id": "uuid généré automatiquement par cartes.gouv.fr",
        "url": "https://ign.fr"
    },
    {
        "type": "file",
        "name": "projet qgis",
        "description": "un projet qgis",
        "id": "identifiant de l'annexe",
        "url": "url complète de l'annexe"
    }
    ...
]
```

## la vignette d'une fiche de donnée

Labels :

| label            | description               |        |
| ---------------- | ------------------------- | ------ |
| `datasheet_name` | nom de la fiche de donnée | string |
| `type`           | valeur fixe : "thumbnail" | string |

## un fichier GetCapabilities filtré pour chaque endpoint public des flux WFS, WMS (raster et vecteur) et WMTS

Syntaxe du path :

```
/[endpoint_technical_name]/capabilities.xml
```

| label  | description                  |        |
| ------ | ---------------------------- | ------ |
| `type` | valeur fixe : "capabilities" | string |
