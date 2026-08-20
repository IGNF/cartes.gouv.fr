# Logs applicatifs et corrélation

Le dashboard Grafana/Loki de la plateforme affiche les lignes brutes (pas de parsing LogQL) et la recherche se fait par sous-chaîne. Le collecteur du cluster enveloppe chaque ligne dans un JSON qui échappe les guillemets : une ligne de log n'est donc lisible et cherchable que si ses informations sont des tokens plats sans guillemets.

## Ligne d'accès applicative (canal monolog `access`)

`AccessLogSubscriber` (kernel.terminate, donc après envoi de la réponse) émet une ligne logfmt par requête traitée par Symfony :

```
method=GET path=/api/datastores/190b.../metadata/arbres status=200 duration_ms=226 route=cartesgouvfr_api_metadata_get request_id=38aa3379... user=fc5a7948-...
```

- Chaque token se cherche tel quel dans le dashboard : `status=500`, un chemin, un request_id, un user.
- `duration_ms` est mesuré depuis `REQUEST_TIME_FLOAT` (temps PHP).
- `route` et `user` sont omis quand ils n'existent pas (404, requête anonyme).
- En prod, le handler `access` sort le message brut sur stdout ; les autres handlers excluent le canal pour éviter la double sortie. Les requêtes servies par Caddy sans PHP (fichiers statiques, redirections héritées, TRACE) restent loggées par l'access log Caddy (voir `.docker/Caddyfile`), qui saute les requêtes dynamiques (`log_skip`).
- Limite assumée : une requête qui tue le process PHP (fatal dur, OOM) n'a pas de ligne d'accès, seule la trace stderr subsiste.

## Corrélation par request_id

`RequestIdProcessor` ajoute `extra.request_id` à tous les enregistrements monolog : l'id vient du header `X-Request-Id` posé par l'ingress (aussi présent dans l'access log Caddy), ou est généré (UUID v7) hors ingress. Coller un request_id dans la recherche du dashboard remonte la ligne d'accès et tous les logs applicatifs de la requête.

## Données personnelles

Finalité : sécurité et diagnostic (traçabilité par compte attendue par les recommandations CNIL/ANSSI de journalisation). Minimisation appliquée :

| Champ        | Contenu                                    | Minimisation                                                                                 |
| ------------ | ------------------------------------------ | -------------------------------------------------------------------------------------------- |
| `user`       | UUID technique du compte (`User::getId()`) | jamais l'email, le username ni le nom                                                        |
| `path`       | URI brute                                  | sans query string (risque de données personnelles dans les paramètres)                       |
| `request_id` | aléatoire par requête                      | ne relie pas l'activité entre requêtes                                                       |
| adresse IP   | absente                                    | l'IP reste uniquement dans l'access log Caddy (statiques/redirections), comme historiquement |

Ne jamais logger d'objet utilisateur, d'email ou de token dans le `context` d'un log applicatif.
