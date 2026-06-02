import { DocumentDTO } from "@/@types/espaceco";
import { createContext, ReactNode, use, useMemo } from "react";

export const DocumentsContext = createContext<{ communityId: number; documents: DocumentDTO[] }>({
    communityId: 0,
    documents: [],
});

export function useDocuments() {
    return use(DocumentsContext);
}

interface IDocumentsProviderProps {
    children: ReactNode;
    communityId: number;
    documents: DocumentDTO[];
}

export function DocumentsProvider(props: IDocumentsProviderProps) {
    const { children, communityId, documents } = props;
    const context = useMemo(() => ({ communityId, documents }), [communityId, documents]);
    return <DocumentsContext value={context}>{children}</DocumentsContext>;
}
