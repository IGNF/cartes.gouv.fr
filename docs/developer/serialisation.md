# Sérialisation JSON

Les clés JSON échangées avec le front sont en snake_case, en entrée comme en sortie. Le sérialiseur Symfony n’a pas de convertisseur de noms : une clé JSON porte exactement le nom de la propriété PHP, sauf si `#[SerializedName]` en donne un autre.

## Règles

- Propriété en snake_case (`technical_name`, cas de tous les DTO de requête) : aucun attribut.
- Propriété en camelCase lue ou écrite par le sérialiseur : `#[SerializedName('snake_case')]` obligatoire, sinon la clé JSON passe en camelCase. Aucune classe exposée n’en a besoin aujourd’hui : `CswMetadata` et `CswOnlineResource` sont en snake_case comme les DTO.
- Les chemins des erreurs de validation (422, `violations[].propertyPath`) suivent les mêmes noms.

## Pièges

- Une clé d’entrée inconnue est ignorée sans erreur : la propriété garde sa valeur par défaut.
- Une clé de sortie renommée par erreur ne casse pas la compilation du front : les types de `assets/@types/app.ts` sont écrits à la main.
- Les tableaux renvoyés tels quels par l’Entrepôt ne passent pas par cette règle : leurs clés ne sont jamais modifiées.

`tests/Functional/SerializerContractTest.php` fige ces clés : toute nouvelle classe exposée ou DTO d’entrée s’y ajoute.
