import SymfonyRouting from "../modules/Routing";
import { jsonFetch } from "../modules/jsonFetch";
import { DatasheetThumbnailAnnexe } from "../types/app";

const addThumbnail = (datastoreId: string, data: object) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_annexe_thumbnail_add", { datastoreId });
    return jsonFetch<DatasheetThumbnailAnnexe>(
        url,
        {
            method: "POST",
        },
        data,
        true
    );
};

const removeThumbnail = (datastoreId: string, annexeId: string) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_annexe_thumbnail_remove", { datastoreId, annexeId });
    return jsonFetch<null>(url, { method: "DELETE" });
};

const addCapabilities = (datastoreId: string, offeringId: string) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_annexe_capabilities_add", { datastoreId, offeringId });
    return jsonFetch<undefined>(url, { method: "GET" });
};

export default {
    addThumbnail,
    removeThumbnail,
    addCapabilities,
};
