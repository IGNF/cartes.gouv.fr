# Erreurs de l’API

Les routes `/api` répondent en erreur au format Problem Details (RFC 9457, `application/problem+json`). `src/Serializer/ApiErrorNormalizer.php` produit ce corps ; `assets/modules/jsonFetch.ts` le lève tel quel côté front (type `ApiError`).

## Erreurs de validation (422)

Un DTO invalide (`#[MapRequestPayload]`, ou une `UnprocessableEntityHttpException` dont la `previous` est une `ValidationFailedException`) donne un 422 avec la liste `violations` :

```json
{
    "status": 422,
    "title": "Unprocessable Content",
    "violations": [{ "propertyPath": "producers[0].email", "title": "Cette valeur n’est pas une adresse e-mail valide." }]
}
```

Les formulaires multipart (fichier + champ JSON `data`) passent par `App\Services\MultipartPayloadMapper`, qui suit les mêmes règles que `#[MapRequestPayload]` :

- un champ de type inattendu (`"producers": "x"`) donne un 422 avec une violation sur ce champ ; dans ce cas les contraintes du DTO ne sont pas évaluées, l’objet étant incomplet ;
- sinon les contraintes du DTO sont évaluées et donnent un 422 en cas d’échec ;
- un champ `data` absent ou un JSON illisible donne un 400 au message fixe, sans détail technique.

`propertyPath` suit la notation Symfony (`[0]` pour un indice de tableau) ; `title` est le message traduit.

Côté formulaire, `setApiFormErrors(error, setError)` (`assets/modules/setApiFormErrors.ts`) pose chaque violation sur le champ React Hook Form correspondant :

- `producers[0].email` devient `producers.0.email` ;
- seul le premier message par champ est gardé ;
- une violation sans `propertyPath` est ignorée : l’appelant affiche alors l’erreur globale (`getApiErrorMessage`).

La fonction renvoie `true` si au moins un champ a reçu une erreur.

```ts
onError: (error) => {
    if (!setApiFormErrors(error, setError)) {
        setGlobalError(getApiErrorMessage(error));
    }
},
```
