# ApiClient — Documentation

## Pourquoi ne pas utiliser Guzzle / HTTPlug / une solution existante ?

La réponse courte : le `HttpClient` de Symfony fait déjà de l'asynchrone. Tout ce dont on a besoin est déjà dans le framework, sans dépendance supplémentaire.

La réponse longue :

**Guzzle / HTTPlug** sont d'excellents clients HTTP, mais ils dupliquent ce que `symfony/http-client` fournit déjà. Les promesses de Guzzle reposent sur `guzzlehttp/promises`, une bibliothèque de promesses indépendante avec sa propre boucle d'événements — elle n'est pas vraiment non-bloquante en PHP, elle nécessite de faire tourner la boucle manuellement, et elle ne s'intègre pas au profileur ni au middleware de retry de Symfony.

**ReactPHP / Amp** offrent une véritable I/O asynchrone, mais impliquent un modèle de programmation entièrement différent (boucle d'événements au point d'entrée, callbacks/coroutines partout). C'est un engagement architectural complet, pas quelque chose qu'on greffe sur une application Symfony classique.

**`HttpClientInterface` de Symfony** est le bon outil ici car :

1. **Le streaming / multiplex est natif.** `$client->stream($responses)` traite plusieurs requêtes en parallèle via un seul `curl_multi` ou select sur socket, en livrant les chunks au fur et à mesure. C'est une vraie I/O parallèle dans une seule requête PHP — sans boucle d'événements, sans callbacks, sans configuration spéciale.
2. **Zéro dépendance supplémentaire.** Il est livré avec Symfony, déjà câblé dans le conteneur, et déjà configuré avec retry, timeout et proxy dans `config/packages/framework.yaml`.
3. **Intégration profileur.** Chaque requête apparaît gratuitement dans la timeline du profileur Symfony — durée, statut, headers, body.
4. **Clients scopés / base URI.** `withOptions(['base_uri' => ...])` permet à chaque domaine d'API d'avoir sa propre instance préconfigurée (`ApiClientFactory`).

Ce qu'on a ajouté par-dessus est une fine couche ergonomique : consommation différée (`ResponsePromise`), autopagination transparente (`PaginatedPromise`), et récupération de détails en batch (`fetchAllDetailsAsync`). Rien de tout cela ne nécessite de bibliothèque tierce.

---

## Vue d'ensemble de l'architecture

```
ApiClient                 — méthodes HTTP ; retournent toutes ResponsePromise ou PaginatedPromise
  └── ResponsePromise     — wrapper lazy pour une réponse ; consommé via ->array(), ->text(), ->await()
  └── PaginatedPromise    — wrapper lazy pour toutes les pages ; consommé via ->resolve()
  └── PaginatedResponse   — objet valeur : tableau de contenu + headers (pour la pagination)
  └── RequestOptions      — objet valeur : body, query, headers, flag fileUpload

ApiClientFactory          — crée les instances ApiClient préconfigurées par API :
                            createEntrepotClient(), createEspaceCoClient(), createEspaceCoStyleClient()

AuthenticatedHttpClient   — décorateur qui injecte le token Bearer Keycloak sur chaque requête

ErrorParser/              — normalisation des erreurs par API -> ApiException
  EntrepotErrorParser
  EspaceCoErrorParser
```

Les services métier (`src/Services/EntrepotApi/`, `src/Services/EspaceCoApi/`) injectent chacun une instance `ApiClient` via `#[Autowire(service: 'app.api_client.entrepot')]` et encapsulent les appels bruts en méthodes PHP typées.

---

## ResponsePromise — référence API

