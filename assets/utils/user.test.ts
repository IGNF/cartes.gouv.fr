import { describe, expect, it } from "vitest";

import { CommunityMemberDto, CommunityMemberDtoRightsEnum } from "@/@types/entrepot";
import { canUserAccess } from "./user";

const USER_ID = "user-1";
const SUPERVISOR_ID = "supervisor-1";

function communityMember(): CommunityMemberDto {
    return {
        rights: [CommunityMemberDtoRightsEnum.UPLOAD],
        community: { _id: "community-1", datastore: "datastore-1", supervisor: SUPERVISOR_ID },
    } as CommunityMemberDto;
}

describe("canUserAccess", () => {
    it("autorise le membre sans droit demandé", () => {
        expect(canUserAccess(USER_ID, communityMember())).toBe(true);
    });

    it("autorise quand le droit demandé est présent", () => {
        expect(canUserAccess(USER_ID, communityMember(), CommunityMemberDtoRightsEnum.UPLOAD)).toBe(true);
    });

    it("refuse quand un droit demandé manque", () => {
        expect(canUserAccess(USER_ID, communityMember(), CommunityMemberDtoRightsEnum.COMMUNITY)).toBe(false);
        expect(canUserAccess(USER_ID, communityMember(), [CommunityMemberDtoRightsEnum.UPLOAD, CommunityMemberDtoRightsEnum.COMMUNITY])).toBe(false);
    });

    it("autorise le superviseur même sans le droit demandé", () => {
        expect(canUserAccess(SUPERVISOR_ID, communityMember(), CommunityMemberDtoRightsEnum.COMMUNITY)).toBe(true);
    });
});
