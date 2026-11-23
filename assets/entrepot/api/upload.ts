import SymfonyRouting, { type QueryParams } from "../../modules/Routing";
import { apiFetch, jsonFetch } from "../../modules/jsonFetch";
import { DataDetailsUpload, Upload, UploadIntegration } from "../../@types/app";

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

const add = (datastoreId: string, data: object) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_upload_add", { datastoreId });
    // corps lu par #[MapRequestPayload] : il exige le type JSON
    return jsonFetch<Upload>(url, { method: "POST", headers: { "Content-Type": "application/json" } }, data);
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

const getDetails = (datastoreId: string, uploadId: string, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_upload_get_details", { datastoreId, uploadId });
    return jsonFetch<DataDetailsUpload>(url, { ...otherOptions });
};

const getCheckLogs = (datastoreId: string, uploadId: string, executionId: string, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_upload_get_check_logs", { datastoreId, uploadId, executionId });
    return jsonFetch<string[]>(url, { ...otherOptions });
};

const upload = {
    getList,
    add,
    getIntegration,
    advanceIntegration,
    remove,
    getDetails,
    getCheckLogs,
};

export default upload;
