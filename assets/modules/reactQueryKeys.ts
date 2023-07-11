const reactQueryKeys = {
    datastore_list: "datastore_list",
    datastore: (id: string): string => `datastore_${id}`,
    datastore_dataList: (id: string): string => `datastore_${id}_datalist`,
    datastore_dataList_detailed: (id: string): string => `datastore_${id}_datalist_detailed`,
};

export default reactQueryKeys;
