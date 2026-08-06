import { describe, expect, it } from "vitest";

import { CartesUser } from "@/@types/app";
import { CommunityMemberDto, CommunityMemberDtoRightsEnum } from "@/@types/entrepot";
import { findMembership, hasAccess, hasRights, isSupervisor } from "./user";

const USER_ID = "user-1";
const SUPERVISOR_ID = "supervisor-1";

function communityMember(): CommunityMemberDto {
    return {
        rights: [CommunityMemberDtoRightsEnum.UPLOAD],
        community: {
            _id: "community-1",
            datastore: "datastore-1",
            supervisor: SUPERVISOR_ID,
            name: "Communauté 1",
            technical_name: "communaute-1",
            creation: "",
            update: "",
        },
    } as CommunityMemberDto;
}

function user(members: CommunityMemberDto[]): CartesUser {
    return { id: USER_ID, communities_member: members } as CartesUser;
}

describe("findMembership", () => {
    const member = communityMember();

    it("retrouve l'appartenance par datastoreId", () => {
        expect(findMembership(user([member]), { datastoreId: "datastore-1" })).toBe(member);
    });

    it("retrouve l'appartenance par communityId", () => {
        expect(findMembership(user([member]), { communityId: "community-1" })).toBe(member);
    });

    it("retourne undefined si aucune correspondance", () => {
        expect(findMembership(user([member]), { datastoreId: "datastore-2" })).toBeUndefined();
        expect(findMembership(user([member]), { communityId: "community-2" })).toBeUndefined();
    });

    it("retourne undefined sans utilisateur ou sans critère", () => {
        expect(findMembership(null, { datastoreId: "datastore-1" })).toBeUndefined();
        expect(findMembership(undefined, { datastoreId: "datastore-1" })).toBeUndefined();
        expect(findMembership(user([member]), {})).toBeUndefined();
    });

    it("ignore les appartenances sans communauté et les communautés sans datastore", () => {
        const withoutCommunity = { rights: [] } as unknown as CommunityMemberDto;
        const noDatastore = communityMember();
        if (noDatastore.community) {
            noDatastore.community = { ...noDatastore.community, _id: "community-3", datastore: undefined as unknown as string };
        }
        expect(findMembership(user([withoutCommunity, noDatastore]), { datastoreId: "datastore-1" })).toBeUndefined();
        expect(findMembership(user([withoutCommunity, noDatastore]), { communityId: "community-3" })).toBe(noDatastore);
    });
});

describe("isSupervisor", () => {
    it("reconnaît le superviseur de la communauté", () => {
        expect(isSupervisor(SUPERVISOR_ID, communityMember())).toBe(true);
        expect(isSupervisor(USER_ID, communityMember())).toBe(false);
    });
});

describe("hasRights", () => {
    it("autorise quand aucun droit n'est requis (tableau vide)", () => {
        expect(hasRights(communityMember(), [])).toBe(true);
        const member = communityMember();
        member.rights = undefined;
        expect(hasRights(member, [])).toBe(true);
    });

    it("vérifie un droit unique", () => {
        expect(hasRights(communityMember(), [CommunityMemberDtoRightsEnum.UPLOAD])).toBe(true);
        expect(hasRights(communityMember(), [CommunityMemberDtoRightsEnum.COMMUNITY])).toBe(false);
    });

    it("exige TOUS les droits demandés", () => {
        const member = communityMember();
        member.rights = [CommunityMemberDtoRightsEnum.UPLOAD, CommunityMemberDtoRightsEnum.PROCESSING];
        expect(hasRights(member, [CommunityMemberDtoRightsEnum.UPLOAD, CommunityMemberDtoRightsEnum.PROCESSING])).toBe(true);
        expect(hasRights(member, [CommunityMemberDtoRightsEnum.UPLOAD, CommunityMemberDtoRightsEnum.COMMUNITY])).toBe(false);
    });

    it("refuse quand rights est absent", () => {
        const member = communityMember();
        member.rights = undefined;
        expect(hasRights(member, [CommunityMemberDtoRightsEnum.UPLOAD])).toBe(false);
    });

    it("ne fait PAS de bypass superviseur (c'est le rôle de hasAccess)", () => {
        const member = communityMember();
        if (member.community) member.community.supervisor = USER_ID;
        expect(hasRights(member, [CommunityMemberDtoRightsEnum.COMMUNITY])).toBe(false);
    });
});

describe("hasAccess", () => {
    const member = communityMember();

    it("refuse sans utilisateur ou sans appartenance", () => {
        expect(hasAccess(null, { datastoreId: "datastore-1" })).toBe(false);
        expect(hasAccess(user([member]), { datastoreId: "datastore-2" })).toBe(false);
    });

    it("autorise le membre, avec et sans droits requis", () => {
        expect(hasAccess(user([member]), { datastoreId: "datastore-1" })).toBe(true);
        expect(hasAccess(user([member]), { communityId: "community-1" }, [CommunityMemberDtoRightsEnum.UPLOAD])).toBe(true);
        expect(hasAccess(user([member]), { datastoreId: "datastore-1" }, [CommunityMemberDtoRightsEnum.COMMUNITY])).toBe(false);
    });

    it("autorise le superviseur quel que soit le droit demandé", () => {
        const supervised = communityMember();
        if (supervised.community) supervised.community.supervisor = USER_ID;
        expect(hasAccess(user([supervised]), { communityId: "community-1" }, [CommunityMemberDtoRightsEnum.COMMUNITY])).toBe(true);
    });
});
