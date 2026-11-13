import SymfonyRouting, { type QueryParams } from "../../modules/Routing";
import { type ApiError, apiFetch, jsonFetch } from "../../modules/jsonFetch";
import { Metadata } from "../../@types/app";

// false seulement si l’identifiant est pris (409) : toute autre erreur ne bloque pas, la création revérifie
const isFileIdentifierAvailable = async (datastoreId: string, fileIdentifier: string): Promise<boolean> => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_metadata_check_file_identifier_availability", { datastoreId, file_identifier: fileIdentifier });
    try {
        await apiFetch(url, { method: "HEAD" });
        return true;
    } catch (error) {
        return (error as ApiError).status !== 409;
    }
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

const remove = (datastoreId: string, metadataId: string) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_metadata_delete", { datastoreId, metadataId });
    return jsonFetch<null>(url, { method: "DELETE" });
};

// shortcut: débogage (« Voir XML publié »), à retirer avant la fusion dans main
const getFileContent = async (datastoreId: string, metadataId: string): Promise<string> => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_metadata_get_file_content", { datastoreId, metadataId });
    const response = await apiFetch(url);
    return response.text();
};

const metadata = {
    isFileIdentifierAvailable,
    getFileContent,
    getById,
    getByDatasheetName,
    getList,
    remove,
};

export default metadata;
