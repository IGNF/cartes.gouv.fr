import { DocumentDTO } from "@/@types/espaceco";
import { createContext, ReactNode, useContext, useMemo } from "react";

export const documentsContext = createContext<{ communityId: number; documents: DocumentDTO[] }>({
    communityId: 0,
    documents: [],
});

export function useDocuments() {
    return useContext(documentsContext);
}

interface IDocumentsProviderProps {
    children: ReactNode;
    communityId: number;
    documents: DocumentDTO[];
}

export function DocumentsProvider(props: IDocumentsProviderProps) {
    const { children, communityId, documents } = props;
    const context = useMemo(() => ({ communityId, documents }), [communityId, documents]);
    return <documentsContext.Provider value={context}>{children}</documentsContext.Provider>;
}
