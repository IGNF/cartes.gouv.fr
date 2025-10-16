import { CommunityListFilter } from "../../@types/app_espaceco";

const RQKeys = {
    communityList: (queryParams: Record<string, unknown> = {}): string[] => ["communities", JSON.stringify(queryParams)],
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
    communityMembers: (communityId: number): string[] => ["community", "members", communityId.toString()],
    searchCommunities: (search: string, filter: CommunityListFilter): string[] => {
        return ["searchCommunities", filter, search];
    },
    communitiesAsMember: (queryParams: Record<string, unknown> = {}): string[] => ["communities_as_member", JSON.stringify(queryParams)],
    communityDocuments: (communityId?: number): string[] => ["community", "documents", communityId ? communityId.toString() : ""],
    communityLayers: (communityId: number): string[] => ["community", "layers", communityId.toString()],
    userSharedThemes: (): string[] => ["user", "shared_themes"],
    searchAddress: (search: string, filters: Record<string, unknown>): string[] => ["searchAddress", search, JSON.stringify(filters)],
    searchGrids: (text: string, filters: Record<string, unknown>): string[] => ["searchGrids", text, JSON.stringify(filters)],
    getMe: (): string[] => ["espaceco", "users", "me"],
    searchUsers: (text: string): string[] => ["searchUsers", text],
    databases: (fields: string[]) => ["databases", fields.join(",")],
    database: (databaseId: number) => ["databases", databaseId.toString()],
    table: (databaseId: number, tableId: number) => ["databases", databaseId.toString(), tableId.toString()],
    searchDatabases: (field: string, search: string, fields: string[]): string[] => ["searchDatabases", field, search, fields.join(",")],
    permissions: (communityId: number) => ["permissions", communityId.toString()],
    viewableTables: (communityId: number) => ["permissions", "viewableTables", communityId.toString()],
    permissionsOnDB: (communityId: number, databaseIds: number[]) => ["permissions", communityId.toString(), databaseIds.map((id) => id.toString()).join(",")],
    tables: (communityId: number): string[] => ["feature_types", communityId.toString()],
    emailPlanners: (communityId: number): string[] => ["emailplanners", communityId.toString()],
};

export default RQKeys;
