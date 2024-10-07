import { CommunityListFilter } from "../../@types/app_espaceco";

const RQKeys = {
    user_shared_themes: (): string[] => ["user", "shared_themes"],
    community: (communityId: number): string[] => ["community", communityId.toString()],
    community_list: (page: number, limit: number): string[] => ["communities", page.toString(), limit.toString()],
    searchCommunities: (search: string, filter: CommunityListFilter): string[] => {
        return ["searchCommunities", filter, search];
    },
    communities_as_member: (pending: boolean, page: number, limit: number): string[] => [
        "communities_as_member",
        new Boolean(pending).toString(),
        page.toString(),
        limit.toString(),
    ],
    searchAddress: (search: string): string[] => ["searchAddress", search],
    searchGrids: (text: string): string[] => ["searchGrids", text],
    tables: (communityId: number): string[] => ["feature_types", communityId.toString()],
};

export default RQKeys;
