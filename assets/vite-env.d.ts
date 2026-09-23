/// <reference types="vite/client" />
/// <reference types="vite/types/importMeta.d.ts" />

/** Version de l'image Docker fournie par la CI (ex. pr-1060-61ca0fe, 0.15.11), vide en build local */
declare const __APP_VERSION__: string;
/** Commit fourni par la CI, vide en build local */
declare const __APP_REVISION__: string;
/** Invalidation du cache react-query persisté : commit, ou horodatage du build en local */
declare const __CACHE_BUSTER__: string;
