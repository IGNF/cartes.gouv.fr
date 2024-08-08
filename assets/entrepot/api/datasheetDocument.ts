import { DatasheetDocument } from "../../@types/app";
import { jsonFetch } from "../../modules/jsonFetch";
import SymfonyRouting from "../../modules/Routing";

const getList = (datastoreId: string, datasheetName: string, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_datasheet_document_get_list", { datastoreId, datasheetName });
    return jsonFetch<DatasheetDocument[]>(url, {
        ...otherOptions,
    });
};

const add = (datastoreId: string, datasheetName: string, formData: FormData | object) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_datasheet_document_add", { datastoreId, datasheetName });
    return jsonFetch<DatasheetDocument[]>(
        url,
        {
            method: "POST",
        },
        formData,
        true,
        true
    );
};

const edit = (datastoreId: string, datasheetName: string, documentId: string, formData: FormData | object) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_datasheet_document_edit", { datastoreId, datasheetName, documentId });
    return jsonFetch<DatasheetDocument[]>(
        url,
        {
            method: "PATCH",
        },
        formData
    );
};

const remove = (datastoreId: string, datasheetName: string, documentId: string) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_datasheet_document_delete", { datastoreId, datasheetName, documentId });
    return jsonFetch(url, {
        method: "DELETE",
    });
};

const datasheet = {
    getList,
    add,
    edit,
    remove,
};

export default datasheet;
