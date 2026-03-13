import SymfonyRouting from "../../modules/Routing";
import { apiFetch, jsonFetch } from "../../modules/jsonFetch";
import { UploadReport } from "../../@types/app";
import { Upload, UploadTree } from "../../@types/app";

const getList = async (datastoreId: string, query: object = {}, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_upload_get_list", { datastoreId, ...query });
    const res = await apiFetch(url, {
        ...otherOptions,
    });

    return {
        data: (await res.json()) as Upload[],
        headers: res.headers,
    };
};

const getAll = async (datastoreId: string, query: object = {}, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_upload_get_list", { datastoreId, all: true, ...query });
    return jsonFetch<Upload[]>(url, {
        ...otherOptions,
    });
};

const add = (datastoreId: string, data: object) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_upload_add", { datastoreId });
    return jsonFetch<Upload>(
        url,
        {
            method: "POST",
        },
        data
    );
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

type IntegrationProgress = { integration_progress?: string; integration_current_step?: string; upload?: Upload };

const getIntegrationProgress = (datastoreId: string, uploadId: string, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_upload_integration_progress", { datastoreId, uploadId, getOnlyProgress: true });
    return jsonFetch<IntegrationProgress>(url, {
        method: "GET",
        ...otherOptions,
    });
};

const pingIntegrationProgress = (datastoreId: string, uploadId: string, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_upload_integration_progress", { datastoreId, uploadId, getOnlyProgress: false });
    return jsonFetch<IntegrationProgress>(url, {
        method: "GET",
        ...otherOptions,
    });
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
    getIntegrationProgress,
    pingIntegrationProgress,
    getFileTree,
    remove,
    getUploadReport,
};

export default upload;
