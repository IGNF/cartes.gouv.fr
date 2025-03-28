import { CommunityListFilter } from "../../@types/app_espaceco";

const RQKeys = {
    communityList: (page: number, limit: number): string[] => ["communities", page.toString(), limit.toString()],
    communities: (fields: string | null = null): string[] => {
        const key = ["all_communities"];
        if (fields) {
            key.push(fields);
        }
        return key;
    },
    communitiesName: (): string[] => ["communities_names"],
    community: (communityId: number): string[] => ["community", communityId.toString()],
    communityMembershipRequests: (communityId: number): string[] => ["community", "members", "pending", communityId.toString()],
    communityMembers: (communityId: number, page: number, limit: number): string[] => [
        "community",
        "members",
        communityId.toString(),
        page.toString(),
        limit.toString(),
    ],
    searchCommunities: (search: string, filter: CommunityListFilter): string[] => {
        return ["searchCommunities", filter, search];
    },
    communitiesAsMember: (pending: boolean, page: number, limit: number): string[] => [
        "communities_as_member",
        new Boolean(pending).toString(),
        page.toString(),
        limit.toString(),
    ],
    communityDocuments: (communityId?: number): string[] => ["community", "documents", communityId ? communityId.toString() : ""],
    communityLayers: (communityId: number): string[] => ["community", "layers", communityId.toString()],
    userSharedThemes: (): string[] => ["user", "shared_themes"],
    searchAddress: (search: string): string[] => ["searchAddress", search],
    searchGrids: (text: string): string[] => ["searchGrids", text],
    getMe: (): string[] => ["espaceco", "users", "me"],
    searchUsers: (text: string): string[] => ["searchUsers", text],
    databases: (databaseIds: number[]) => ["databases", databaseIds.map((id) => id.toString()).join(",")],
    permissions: (communityId: number) => ["permissions", communityId.toString()],
    permissionsOnDB: (communityId: number, databaseIds: number[]) => ["permissions", communityId.toString(), databaseIds.map((id) => id.toString()).join(",")],
    tables: (communityId: number): string[] => ["feature_types", communityId.toString()],
    emailPlanners: (communityId: number): string[] => ["emailplanners", communityId.toString()],
};

export default RQKeys;
