import { createContext, ReactNode, use } from "react";
import { CommunityDetailResponseDto } from "../@types/entrepot";

export const CommunityContext = createContext<CommunityDetailResponseDto | null>(null);

export function useCommunity() {
    const community = use(CommunityContext);
    if (!community) {
        throw new Error("useCommunity must be used within a CommunityProvider");
    }
    return community;
}

export function CommunityProvider({ children, community }: { children: ReactNode; community: CommunityDetailResponseDto }) {
    return <CommunityContext value={community}>{children}</CommunityContext>;
}
