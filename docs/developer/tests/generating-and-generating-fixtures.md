# Partage de fixtures backend (PHPUnit) / frontend (Cypress)

## Ce qui se recoupe concrètement

Les deux plans manipulent les **mêmes structures de données** au même format JSON snake_case :

| Donnée                                                                 | Backend (PHPUnit)                                                | Frontend (Cypress)                               |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------ |
| **Profils utilisateur** (`CartesUser`)                                 | Tests fonctionnels `WfsController` (session/user)                | Injection dans `<div id="user" data-user="...">` |
| **Réponses API Entrepôt** (stored data, configs, offerings, endpoints) | Retours mockés des services (`->method('get')->willReturn(...)`) | `cy.intercept('/api/...', fixture)`              |
| **Payloads DTO** (WfsServiceDTO JSON)                                  | Corps POST dans tests fonctionnels                               | Corps POST soumis par les formulaires            |
| **Attributs root** (configCommunityId, etc.)                           | Variables d'env `.env.test`                                      | `data-*` attributes injectés sur `#root`         |

Un point clé : le serializer Symfony est configuré avec `camel_case_to_snake_case` dans `config/packages/framework.yaml`, donc **tout le JSON produit par le backend est en snake_case** — exactement le format que Cypress consomme. La classe `src/Security/User.php` a même une méthode `getTestUser()` qui produit un utilisateur de test.

---

## Les 3 options

### Option A — Répertoire JSON partagé + chargeurs des deux côtés

```
tests/
  fixtures/                          ← RÉPERTOIRE PARTAGÉ (source unique)
    users/
      me.json
      me-with-config-access.json
    entrepot/
      stored-data.json
      configuration-wfs.json
      offering-wfs.json
      endpoint.json
      datastore.json
    payloads/
      wfs-add.json
  Fixtures/
    EntrepotFixtures.php             ← Charge les JSON + permet les overrides
    FixtureLoader.php                ← Helper: json_decode(file_get_contents(...))
cypress/
  fixtures/ → ../tests/fixtures/     ← SYMLINK vers le répertoire partagé
```

**Côté PHP** : `EntrepotFixtures` charge les JSON et les enrichit :

```php
class EntrepotFixtures {
    public function storedData(array $overrides = []): array {
        return array_merge(FixtureLoader::load('entrepot/stored-data.json'), $overrides);
    }
}
```

**Côté Cypress** : `cy.fixture('entrepot/stored-data.json')` charge le même fichier directement.

| Avantage                                          | Inconvénient                                                                                             |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Zéro duplication** — un seul fichier par entité | **Symlink** à gérer (compatibilité Windows/Docker)                                                       |
| Cohérence format garantie                         | JSON statique moins flexible que la factory PHP pour les IDs liés                                        |
| Fonctionne nativement avec `cy.fixture()`         | Les fixtures complexes (relations inter-entités) nécessitent des conventions d'IDs stables dans les JSON |

**Complexité relations** : dans le plan backend actuel, `EntrepotFixtures` garantit la cohérence des IDs (`$this->configId` référencé partout). Avec du JSON statique, il faut que les IDs soient hardcodés et cohérents entre fichiers — faisable mais moins dynamique.

---

### Option B — PHP comme source unique → génère le JSON pour Cypress

```
tests/
  Fixtures/
    EntrepotFixtures.php             ← Source unique (PHP arrays)
  fixtures/                          ← Généré par la commande
    users/me.json
    entrepot/stored-data.json
    ...
cypress/
  fixtures/ → ../tests/fixtures/     ← Symlink vers le généré
```

Une commande Symfony `bin/console app:generate-fixtures` sérialise les fixtures PHP en JSON :

```php
class GenerateFixturesCommand extends Command {
    protected function execute(...): int {
        $f = new EntrepotFixtures();
        file_put_contents('tests/fixtures/users/me.json', json_encode($f->user()));
        file_put_contents('tests/fixtures/entrepot/stored-data.json', json_encode($f->storedData()));
        // ...
    }
}
```

