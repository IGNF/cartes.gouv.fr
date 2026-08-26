import { describe, expect, it } from "vitest";

import { CartesUser } from "@/@types/app";
import { CommunityMemberDto, CommunityMemberDtoRightsEnum } from "@/@types/entrepot";
import { findMembership, isSandboxCommunity } from "./membership";

const USER_ID = "user-1";

function communityMember(): CommunityMemberDto {
    return {
        rights: [CommunityMemberDtoRightsEnum.UPLOAD],
        community: {
            _id: "community-1",
            datastore: "datastore-1",
            supervisor: "supervisor-1",
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

    it("retrouve l’appartenance par datastoreId", () => {
        expect(findMembership(user([member]), { datastoreId: "datastore-1" })).toBe(member);
    });

    it("retrouve l’appartenance par communityId", () => {
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

describe("isSandboxCommunity", () => {
    it("reconnaît la communauté bac à sable par son id", () => {
        expect(isSandboxCommunity(communityMember().community, "community-1")).toBe(true);
        expect(isSandboxCommunity(communityMember().community, "community-2")).toBe(false);
    });

    it("jamais bac à sable sans id configuré ou sans communauté", () => {
        expect(isSandboxCommunity(communityMember().community, null)).toBe(false);
        expect(isSandboxCommunity(undefined, "community-1")).toBe(false);
    });
});
