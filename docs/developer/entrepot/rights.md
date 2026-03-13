# Récapitulatif de la gestion de l'affichage des boutons en fonction des droits de l'utilisateur

## Liste des données

| Action                     | Droits nécessaires | En l'absence de droits    |
| -------------------------- | ------------------ | ------------------------- |
| Créer une fiche de données | UPLOAD, PROCESSING | Ne pas afficher le bouton |

## Fiche de données

### Global

| Action                          | Droits nécessaires                   | En l'absence de droits    |
| ------------------------------- | ------------------------------------ | ------------------------- |
| Ajouter ou modifier la vignette | ANNEX                                | Ne pas afficher le bouton |
| Supprimer la fiche de données   | ANNEX, UPLOAD, PROCESSING, BROADCAST | Ne pas afficher le bouton |

### Onglet "Jeux de données"

| Action                                           | Droits nécessaires           | En l'absence de droits                 |
| ------------------------------------------------ | ---------------------------- | -------------------------------------- |
| Ajouter un fichier de données                    | UPLOAD, PROCESSING           | Ne pas afficher le bouton              |
| Livraison non terminée - Reprendre l'intégration | UPLOAD, PROCESSING           | Ne pas afficher le bouton              |
| Livraison non terminée - Supprimer               | UPLOAD, PROCESSING           | Ne pas afficher le bouton              |
| BDD Vecteur - Créer un service WFS ou WMS        | BROADCAST                    | Griser les possibilités dans la modale |
| BDD Vecteur - Créer un service TMS               | PROCESSING                   | Griser les possibilités dans la modale |
| Pyramides vectorielles - Publier le service TMS  | BROADCAST                    | Ne pas afficher le bouton              |
| Pyramides raster - Publier                       | BROADCAST                    | Ne pas afficher le bouton              |
| BDD Vecteur - Supprimer                          | ANNEX, PROCESSING, BROADCAST | Ne pas afficher le bouton              |

### Onglet "Services"

| Action                                        | Droits nécessaires | En l'absence de droits   |
| --------------------------------------------- | ------------------ | ------------------------ |
| Modifier les informations de publication      | BROADCAST          | Ne pas afficher l'action |
| Dépublier                                     | BROADCAST          | Ne pas afficher l'action |
| Gérer les styles                              | ANNEX, BROADCAST   | Ne pas afficher l'action |
| Menu WMS-V - Créer un service raster WMS/WMTS | PROCESSING         | Ne pas afficher l'action |

### Onglet "Document"

| Action                  | Droits nécessaires | En l'absence de droits    |
| ----------------------- | ------------------ | ------------------------- |
| Ajouter un document     | ANNEX              | Ne pas afficher le bouton |
| Menu Modifier/Supprimer | ANNEX              | Ne pas afficher le bouton |
