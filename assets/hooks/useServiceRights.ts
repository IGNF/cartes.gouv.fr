import { CommunityMemberDtoRightsEnum } from "@/@types/entrepot";
import useCommunityRights from "./useCommunityRights";

/** droits sur les flux de l’entrepôt courant, mêmes règles que les routes serveur */
const useServiceRights = () => {
    const { userRights, isSupervisor } = useCommunityRights();
    const hasRight = (right: CommunityMemberDtoRightsEnum) => isSupervisor || !!userRights?.includes(right);
    const canBroadcast = hasRight(CommunityMemberDtoRightsEnum.BROADCAST);

    return {
        canBroadcast,
        // publication, modification et styles déposent des fichiers en annexes
        canEdit: canBroadcast && hasRight(CommunityMemberDtoRightsEnum.ANNEX),
        // la pyramide raster dépose aussi une légende en annexe
        canGeneratePyramid: (kind: "vector" | "raster") =>
            hasRight(CommunityMemberDtoRightsEnum.PROCESSING) && (kind === "vector" || hasRight(CommunityMemberDtoRightsEnum.ANNEX)),
    };
};

export default useServiceRights;
