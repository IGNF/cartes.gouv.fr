import SymfonyRouting from "../modules/Routing";
import { jsonFetch } from "../modules/jsonFetch";
import { Upload, UploadTree, UploadType } from "../types/app";

const getList = (datastoreId: string, type?: UploadType, otherOptions: RequestInit = {}) => {
    const params = { datastoreId };
    if (type !== undefined) {
        params["type"] = type;
    }

    const url = SymfonyRouting.generate("cartesgouvfr_api_upload_get_list", params);
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

type IntegrationProgress = { integration_progress?: string; integration_current_step?: string };

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

const upload = {
    getList,
    add,
    get,
    getIntegrationProgress,
    pingIntegrationProgress,
    getFileTree,
};

export default upload;
