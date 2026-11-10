import SymfonyRouting, { type QueryParams } from "../../modules/Routing";
import { jsonFetch } from "../../modules/jsonFetch";
import { Metadata } from "../../@types/app";

const getList = (datastoreId: string, queryParams: QueryParams = {}, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_metadata_get_list", { datastoreId, ...queryParams });
    return jsonFetch<Omit<Metadata, "csw_metadata">[]>(url, {
        method: "GET",
        ...otherOptions,
    });
};

const getById = (datastoreId: string, metadataId: string, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_metadata_get", { datastoreId, metadataId });
    return jsonFetch<Metadata>(url, {
        method: "GET",
        ...otherOptions,
    });
};

const getByDatasheetName = (datastoreId: string, datasheetName: string, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_metadata_get_by_datasheet_name", { datastoreId, datasheetName });
    return jsonFetch<Metadata>(url, {
        method: "GET",
        ...otherOptions,
    });
};

const remove = (datastoreId: string, metadataId: string) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_metadata_delete", { datastoreId, metadataId });
    return jsonFetch<null>(url, { method: "DELETE" });
};

const metadata = {
    getById,
    getByDatasheetName,
    getList,
    remove,
};

export default metadata;
