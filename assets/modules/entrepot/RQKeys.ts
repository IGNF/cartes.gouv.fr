import { ConfigurationTypeEnum, OfferingTypeEnum } from "../../@types/app";

/**
 * Factory pour créer des query keys pour react-query
 */
const RQKeys = {
    datastore_list: (): string[] => ["datastore"],
    datastore: (datastoreId: string): string[] => ["datastore", datastoreId],
    datastore_endpoints: (datastoreId: string): string[] => ["datastore", datastoreId, "endpoints"],
    datastore_permissions: (datastoreId: string): string[] => ["datastore", datastoreId, "permissions"],
    datastore_permission_offering: (datastoreId: string, offeringId: string): string[] => ["datastore", datastoreId, "permissions", "offering", offeringId],
    datastore_permission: (datastoreId: string, permissionId: string): string[] => ["datastore", datastoreId, "permission", permissionId],

    datastore_upload_list: (datastoreId: string): string[] => ["datastore", datastoreId, "upload"],
    datastore_upload: (datastoreId: string, uploadId: string): string[] => ["datastore", datastoreId, "upload", uploadId],
    datastore_upload_integration: (datastoreId: string, uploadId: string): string[] => ["datastore", datastoreId, "upload", uploadId, "integration"],
    datastore_upload_file_tree: (datastoreId: string, uploadId: string = "undefined"): string[] => ["datastore", datastoreId, "upload", uploadId, "file_tree"],
    datastore_upload_report: (datastoreId: string, uploadId: string): string[] => ["datastore", datastoreId, "upload", uploadId, "report"],

    datastore_stored_data_list: (datastoreId: string): string[] => ["datastore", datastoreId, "stored_data"],
    datastore_stored_data_list_with_type: (datastoreId: string, type: string): string[] => ["datastore", datastoreId, "stored_data", "type", type],
    datastore_stored_data: (datastoreId: string, storedDataId: string): string[] => ["datastore", datastoreId, "stored_data", storedDataId],
    datastore_stored_data_uses: (datastoreId: string, storedDataId: string): string[] => ["datastore", datastoreId, "stored_data", storedDataId, "uses"],
    datastore_stored_data_report: (datastoreId: string, storedDataId: string): string[] => ["datastore", datastoreId, "stored_data", storedDataId, "report"],

    datastore_processing_execution_list: (datastoreId: string, queryParams: object | null = null): string[] => {
        const keys = ["datastore", datastoreId, "processing", "executions"];
        if (queryParams) keys.push(JSON.stringify(queryParams));
        return keys;
    },

    datastore_datasheet_list: (datastoreId: string): string[] => ["datastore", datastoreId, "datasheet"],
    datastore_datasheet: (datastoreId: string, datasheetName: string): string[] => ["datastore", datastoreId, "datasheet", datasheetName],
    datastore_datasheet_metadata: (datastoreId: string, datasheetName: string): string[] => ["datastore", datastoreId, "datasheet", datasheetName, "metadata"],
    datastore_datasheet_service_list: (datastoreId: string, datasheetName: string) => ["datastore", datastoreId, "datasheet", datasheetName, "services"],

    datastore_offering_list: (datastoreId: string): string[] => ["datastore", datastoreId, "offering"],
    datastore_layernames_list: (datastoreId: string, configurationType: ConfigurationTypeEnum | OfferingTypeEnum): string[] => [
        "datastore",
        datastoreId,
        "layernames",
        configurationType,
    ],

    datastore_datasheet_documents_list: (datastoreId: string, datasheetName: string) => ["datastore", datastoreId, "datasheet", datasheetName, "documents"],

    datastore_offering: (datastoreId: string, offeringId: string): string[] => ["datastore", datastoreId, "offering", offeringId],

    datastore_annexe_list: (datastoreId: string): string[] => ["datastore", datastoreId, "annexe"],
    datastore_annexe: (datastoreId: string, annexeId: string): string[] => ["datastore", datastoreId, "annexe", annexeId],

    datastore_metadata_list: (datastoreId: string): string[] => ["datastore", datastoreId, "metadata"],
    datastore_metadata_by_id: (datastoreId: string, metadataId: string): string[] => ["datastore", datastoreId, "metadata", metadataId],

    datastore_statics_list: (datastoreId: string, query?: unknown): string[] => ["datastore", datastoreId, "statics", JSON.stringify(query)],
    datastore_statics_download: (datastoreId: string, fileId: string): string[] => ["datastore", datastoreId, "statics", fileId, "download"],

    community: (communityId: string): string[] => ["community", communityId],
    community_members: (communityId: string): string[] => ["community", communityId, "members"],

    catalogs_communities: (): string[] => ["catalogs", "communities"],
    catalogs_communities_join_schema: (techName: string): string[] => ["catalogs", "communities", techName, "schema"],
    catalogs_organizations: (): string[] => ["catalogs", "organizations"],

    user_me: (): string[] => ["user", "me"],
    my_keys: (): string[] => ["user", "me", "keys"],
    my_key: (keyId: string): string[] => ["user", "me", "keys", keyId],
    my_permissions: (): string[] => ["user", "me", "permissions"],
    get_permission: (permissionId: string): string[] => ["user", "me", "permissions", permissionId],
    my_documents: (query?: unknown): string[] => ["user", "me", "documents", JSON.stringify(query)],
    my_document: (documentId: string): string[] => ["user", "me", "documents", documentId],

    accesses_request: (fileIdentifier: string): string[] => ["accesses_request", fileIdentifier],

    alerts: (): string[] => ["alerts"],
};

export default RQKeys;
