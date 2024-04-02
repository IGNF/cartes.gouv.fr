import SymfonyRouting from "../modules/Routing";
import { jsonFetch } from "../modules/jsonFetch";

const add = (datastoreId: string, body: object, queryParams: object = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_metadata_add", { datastoreId, ...queryParams });
    return jsonFetch(
        url,
        {
            method: "POST",
        },
        body
    );
};

const remove = (datastoreId: string, metadataId: string) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_metadata_delete", { datastoreId, metadataId });
    return jsonFetch<null>(url, { method: "DELETE" });
};

const metadata = {
    add,
    remove,
};

export default metadata;
