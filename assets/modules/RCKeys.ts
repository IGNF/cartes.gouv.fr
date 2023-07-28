/**
 * Factory pour créer des query keys pour react-query
 */
const RCKeys = {
    datastore_list: ["datastore_list"],
    datastore: (datastoreId: string): string[] => [`datastore_${datastoreId}`],

    datastore_upload: (datastoreId: string, uploadId: string): string[] => [`datastore_${datastoreId}_upload_${uploadId}`],
    datastore_upload_integration: (datastoreId: string, uploadId: string): string[] => [`datastore_${datastoreId}_upload_${uploadId}_integration`],

    datastore_datasheet_list: (datastoreId: string): string[] => [`datastore_${datastoreId}_datasheet_list`],
    datastore_datasheet: (datastoreId: string, dataName: string): string[] => [`datastore_${datastoreId}_datasheet_${dataName}`],
};

export default RCKeys;
