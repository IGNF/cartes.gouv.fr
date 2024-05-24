# Utilisation des `labels`

Certaines entités portent une propriété `labels`, qui est une liste de chaînes de caractères (string[]), permettant de stocker des informations supplémentaires.

Mais nous utilisons les labels comme des `tags` de la manière suivante : "[clé]=[valeur]". Donc, pas de "=" possible dans les labels.

## `annexe`

### vignette d'une fiche de donnée

| label            | description               |        |
| ---------------- | ------------------------- | ------ |
| `datasheet_name` | nom de la fiche de donnée | string |
| `type`           | valeur fixe : "thumbnail" | string |

### fichier de style individuel (par ex. contenu du SLD, QML etc)

| label            | description               |        |
| ---------------- | ------------------------- | ------ |
| `datasheet_name` | nom de la fiche de donnée | string |
| `type`           | valeur fixe : "style"     | string |
