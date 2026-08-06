import { CartesUser } from "@/@types/app";
import { CommunityMemberDto, CommunityMemberDtoRightsEnum } from "@/@types/entrepot";

/** Désigne une communauté, directement ou via son datastore */
export type CommunityRef = { datastoreId: string; communityId?: never } | { communityId: string; datastoreId?: never };

/**
 * Retrouve l'appartenance de l'utilisateur à une communauté, par datastore ou par communauté.
 * Source de vérité unique pour la jointure user ↔ communauté/datastore.
 */
export function findMembership(user: CartesUser | null | undefined, criteria: { datastoreId?: string; communityId?: string }): CommunityMemberDto | undefined {
    const { datastoreId, communityId } = criteria;
    if (!user?.communities_member || (datastoreId === undefined && communityId === undefined)) {
        return undefined;
    }
    return user.communities_member.find((member) => {
        if (!member.community) return false;
        if (datastoreId !== undefined) return member.community.datastore === datastoreId;
        return member.community._id === communityId;
    });
}

/** true si l'utilisateur est le superviseur de la communauté */
export function isSupervisor(userId: string, membership: CommunityMemberDto): boolean {
    return membership.community?.supervisor === userId;
}

/** true si l'appartenance porte TOUS les droits demandés (tableau vide : aucun droit requis) */
export function hasRights(membership: CommunityMemberDto, requiredRights: CommunityMemberDtoRightsEnum[]): boolean {
    return requiredRights.every((right) => membership.rights?.includes(right) === true);
}

/**
 * Règle d'accès complète : appartenance (par datastore ou communauté), puis superviseur ou droits requis.
 */
export function hasAccess(user: CartesUser | null | undefined, ref: CommunityRef, requiredRights: CommunityMemberDtoRightsEnum[] = []): boolean {
    if (!user?.id) {
        return false;
    }
    const membership = findMembership(user, ref);
    if (!membership) {
        return false;
    }
    return isSupervisor(user.id, membership) || hasRights(membership, requiredRights);
}