Toutes les méthodes HTTP de `ApiClient` (`get`, `post`, `patch`, `put`, `delete`, `sendFile`) retournent un `ResponsePromise`. La requête HTTP sous-jacente est déjà en vol (Symfony's HttpClient la dispatche immédiatement), mais aucun octet n'a encore été lu.

| Méthode                                  | Retour              | Notes                                                                                     |
| ---------------------------------------- | ------------------- | ----------------------------------------------------------------------------------------- |
| `->array()`                              | `array`             | Parse le body en JSON, lève `ApiException` si non-2xx                                     |
| `->text()`                               | `string`            | Retourne le body brut                                                                     |
| `->arrayWithHeaders()`                   | `PaginatedResponse` | `array()` + headers de réponse ; utilisé pour les endpoints de liste paginés              |
| `->await()`                              | `array`             | Alias de `array()` ; plus lisible pour les mutations feu-et-oubli                         |
| `->then(callable)`                       | `mixed`             | Applique une transformation immédiatement après consommation ; `$transform(array): mixed` |
| `->getResponse()`                        | `ResponseInterface` | Accès à la réponse Symfony brute (usage avancé)                                           |
| `::all(HttpClient, array, bool, Logger)` | `array`             | Statique ; résout plusieurs ResponsePromise en parallèle (voir ci-dessous)                |

**`->await()` vs `->array()` :** ils sont identiques. Convention : utiliser `->array()` quand on assigne ou retourne le résultat ; utiliser `->await()` sur les mutations feu-et-oubli (delete, tag, lancement) où le body de réponse n'est pas nécessaire, pour rendre l'intention « j'attends juste que ça finisse » explicite.

---

## PaginatedPromise — référence API

`ApiClient::requestAll()` retourne un `PaginatedPromise`. Il déclenche la page 1 immédiatement à la construction. Les pages 2–N sont déclenchées en lots parallèles de 20 maximum lors de l'appel à `->resolve()`.

| Méthode            | Retour             | Notes                                                                                                             |
| ------------------ | ------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `->resolve()`      | `array`            | Bloque et retourne le tableau fusionné de toutes les pages ; résultat mis en cache (idempotent)                   |
| `->then(callable)` | `PaginatedPromise` | Enregistre une transformation lazy appliquée au tableau complet au moment du resolve ; `$transform(array): array` |

`->then()` est composable et reste lazy — la transformation ne s'exécute qu'une fois, au moment du `->resolve()`.

---

## ApiClient — méthodes de haut niveau

### `resolveAll(array $pendingsByKey, bool $continueOnError = false): array`

Stream plusieurs `ResponsePromise` en parallèle via `HttpClient::stream()`. Retourne `array<clé, array>` dans le même ordre de clés que l'entrée. Encapsule `ResponsePromise::all()`.

- Toutes les promesses doivent provenir de la **même instance `HttpClient`** (elles partagent le pool de connexions sous-jacent).
- `$continueOnError = true` : les réponses en erreur sont silencieusement ignorées (clé absente du résultat) et un warning est loggé. Par défaut : tout échec lève immédiatement une exception.

### `fetchAllDetailsAsync(array $items, callable $asyncFetcher, bool $continueOnError = false): array`

Enrichit une liste plate en récupérant le détail de chaque item en parallèle, par lots de 20. Le `$asyncFetcher` reçoit `(item, clé)` et doit retourner un `ResponsePromise`. Retourne le même tableau avec chaque item remplacé par son payload détaillé.

### `requestAll(string $url, array $query = [], array $headers = []): PaginatedPromise`

Pagine automatiquement un endpoint GET. Toujours `limit=100`. Déclenche la page 1 immédiatement ; toutes les pages restantes sont déclenchées en parallèle lors de l'appel à `->resolve()`.

---

## Exemples d'utilisation

### 1. Récupération simple d'une ressource

```php
// Dans un service : retourner la promesse, laisser l'appelant décider quand consommer
public function get(string $datastoreId, string $storedDataId): ResponsePromise
{
    return $this->api->get("datastores/$datastoreId/stored_data/$storedDataId");
}

// Dans un contrôleur : consommer immédiatement
$storedData = $this->storedDataApiService->get($datastoreId, $id)->array();
```

### 2. Mutation feu-et-oubli

```php
// Pas besoin du body de réponse ; ->await() rend l'intention claire
$this->processingApiService->launchExecution($datastoreId, $execId)->await();
$this->annexeApiService->remove($datastoreId, $annexeId)->await();
```

### 3. Récupération de toutes les pages d'une collection

```php
// Service : retourner la promesse lazy
public function getAll(string $datastoreId, array $query = []): PaginatedPromise
{
    return $this->api->requestAll("datastores/$datastoreId/stored_data", $query);
}

// Contrôleur/service : résoudre quand les données sont nécessaires
$storedDataList = $this->storedDataApiService->getAll($datastoreId)->resolve();
```

### 4. Transformation lazy sur une collection paginée

```php
// La transformation s'exécute au moment du resolve(), pas avant
public function getCommunitiesName(): PaginatedPromise
{
    return $this->api->requestAll('communities', ['fields' => ['name']])
        ->then(fn (array $items) => array_map(fn ($c) => $c['name'], $items));
}

$names = $communityApiService->getCommunitiesName()->resolve();
```

### 5. Déclencher plusieurs promesses paginées, faire du travail entre les deux, résoudre plus tard

C'est le pattern central. Cinq requêtes sont dispatchées simultanément. Le travail synchrone (ex. récupération du datastore en cache) s'exécute pendant les allers-retours réseau. Chaque `->resolve()` ne bloque que si les données ne sont pas encore reçues, ce qui est rare au moment où on l'appelle.

```php
// Dispatch immédiat des cinq requêtes (page 1 de chacune déjà en vol)
$pendingUploads        = $this->uploadApiService->getAll($datastoreId);
$pendingStoredData     = $this->storedDataApiService->getAll($datastoreId);
$pendingMetadata       = $this->metadataApiService->getAll($datastoreId);
$pendingConfigurations = $this->configurationApiService->getAll($datastoreId);
$pendingAnnexes        = $this->annexeApiService->getAll($datastoreId);

// Cet appel synchrone s'exécute pendant que les requêtes sont sur le réseau
$datastore = $this->datastoreApiService->get($datastoreId); // mis en cache

// Consommation — la plupart des données sont probablement déjà reçues
$uploads        = $pendingUploads->resolve();
$storedDataList = $pendingStoredData->resolve();
$metadataList   = $pendingMetadata->resolve();
$configurations = $pendingConfigurations->resolve();
$annexes        = $pendingAnnexes->resolve();
```

Exemple réel : `DatasheetController::getDatasheetList()`.

### 6. Récupérer une page puis enrichir chaque item avec son détail, en parallèle

```php
public function getAllDetailed(string $datastoreId, array $query = []): array
{
    $list = $this->getAll($datastoreId, $query)->resolve();

    // Déclenche un GET /stored_data/{id} par item, jusqu'à 20 en parallèle
    return $this->api->fetchAllDetailsAsync(
        $list,
        fn (array $item): ResponsePromise => $this->api->get(
            "datastores/$datastoreId/stored_data/{$item['_id']}"
        )
    );
}
```

### 7. Liste sur une seule page avec headers (pagination manuelle transmise au frontend)

```php
// Service : expose PaginatedResponse pour que le contrôleur puisse transmettre les headers
public function getList(string $datastoreId, array $query = []): PaginatedResponse
{
    return $this->api->get("datastores/$datastoreId/stored_data", $query)
        ->arrayWithHeaders();
}

// Contrôleur :
$page = $this->storedDataApiService->getList($datastoreId, $request->query->all());
// $page->content           — items de la page courante
// $page->getPageCount(100) — nombre total de pages depuis le header Content-Range
```

### 8. Résoudre plusieurs requêtes indépendantes sur une seule ressource en parallèle

Utiliser `resolveAll()` directement pour un ensemble fixe de requêtes indépendantes non paginées.

```php
$results = $this->api->resolveAll([
    'upload'     => $this->api->get("datastores/$datastoreId/uploads/$uploadId"),
    'executions' => $this->api->get("datastores/$datastoreId/processing_executions", [
        'upload' => $uploadId,
    ]),
]);

$upload     = $results['upload'];
$executions = $results['executions'];
```

---

## Ce qui ne bénéficie pas de ce pattern

- **Chaînes de dépendances séquentielles.** Si l'étape B a besoin du résultat de A pour construire son URL, impossible de paralléliser — appeler `->array()` directement.
- **Mutations feu-et-oubli en boucle.** Trois `->await()` en séquence dans une boucle restent séquentiels. Collecter les promesses d'abord et utiliser `resolveAll()` pour des suppressions parallèles.
- **Appels dans une closure mise en cache.** Si le résultat est mémoïsé de toute façon (`$cache->get(...)`), différer la consommation ne sert à rien.

---

## Gestion des erreurs

Toutes les méthodes de consommation (`->array()`, `->text()`, `->await()`, `->resolve()`) lèvent `App\Exception\ApiException` sur toute réponse non-2xx. `ApiException` porte le code HTTP et un payload d'erreur parsé normalisé par `EntrepotErrorParser` / `EspaceCoErrorParser`.

Les erreurs réseau (DNS, connexion refusée, timeout) lèvent `ApiException` avec le statut 503 avant toute réponse HTTP.

Le retry (max 3 tentatives, sur 500/502/503/504) est configuré au niveau du HttpClient de Symfony dans `config/packages/framework.yaml` et est transparent pour la couche service.

---

## Carte des fichiers

```
src/ApiClient/
  ApiClient.php               — point d'entrée principal (verbes HTTP + helpers de haut niveau)
  ApiClientFactory.php        — factory : un ApiClient par API externe
  AuthenticatedHttpClient.php — décorateur HttpClient : injecte le token Bearer
  ResponsePromise.php         — wrapper lazy pour une réponse unique
  PaginatedPromise.php        — wrapper lazy pour toutes les pages
  PaginatedResponse.php       — objet valeur : contenu + headers
  RequestOptions.php          — objet valeur : paramètres de requête
  ErrorParser/
    ErrorParserInterface.php
    EntrepotErrorParser.php
    EspaceCoErrorParser.php
```
