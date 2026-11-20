import { ProcessingExecution } from "@/@types/app";
import { jsonFetch } from "@/modules/jsonFetch";
import SymfonyRouting, { type QueryParams } from "@/modules/Routing";

// exécutions de traitements
const getExecutionList = (datastoreId: string, queryParams: QueryParams = {}, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_processing_execution_get_list", { datastoreId, ...queryParams });
    return jsonFetch<ProcessingExecution[]>(url, {
        ...otherOptions,
    });
};

export default {
    // exécutions de traitements
    getExecutionList,
};
