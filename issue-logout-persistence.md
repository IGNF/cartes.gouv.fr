# Bug : l'utilisateur persiste après la déconnexion (`app.user` non nul après `/logout`)

## Comportement observé

Après avoir visité `/logout`, l'utilisateur reste parfois authentifié côté Symfony : `app.user` est non nul dans les templates Twig, et le `<div id="user" data-user="...">` est toujours présent dans le HTML des pages suivantes. Ce comportement est **intermittent**.

## Comportement attendu

Après `/logout`, la session PHP doit être détruite, `app.user` doit être `null` et le cookie de session doit pointer vers une nouvelle session vide.

## Cause racine

Le problème est dans la chaîne d'appels de `LogoutSubscriber::onLogout()`.

### Déroulé du bug

1. `LogoutSubscriber::onLogout()` appelle `$this->tokenManager->getToken()` pour récupérer l'`id_token` Keycloak (nécessaire au hint de déconnexion fédérée).
2. `KeycloakTokenManager::getToken()` lit la session, met le token en cache dans les attributs de requête, puis **appelle `$session->save()`** — cette optimisation a été introduite pour libérer le verrou fichier de session et permettre les requêtes concurrentes.
3. `save()` exécute `session_write_close()` en interne, ce qui **ferme la session PHP** (`session_status()` passe de `PHP_SESSION_ACTIVE` à `PHP_SESSION_NONE`).
4. `$session->invalidate()` est ensuite appelé. En interne, Symfony délègue à `NativeSessionStorage::regenerate()`, qui vérifie `session_status()` au début : si la session est fermée, **`regenerate()` retourne `false` silencieusement**, sans lever d'exception.
5. Conséquence : le fichier de session sur disque **n'est pas supprimé**, et le cookie de session conserve l'**ancien identifiant de session**. L'entrée `_security_main` (token de sécurité Symfony) reste intacte dans ce fichier.
6. Lors de la requête suivante, le navigateur envoie l'ancien cookie → l'ancienne session est chargée → l'utilisateur apparaît toujours authentifié.

### Pourquoi c'est intermittent

`InternalApiSubscriber::onKernelController()` appelle aussi `getToken()`, mais uniquement pour les contrôleurs implémentant `ApiControllerInterface`. `SecurityController` (qui gère la route `/logout`) n'implémente pas cette interface. Par conséquent, `getToken()` n'est **jamais pré-chargé en cache** sur la requête de déconnexion, et le premier appel à `getToken()` dans `LogoutSubscriber` déclenche systématiquement le `save()` fatal.

### Fichiers concernés

| Fichier                                 | Ligne | Problème                                                                 |
| --------------------------------------- | ----- | ------------------------------------------------------------------------ |
| `src/Listener/LogoutSubscriber.php`     | 31    | Appelle `getToken()` qui ferme la session                                |
| `src/Security/KeycloakTokenManager.php` | 44    | `save()` appelé dans `getToken()`, ferme la session avant l'invalidation |

## Solution proposée

Ajouter une méthode `getIdTokenHint(): ?string` dans `KeycloakTokenManager` qui récupère uniquement l'`id_token` **sans appeler `save()`**. Elle consulte d'abord le cache des attributs de requête (si `getToken()` a déjà été appelé), puis lit directement la session sans la fermer.

`LogoutSubscriber` utilisera `getIdTokenHint()` à la place de `getToken()`, laissant la session ouverte jusqu'à ce que `$session->invalidate()` puisse la détruire proprement.

### `src/Security/KeycloakTokenManager.php` — nouvelle méthode

```php
/**
 * Retourne l'id_token Keycloak destiné au hint de déconnexion fédérée,
 * sans appeler save() afin de ne pas fermer la session avant son invalidation.
 */
public function getIdTokenHint(): ?string
{
    $request = $this->requestStack->getCurrentRequest();
    if (null === $request) {
        return null;
    }

    if ($request->attributes->has(self::REQUEST_ATTR)) {
        /** @var ?AccessToken */
        $cached = $request->attributes->get(self::REQUEST_ATTR);
        return $cached?->getValues()['id_token'] ?? null;
    }

    if (!$request->hasSession()) {
        return null;
    }

    /** @var ?AccessToken */
    $token = $request->getSession()->get(self::SESSION_KEY);

    return $token?->getValues()['id_token'] ?? null;
}
```

### `src/Listener/LogoutSubscriber.php` — ligne 31

```diff
- $idToken = $this->tokenManager->getToken()?->getValues()['id_token'] ?? null;
+ $idToken = $this->tokenManager->getIdTokenHint();
```

## Vérification

1. Se connecter, puis visiter `/logout`.
2. Vérifier que le cookie `__Host-PHPSESSID` change de valeur (DevTools → Application → Cookies).
3. Vérifier qu'après le retour de Keycloak, le HTML ne contient plus de `<div id="user">`.
4. Vérifier dans `var/sessions/dev/` que le fichier de l'ancienne session a été supprimé.
5. Exécuter `composer check-rules` (PHPStan, PHPMD) pour valider le nouveau code.

/btw could we bypass or never have this problem if we had a redis to store sessions instead of files?

    No — Redis would not bypass this bug, and here's why.

    The root cause is entirely in the PHP session lifecycle, not the storage backend. When KeycloakTokenManager::getToken() calls $session->save(), Symfony internally executes session_write_close(). That is a
    PHP core function that closes the current session and sets session_status() to PHP_SESSION_NONE — regardless of whether the backend is a file, Redis, Memcached, or anything else. After that,
    NativeSessionStorage::regenerate() checks session_status() and returns false silently because the session is no longer active. That failure is storage-backend-agnostic.

    What Redis would change: The reason save() was added to getToken() in the first place was to release the file lock early, so concurrent AJAX requests don't block waiting for the session file to be unlocked.
    Redis-based session handlers don't use the same file-locking mechanism, so that optimization would likely never have been necessary — meaning the save() call might never have been introduced, and this bug
    might never have existed.

    So: Redis doesn't fix the current code, but it removes the underlying pressure (file lock contention) that led to the introduction of the save() call. The real fix remains the same regardless of backend:
    don't call save() before invalidate().
