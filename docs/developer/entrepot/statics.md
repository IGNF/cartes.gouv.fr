# Utilisation des fichiers statiques

Il s'agit d'une [entité](./entities.md) de l'API qui représente des fichiers de configuration utilisés par l'Entrepôt en arrière plan lors des différents traitements.

Cette entité `static` a seulement une propriété `name`, pas de `tags` ni de `labels`. Donc, afin de pouvoir lier ces fichiers statiques à d'autres entités pour notre usage, nous allons se contenter d'utiliser une nomination particulière.

## fichiers de style SLD pour une configuration du type `WMS-VECTOR`

Syntaxe :

```
storeddata_[stored_data_id]_style_[type_config]_[table_name]
```

| tag              | description                                                                                          |        |
| ---------------- | ---------------------------------------------------------------------------------------------------- | ------ |
| `stored_data_id` | identifiant de la `stored_data` du type `VECTOR-DB` utilisé en entrée de la configuration WMS-VECTOR | uuidv4 |
| `type_config`    | type de configuration, ici WMS-VECTOR                                                                | string |
| `table_name`     | nom de la table                                                                                      | string |
