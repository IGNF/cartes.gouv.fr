import SymfonyRouting, { type QueryParams } from "../../modules/Routing";
import { apiFetch, jsonFetch } from "../../modules/jsonFetch";
import { UploadReport } from "../../@types/app";
import { Upload, UploadIntegration, UploadTree } from "../../@types/app";

const getList = async (datastoreId: string, query: QueryParams = {}, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_upload_get_list", { datastoreId, ...query });
    const res = await apiFetch(url, {
        ...otherOptions,
    });

    return {
        data: (await res.json()) as Upload[],
        headers: res.headers,
    };
};

const getAll = async (datastoreId: string, query: QueryParams = {}, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_upload_get_list", { datastoreId, all: true, ...query });
    return jsonFetch<Upload[]>(url, {
        ...otherOptions,
    });
};

const add = (datastoreId: string, data: object) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_upload_add", { datastoreId });
    // corps lu par #[MapRequestPayload] : il exige le type JSON
    return jsonFetch<Upload>(url, { method: "POST", headers: { "Content-Type": "application/json" } }, data);
};

const getFileTree = (datastoreId: string, uploadId: string) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_upload_get_file_tree", { datastoreId, uploadId });
    return jsonFetch<UploadTree>(url);
};

const get = (datastoreId: string, uploadId: string, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_upload_get", { datastoreId, uploadId });
    return jsonFetch<Upload>(url, {
        method: "GET",
        ...otherOptions,
    });
};

const getIntegration = (datastoreId: string, uploadId: string, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_upload_integration", { datastoreId, uploadId });
    return jsonFetch<UploadIntegration>(url, { ...otherOptions });
};

/** exécute la prochaine action de l’intégration (envoi des fichiers, lancement du traitement, suppression de la livraison) */
const advanceIntegration = (datastoreId: string, uploadId: string) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_upload_integration_advance", { datastoreId, uploadId });
    return jsonFetch<UploadIntegration>(url, { method: "POST" });
};

const remove = (datastoreId: string, uploadId: string) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_upload_delete", { datastoreId, uploadId });
    return jsonFetch<null>(url, { method: "DELETE" });
};

const getUploadReport = (datastoreId: string, uploadId: string, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_upload_get_upload_report", { datastoreId, uploadId });
    return jsonFetch<UploadReport>(url, {
        ...otherOptions,
    });
};

const upload = {
    getList,
    getAll,
    add,
    get,
    getIntegration,
    advanceIntegration,
    getFileTree,
    remove,
    getUploadReport,
};

export default upload;
