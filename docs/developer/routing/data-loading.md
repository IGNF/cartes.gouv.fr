# Routing — chargement des données

Contrat entre les routes (TanStack Router), React Query et les pages. Principe directeur : **light-first** — la décision d'autorisation est synchrone, l'en-tête, le menu latéral et le fil d'Ariane se rendent immédiatement, seule la donnée strictement nécessaire retarde le contenu d'une page.

## Arbre de décision

Pour **chaque donnée** dont une route ou une page a besoin, la classer dans une des quatre catégories :

| Catégorie       | Définition                                                                                                                                                        | Mécanisme                                                                                        | Attente / erreur affichées par                                                                          |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| **Gate**        | Autorisation : de quoi décider redirect / 404 / Forbidden. `user_me.communities_member` suffit presque toujours.                                                  | `beforeLoad` **synchrone** (lecture du cache), `throw redirect()` / `notFound()`                 | Rien à attendre ; pages d'erreur dédiées (`PageNotFound`, `Forbidden`)                                  |
| **Requise**     | La page n'a aucun sens sans elle : le datastore d'un formulaire de service, la fiche de données de sa page de détail, la clé d'accès de son formulaire d'édition… | `prefetchQuery` **non attendu** dans le `loader` de la feuille + `useSuspenseQuery` dans la page | `pendingComponent` / `errorComponent` de la route                                                       |
| **Optionnelle** | La page se rend autour d'elle : métadonnée dont l'absence est un état normal, compteurs d'onglets, widgets de consommation…                                       | `useQuery` + branchement local                                                                   | Indicateur local (`LoadingText as="p"`, `LoadingIcon`, `Skeleton`) + `Alert` locale                     |
| **Mutation**    | Résultat d'une action utilisateur                                                                                                                                 | `useMutation`                                                                                    | `Wait` + `LoadingText` pour `isPending`, `Alert` locale pour l'erreur — le router n'est jamais impliqué |

