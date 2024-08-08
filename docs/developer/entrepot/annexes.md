# Utilisation des fichiers annexes

Il s'agit d'une [entité](./entities.md) de l'API qui représente des fichiers librement déposés et utilisés par les utilisateurs de l'API Entrepôt.

## un ensemble de fichiers de style associés à une configuration

Syntaxe du path :

```sh
/configuration/[configuration_id]/styles.json
```

| variable           | description                       |        |
| ------------------ | --------------------------------- | ------ |
| `configuration_id` | identifiant de la `configuration` | uuidv4 |

Structure de cet annexe json :

-   `SLD` ou `QML` pour une configuration du type `WFS`

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

-   `Mapbox` pour une configuration du type `WMTS-TMS`

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
