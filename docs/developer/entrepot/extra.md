# Utilisation des `extra`

Il s'agit d'une propriété nommée `extra` qui sont présentes dans certaines [entités](https://geoplateforme.github.io/entrepot/production/concepts/) de l'API qui permet de stocker des informations supplémentaires.

## un ensemble de fichiers de style associés à une configuration

Chemin dans extra : "styles"

```json
{
    "extra": {
        "styles": []
    }
}
```

Structure json :

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
