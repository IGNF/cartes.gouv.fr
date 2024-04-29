/**
 * Factory pour créer des query keys pour react-query
 */
const RQKeys = {
    datastore_list: (): string[] => ["datastore"],
    datastore: (datastoreId: string): string[] => ["datastore", datastoreId],
    datastore_endpoints: (datastoreId: string): string[] => ["datastore", datastoreId, "endpoints"],
    datastore_permissions: (datastoreId: string): string[] => ["datastore", datastoreId, "permissions"],
    datastore_permission: (datastoreId: string, permissionId: string): string[] => ["datastore", datastoreId, "permission", permissionId],

    datastore_upload_list: (datastoreId: string): string[] => ["datastore", datastoreId, "upload"],
    datastore_upload: (datastoreId: string, uploadId: string): string[] => ["datastore", datastoreId, "upload", uploadId],
    datastore_upload_integration: (datastoreId: string, uploadId: string): string[] => ["datastore", datastoreId, "upload", uploadId, "integration"],
    datastore_upload_file_tree: (datastoreId: string, uploadId: string = "undefined"): string[] => ["datastore", datastoreId, "upload", uploadId, "file_tree"],

    datastore_stored_data_list: (datastoreId: string): string[] => ["datastore", datastoreId, "stored_data"],
    datastore_stored_data_list_with_type: (datastoreId: string, type: string): string[] => ["datastore", datastoreId, "stored_data", "type", type],
    datastore_stored_data: (datastoreId: string, storedDataId: string): string[] => ["datastore", datastoreId, "stored_data", storedDataId],
    datastore_stored_data_uses: (datastoreId: string, storedDataId: string): string[] => ["datastore", datastoreId, "stored_data", storedDataId, "uses"],
    datastore_stored_data_report: (datastoreId: string, storedDataId: string): string[] => ["datastore", datastoreId, "stored_data", storedDataId, "report"],

    datastore_datasheet_list: (datastoreId: string): string[] => ["datastore", datastoreId, "datasheet"],
    datastore_datasheet: (datastoreId: string, dataName: string): string[] => ["datastore", datastoreId, "datasheet", dataName],
    datastore_datasheet_service_list: (datastoreId: string, dataName: string) => ["datastore", datastoreId, "datasheet", dataName, "services"],

    datastore_offering_list: (datastoreId: string): string[] => ["datastore", datastoreId, "offering"],
    datastore_offering: (datastoreId: string, offeringId: string): string[] => ["datastore", datastoreId, "offering", offeringId],

    datastore_annexe_list: (datastoreId: string): string[] => ["datastore", datastoreId, "annexe"],

    datastore_metadata_list: (datastoreId: string): string[] => ["datastore", datastoreId, "metadata"],
    datastore_metadata_by_datasheet_name: (datastoreId: string, datasheetName: string): string[] => [
        "datastore",
        datastoreId,
        "metadata",
        "datasheet",
        datasheetName,
    ],
    datastore_metadata_by_id: (datastoreId: string, metadataId: string): string[] => ["datastore", datastoreId, "metadata", metadataId],

    datastore_statics_list: (datastoreId: string): string[] => ["datastore", datastoreId, "statics"],

    catalogs_communities: (): string[] => ["catalogs", "communities"],

    my_keys: (): string[] => ["my_keys"],
    my_key: (keyId: string): string[] => ["my_key", keyId],
    my_permissions: (): string[] => ["my_permissions"],
};

export default RQKeys;
