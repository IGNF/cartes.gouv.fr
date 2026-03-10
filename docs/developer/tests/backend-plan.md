# Plan : Tests backend — CartesServiceApiService + WfsController

## Contexte

Le projet **cartes.gouv.fr** n'a aujourd'hui aucune infrastructure de test backend :

- Pas de PHPUnit installé
- Pas de répertoire `tests/`, `phpunit.xml`, `.env.test`
- `composer.json` a déjà `autoload-dev` configuré : `"App\\Tests\\": "tests/"`
- `symfony/browser-kit` et `symfony/css-selector` sont déjà en `require-dev`

### Objectifs

1. **Tests unitaires approfondis** de `CartesServiceApiService` (classe d'orchestration, ~340 lignes, 14 dépendances)
2. **Tests fonctionnels** de `WfsController` via `WebTestCase` (routing, validation DTO, gestion d'erreurs)

### Décisions prises

- **Fixture Factory avec cohérence intégrée** pour les données de test (pas de JSON OpenAPI, pas de faker)
- **Exclure** `unpublish()` / `unpublishOfferingAndConfiguration()` (contient `sleep()`, à repenser pour la testabilité)
- `getNewConfigMetadata()` testé **indirectement** via les scénarios `saveService()`
- `synchroniseSiblingServices()` : couverture **minimale** (appel sans erreur)
- `InternalApiSubscriber` désactive l'auth Keycloak en `APP_ENV=test` → pas besoin de simuler OAuth2

---

## Phase 1 — Infrastructure de test

| Étape | Action                       | Détails                                                                 |
| ----- | ---------------------------- | ----------------------------------------------------------------------- |
| 1.1   | Installer PHPUnit            | `composer require --dev symfony/test-pack`                              |
| 1.2   | Créer `phpunit.xml.dist`     | Bootstrap `vendor/autoload.php`, testsuite `tests/`, env `APP_ENV=test` |
| 1.3   | Créer `.env.test`            | Variables minimales : `APP_ENV=test`, `APP_SECRET=test`                 |
| 1.4   | Créer le répertoire `tests/` | Structure initiale                                                      |

**Fichiers créés :**

- `phpunit.xml.dist`
- `.env.test`
- `tests/`

---

## Phase 2 — Fixture Factory

**Fichier :** `tests/Fixtures/EntrepotFixtures.php`

Classe qui génère des jeux de données cohérents pour les entités de l'API Entrepôt. Les IDs sont partagés au sein d'une même instance pour garantir les relations inter-entités.

### Principes

- Les IDs (`datastoreId`, `storedDataId`, `configId`, `offeringId`, `endpointId`) sont des propriétés de l'instance
- Chaque méthode retourne un `array<mixed>` conforme à la forme des réponses API
- Les références croisées sont automatiques (l'offering pointe vers la bonne configuration, la configuration référence le bon `stored_data`, etc.)
- Toutes les méthodes acceptent un paramètre `array $overrides = []` pour les cas particuliers

### Méthodes à implémenter

| Méthode                                               | Retourne                              | Relations garanties                                         |
| ----------------------------------------------------- | ------------------------------------- | ----------------------------------------------------------- |
| `storedData()`                                        | Stored data avec tag `DATASHEET_NAME` | Utilise `$this->storedDataId`                               |
| `endpoint(bool $open = true)`                         | Endpoint avec URLs                    | Utilise `$this->endpointId`                                 |
| `configuration(array $overrides = [])`                | Configuration WFS complète            | Référence `$this->storedDataId` dans `type_infos.used_data` |
| `offering(array $overrides = [])`                     | Offering avec config et endpoint      | Référence `$this->configId`, `$this->endpointId`            |
| `datastore()`                                         | Datastore avec community              | Utilise `$this->datastoreId`                                |
| `permission(string $offeringId, string $communityId)` | Permission de type COMMUNITY          | Référence offering et community                             |
| `cswMetadata(array $layers = [])`                     | Objet `CswMetadata` avec layers       | Chaque layer référence un `offeringId`                      |
| `createCommonDTO(array $overrides = [])`              | `CommonDTO` valide                    | Tous les champs obligatoires remplis                        |

### Aperçu de la classe

```php
<?php

namespace App\Tests\Fixtures;

use App\Constants\EntrepotApi\CommonTags;
use App\Constants\EntrepotApi\OfferingTypes;
use App\Constants\EntrepotApi\PermissionTypes;
use App\Dto\Services\CommonDTO;
use App\Entity\CswMetadata\CswLanguage;
use App\Entity\CswMetadata\CswMetadata;
use App\Entity\CswMetadata\CswMetadataLayer;

class EntrepotFixtures
{
    public string $datastoreId = 'ds-001';
    public string $communityId = 'com-001';
    public string $storedDataId = 'sd-001';
    public string $configId = 'cfg-001';
    public string $offeringId = 'off-001';
    public string $endpointId = 'ep-001';
    public string $datasheetName = 'my_datasheet';

    public function storedData(array $overrides = []): array
    {
        return array_merge([
            '_id' => $this->storedDataId,
            'type' => 'VECTOR-DB',
            'name' => 'stored_data_test',
            'tags' => [
                CommonTags::DATASHEET_NAME => $this->datasheetName,
            ],
        ], $overrides);
    }

    public function endpoint(bool $open = true, array $overrides = []): array
    {
        return array_merge([
            '_id' => $this->endpointId,
            'open' => $open,
            'technical_name' => 'wfs-endpoint',
            'endpoint' => [
                '_id' => $this->endpointId,
                'technical_name' => 'wfs-endpoint',
                'urls' => [['url' => 'https://data.geopf.fr/wfs']],
            ],
        ], $overrides);
    }

    public function configuration(array $overrides = []): array
    {
        return array_merge([
            '_id' => $this->configId,
            'type' => 'WFS',
            'name' => 'my_service',
            'layer_name' => 'my_layer',
            'status' => 'PUBLISHED',
            'tags' => [
                CommonTags::DATASHEET_NAME => $this->datasheetName,
                CommonTags::CONFIG_THEME => 'Transport',
            ],
            'metadata' => [],
            'type_infos' => [
                'used_data' => [[
                    'stored_data' => $this->storedDataId,
                    'relations' => [
                        [
                            'native_name' => 'ma_table',
                            'title' => 'Ma Table',
                            'abstract' => 'Description',
                        ],
                    ],
                ]],
            ],
        ], $overrides);
    }

    public function offering(array $overrides = []): array
    {
        return array_merge([
            '_id' => $this->offeringId,
            'type' => OfferingTypes::WFS,
            'open' => true,
            'layer_name' => 'my_layer',
            'configuration' => ['_id' => $this->configId],
            'endpoint' => ['_id' => $this->endpointId],
            'urls' => [['url' => 'https://data.geopf.fr/wfs/ows', 'type' => 'WFS']],
        ], $overrides);
    }

    public function datastore(array $overrides = []): array
    {
        return array_merge([
            '_id' => $this->datastoreId,
            'technical_name' => 'my-datastore',
            'community' => ['_id' => $this->communityId],
        ], $overrides);
    }

    public function permission(string $offeringId, string $communityId): array
    {
        return [
            '_id' => 'perm-001',
            'type' => PermissionTypes::COMMUNITY,
            'offerings' => [['_id' => $offeringId]],
            'beneficiary' => ['_id' => $communityId],
        ];
    }

    public function cswMetadata(array $layers = []): CswMetadata
    {
        $csw = new CswMetadata();
        $csw->fileIdentifier = 'fr-test-wfs-001';
        $csw->title = 'Test metadata';
        $csw->layers = array_map(function (array $layerData) {
            $layer = new CswMetadataLayer();
            $layer->offeringId = $layerData['offeringId'];
            $layer->name = $layerData['name'] ?? 'layer_name';
            $layer->open = $layerData['open'] ?? true;
            $layer->gmdOnlineResourceProtocol = 'OGC:WFS';
            $layer->gmdOnlineResourceUrl = 'https://data.geopf.fr/wfs/ows';

            return $layer;
        }, $layers);

        return $csw;
    }

    public function createCommonDTO(array $overrides = []): CommonDTO
    {
        $dto = new CommonDTO();
        $dto->technical_name = $overrides['technical_name'] ?? 'my_wfs_service';
        $dto->public_name = $overrides['public_name'] ?? 'Mon service WFS';
        $dto->service_name = $overrides['service_name'] ?? 'WFS Test';
        $dto->description = $overrides['description'] ?? 'Description du service';
        $dto->identifier = $overrides['identifier'] ?? 'fr-test-wfs-001';
        $dto->category = $overrides['category'] ?? ['transport'];
        $dto->keywords = $overrides['keywords'] ?? ['wfs', 'test'];
        $dto->free_keywords = $overrides['free_keywords'] ?? [];
        $dto->email_contact = $overrides['email_contact'] ?? 'test@example.com';
        $dto->creation_date = $overrides['creation_date'] ?? '2026-01-01';
        $dto->organization = $overrides['organization'] ?? 'Test Org';
        $dto->organization_email = $overrides['organization_email'] ?? 'org@example.com';
        $dto->projection = $overrides['projection'] ?? 'EPSG:4326';
        $dto->attribution_text = $overrides['attribution_text'] ?? '';
        $dto->attribution_url = $overrides['attribution_url'] ?? '';
        $dto->language = $overrides['language'] ?? CswLanguage::FRE;
        $dto->charset = $overrides['charset'] ?? 'utf8';
        $dto->resolution = $overrides['resolution'] ?? '';
        $dto->hierarchy_level = $overrides['hierarchy_level'] ?? null;
        $dto->resource_genealogy = $overrides['resource_genealogy'] ?? '';
        $dto->frequency_code = $overrides['frequency_code'] ?? 'unknown';
        $dto->share_with = $overrides['share_with'] ?? 'all_public';
        $dto->allow_view_data = $overrides['allow_view_data'] ?? true;

        return $dto;
    }
}
```

### Exemple d'utilisation

```php
$fixtures = new EntrepotFixtures();

// Données cohérentes automatiquement
$storedData = $fixtures->storedData();
$config = $fixtures->configuration();
$offering = $fixtures->offering();

// $offering['configuration']['_id'] === $config['_id']
// $config['type_infos']['used_data'][0]['stored_data'] === $storedData['_id']

// Cas avec overrides pour un scénario spécifique
$closedEndpoint = $fixtures->endpoint(open: false);
$communityDto = $fixtures->createCommonDTO(['share_with' => 'your_community']);

// Metadata avec services frères
$csw = $fixtures->cswMetadata([
    ['offeringId' => 'off-001', 'name' => 'wfs_layer'],
    ['offeringId' => 'off-002', 'name' => 'wms_layer'],
]);
```

**Fichiers de référence pour la forme des données :**

- `src/Services/EntrepotApi/ConfigurationApiService.php` — get, add, replace retournent des arrays
- `src/Services/EntrepotApi/DatastoreApiService.php` — get, getEndpointsList
- `src/Services/EntrepotApi/StoredDataApiService.php` — get
- `src/Constants/EntrepotApi/CommonTags.php` — clés des tags
- `src/Constants/EntrepotApi/OfferingTypes.php` — types d'offering
- `src/Entity/CswMetadata/CswMetadata.php`, `CswMetadataLayer.php` — entités métadonnées

---

## Phase 3 — Tests unitaires `CartesServiceApiService`

**Fichier :** `tests/Services/EntrepotApi/CartesServiceApiServiceTest.php`

### Setup

Méthode `setUp()` qui instancie les **14 mocks** et le service :

| Dépendance                 | Type de mock        | Méthodes à configurer                                                                                        |
| -------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------ |
| `ParameterBagInterface`    | Mock                | `get()` → retourne `http_proxy`, `annexes_url`, `catalogue_url`, `config`                                    |
| `ConfigurationApiService`  | Mock                | `get`, `add`, `replace`, `addTags`, `addOffering`, `syncOffering`, `removeOffering`, `getOffering`, `remove` |
| `DatastoreApiService`      | Mock                | `get`, `getEndpointsList`, `getEndpoint`, `getPermissions`, `addPermission`, `removePermission`              |
| `CartesMetadataApiService` | Mock                | `createOrUpdate` → retourne `['csw_metadata' => CswMetadata]`                                                |
| `StoredDataApiService`     | Mock                | `get`                                                                                                        |
| `CapabilitiesService`      | Mock                | `createOrUpdate`, `getGetCapUrl`                                                                             |
| `SandboxService`           | Mock                | `isSandboxDatastore`                                                                                         |
| `CartesStylesApiService`   | Mock                | `getStyles`                                                                                                  |
| `GeonetworkApiService`     | Mock                | `getBaseUrl`, `getUrl`                                                                                       |
| `AnnexeApiService`         | Mock                | `remove`                                                                                                     |
| `StaticApiService`         | Mock                | `delete`                                                                                                     |
| `CacheInterface`           | `ArrayAdapter` réel | Le cache en mémoire exécute les closures normalement                                                         |
| `LoggerInterface`          | `NullLogger`        | Pas de vérification de logs (sauf tests spécifiques)                                                         |
| `HttpClientInterface`      | Mock                | `request()` pour les appels TMS metadata dans `getService`                                                   |

### Tests `saveService()` — 7 tests

| #   | Nom du test                                      | Scénario                                  | Assertions clés                                                                                                           |
| --- | ------------------------------------------------ | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 3.1 | `testSaveServiceNewPublicService`                | Nouveau service, `share_with=all_public`  | Chaîne complète : endpoint → add config → addTags → addOffering → metadata. L'offering retourné contient `configuration`. |
| 3.2 | `testSaveServiceRollbackOnOfferingFailure`       | `addOffering()` throw `\RuntimeException` | `configurationApiService->remove()` appelé (rollback). L'exception est relancée.                                          |
| 3.3 | `testSaveServiceEditSameEndpoint`                | Modification, même `open`                 | `syncOffering()` appelé. Ni `removeOffering` ni `addOffering`.                                                            |
| 3.4 | `testSaveServiceEditEndpointChange`              | Modification, changement `open`           | `removeOffering()` puis `addOffering()`. Pas `syncOffering`.                                                              |
| 3.5 | `testSaveServiceSandbox`                         | Nouveau, `isSandboxDatastore=true`        | `capabilitiesService->createOrUpdate()` **pas** appelé. `identifier` préfixé `sandbox.`.                                  |
| 3.6 | `testSaveServiceCapabilitiesFailureDoesNotBlock` | capabilities throw                        | `saveService()` ne lève pas d'exception. Logger reçoit un warning.                                                        |
| 3.7 | `testSaveServiceCommunitySharing`                | `share_with=your_community`               | Endpoint `open=false`. `addPermission` appelé.                                                                            |

### Tests permissions — 3 tests (indirects via `saveService`)

| #   | Nom du test                                | Scénario                                                    | Assertions clés                                                        |
| --- | ------------------------------------------ | ----------------------------------------------------------- | ---------------------------------------------------------------------- |
| 4.1 | `testPermissionCreatedForCurrentCommunity` | `share_with=your_community`                                 | `addPermission` avec `communities: [community._id]`, `type: COMMUNITY` |
| 4.2 | `testPermissionCreatedForConfigCommunity`  | `open=false`, `allow_view_data=true`                        | `addPermission` avec `communities: [config_community_id]`              |
| 4.3 | `testExistingConfigPermissionRemoved`      | `open=false`, `allow_view_data=false`, permission existante | `removePermission` appelé                                              |

### Tests `getService()` — 3 tests

| #   | Nom du test                                | Scénario                             | Assertions clés                                     |
| --- | ------------------------------------------ | ------------------------------------ | --------------------------------------------------- |
| 5.1 | `testGetServiceWfs`                        | Offering type WFS                    | Retour contient `configuration.styles`, `share_url` |
| 5.2 | `testGetServiceWmtsTmsWithTmsMetadata`     | WMTS-TMS, pyramide vecteur, HTTP 200 | `tms_metadata` présent                              |
| 5.3 | `testGetServiceTmsMetadataFailureGraceful` | Requête TMS throw                    | Pas d'exception. `tms_metadata` absent              |

### Tests `getShareUrl()` — 4 tests

| #   | Nom du test                 | Scénario                     | Assertions clés                                                                       |
| --- | --------------------------- | ---------------------------- | ------------------------------------------------------------------------------------- |
| 6.1 | `testShareUrlWfsNonSandbox` | WFS, non-sandbox             | `{annexes_url}/{datastore.technical_name}/{endpoint.technical_name}/capabilities.xml` |
| 6.2 | `testShareUrlWfsSandbox`    | WFS, sandbox                 | `getGetCapUrl()` appelé                                                               |
| 6.3 | `testShareUrlWmtsTmsVector` | WMTS-TMS, `tiles[0]` présent | URL du tile                                                                           |
| 6.4 | `testShareUrlUnknownType`   | Type non reconnu             | `null`                                                                                |

**Total : ~17 tests unitaires**

---

## Phase 4 — Tests fonctionnels `WfsController`

**Fichier :** `tests/Controller/Entrepot/WfsControllerTest.php`

### Approche

- Étend `Symfony\Bundle\FrameworkBundle\Test\WebTestCase`
- Utilise le `KernelBrowser` pour envoyer des requêtes HTTP à travers le stack Symfony complet
- Mock **seulement** `CartesServiceApiService` et `ConfigurationApiService` dans le conteneur
- Auth désactivée en env test (`InternalApiSubscriber` skip quand `app_env=test`)
- Header requis : `X-Requested-With: XMLHttpRequest`

### Ce qui est testé (non couvert par les tests unitaires)

- **Routing** : résolution URL, paramètres `{datastoreId}`, `{storedDataId}`
- **Condition `isXmlHttpRequest()`**
- **Désérialisation** `#[MapRequestPayload]` → `WfsServiceDTO`
- **Validation DTO** : contraintes `@Assert\NotBlank`, `@Assert\Count`, `@Assert\Email`, etc.
- **`CartesApiExceptionSubscriber`** → JSON structuré
- **Logique contrôleur** : `getConfigTypeInfos()`, `getConfigRequestBody()`

### Tests `add` — 5 tests

| #   | Nom du test                        | Requête                            | Réponse     | Vérifie                        |
| --- | ---------------------------------- | ---------------------------------- | ----------- | ------------------------------ |
| 4.1 | `testAddSuccess`                   | POST valide + XHR                  | 200 + JSON  | Happy path                     |
| 4.2 | `testAddWithoutXhrHeader`          | POST sans `X-Requested-With`       | 404         | Condition routing              |
| 4.3 | `testAddWithEmptyTableInfos`       | `table_infos: []`                  | 422         | `@Assert\Count(min:1)`         |
| 4.4 | `testAddWithMissingRequiredFields` | Champs manquants                   | 422         | Validation `CommonDTO`         |
| 4.5 | `testAddWhenApiThrows`             | `saveService` throw `ApiException` | JSON erreur | `CartesApiExceptionSubscriber` |

### Tests `edit` — 3 tests

| #   | Nom du test              | Requête                                | Réponse     | Vérifie                           |
| --- | ------------------------ | -------------------------------------- | ----------- | --------------------------------- |
| 4.6 | `testEditSuccess`        | POST `/{offeringId}/edit` valide + XHR | 200 + JSON  | Old offering/config + saveService |
| 4.7 | `testEditWithInvalidDto` | POST invalide                          | 422         | Validation DTO                    |
| 4.8 | `testEditWhenApiThrows`  | `getOffering` throw                    | JSON erreur | Gestion d'erreur                  |

**Total : ~8 tests fonctionnels**

### Payload JSON de référence

```json
{
    "technical_name": "my_wfs_service",
    "public_name": "Mon service WFS",
    "service_name": "WFS Test",
    "description": "Description du service",
    "identifier": "fr-test-wfs-001",
    "category": ["transport"],
    "keywords": ["wfs", "test"],
    "free_keywords": [],
    "email_contact": "test@example.com",
    "organization": "Test Org",
    "organization_email": "org@example.com",
    "creation_date": "2026-01-01",
    "charset": "utf8",
    "language": "fre",
    "resolution": "",
    "hierarchy_level": null,
    "resource_genealogy": "",
    "frequency_code": "unknown",
    "share_with": "all_public",
    "allow_view_data": true,
    "attribution_text": "",
    "attribution_url": "",
    "table_infos": [
        {
            "native_name": "ma_table",
            "title": "Ma Table",
            "description": "Description de la table",
            "public_name": "ma_table_pub",
            "keywords": ["transport", "routes"]
        }
    ]
}
```

---

## Phase 5 — Vérification

| Étape | Commande                                                    | Attendu              |
| ----- | ----------------------------------------------------------- | -------------------- |
| 5.1   | `./vendor/bin/phpunit`                                      | ~25 tests passent    |
| 5.2   | `./vendor/bin/phpunit --filter CartesServiceApiServiceTest` | 17 tests unitaires   |
| 5.3   | `./vendor/bin/phpunit --filter WfsControllerTest`           | 8 tests fonctionnels |
| 5.4   | `composer check-rules`                                      | Pas de régression    |

---

## Structure finale

```
tests/
├── Fixtures/
│   └── EntrepotFixtures.php                  ← Factory cohérente
├── Services/
│   └── EntrepotApi/
│       └── CartesServiceApiServiceTest.php   ← 17 tests unitaires
└── Controller/
    └── Entrepot/
        └── WfsControllerTest.php             ← 8 tests fonctionnels
phpunit.xml.dist
.env.test
```

---

## Fichiers de référence

### Classes testées

- `src/Services/EntrepotApi/CartesServiceApiService.php` — orchestration services (saveService, getService, getShareUrl)
- `src/Controller/Entrepot/WfsController.php` — contrôleur WFS (add, edit, getConfigTypeInfos)
- `src/Controller/Entrepot/ServiceController.php` — parent (getConfigRequestBody)

### Dépendances à mocker

- `src/Services/EntrepotApi/ConfigurationApiService.php`
- `src/Services/EntrepotApi/DatastoreApiService.php`
- `src/Services/EntrepotApi/CartesMetadataApiService.php`
- `src/Services/EntrepotApi/StoredDataApiService.php`
- `src/Services/EntrepotApi/CartesStylesApiService.php`
- `src/Services/EntrepotApi/AnnexeApiService.php`
- `src/Services/EntrepotApi/StaticApiService.php`
- `src/Services/CapabilitiesService.php`
- `src/Services/SandboxService.php`
- `src/Services/GeonetworkApiService.php`

### DTOs et entités

- `src/Dto/Services/CommonDTO.php`
- `src/Dto/Services/Wfs/WfsServiceDTO.php`
- `src/Dto/Services/Wfs/WfsTableDTO.php`
- `src/Entity/CswMetadata/CswMetadata.php`
- `src/Entity/CswMetadata/CswMetadataLayer.php`

### Constants

- `src/Constants/EntrepotApi/CommonTags.php`
- `src/Constants/EntrepotApi/ConfigurationTypes.php`
- `src/Constants/EntrepotApi/OfferingTypes.php`
- `src/Constants/EntrepotApi/PermissionTypes.php`
- `src/Constants/EntrepotApi/StoredDataTypes.php`
- `src/Constants/EntrepotApi/Sandbox.php`

### Listeners

- `src/Listener/CartesApiExceptionSubscriber.php` — conversion exceptions → JSON
- `src/Listener/InternalApiSubscriber.php` — auth Keycloak (désactivée en test)

---

## Hors scope

- `unpublish()` / `unpublishOfferingAndConfiguration()` — contient `sleep()`, nécessite refactoring
- `removeStyleFiles()` — private, couplée à unpublish
- Tests approfondis `synchroniseSiblingServices()` — couvert minimalement
- Autres contrôleurs (WmsVectorController, TmsController, etc.)
- Tests d'intégration avec mock API server
- Auto-génération de fixtures via OpenAPI
