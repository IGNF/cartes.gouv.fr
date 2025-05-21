import { CommunityMember } from "@/@types/app_espaceco";

interface IUseSearchMembersResult {
    searchedItems: CommunityMember[];
}

export function useSearchMember(members: CommunityMember[], searchTerm): IUseSearchMembersResult {
    if (!searchTerm) {
        return {
            searchedItems: members,
        };
    }

    return {
        searchedItems: members.filter((m) => {
            return (
                m.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                m.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                m.surname?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }),
    };
}
