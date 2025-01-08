# Utilisation des fichiers annexes

Il s'agit d'une [entité](https://geoplateforme.github.io/entrepot/production/concepts/) de l'API qui représente des fichiers librement déposés et utilisés par les utilisateurs de l'API Entrepôt.

## un ensemble de fichiers de style associés à une configuration

Migré vers [extra](./extra.md#un-ensemble-de-fichiers-de-style-associés-à-une-configuration).

## un ensemble de documents liés à une fiche de donnée

Syntaxe du path :

```
/documents/[datasheet_name].json
```

| variable         | description               |        |
| ---------------- | ------------------------- | ------ |
| `datasheet_name` | nom de la fiche de donnée | string |

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
