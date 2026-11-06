# Routage (TanStack Router)

Le front utilise [TanStack Router](https://tanstack.com/router) en routage par fichiers. Ce document décrit les conventions du dépôt.

## Arbre des routes

- Les routes vivent dans `assets/routes/`. Les noms de fichiers reprennent les URL, donc en français (`mes-cles/$keyId.modification.tsx`).
- Le plugin Vite (`vite.config.ts`) génère `assets/routeTree.gen.ts` à chaque `npm run dev` et `vite build`. Le fichier est commité, car la CI vérifie les types sans lancer Vite. Il est ignoré par oxlint et prettier.
- Un dossier préfixé par `_` est un layout sans segment d’URL :
    - `_public` : pages accessibles sans connexion (`staticData.public`).
    - `_private` : pages connectées. Son `beforeLoad` redirige vers la connexion Keycloak, en navigation pleine page, si `user_me` est absent du cache.
    - `_private/_panneau` : panneau « Mes entrepôts » (sélection, demande de création, rejoindre une communauté).
    - `.../$datastoreId/_onglets` et `.../$communityId/_onglets` : panneau, nom de l’entrepôt et onglets. Ils restent montés quand on change d’onglet.
- Le chemin de base de l’installation vient de `basePath` (`assets/env.ts`), passé à `createRouter` dans `assets/router/index.tsx`.

## Accès aux ressources

- Les layouts `.../entrepots/$datastoreId/route.tsx` et `.../communaute/$communityId/route.tsx` décident dans `beforeLoad`, sans requête, à partir de l’appartenance lue dans `user_me` (`findMembership`).
- Sans appartenance, la route lève `notFound()` : une ressource inaccessible et une ressource inexistante donnent la même page 404. Avant ce refus, `revalidateUser()` relance une fois `user_me` (au plus toutes les 30 s).
- Une feuille qui exige des droits les déclare dans `staticData.requiredRights` (tous requis). `ResourceAccessGate` et les layouts d’onglets les lisent avec `useRequiredRights()` et affichent `Forbidden` sans les droits. Le superviseur de la communauté a tous les droits.
- Toute nouvelle valeur de `user_me` (reconnexion, revalidation) relance les `beforeLoad` par `router.invalidate()` (abonnement dans `assets/router/index.tsx`). Une erreur 403 ou 404 d’une requête relance `user_me` (`assets/modules/queryClient.ts`).

## Chargement des données

- Les options d’une requête partagée vivent dans `assets/hooks/queries/xxxQueryOptions.ts` (`queryOptions` de react-query : clé, fonction, `staleTime`, `throwOnError`). Le `loader` de la route et la page importent les mêmes options.
- Le `loader` lance la requête sans l’attendre : `void context.queryClient.query(options).catch(() => {})`. La navigation ne bloque pas. Une erreur reste dans le cache et la page la lève au rendu. `prefetchQuery`, `fetchQuery` et `ensureQueryData` sont dépréciés.
- Le nom, les ids, le superviseur et les droits d’un entrepôt ou d’une communauté viennent de l’appartenance (`useMembership`), sans requête. Le nom de l’entrepôt est celui de sa communauté.
- Seules les pages qui lisent le DTO complet l’attendent, avec `useSuspenseQuery` (consommation, formulaires de service, fiche communauté). Pendant l’attente, `defaultPendingComponent` occupe la zone de la page ; l’en-tête et les onglets restent affichés.
- Une erreur levée sous un entrepôt ou une communauté arrive à `ApiErrorPage` : page 404 pour un 404, sinon erreur générique avec bouton « Réessayer ».
- Le client de requêtes ne réessaie pas une erreur 4xx et réessaie au plus 3 fois les autres (`assets/modules/queryClient.ts`).

## Paramètres de recherche

- Chaque route valide sa recherche dans `validateSearch`, avec les fonctions de `assets/router/searchParams.ts` (entiers, entiers positifs, listes autorisées, paramètres requis).
- Un paramètre requis absent lève une erreur que le routeur enveloppe dans `SearchParamError`. Les `errorComponent` de la racine et des sous-arbres la rendent en page 404.
- Une page lit sa recherche par `getRouteApi("<id de route>").useSearch()`, sans importer son fichier de route. Une page rendue sous plusieurs routes lit `useSearch({ strict: false })`.

## Liens et navigation

- `AppLink` (`assets/router/AppLink.tsx`) est le lien enregistré auprès de react-dsfr. Les composants DSFR acceptent donc `linkProps={{ to, params, search }}`. Sans `to`, il rend une ancre native (liens externes, `href`).
- `AppLink` marque actif le lien exact, sans tenir compte de la recherche. Les liens de pagination passent `searchAwareActiveOptions`.
- La navigation impérative passe par `useNavigate()`.

## Métadonnées de route (`staticData`)

| Clé              | Rôle                                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------- |
| `requiredRights` | droits exigés sur la communauté                                                                         |
| `public`         | layout des pages sans connexion (badge, alerte de session expirée)                                      |
| `matomoLabel`    | titre de la page vue Matomo, obligatoire sur chaque feuille (test `assets/router/matomoLabels.test.ts`) |

## Attente, erreurs, découpage

- `autoCodeSplitting` met le composant de chaque route dans son propre chunk. Les layouts `_public` et `_private` et la page d’accueil restent dans le bundle principal (`codeSplitGroupings: []`).
- Les layouts `_public` et `_private` ont un `pendingComponent` avec en-tête et pied de page. Une feuille en attente de son chunk affiche `defaultPendingComponent` dans la zone de son layout.
- Préchargement à l’intention : au survol d’un lien pendant 200 ms, le routeur charge le chunk et exécute `beforeLoad`.
- Outils de développement : `assets/devtools.tsx` regroupe les panneaux Query et Router, chargés seulement en développement.
