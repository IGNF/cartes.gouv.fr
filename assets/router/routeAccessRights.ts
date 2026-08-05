import { CommunityMemberDtoRightsEnum } from "../@types/entrepot";
import { routes } from "./router";

type RouteName = keyof typeof routes;

/**
 * Droits requis par route, en plus de l'appartenance à la communauté (sémantique : TOUS les droits listés).
 * Une route absente de cette matrice n'exige que l'appartenance.
 * TODO produit : compléter pour les routes datastore (permissions, consommation...).
 */
const routeAccessRights: Partial<Record<RouteName, CommunityMemberDtoRightsEnum[]>> = {
    members_list: [CommunityMemberDtoRightsEnum.COMMUNITY],
};

export default routeAccessRights;
