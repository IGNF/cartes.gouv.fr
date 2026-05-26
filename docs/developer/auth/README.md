# Authentification

L'application utilise un **BFF stateless** (Backend-for-Frontend) : le backend Symfony gère intégralement le flux OAuth2/OIDC avec Keycloak et stocke les tokens dans un **cookie HttpOnly chiffré** posé sur le navigateur. Le frontend React n'a jamais accès aux tokens.

Aucune session PHP n'est utilisée (le bloc `session:` est absent de `config/packages/framework.yaml`, le firewall est `stateless: true`).

---

## Le cookie `__Host-CGAUTH`

| Attribut   | Valeur                                                                                             |
| ---------- | -------------------------------------------------------------------------------------------------- |
| Nom        | `__Host-CGAUTH` (préfixe `__Host-` imposé par le navigateur : `Secure`, `Path=/`, pas de `Domain`) |
| `HttpOnly` | oui — inaccessible au JavaScript                                                                   |
| `Secure`   | oui — HTTPS uniquement                                                                             |
| `SameSite` | `Lax`                                                                                              |
| `Expires`  | aligné sur `access_token.expires` de Keycloak                                                      |

**Contenu** : `serialize(AccessToken)` → `gzdeflate` → chiffré avec **XSalsa20-Poly1305** (libsodium) → `base64url`.

La clé de chiffrement est dérivée de `APP_SECRET` via **HKDF-SHA256** avec l'info `cgfr.auth-cookie.v1`. Elle ne change que si `APP_SECRET` change (voir [Points de vigilance](#points-de-vigilance)).

→ [`src/Security/Cookie/AuthCookieCipher.php`](../../../src/Security/Cookie/AuthCookieCipher.php)

---

## Flux de login

```
Navigateur         Symfony               Keycloak
    |                  |                     |
    |-- GET /login --> |                     |
    |                  |-- build state ------+
    |                  |   (HMAC-signé)      |
    |<-- 307 redirect -+-------------------> |
    |                                        |
    |-- callback GET /login/check?code=X&state=Y -->
    |                  |                     |
    |                  |-- exchange code --> |
    |                  |<-- AccessToken ---- |
    |                  |                     |
    |                  | setAccessToken()    |
    |                  | (intent sur la req) |
    |                  |                     |
    |<-- 302 + Set-Cookie: __Host-CGAUTH ----+
    |                                        |
```

