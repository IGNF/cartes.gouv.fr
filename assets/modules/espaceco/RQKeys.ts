import { CommunityListFilter } from "../../@types/app_espaceco";

const RQKeys = {
    community: (communityId: number): string[] => ["community", communityId.toString()],
    community_list: (page: number, limit: number): string[] => ["communities", page.toString(), limit.toString()],
    search: (search: string, filter: CommunityListFilter): string[] => {
        return ["search", "community", filter, search];
    },
    communities_as_member: (pending: boolean, page: number, limit: number): string[] => [
        "communities_as_member",
        new Boolean(pending).toString(),
        page.toString(),
        limit.toString(),
    ],
};

export default RQKeys;
