/**
 * Factory pour créer des query keys pour react-query
 */
const RQKeys = {
    datastore_list: (): string[] => ["datastore"],
    datastore: (datastoreId: string): string[] => ["datastore", datastoreId],
    datastore_endpoints: (datastoreId: string): string[] => ["datastore", datastoreId, "endpoints"],

    datastore_upload: (datastoreId: string, uploadId: string): string[] => ["datastore", datastoreId, "upload", uploadId],
    datastore_upload_integration: (datastoreId: string, uploadId: string): string[] => ["datastore", datastoreId, "upload", uploadId, "integration"],
    datastore_upload_file_tree: (datastoreId: string, uploadId: string = "undefined"): string[] => ["datastore", datastoreId, "upload", uploadId, "file_tree"],

    datastore_stored_data: (datastoreId: string, storedDataId: string): string[] => ["datastore", datastoreId, "stored_data", storedDataId],

    datastore_datasheet_list: (datastoreId: string): string[] => ["datastore", datastoreId, "datasheet"],
    datastore_datasheet: (datastoreId: string, dataName: string): string[] => ["datastore", datastoreId, "datasheet", dataName],

    datastore_offerings: (datastoreId: string): string[] => ["datastore", datastoreId],
    datastore_offering: (datastoreId: string, offeringId: string): string[] => ["datastore", datastoreId, "offering", offeringId],
};

export default RQKeys;
