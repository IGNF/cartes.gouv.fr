import { CommunityListFilter } from "../../@types/app_espaceco";

const RQKeys = {
    communityList: (page: number, limit: number): string[] => ["communities", page.toString(), limit.toString()],
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
    userSharedThemes: (): string[] => ["user", "shared_themes"],
    searchAddress: (search: string): string[] => ["searchAddress", search],
    searchGrids: (text: string): string[] => ["searchGrids", text],
    tables: (communityId: number): string[] => ["feature_types", communityId.toString()],
};

export default RQKeys;
