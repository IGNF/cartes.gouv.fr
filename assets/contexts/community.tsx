import { createContext, ReactNode, useContext } from "react";
import { CommunityDetailResponseDto } from "../@types/entrepot";

export const communityContext = createContext<CommunityDetailResponseDto | null>(null);

export function useCommunity() {
    const community = useContext(communityContext);
    if (!community) {
        throw new Error("useCommunity must be used within a CommunityProvider");
    }
    return community;
}

export function CommunityProvider({ children, community }: { children: ReactNode; community: CommunityDetailResponseDto }) {
    return <communityContext.Provider value={community}>{children}</communityContext.Provider>;
}