| Avantage                                                                  | Inconvénient                                                                   |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **Factory PHP = source unique** — les relations complexes restent faciles | **Étape de build supplémentaire** (`composer generate-fixtures` avant Cypress) |
| Sérialisation via Symfony serializer possible → format garanti            | Plus lourd à maintenir (commande + factory + fichiers générés)                 |
| Flexibilité totale côté PHP                                               | Les fichiers JSON générés doivent être commités ou générés en CI               |

---

### Option C — JSON partagé pour le commun + factory PHP pour le complexe (hybride)

```
tests/
  fixtures/                          ← JSON partagé pour les entités simples
    users/
      me.json
      me-with-config-access.json
    payloads/
      wfs-add.json
  Fixtures/
    EntrepotFixtures.php             ← Factory PHP pour les entités complexes (relations)
    FixtureLoader.php                ← Charge les JSON partagés
cypress/
  fixtures/
    users/ → ../../tests/fixtures/users/       ← Symlink sélectif
    payloads/ → ../../tests/fixtures/payloads/
    entrepot/                                   ← Fixtures spécifiques Cypress (intercepts API)
      my-datastores.json
```

Seules les fixtures **réellement partagées** (profils utilisateur, payloads) sont dans le répertoire commun. Les fixtures d'entités Entrepôt (stored data, configs, offerings) restent :

- Côté PHP → dans la factory `EntrepotFixtures` (pour les relations inter-IDs)
- Côté Cypress → dans `cypress/fixtures/entrepot/` (pour les `cy.intercept` avec des réponses complètes adaptées au scénario E2E)

| Avantage                                              | Inconvénient                                              |
| ----------------------------------------------------- | --------------------------------------------------------- |
| **Partage pragmatique** — uniquement ce qui a du sens | Deux sources pour les entités API (duplication partielle) |
| Pas de build supplémentaire                           | Convention à documenter (quoi va où)                      |
| Chaque monde garde sa flexibilité                     |                                                           |
| Pas de symlink profond                                |                                                           |

---

## Le choix de framework change-t-il la donne ?

**Non significativement.** Le partage de fixtures est un problème de **format de données**, pas de test runner :

| Framework                 | Charge du JSON ?                      | Factory pattern ?         | Avantage spécifique                            |
| ------------------------- | ------------------------------------- | ------------------------- | ---------------------------------------------- |
| **PHPUnit** (plan actuel) | `json_decode(file_get_contents(...))` | Oui, classique            | Écosystème Symfony natif                       |
| **Pest**                  | Identique (wrapper PHPUnit)           | Oui, syntaxe plus concise | Syntaxe plus lisible, mais les mêmes capacités |
| **Codeception**           | Module `Fixture` intégré              | Oui + helpers HTTP        | Modules Symfony/REST intégrés, mais plus lourd |

Rester sur **PHPUnit** est le bon choix — c'est le standard Symfony, le plan backend est déjà écrit pour, et les capacités de chargement JSON sont identiques.

---

## Recommandation

**Option C (hybride)** pour commencer, avec la possibilité de migrer vers A si les intercepts Cypress grandissent :

- Les profils utilisateur et payloads DTO sont les mêmes des deux côtés → JSON partagé
- Les entités API complexes (stored data, configs, offerings avec relations inter-IDs) → PHP factory côté backend, JSON dédié côté Cypress (les scénarios E2E ont souvent besoin de réponses différentes des scénarios unitaires)
- Pas de build supplémentaire, pas de symlink complexe

---

## Impact sur les deux plans existants

Si on retient l'option choisie, il faudrait ajuster :

1. **Plan backend** : `EntrepotFixtures` charge les JSON partagés via `FixtureLoader` pour les profils utilisateur, garde sa factory pour les entités API
2. **Plan frontend** : les fixtures `cypress/fixtures/users/` pointent vers `tests/fixtures/users/` (symlink ou copie)
3. **Nouveau** : un `tests/fixtures/` avec les JSON partagés + un `tests/Fixtures/FixtureLoader.php` helper
