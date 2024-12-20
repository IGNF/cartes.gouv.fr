# Utilisation des fichiers annexes

Il s'agit d'une [entité](https://geoplateforme.github.io/entrepot/production/concepts/) de l'API qui représente des fichiers librement déposés et utilisés par les utilisateurs de l'API Entrepôt.

## un ensemble de fichiers de style associés à une configuration

Syntaxe du path :

```
/configuration/[configuration_id]/styles.json
```

| variable           | description                       |        |
| ------------------ | --------------------------------- | ------ |
| `configuration_id` | identifiant de la `configuration` | uuidv4 |

Structure de cet annexe json :

```ts
export type Styles = {
    name: string;
    current?: boolean;
    layers: {
        name?: string;
        annexe_id: string;
        url: string;
    }[];
}[];
```

- `SLD` ou `QML` pour une configuration du type `WFS`

```json
[
    {
        "name": "nom du style 1",
        "current": true,
        "layers": [
            {
                "name": "nom de la table 1",
                "annexe_id": "identifant de l'annexe",
                "url": "url complète de l'annexe"
            },
            {
                "name": "nom de la table 2",
                "annexe_id": "identifant de l'annexe",
                "url": "url complète de l'annexe"
            }
        ]
    },
    {
        "name": "nom du style 2",
        "layers": ["..."]
    }
]
```

> Il y a un fichier de style SLD par table. Donc pour chaque table il y a un annexe qui contient le style. Et cette structure json globale répertorie tous les styles associés à une configuration WFS.

- `Mapbox` pour une configuration du type `WMTS-TMS` (pyramide de tuiles vectorielles)

```json
[
    {
        "name": "nom du style 1",
        "current": true,
        "layers": [
            {
                // une seule layer et pas de name parce qu'il y a une seule couche en TMS
                "annexe_id": "identifant de l'annexe",
                "url": "url complète de l'annexe"
            }
        ]
    },
    {
        "name": "nom du style 2",
        "layers": ["..."]
    }
]
```

## un ensemble de documents liés à une fiche de donnée

Syntaxe du path :

```
/documents/[datasheet_name]/styles.json
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
