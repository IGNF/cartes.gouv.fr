# Authentification

L'application utilise un **BFF stateless** (Backend-for-Frontend) : le backend Symfony gère intégralement le flux OAuth2/OIDC avec Keycloak et stocke les tokens dans un **cookie HttpOnly chiffré** posé sur le navigateur. Le frontend React n'a jamais accès aux tokens.

Aucune session PHP n'est utilisée (le bloc `session:` est absent de `config/packages/framework.yaml`, les deux firewalls sont `stateless: true`).

---

## Le cookie `__Host-CGAUTH`

| Attribut   | Valeur                                                                                             |
| ---------- | -------------------------------------------------------------------------------------------------- |
| Nom        | `__Host-CGAUTH` (préfixe `__Host-` imposé par le navigateur : `Secure`, `Path=/`, pas de `Domain`) |
| `HttpOnly` | oui - inaccessible au JavaScript                                                                   |
| `Secure`   | oui - HTTPS uniquement                                                                             |
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

1. **`GET /login`** ([`SecurityController::login()`](../../../src/Controller/SecurityController.php)) construit le paramètre `state` HMAC-signé (voir [Paramètre `state`](#paramètre-state)), pose son nonce dans le cookie `__Host-CGSTATE` et redirige vers Keycloak. Le `referer` n’y entre que s’il commence par l’origine de l’application (`https://hôte/`) et fait au plus 2048 caractères : il voyage dans l’URL Keycloak.
2. Keycloak authentifie l'utilisateur, puis rappelle **`GET /login/check?code=…&state=…`**.
3. [`KeycloakAuthenticator`](../../../src/Security/Authenticator/KeycloakAuthenticator.php) valide le `state` et le cookie `__Host-CGSTATE`, échange le code contre un `AccessToken` via KnpU, et appelle `KeycloakTokenManager::setAccessToken()`.
4. [`KeycloakTokenManager::setAccessToken()`](../../../src/Security/KeycloakTokenManager.php) pose un **intent** dans les attributs de la requête.
5. [`AuthCookieResponseListener`](../../../src/Security/Cookie/AuthCookieResponseListener.php) intercepte l'événement `kernel.response`, lit l'intent et pose le cookie chiffré sur la réponse.
6. `KeycloakAuthenticator::onAuthenticationSuccess()` redirige vers la page d’origine (`referer` du `state`, revérifié sur l’origine), sinon vers l’accueil de l’application. Login ouvert en popup : vers `/login/popup-callback` (voir [Expiration de session](#expiration-de-session-ux-frontend)).
7. Échec (code refusé, `state` invalide ou expiré, cookie `__Host-CGSTATE` absent ou différent, ID token incomplet) : `KeycloakAuthenticator::onAuthenticationFailure()` redirige vers `/publier-une-donnee?login_failed=1`. La page affiche l’alerte fermable « La connexion a échoué » ; la fermer retire le paramètre de l’URL. Le paramètre reste jusque-là, car la page est rendue deux fois au premier chargement (pendant puis après le chargement des traductions). Après un échec puis une connexion réussie, le retour par le `referer` garde `?login_failed=1` : l’alerte ne s’affiche donc qu’aux visiteurs anonymes, et la page retire le paramètre dès qu’un utilisateur est connecté.

Les cibles de redirection sont des constantes de `KeycloakAuthenticator` : `HOME_ROUTE`, `AFTER_LOGOUT_PATH`, `LOGIN_FAILED_PATH`, `POPUP_CALLBACK_ROUTE`.

---

## Flux d'une requête authentifiée

```
Navigateur              Symfony
    |                      |
    |-- GET /xyz -----------+
    |   Cookie: __Host-CGAUTH=...
    |                      |
    |                      | ApiGuard (routes d'API seulement)
    |                      |   → 403 sans X-Requested-With: XMLHttpRequest
    |                      |
    |                      | CookieAuthenticator::supports() → true (cookie présent)
    |                      | CookieAuthenticator::authenticate()
    |                      |   → KeycloakTokenManager::getAccessToken()
    |                      |      → déchiffrer cookie → unserialize → AccessToken
    |                      |      → mise en cache dans request.attributes
    |                      |   → vérifier token non expiré
    |                      | KeycloakUserProvider::loadUser()
    |                      |   → User depuis les claims de l'id_token du cookie
    |                      |      (aucun appel Keycloak ni Entrepôt)
    |                      |
    |                      | Controller → AuthenticatedHttpClient
    |                      |   → getAccessToken() → header Authorization: Bearer <token>
    |                      |   → appel API Entrepôt
    |<-- réponse -----------+
```

### Frontière API

Une route est une route d'API si son chemin correspond au paramètre `app.api_path_pattern` (`config/services.yaml`) : `/api/*` et `/contact_us`. Ce motif est la seule règle ; il alimente le firewall `api`, le contrôle d'accès, la garde et le rendu des erreurs en `application/problem+json`.

Deux firewalls (`config/packages/security.yaml`) :

- **`api`** (motif) : `CookieAuthenticator` seul, `ROLE_USER` exigé par `access_control` (sauf `/contact_us`, appelé sans cookie par le formulaire du site de documentation, et `/api/doc` en dev). Sans cookie valide, le point d'entrée [`ApiAuthenticationEntryPoint`](../../../src/Security/ApiAuthenticationEntryPoint.php) produit le seul 401 de `type` `/errors/anonymous`, `detail` « Connexion requise ». Un cookie expiré est effacé sur cette réponse. Jamais de redirection.
- **`main`** (le reste : pages, `/login`, `/logout`, `/files`, `/rss`) : `CookieAuthenticator` + `KeycloakAuthenticator`. Cookie expiré sur une page → redirection vers `GET /login` + effacement du cookie.

[`ApiGuard`](../../../src/Listener/ApiGuard.php) (`kernel.request`, avant le firewall) refuse en 403 tout appel d'API sans `X-Requested-With: XMLHttpRequest`, envoyé par `jsonFetch`. Une navigation, une sous-ressource (`<img>`, `<script src>`) ou un formulaire d'un autre site ne porte jamais cet en-tête ; un autre site ne peut l'ajouter qu'en `fetch` avec CORS, que l'application n'autorise pas. Un GET d'API ouvert dans un onglet répond donc 403. Le cookie `SameSite=Lax` reste la première protection, la garde la seconde.

---

## Snapshot utilisateur Entrepôt et cache par pod

L’objet `User` ne porte que l’identité : `id` (claim `sub`, égal à l’identifiant utilisateur Entrepôt), e-mail, nom d’utilisateur, prénom et nom, lus dans l’`id_token` du cookie. Le cookie est scellé, la signature de l’ID token n’est donc pas revérifiée. L’authentification ne fait aucun appel amont. Un ID token sans `sub`, `email` ou `preferred_username` est refusé au retour de Keycloak, avant d’entrer dans le cookie : redirection vers `/publier-une-donnee?login_failed=1`, en anonyme. Une erreur d’authentification sur une requête suivante bouclerait, Keycloak reconnectant le même compte.

L’identité est celle de l’ID token reçu au login : une modification du nom ou de l’e-mail dans le compte Keycloak n’apparaît dans l’application qu’après une reconnexion (au plus 12 h, durée du jeton). Assumé : ces modifications sont rares, et le support identifie un compte par son `id`.

L’Entrepôt valide les jetons hors ligne (signature et `exp`) : un jeton dont la session Keycloak a été fermée reste accepté jusqu’à son expiration, 12 h (test du 04/11/2026). Un contrôle de vivacité côté serveur (userinfo) ne réduirait donc pas ce délai pour l’Entrepôt. Si une exigence de révocation apparaît, le repli est un appel userinfo en cache 15 min dans `KeycloakUserProvider`.

Le profil Entrepôt (`GET users/me`) est mis en cache 60 s par identifiant utilisateur ([`EntrepotUserCache`](../../../src/Services/EntrepotUserCache.php), pool `cache.app`) et lu seulement par [`MembershipService`](../../../src/Services/MembershipService.php). Si `users/me` renvoie un `_id` différent du `sub` du cookie, la lecture échoue en 500 (garde contre un profil attribué au mauvais utilisateur ; une erreur d’authentification bouclerait sur le login, Keycloak reconnectant le même compte). Les infos datastore/communauté (nom, `technical_name`, id de communauté) en sont dérivées au lieu d’être rechargées via l’API. Vocabulaire : [glossaire](../glossaire.md).

La charge utilisateur du front (type `CartesUser`, 13 clés) est assemblée par [`CartesUserPayload`](../../../src/Services/CartesUserPayload.php) : identité + profil en cache pour la page (`#user`), identité + profil frais pour `GET /api/users/me`. Si l’Entrepôt est en panne, une page ou `/api/users/me` d’un utilisateur connecté répond 503 ; une page anonyme reste servie.

Trois mécanismes limitent la fenêtre de péremption :

- **Invalidation** après une mutation d’appartenance faite par l’utilisateur lui-même (quitter une communauté, ajout au bac à sable, modification de ses droits ou de sa communauté) : l’entrée est supprimée, la requête suivante recharge.
- **Rafraîchissement forcé** sur `GET /api/users/me` : la réponse est toujours fraîche et l’entrée du cache est réécrite.
- **Deny-path** : quand une appartenance n’est pas trouvée, une revalidation forcée est tentée avant de conclure, au plus une fois par 10 s (`fetched_at` stocké dans l’entrée).

En production, `cache.app` est APCu, donc **propre à chaque pod** ; Kubernetes exécute plusieurs réplicas sans affinité de session. Conséquences, acceptées :

| Mécanisme              | Portée          | Effet avec N pods                                                                   |
| ---------------------- | --------------- | ----------------------------------------------------------------------------------- |
| Invalidation           | le pod mutateur | les autres pods gardent l’entrée périmée jusqu’à 60 s (seule dégradation)           |
| Rafraîchissement forcé | le pod servant  | toujours frais quel que soit le pod, et répare le cache de ce pod                   |
| Deny-path              | le pod servant  | une appartenance manquante est revérifiée sur n’importe quel pod (≤ 1 appel / 10 s) |

Le sens « obtention d’un accès » est donc couvert sur tous les pods. Le sens « retrait d’un accès » ne l’est volontairement pas : seuls des champs dérivés (noms, ids) sont concernés, l’API Entrepôt fait autorité, et une péremption ≤ 60 s existe déjà sur un seul pod. Aucun cache partagé (Redis) n’est prévu pour cela.

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
    |<-- redirect vers /publier-une-donnee ------+
```

[`LogoutSubscriber`](../../../src/Security/LogoutSubscriber.php) récupère l'`id_token` depuis le token manager, déclenche l'effacement du cookie via `clearAccessToken()` (intent `__clear__`), puis redirige vers le `end_session_endpoint` Keycloak avec `id_token_hint` pour invalider la session SSO côté fournisseur.

Si l'utilisateur est déjà anonyme (cookie absent), `getIdToken()` retourne `null` : le `LogoutSubscriber` redirige directement vers `/publier-une-donnee` sans appeler Keycloak.

---

## Paramètre `state` OAuth2

Le `state` remplace le stockage de contexte en session PHP. C'est un blob `base64url(json).base64url(hmac)` signé avec HKDF-SHA256 (`cgfr.login-state.v1`), valable **5 minutes**.

| Clé       | Contenu                                                                                                                                                                                                                                              |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `referer` | URL de la page depuis laquelle le login a été déclenché, pour y rediriger après succès (même origine seulement)                                                                                                                                      |
| `nonce`   | 16 octets aléatoires en hex, recopiés dans le cookie `__Host-CGSTATE` : lie le `state` au navigateur qui a ouvert `/login` (voir ci-dessous)                                                                                                         |
| `popup`   | `true` si le login est ouvert en popup par `reconnect()` : succès et échec redirigent vers `/login/popup-callback`. Un `state` expiré n’est pas décodé et perd ce drapeau : l’échec s’affiche alors dans la popup, que l’utilisateur ferme à la main |
| `exp`     | Timestamp d'expiration Unix (+5 min) - le state ne peut pas être réutilisé indéfiniment                                                                                                                                                              |

La vérification HMAC avec `hash_equals` protège contre les forgeries.

**Cookie `__Host-CGSTATE` (login CSRF)** : la signature prouve que notre serveur a produit le `state`, pas qu’il l’a produit pour ce navigateur. Sans lien, un tiers démarre un login sur son poste, récupère l’URL `/login/check?code=…&state=…` de son propre compte et la fait ouvrir par une victime : celle-ci se retrouve connectée sur le compte du tiers, et ce qu’elle téléverse part dans son entrepôt. `GET /login` pose donc le nonce dans le cookie `__Host-CGSTATE` (`HttpOnly`, `Secure`, `SameSite=Lax`, 5 min, comme `exp`) ; `KeycloakAuthenticator` refuse un `/login/check` dont le cookie est absent ou différent (`hash_equals`), ce qui mène à l’échec habituel (`?login_failed=1`, ou la page de retour de la popup). `SameSite=Lax` laisse passer le cookie sur le retour de Keycloak, navigation de premier niveau. La popup partage les cookies de l’onglet d’origine, sans cas particulier.

Le cookie n’est effacé qu’après un succès. Deux onglets ouvrant `/login` se partagent un seul cookie : le dernier gagne, le login en cours dans l’autre échoue et l’utilisateur reclique. Effacer le cookie sur cet échec ferait aussi échouer le login qui le détient. La clé `use_state: false` dans `knpu_oauth2_client.yaml` désactive la gestion native du state par le bundle : on gère entièrement le nôtre.

→ [`src/Security/State/LoginStateSerializer.php`](../../../src/Security/State/LoginStateSerializer.php)

---

## Expiration de session (UX frontend)

Le navigateur supprime le cookie en même temps que le token expire : le serveur ne distingue pas « session expirée » de « jamais connecté » et répond le même 401 en Problem Details (RFC 9457) :

```json
{ "title": "Unauthorized", "status": 401, "detail": "Connexion requise", "details": [], "type": "/errors/anonymous" }
```

```
Onglet                         Popup                  Symfony / Keycloak
  |                              |                          |
  |-- GET /api/... ------------------------------------->   |
  |<-- 401 -------------------------------------------------|
  | sessionExpired = true        |                          |
  | alerte « Session expirée »   |                          |
  |                              |                          |
  |-- clic : window.open ------> |                          |
  |                              |-- GET /login?popup=1 --> |
  |                              |   (SSO, /login/check)    |
  |                              |<-- 302 + Set-Cookie -----|
  |                              |-- GET /login/popup-callback
  |                              |   window.close()         |
  | popup.closed (500 ms)        x                          |
  |-- GET /api/users/me ----------------------------------> |
  |<-- 200 utilisateur -------------------------------------|
  | setQueryData, sessionExpired = false, invalidateQueries |
```

1. [`jsonFetch.ts`](../../../assets/modules/jsonFetch.ts) appelle `AuthStore.setSessionExpired(true)` sur un 401 de type `/errors/anonymous`. Un 401 relayé d’une API amont (Entrepôt, espace collaboratif) ne compte pas : le cookie de l’utilisateur est toujours valable. Une réponse OK ne lève pas l’état : une ressource publique (par exemple `alerts.json`) répond OK sans que la session soit revenue.
2. [`useUserQuery`](../../../assets/hooks/queries/useUserQuery.tsx) passe en pause (`enabled: false`) tant que `sessionExpired` est vrai : le dernier utilisateur reste en cache, la page reste montée et les relances au retour sur l’onglet n’envoient plus de 401.
3. [`SessionExpiredAlert`](../../../assets/components/Utils/SessionExpiredAlert.tsx) s’affiche sur une route non publique quand un utilisateur est en cache, donc jamais pour un visiteur anonyme. Elle n’est pas fermable.
4. Le lien appelle [`reconnect()`](../../../assets/modules/reconnect.ts) dans le gestionnaire de clic (hors geste utilisateur, le navigateur bloque `window.open`). La popup ouvre `/login?popup=1` ; le drapeau `popup` du `state` fait rediriger succès et échec vers `/login/popup-callback`, page Twig sans bundle (`Cache-Control: no-store`) dont le seul script est `window.close()`. Pas de `postMessage` : la fermeture est le signal. Un second clic pendant que la popup est ouverte la ramène au premier plan sans la rouvrir.
5. À la fermeture, `reconnect()` relit `/api/users/me`. Autre compte que celui en cache : rechargement de la page, pour ne pas mêler sa session aux pages en cache de l’ancien (l’Entrepôt ne lui sert de toute façon que ses propres données). Même compte : `setQueryData(user_me)`, puis `sessionExpired` à faux, puis `invalidateQueries()` sans filtre. La requête utilisateur, en pause au moment de l’invalidation, se recharge au rendu suivant. 401 : l’alerte reste. Autre erreur : état inchangé, le lien reste cliquable.
6. Popup bloquée : `reconnect()` navigue vers `/login` dans l’onglet, le retour se fait par le `referer`.

Limites assumées : un autre onglet garde son alerte jusqu’à son propre clic (le SSO vivant referme la popup sans saisie) ; une mutation qui a échoué n’est pas rejouée, l’utilisateur re-soumet.

---

## Composants clés

| Fichier                                                                                                                 | Rôle                                                                                  |
| ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| [`src/Security/Authenticator/CookieAuthenticator.php`](../../../src/Security/Authenticator/CookieAuthenticator.php)     | Authenticator principal : lit et valide le cookie sur chaque requête                  |
| [`src/Security/Authenticator/KeycloakAuthenticator.php`](../../../src/Security/Authenticator/KeycloakAuthenticator.php) | Authenticator OAuth2 : gère le callback `/login/check` et le flux OIDC                |
| [`src/Security/ApiAuthenticationEntryPoint.php`](../../../src/Security/ApiAuthenticationEntryPoint.php)                 | Point d'entrée du firewall `api` : seul 401 `/errors/anonymous`                       |
| [`src/Listener/ApiGuard.php`](../../../src/Listener/ApiGuard.php)                                                       | Garde des routes d'API (403 sans `X-Requested-With`)                                  |
| [`src/Security/Cookie/AuthCookieCipher.php`](../../../src/Security/Cookie/AuthCookieCipher.php)                         | Chiffrement/déchiffrement XSalsa20-Poly1305 + HKDF                                    |
| [`src/Security/Cookie/AuthCookieResponseListener.php`](../../../src/Security/Cookie/AuthCookieResponseListener.php)     | Pose ou efface le cookie sur `kernel.response` selon l'intent                         |
| [`src/Security/KeycloakTokenManager.php`](../../../src/Security/KeycloakTokenManager.php)                               | Accès centralisé au token (lecture cookie, cache requête, intent set/clear)           |
| [`src/Security/State/LoginStateSerializer.php`](../../../src/Security/State/LoginStateSerializer.php)                   | Encode/décode le paramètre `state` OAuth2 signé HMAC                                  |
| [`src/Security/KeycloakUserProvider.php`](../../../src/Security/KeycloakUserProvider.php)                               | Construit l'objet `User` depuis les claims de l'`id_token` du cookie                  |
| [`src/Services/EntrepotUserCache.php`](../../../src/Services/EntrepotUserCache.php)                                     | Cache serveur (60 s) de `GET users/me`, invalidation et rafraîchissement              |
| [`src/Services/MembershipService.php`](../../../src/Services/MembershipService.php)                                     | Seul lecteur du profil Entrepôt, dérivation datastore/communauté, deny-path           |
| [`src/Services/CartesUserPayload.php`](../../../src/Services/CartesUserPayload.php)                                     | Charge utilisateur du front (`CartesUser`) : identité + profil Entrepôt               |
| [`src/Controller/SecurityController.php`](../../../src/Controller/SecurityController.php)                               | Routes `/login`, `/logout`, `/login/check`, `/login/popup-callback`, `/userinfo/edit` |
| [`src/Security/LogoutSubscriber.php`](../../../src/Security/LogoutSubscriber.php)                                       | Récupère l'`id_token` et déclenche la déconnexion SSO Keycloak                        |
| [`src/ApiClient/Auth/AuthenticatedHttpClient.php`](../../../src/ApiClient/Auth/AuthenticatedHttpClient.php)             | Injecte `Authorization: Bearer` sur les appels sortants vers l'Entrepôt               |
| [`assets/modules/jsonFetch.ts`](../../../assets/modules/jsonFetch.ts)                                                   | Envoie `X-Requested-With`, notifie l'AuthStore sur 401                                |
| [`assets/modules/reconnect.ts`](../../../assets/modules/reconnect.ts)                                                   | Reconnexion par popup depuis l’alerte de session expirée                              |
| [`config/packages/security.yaml`](../../../config/packages/security.yaml)                                               | Firewalls `api` et `main`, `stateless: true`, contrôle d'accès                        |

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

**Préfixe `__Host-`** : le navigateur n'accepte ce préfixe que si la réponse provient d'une connexion HTTPS. En développement local HTTP (`localhost`), le cookie est refusé - utiliser `https://cartesgouvfr-dev.docker.localhost` via Traefik.

**Taille du cookie** : les JWT Keycloak avec beaucoup de rôles/groupes peuvent être volumineux. La compression `gzdeflate` (niveau 6) est indispensable pour rester sous la limite navigateur de ~4 ko par cookie. Ne pas la retirer sans mesurer la taille réelle pour les comptes administrateurs.

**Aucune route `GET` à effet de bord** : une image (`<img>`) de même origine, par exemple dans une description en markdown, envoie le cookie, et `SameSite=Lax` le laisse passer sur les navigations. Toute écriture passe par `POST`, `PUT`, `PATCH` ou `DELETE`.

**Garde `X-Requested-With`** : tout appel d'API passe par `jsonFetch`/`apiFetch`, qui envoie l'en-tête. Un `EventSource` natif ne peut pas l'envoyer : lire un flux par `fetch` et `readServerEvents`. Une brique servie depuis un sous-domaine devrait passer par CORS, absent aujourd'hui.

**Retour après connexion** : le `referer` n’est gardé que s’il commence par `getSchemeAndHttpHost()` suivi de `/`. Derrière le proxy, cette origine vient des en-têtes `x-forwarded-proto`, `x-forwarded-host` et `x-forwarded-port` (`trusted_proxies`, `framework.yaml`) : s’ils manquent, tout `referer` est écarté et l’utilisateur revient sur l’accueil.

**`/contact_us` public** : seule route d'API appelable sans cookie, chaque appel envoie un courriel au support. Le limiteur `contact_us` (`config/packages/rate_limiter.yaml`) accepte 5 appels par 10 min et par adresse IP, appels de robots compris ; au-delà, 429 en Problem Details avec `Retry-After`. Un verrou `flock` unique (`contact_us_limiter`, un seul fichier dans `/tmp`) sérialise la mise à jour du compteur entre les threads FrankenPHP : sans lui, des appels simultanés d’une même adresse dépassaient la limite. Le verrou par clé du limiteur est désactivé, car il laissait un fichier par adresse IP dans `/tmp`. Le compteur est en APCu, donc propre à chaque pod : avec N pods, jusqu'à 5 × N appels passent. Une limite exacte demanderait un stockage partagé (Redis), non prévu.

**Pas de session PHP** : le bloc `session:` est intentionnellement absent de `config/packages/framework.yaml`. Ne pas le réintroduire pour des fonctionnalités annexes (flash, CSRF, etc.) sans réévaluer l'architecture stateless.
