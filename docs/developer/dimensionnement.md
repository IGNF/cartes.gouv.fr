# Dimensionnement des ressources (threads FrankenPHP, mémoire, probes)

Comment calculer les valeurs de `num_threads`/`max_threads`, la mémoire des pods et les réglages associés. La formule est le contrat ; le tableau d'exemples est une illustration datée.

## Anatomie mémoire d'un pod

La mémoire d'un pod se décompose en une base fixe partagée (indépendante du nombre de threads) et une part variable proportionnelle aux requêtes traitées simultanément.

**Base fixe** (valeurs de `.docker/php.ini`) :

| Poste                             | Taille     | Réglage                           |
| --------------------------------- | ---------- | --------------------------------- |
| opcache (code compilé, partagé)   | 192M       | `opcache.memory_consumption`      |
| opcache (chaînes internées)       | 16M        | `opcache.interned_strings_buffer` |
| APCu (cache app + system en prod) | 64M        | `apc.shm_size`                    |
| FrankenPHP / Caddy / runtime Go   | ~80M       | -                                 |
| **Total**                         | **~330Mi** |                                   |

**Part variable** : chaque requête en cours consomme de la mémoire dans son thread. `memory_limit` (256M) est un plafond de protection, pas un pic typique : une requête réelle consomme plutôt quelques dizaines de Mo (40 à 80M pour les plus lourdes). Un thread autoscalé inactif est désactivé et libère sa mémoire de requête.

**Mesurer plutôt qu'estimer** : `container_memory_working_set_bytes` dans Grafana (c'est la métrique que l'OOM killer regarde), `apcu_cache_info()` (`expunges` > 0 = shm trop petit), `opcache_get_status()` (taux d'occupation).

## Formule

```
mémoire pod ≥ base fixe + max_threads x pic réaliste par requête
```

Variante garde-fou absolu (aucun OOM possible, mais très surdimensionnée car elle suppose toutes les requêtes au plafond simultanément) :

```
mémoire pod ≥ base fixe + max_threads x memory_limit
```

Deux couplages non évidents à connaître :

1. **`num_threads` doit être épinglé dès que le pod n'a pas de limite CPU.** Le défaut FrankenPHP est 2 x CPU disponibles, et sans limite CPU (cgroup), « disponibles » = les coeurs du **noeud**, pas du pod : sur un noeud 16 coeurs, 32 threads, soit un pire cas mémoire sans rapport avec le pod. D'où `num_threads {$FRANKENPHP_NUM_THREADS:4}` dans `.docker/Caddyfile`.
2. **Des probes k8s sur un endpoint PHP transforment la saturation des threads en redémarrage.** Liveness et readiness pointent sur `/tableau-de-bord/health` (servi par PHP) avec les défauts k8s (`timeoutSeconds: 1`, `failureThreshold: 3`, `periodSeconds: 10`) : si tous les threads sont occupés ~30 s (appels lents vers l'API Entrepôt), la readiness sort le pod du service (reportant la charge sur l'autre replica) puis la liveness tue le conteneur avec ses requêtes en cours. C'est le rôle de `max_threads` (threads à la demande, désactivés après 5 s d'inactivité) : garder de la marge pour les probes sans provisionner en permanence. Recommandation côté chart : `timeoutSeconds: 5` sur les deux probes.

## Exemples (valeurs constatées au 21/08/2026)

Contexte : `memory_limit = 256M`, base fixe ~330Mi, pic réaliste 40 à 80M, prd = 2 replicas, requests = limits (QoS Guaranteed : dépassement = OOMKill), CPU 500m sans limite.

| num_threads | max_threads | Mémoire pod | Calcul                     | Remarque                                                                     |
| ----------- | ----------- | ----------- | -------------------------- | ---------------------------------------------------------------------------- |
| 4           | 4           | 768Mi       | 330 + 4 x 80 = 650Mi       | prd avant max_threads : correct, mais saturation = probes affamées           |
| 4           | 8           | 768Mi       | 330 + 8 x 55 ≈ 770Mi       | **recommandé** : l'élasticité absorbe les pics, occupation 8/8 brève et rare |
| 8           | 12          | 1Gi         | 330 + 12 x 55 ≈ 990Mi      | si Grafana montre une occupation soutenue > 4 threads                        |
| non épinglé | -           | quelconque  | 2 x coeurs du noeud x 256M | à ne jamais faire sans limite CPU (voir couplage n° 1)                       |

## Où vit chaque réglage

| Réglage                                 | Fichier                                        | Dépôt              |
| --------------------------------------- | ---------------------------------------------- | ------------------ |
| `memory_limit`, opcache, `apc.shm_size` | `.docker/php.ini` (embarqué dans l'image)      | cartes.gouv.fr     |
| Défauts `num_threads` / `max_threads`   | `.docker/Caddyfile`                            | cartes.gouv.fr     |
| `FRANKENPHP_NUM_THREADS` (par env)      | `charts/cartes/templates/config.yaml` + values | cartes-deploiement |
| `resources`, probes (par env)           | `config/ign-mut-{dev,qua,prd}/values.yaml`     | cartes-deploiement |

`FRANKENPHP_MAX_THREADS` n'est pas encore plombé dans le configmap du chart : le défaut du Caddyfile (8) s'applique partout ; ajouter l'entrée au chart si un réglage par environnement devient nécessaire.
