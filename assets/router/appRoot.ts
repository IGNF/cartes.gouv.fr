import SymfonyRouting from "../modules/Routing";

// Préfixe d'URL de l'app (vide en dev), extrait de router.ts pour survivre à la suppression de type-route
export const appRoot = SymfonyRouting.getBaseUrl();
