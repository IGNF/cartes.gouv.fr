const reactQueryKeys = {
    datastore_list: "datastore_list",
    datastore: (id) => `datastore_${id}`,
    datastore_dataList: (id) => `datastore_${id}_datalist`,
};

export default reactQueryKeys;