Test rapide requise/optionnelle : _« si cette requête échoue, la page doit-elle exister ? »_ Non → requise (l'échec devient une page d'erreur). Oui → optionnelle (l'échec est une `Alert` dans la page).

## Recettes

### Gate

Références : [`$datastoreId/route.tsx`](../../../assets/routes/_private/tableau-de-bord/entrepots/$datastoreId/route.tsx) (gate d'appartenance, `beforeLoad`), [`_private/route.tsx`](../../../assets/routes/_private/route.tsx) (gate d'authentification).

- Lecture synchrone du cache (`context.queryClient.getQueryData(RQKeys.user_me())` + `findMembership`), **aucun fetch** : `user_me` est bootstrappé dans le DOM.
- Appartenance absente → `revalidateUser()` (une revalidation throttlée) puis `throw notFound()` (miroir-404 : inexistant et inaccessible sont indistinguables).
- Membre sans droit suffisant → `Forbidden`, rendu par le layout via `useMatches()` + `staticData.requiredRights` (les feuilles déclarent leurs droits, `beforeLoad` n'y a pas accès).
- `return { membership }` fournit l'appartenance au sous-arbre via le contexte de route typé.
- Exception assumée : le sous-arbre espaceco a un gate **async** (`await ensureQueryData` en `beforeLoad`, [`espace-collaboratif/route.tsx`](../../../assets/routes/_private/espace-collaboratif/route.tsx)) car son `getMe` n'est pas bootstrappé.

### Donnée requise

Références : [`$datastoreId/route.tsx`](../../../assets/routes/_private/tableau-de-bord/entrepots/$datastoreId/route.tsx) (loader), [`datastoreQueryOptions.ts`](../../../assets/entrepot/hooks/queries/datastoreQueryOptions.ts) (factory), [`DatasheetList.tsx`](../../../assets/entrepot/pages/datasheet/DatasheetList/DatasheetList.tsx) et [`WfsServiceForm.tsx`](../../../assets/entrepot/pages/service/wfs/WfsServiceForm.tsx) (consommation).

```tsx
// route (layout ou feuille) : préchauffage, ne bloque JAMAIS la navigation
loader: ({ context, params }) => {
    void context.queryClient.prefetchQuery(datastoreQueryOptions(params.datastoreId));
},
```

```tsx
// page : le vrai contrat de données
const { data: datastore } = useSuspenseQuery(datastoreSuspenseQueryOptions(datastoreId));
```

- Le loader n'est qu'un préchauffage : **React Query reste la source de vérité** (cache persisté en localStorage, `staleTime`, coutures de revalidation). Ne jamais `await ensureQueryData` dans un loader — cela bloquerait la navigation (régression light-first) et déplacerait la vérité hors du cache.
- Factory d'options en deux variantes (cf. `datastoreQueryOptions.ts`) : une avec `enabled` pour `useQuery`, une stricte pour `useSuspenseQuery`.
- La suspension remonte au `pendingComponent` le plus proche, l'erreur à l'`errorComponent` le plus proche : la page n'écrit **aucun** branchement isLoading/isError pour cette donnée.
- Les enfants reçoivent `data` en prop, jamais un `UseQueryResult`.

### Donnée optionnelle

Références : [`MetadataTab.tsx`](../../../assets/entrepot/pages/datasheet/DatasheetView/MetadataTab/MetadataTab.tsx) (dont 404 sémantique), [`AnnexeUsage.tsx`](../../../assets/entrepot/pages/datastore/ManageStorage/storages/AnnexeUsage.tsx) (widget de consommation), [`DatasheetView.tsx`](../../../assets/entrepot/pages/datasheet/DatasheetView/DatasheetView/DatasheetView.tsx) (page progressive : plusieurs requêtes en parallèle autour d'un rendu immédiat).

- `useQuery` classique, la page se rend sans attendre ; indicateur local pendant `isLoading`, `LoadingIcon` discret pendant `isFetching` (rafraîchissement en arrière-plan).
- **Toute requête optionnelle a une branche d'erreur visible** (`Alert severity="error"`). Une requête sans branche d'erreur est un bug (état vide éternel).
- 404 sémantique (ex. métadonnée absente = état normal) : à traiter localement, jamais via suspense/errorComponent.

### Mutation

Références : suppression dans [`DatasheetView.tsx`](../../../assets/entrepot/pages/datasheet/DatasheetView/DatasheetView/DatasheetView.tsx), superpositions `Wait` dans [`EmailPlanners.tsx`](../../../assets/espaceco/pages/communities/management/reports/EmailPlanners.tsx).

- `isPending` → superposition `Wait` + `LoadingText` ; erreur → `Alert` locale (ou snackbar pour un succès).
- Le router n'affiche rien pour une mutation : ne pas chercher à utiliser pending/errorComponent ici.

## Attente (pending)

- La suspension d'une donnée requise est affichée par le `pendingComponent` le plus proche, sinon `defaultPendingComponent` ([`router/index.tsx`](../../../assets/router/index.tsx)).
- Les layouts [`_private`](../../../assets/routes/_private/route.tsx)/[`_public`](../../../assets/routes/_public/route.tsx) fournissent un pending avec en-tête et pied de page ; une feuille ne définit un `pendingComponent` que pour proposer mieux (ex. `Skeleton` de liste).
- Seuils : défauts TanStack non surchargés à ce jour (`defaultPendingMs` 1000 ms avant affichage, `defaultPendingMinMs` 500 ms d'affichage minimum — évite le flash).
- Préchargement à l'intention (`defaultPreload: "intent"`, délai 200 ms) : au survol/touch d'un lien, le router charge le chunk et exécute `beforeLoad` + `loader`. Coût nul en régime permanent (les loaders sont des `prefetchQuery` qui respectent le `staleTime` react-query ; `defaultPreloadStaleTime: 0` laisse react-query décider de la fraîcheur). Un preload ne suit jamais un redirect `reloadDocument` et ses résultats ne sont pas réutilisés par la navigation réelle.

## Erreurs

Partitions de référence : `DatastoreErrorComponent` dans [`$datastoreId/route.tsx`](../../../assets/routes/_private/tableau-de-bord/entrepots/$datastoreId/route.tsx) (sous-arbre), `RootErrorComponent` dans [`__root.tsx`](../../../assets/routes/__root.tsx) (racine).

- `SearchParamError` (échec de `validateSearch`) → rendu 404. Piège : cette erreur n'atteint jamais `notFoundComponent`, tout sous-arbre qui définit son propre `errorComponent` doit la re-mapper.
- `CartesApiException.code === 404` → `PageNotFound` (miroir-404).
- Toute autre erreur → `UnexpectedError` avec retry = `useQueryErrorResetBoundary().reset()` + `router.invalidate()` (le reset est indispensable, sinon la query en erreur re-suspend sans refetch).
- Répartition : échec d'une donnée **requise** → `errorComponent` de route ; échec d'une donnée **optionnelle** ou d'une **mutation** → `Alert` locale.

## Anti-patterns

- `await ensureQueryData` dans un `loader` (bloque la navigation, casse light-first).
- Plusieurs `useSuspenseQuery` empilés dans un même composant : les fetchs deviennent **séquentiels** → `useSuspenseQueries`, ou reclasser en optionnelle.
- Convertir en suspense les requêtes secondaires d'une page progressive (ex. [`DatasheetView.tsx`](../../../assets/entrepot/pages/datasheet/DatasheetView/DatasheetView/DatasheetView.tsx) : l'en-tête et les onglets se rendent pendant que les requêtes arrivent — c'est voulu).
- Passer un `UseQueryResult` en prop à un enfant.
- Requête sans branche d'erreur visible.
- Charger le DTO complet datastore/community pour une page qui n'a besoin que de l'appartenance (`membership` du contexte de route suffit pour les boutons gated, le titre, la navigation).

## Décisions ouvertes

- Surcharge éventuelle des seuils pending (valeurs par défaut jamais choisies explicitement).
- Pages historiques non converties : leur 404 s'affiche encore en `Alert` inline au lieu de la page 404 (changement de comportement à valider page par page lors de la conversion).
