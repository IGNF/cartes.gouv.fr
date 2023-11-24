import SymfonyRouting from "../modules/Routing";

import { jsonFetch } from "../modules/jsonFetch";
import { AnnexDetailResponseDto } from "../types/entrepot";

const addThumbnail = (datastoreId: string, data: object) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_annexe_thumbnail_add", { datastoreId });
    return jsonFetch<AnnexDetailResponseDto & { url: string }>(
        url,
        {
            method: "POST",
        },
        data,
        true
    );
};

const addCapabilities = (datastoreId: string, offeringId: string) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_annexe_capabilities_add", { datastoreId, offeringId });
    return jsonFetch<undefined>(url, { method: "GET" });
};

export default {
    addThumbnail,
    addCapabilities,
};
