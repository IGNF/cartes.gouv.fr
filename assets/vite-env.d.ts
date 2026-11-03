/// <reference types="vite/client" />
/// <reference types="vite/types/importMeta.d.ts" />

interface ImportMetaEnv {
    /** Chemin de base de l’installation (APP_BASE_PATH), vide à la racine */
    readonly APP_BASE_PATH?: string;
    /** Version de l’image Docker fournie par la CI (ex. pr-1060-61ca0fe, 0.15.11), vide en build local */
    readonly APP_VERSION?: string;
    /** Commit fourni par la CI, vide en build local */
    readonly APP_REVISION?: string;
    /** Invalidation du cache react-query persisté : commit, ou horodatage du build en local */
    readonly APP_CACHE_BUSTER?: string;
}
