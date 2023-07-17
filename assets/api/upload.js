import { jsonFetch } from "../modules/jsonFetch";

/**
 *
 * @param {string} datastoreId
 * @param {FormData|object} formData
 * @returns {Promise}
 */
const add = (datastoreId, formData) => {
    const url = Routing.generate("cartesgouvfr_api_upload_add", { datastoreId });
    return jsonFetch(url, {
        method: "POST",
        body: formData,
    });
};

/**
 *
 * @param {string} datastoreId
 * @param {string} uploadId
 * @returns {Promise}
 */
const getFileTree = (datastoreId, uploadId) => {
    const url = Routing.generate("cartesgouvfr_api_upload_get_file_tree", { datastoreId, uploadId });
    return jsonFetch(url);
};

/**
 *
 * @param {string} datastoreId
 * @param {string} uploadId
 * @param {RequestInit} otherOptions
 * @returns {Promise}
 */
const get = (datastoreId, uploadId, otherOptions = {}) => {
    const url = Routing.generate("cartesgouvfr_api_upload_get", { datastoreId, uploadId });
    return jsonFetch(url, {
        method: "GET",
        ...otherOptions,
    });
};

/**
 *
 * @param {string} datastoreId
 * @param {string} uploadId
 * @param {RequestInit} otherOptions
 * @returns {Promise}
 */
const getIntegrationProgress = (datastoreId, uploadId, otherOptions = {}) => {
    const url = Routing.generate("cartesgouvfr_api_upload_integration_progress", { datastoreId, uploadId, getOnlyProgress: true });
    return jsonFetch(url, {
        method: "GET",
        ...otherOptions,
    });
};

/**
 *
 * @param {string} datastoreId
 * @param {string} uploadId
 * @param {RequestInit} otherOptions
 * @returns {Promise}
 */
const pingIntegrationProgress = (datastoreId, uploadId, otherOptions = {}) => {
    const url = Routing.generate("cartesgouvfr_api_upload_integration_progress", { datastoreId, uploadId, getOnlyProgress: false });
    return jsonFetch(url, {
        method: "GET",
        ...otherOptions,
    });
};

export default {
    add,
    get,
    getIntegrationProgress,
    pingIntegrationProgress,
    getFileTree,
};
