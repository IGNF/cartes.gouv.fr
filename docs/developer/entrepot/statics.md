# Utilisation des fichiers statiques

Il s'agit d'une [entité](https://geoplateforme.github.io/entrepot/production/concepts/) de l'API qui représente des fichiers de configuration utilisés par l'Entrepôt en arrière plan lors des différents traitements.

Cette entité `static` a seulement une propriété `name` pouvant être utilisé pour filtrer, pas de `tags` ni de `labels`. Donc, afin de pouvoir lier ces fichiers statiques à d'autres entités pour notre usage, nous allons se contenter d'utiliser une nomination particulière.

## fichiers de style SLD pour une configuration du type `WMS-VECTOR`

Syntaxe du `name` :

```
config_[configuration_id]_style_[type_config]_[table_name]
```

| variable           | description                                            |        |
| ------------------ | ------------------------------------------------------ | ------ |
| `configuration_id` | identifiant de la `configuration` du type `WMS-VECTOR` | uuidv4 |
| `type_config`      | type de configuration, `wmsv` pour WMS-VECTOR          | string |
| `table_name`       | nom de la table                                        | string |