1. **`GET /login`** ([`SecurityController::login()`](../../../src/Controller/SecurityController.php)) construit le paramètre `state` HMAC-signé (voir [Paramètre `state`](#paramètre-state)) et redirige vers Keycloak.
2. Keycloak authentifie l'utilisateur, puis rappelle **`GET /login/check?code=…&state=…`**.
3. [`KeycloakAuthenticator`](../../../src/Security/KeycloakAuthenticator.php) valide le `state`, échange le code contre un `AccessToken` via KnpU, et appelle `KeycloakTokenManager::setAccessToken()`.
4. [`KeycloakTokenManager::setAccessToken()`](../../../src/Security/KeycloakTokenManager.php) pose un **intent** dans les attributs de la requête.
5. [`AuthCookieResponseListener`](../../../src/Security/Cookie/AuthCookieResponseListener.php) intercepte l'événement `kernel.response`, lit l'intent et pose le cookie chiffré sur la réponse.
6. `KeycloakAuthenticator::onAuthenticationSuccess()` redirige vers la page d'origine (via `referer` stocké dans `state`).

---

## Flux d'une requête authentifiée

```
Navigateur              Symfony
    |                      |
    |-- GET /xyz -----------+
    |   Cookie: __Host-CGAUTH=...
    |                      |
    |                      | CookieAuthenticator::supports() → true (cookie présent)
    |                      | CookieAuthenticator::authenticate()
    |                      |   → KeycloakTokenManager::getAccessToken()
    |                      |      → déchiffrer cookie → unserialize → AccessToken
    |                      |      → mise en cache dans request.attributes
    |                      |   → vérifier token non expiré
    |                      |
    |                      | Controller → AuthenticatedHttpClient
    |                      |   → getAccessToken() → header Authorization: Bearer <token>
    |                      |   → appel API Entrepôt
    |<-- réponse -----------+
```

[`CookieAuthenticator`](../../../src/Security/Authenticator/CookieAuthenticator.php) s'active sur toute requête portant le cookie (sauf `/login/check`). En cas d'échec (cookie absent, HMAC invalide, token expiré) :

- **Route `/api/*`** → JSON 401 `{ session_expired: true }` — détecté par [`jsonFetch.ts`](../../../assets/modules/jsonFetch.ts) côté frontend.
- **Toute autre route** → redirect `GET /login?session_expired=1` + effacement du cookie.

---

## Flux de logout

```
Navigateur              Symfony               Keycloak
    |                      |                     |
    |-- GET /logout ------> |                     |
    |                      | LogoutSubscriber::onLogout()
    |                      |   → getIdToken()    |
    |                      |   → clearAccessToken() (intent CLEAR sur la req)
    |                      |                     |
    |                      | kernel.response     |
    |                      |   → AuthCookieResponseListener
    |                      |      → Set-Cookie: __Host-CGAUTH=; Max-Age=0
    |                      |                     |
    |<-- 302 + cookie vide -+---> end_session_endpoint?id_token_hint=…&post_logout_redirect_uri=…
    |                                            |
    |<-- redirect vers /decouvrir ---------------+
```

[`LogoutSubscriber`](../../../src/Listener/LogoutSubscriber.php) récupère l'`id_token` depuis le token manager, déclenche l'effacement du cookie via `clearAccessToken()` (intent `__clear__`), puis redirige vers le `end_session_endpoint` Keycloak avec `id_token_hint` pour invalider la session SSO côté fournisseur.

Si l'utilisateur est déjà anonyme (cookie absent), `getIdToken()` retourne `null` : le `LogoutSubscriber` redirige directement vers `/decouvrir` sans appeler Keycloak.

---

## Paramètre `state` OAuth2

Le `state` remplace le stockage de contexte en session PHP. C'est un blob `base64url(json).base64url(hmac)` signé avec HKDF-SHA256 (`cgfr.login-state.v1`), valable **5 minutes**.

| Clé               | Contenu                                                                                                                                                                                                           |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `referer`         | URL de la page depuis laquelle le login a été déclenché, pour y rediriger après succès                                                                                                                            |
| `app`             | Identifiant de la sous-application (`entree-carto`, `guichet-collaboratif`…) pour un redirect personnalisé post-login                                                                                             |
| `session_expired` | `"1"` si le login a été déclenché par une expiration de session, pour afficher un message approprié                                                                                                               |
| `nonce`           | 16 octets aléatoires en hex — entropie pour que chaque state ait une signature HMAC distincte. Il n'y a pas de nonce serveur à usage unique (design stateless) ; la fenêtre de rejeu est bornée par `exp` (5 min) |
| `exp`             | Timestamp d'expiration Unix (+5 min) — le state ne peut pas être réutilisé indéfiniment                                                                                                                           |

La vérification HMAC avec `hash_equals` protège contre les forgeries. La clé `use_state: false` dans `knpu_oauth2_client.yaml` désactive la gestion native du state par le bundle : on gère entièrement le nôtre.

→ [`src/Security/State/LoginStateSerializer.php`](../../../src/Security/State/LoginStateSerializer.php)

---

## Expiration de session (UX frontend)

Quand `CookieAuthenticator` détecte un token expiré sur une requête `/api/*`, il répond :

```json
{ "code": 401, "details": { "controller": "App\\Controller\\ApiControllerInterface", "session_expired": true } }
```

[`jsonFetch.ts`](../../../assets/modules/jsonFetch.ts) détecte cette forme exacte (`hasSessionExpired`) et appelle `AuthStore.setSessionExpired(true)`, ce qui affiche le bandeau [`SessionExpiredAlert`](../../../assets/components/Utils/SessionExpiredAlert.tsx) invitant l'utilisateur à se reconnecter.

---

## Composants clés

| Fichier                                                                                                             | Rôle                                                                        |
| ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| [`src/Security/Authenticator/CookieAuthenticator.php`](../../../src/Security/Authenticator/CookieAuthenticator.php) | Authenticator principal : lit et valide le cookie sur chaque requête        |
| [`src/Security/KeycloakAuthenticator.php`](../../../src/Security/KeycloakAuthenticator.php)                         | Authenticator OAuth2 : gère le callback `/login/check` et le flux OIDC      |
| [`src/Security/Cookie/AuthCookieCipher.php`](../../../src/Security/Cookie/AuthCookieCipher.php)                     | Chiffrement/déchiffrement XSalsa20-Poly1305 + HKDF                          |
| [`src/Security/Cookie/AuthCookieResponseListener.php`](../../../src/Security/Cookie/AuthCookieResponseListener.php) | Pose ou efface le cookie sur `kernel.response` selon l'intent               |
| [`src/Security/KeycloakTokenManager.php`](../../../src/Security/KeycloakTokenManager.php)                           | Accès centralisé au token (lecture cookie, cache requête, intent set/clear) |
| [`src/Security/State/LoginStateSerializer.php`](../../../src/Security/State/LoginStateSerializer.php)               | Encode/décode le paramètre `state` OAuth2 signé HMAC                        |
| [`src/Security/KeycloakUserProvider.php`](../../../src/Security/KeycloakUserProvider.php)                           | Reconstruit l'objet `User` à partir du JWT (claims Keycloak)                |
| [`src/Controller/SecurityController.php`](../../../src/Controller/SecurityController.php)                           | Routes `/login`, `/logout`, `/login/check`                                  |
| [`src/Listener/LogoutSubscriber.php`](../../../src/Listener/LogoutSubscriber.php)                                   | Récupère l'`id_token` et déclenche la déconnexion SSO Keycloak              |
| [`src/ApiClient/AuthenticatedHttpClient.php`](../../../src/ApiClient/AuthenticatedHttpClient.php)                   | Injecte `Authorization: Bearer` sur les appels sortants vers l'Entrepôt     |
| [`assets/modules/jsonFetch.ts`](../../../assets/modules/jsonFetch.ts)                                               | Détecte le 401 `session_expired` et notifie l'AuthStore                     |
| [`config/packages/security.yaml`](../../../config/packages/security.yaml)                                           | Firewall `stateless: true`, ordre des authenticators                        |

---

## Paramètres et variables d'environnement

| Paramètre            | Source                     | Rôle                                                      |
| -------------------- | -------------------------- | --------------------------------------------------------- |
| `APP_SECRET`         | `.env` / secret Kubernetes | Dérivation des clés HKDF (cookie + state). **Critique.**  |
| `iam_base_url`       | `config/parameters.yaml`   | URL base du serveur Keycloak                              |
| `iam_realm`          | `config/parameters.yaml`   | Realm Keycloak                                            |
| `iam_client_id`      | secret                     | Client ID OAuth2                                          |
| `iam_client_secret`  | secret                     | Client secret OAuth2                                      |
| `iam_login_disabled` | `config/parameters.yaml`   | Si `true`, redirige `/login` vers `/connexion-desactivee` |

---

## Points de vigilance

**Rotation de `APP_SECRET`** : toute rotation invalide immédiatement tous les cookies en cours (HKDF change → déchiffrement échoue → tous les utilisateurs sont déconnectés). Prévoir une fenêtre de maintenance ou une double-clé si nécessaire.

**Préfixe `__Host-`** : le navigateur n'accepte ce préfixe que si la réponse provient d'une connexion HTTPS. En développement local HTTP (`localhost`), le cookie est refusé — utiliser `https://cartesgouvfr-dev.docker.localhost` via Traefik.

**Taille du cookie** : les JWT Keycloak avec beaucoup de rôles/groupes peuvent être volumineux. La compression `gzdeflate` (niveau 6) est indispensable pour rester sous la limite navigateur de ~4 ko par cookie. Ne pas la retirer sans mesurer la taille réelle pour les comptes administrateurs.

**Pas de session PHP** : le bloc `session:` est intentionnellement absent de `config/packages/framework.yaml`. Ne pas le réintroduire pour des fonctionnalités annexes (flash, CSRF, etc.) sans réévaluer l'architecture stateless.
