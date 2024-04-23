import SymfonyRouting from "../../modules/Routing";
import { jsonFetch } from "../../modules/jsonFetch";
import { Metadata } from "../../@types/app";

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

const getList = (datastoreId: string, queryParams: object = {}, otherOptions: RequestInit = {}) => {
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

const getFileContent = async (datastoreId: string, metadataId: string) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_metadata_get_file_content", { datastoreId, metadataId });

    const response = await fetch(url);
    return await response.text();
};

const remove = (datastoreId: string, metadataId: string) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_metadata_delete", { datastoreId, metadataId });
    return jsonFetch<null>(url, { method: "DELETE" });
};

const metadata = {
    add,
    getById,
    getByDatasheetName,
    getList,
    getFileContent,
    remove,
};

export default metadata;
