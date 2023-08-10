/**
 * Factory pour créer des query keys pour react-query
 */
const RCKeys = {
    datastore_list: ["datastore_list"],
    datastore: (datastoreId: string): string[] => [`datastore_${datastoreId}`],
    datastore_endpoints: (datastoreId: string): string[] => [`datastore_${datastoreId}_endpoints`],

    datastore_upload: (datastoreId: string, uploadId: string): string[] => [`datastore_${datastoreId}_upload_${uploadId}`],
    datastore_upload_integration: (datastoreId: string, uploadId: string): string[] => [`datastore_${datastoreId}_upload_${uploadId}_integration`],
    datastore_upload_file_tree: (datastoreId: string, uploadId: string = "undefined"): string[] => [`datastore_${datastoreId}_upload_${uploadId}_file_tree`],

    datastore_stored_data: (datastoreId: string, storedDataId: string): string[] => [`datastore_${datastoreId}_stored_data_${storedDataId}`],

    datastore_datasheet_list: (datastoreId: string): string[] => [`datastore_${datastoreId}_datasheet_list`],
    datastore_datasheet: (datastoreId: string, dataName: string): string[] => [`datastore_${datastoreId}_datasheet_${dataName}`],

    datastore_offering: (datastoreId: string, offeringId: string): string[] => [`datastore_${datastoreId}_offering_${offeringId}`],
};

export default RCKeys;
