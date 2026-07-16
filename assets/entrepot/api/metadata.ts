import { Metadata } from "../../@types/app";
import SymfonyRouting, { type QueryParams } from "../../modules/Routing";
import { apiFetch, jsonFetch } from "../../modules/jsonFetch";

const add = (datastoreId: string, body: object, queryParams: QueryParams = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_metadata_add", { datastoreId, ...queryParams });
    return jsonFetch(
        url,
        {
            method: "POST",
        },
        body
    );
};

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

const getFileContent = (datastoreId: string, metadataId: string) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_metadata_get_file_content", { datastoreId, metadataId });

    return apiFetch(url);
};

const checkFileIdentifierAvailability = async (datastoreId: string, fileIdentifier: string, signal?: AbortSignal) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_metadata_check_file_identifier_availability", { datastoreId, file_identifier: fileIdentifier });
    try {
        const response = await apiFetch(url, { method: "HEAD", signal });
        return response.ok;
    } catch {
        return false;
    }
};

const remove = (datastoreId: string, metadataId: string) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_metadata_delete", { datastoreId, metadataId });
    return jsonFetch<null>(url, { method: "DELETE" });
};

const publish = (datastoreId: string, metadataId: string) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_metadata_publish", { datastoreId, metadataId });
    return jsonFetch<null>(url, { method: "POST" });
};

const unpublish = (datastoreId: string, metadataId: string) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_metadata_unpublish", { datastoreId, metadataId });
    return jsonFetch<null>(url, { method: "DELETE" });
};

const metadata = {
    add,
    getById,
    getByDatasheetName,
    getList,
    getFileContent,
    checkFileIdentifierAvailability,
    remove,
    publish,
    unpublish,
};

export default metadata;
