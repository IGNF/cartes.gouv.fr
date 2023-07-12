const reactQueryKeys = {
    datastore_list: "datastore_list",
    datastore: (datastoreId: string): string => `datastore_${datastoreId}`,
    datastore_upload_integration: (datastoreId: string, uploadId: string): string => `datastore_${datastoreId}_upload_${uploadId}_integration`,
    datastore_dataList: (datastoreId: string): string => `datastore_${datastoreId}_datalist`,
    datastore_dataList_detailed: (datastoreId: string): string => `datastore_${datastoreId}_datalist_detailed`,
    datastore_data: (datastoreId: string, dataName: string): string => `datastore_${datastoreId}_data_${dataName}`,
};

export default reactQueryKeys;
