import { ProcessingExecution } from "@/@types/app";
import { ProcessingListResponseDto } from "@/@types/entrepot";
import { jsonFetch } from "@/modules/jsonFetch";
import SymfonyRouting from "@/modules/Routing";

const getList = (datastoreId: string, queryParams: object = {}, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_processing_get_list", { datastoreId, ...queryParams });
    return jsonFetch<ProcessingListResponseDto[]>(url, {
        ...otherOptions,
    });
};

// exécutions de traitements
const getExecutionList = (datastoreId: string, queryParams: object = {}, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_processing_execution_get_list", { datastoreId, ...queryParams });
    return jsonFetch<ProcessingExecution[]>(url, {
        ...otherOptions,
    });
};

export default {
    getList,
    // exécutions de traitements
    getExecutionList,
};
