# Glossaire

Termes du projet dont le sens n’est pas évident à la lecture du code. Les mécanismes sont décrits dans les documents pointés.

**Appartenance (membership)** : lien entre un utilisateur et une communauté, avec ses droits (`communities_member[]` dans la réponse `GET users/me` de l’Entrepôt). C’est la source unique de la jointure utilisateur ↔ communauté ↔ datastore, côté backend (`MembershipService`, `User::findMembership*`) comme côté frontend (`assets/utils/membership.ts`).

**Dérivation vs autorisation** : les infos datastore/communauté (nom, `technical_name`, id de communauté) sont _dérivées_ de l’appartenance au lieu d’être rechargées via l’API ; ce n’est pas un contrôle d’accès. L’_autorisation_ reste du ressort de l’API Entrepôt, qui refuse elle-même les appels non permis.

**Snapshot utilisateur** : réponse `GET users/me` mise en cache serveur (60 s) par identifiant Keycloak, dont est reconstruit l’objet `User` à chaque requête. Voir [Authentification](./auth/README.md).

**Grant-path** : chemin « l’utilisateur vient d’obtenir un accès » (rejoint une communauté, ajout au bac à sable). Le snapshot doit être invalidé ou rafraîchi pour que la dérivation voie la nouvelle appartenance sans attendre l’expiration du cache.

**Deny-path** : chemin « l’appartenance n’est pas trouvée ». Avant de conclure, une revalidation forcée mais limitée (au plus une par 10 s) du snapshot est tentée : l’appartenance a pu être accordée depuis moins de 60 s.

**Revoke-path** : chemin « l’utilisateur vient de perdre un accès ». Volontairement non traité côté backend : l’API Entrepôt fait autorité et les champs dérivés sont sans risque pendant le délai d’expiration.

**Bac à sable (sandbox)** : communauté de découverte, identifiée par `SANDBOX_COMMUNITY_ID`, que tout utilisateur peut rejoindre en autonomie via le compte de service (`ServiceAccount`). Seul cas de grant self-service de l’application.

**Site MIXED** : appel d’API dont la suppression ne ferait rien gagner, parce que la même requête recharge de toute façon la même ressource par un autre chemin (par exemple un DTO datastore rechargé via `getEndpoint*`). Laissé tel quel, par choix.

**Compte de service** : client Entrepôt authentifié en `client_credentials` (et non avec le token de l’utilisateur), utilisé pour les actions que l’utilisateur ne peut pas faire lui-même, comme s’ajouter au bac à sable.
