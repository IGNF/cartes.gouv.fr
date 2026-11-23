# Utilisation des `extra`

Il s'agit d'une propriété nommée `extra` qui sont présentes dans certaines [entités](https://geoplateforme.github.io/entrepot/production/concepts/) de l'API qui permet de stocker des informations supplémentaires.

Sur une configuration, seul un `PATCH` écrit `extra` : le `POST` de création et le `PUT` de remplacement l’ignorent (vérifié le 10/11/2026). Le `PATCH` remplace l’objet entier : `ConfigurationApiService::modify` fusionne avec la valeur existante avant l’envoi.

Sur une livraison, l’OpenAPI ne documente pas `extra`, mais un `PATCH` l’écrit et le remplace en entier (vérifié le 23/11/2026). Seul le `GET` d’une livraison le renvoie : la liste refuse `fields=extra`.

## arborescence d’une livraison supprimée

Chemin dans extra : "file_tree"

```json
{
    "extra": {
        "file_tree": [
            {
                "type": "DIRECTORY",
                "name": "data",
                "size": 240,
                "children": [{ "type": "FILE", "name": "donnee.geojson", "size": 240 }]
            },
            { "type": "FILE", "name": "donnee.geojson.md5", "size": 63 }
        ]
    }
}
```

Réponse de `GET uploads/{id}/tree`, illisible une fois la livraison supprimée. `UploadApiService::remove` l’écrit juste avant la suppression, en gardant les autres clés d’`extra`. `extra` survit à la suppression : `UploadApiService::getFileTree` le relit pour une livraison supprimée. Un tag ne convient pas, sa valeur est limitée à 99 caractères.

## vignette d’un flux

Chemin dans extra : "_search.url_vignette"

```json
{
    "extra": {
        "_search": {
            "url_vignette": "https://data.geopf.fr/annexes/{technical_name}/thumbnail/{uuid}.png"
        }
    }
}
```

URL de l’annexe vignette déposée par le formulaire de publication (voir [annexes/README.md](annexes/README.md)), écrite par un `PATCH` juste après la création de la configuration. Lue par l’onglet « Flux » de la fiche.

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

## légende GetLegendGraphic du WMS-Vecteur associée à la pyramide raster générée par moissonnage

```json
{
    "extra": {
        "legend": {
            "url": "url absolue de l'annexe",
            "annexe_id": "identifiant de l'annexe"
        }
    }
}
```
