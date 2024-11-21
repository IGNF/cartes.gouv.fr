import { DocumentDTO } from "../../@types/espaceco";
import { jsonFetch } from "../../modules/jsonFetch";
import SymfonyRouting from "../../modules/Routing";

const getAll = (communityId: number, fields: string[], signal: AbortSignal) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_espaceco_community_document_get_all", {
        communityId,
        fields: fields,
    });
    return jsonFetch<DocumentDTO[]>(url, {
        signal: signal,
    });
};

const add = (communityId: number, data: FormData) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_espaceco_community_document_add", { communityId });
    return jsonFetch<DocumentDTO>(
        url,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        },
        data,
        true
    );
};

const update = (communityId: number, documentId: number, data: object) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_espaceco_community_document_update", { communityId, documentId });
    return jsonFetch<DocumentDTO>(
        url,
        {
            method: "PATCH",
        },
        data
    );
};

const remove = (communityId: number, documentId: number) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_espaceco_community_document_delete", { communityId, documentId });
    return jsonFetch<DocumentDTO>(url, {
        method: "DELETE",
    });
};

const communityDocuments = {
    getAll,
    add,
    update,
    remove,
};

export default communityDocuments;
