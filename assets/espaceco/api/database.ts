import { DatabaseDetailedResponseDTO, DatabaseResponseDTO, TableDetailedDTO } from "@/@types/espaceco";
import { jsonFetch } from "@/modules/jsonFetch";
import SymfonyRouting from "@/modules/Routing";

const getAll = (fields: string[], signal: AbortSignal) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_espaceco_databases_get_all", { fields: fields });
    return jsonFetch<DatabaseResponseDTO[]>(url, {
        signal: signal,
    });
};

const get = (databaseId: number, fields: string[], signal: AbortSignal) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_espaceco_databases_get", { databaseId, fields: fields });
    return jsonFetch<DatabaseDetailedResponseDTO>(url, {
        signal: signal,
    });
};

const searchBy = (field: string, value: string, fields: string[], signal: AbortSignal) => {
    const queryParams = { field: field, value: `%${value}%`, sort: `${field}:ASC`, fields: fields };
    const url = SymfonyRouting.generate("cartesgouvfr_api_espaceco_databases_search_by", queryParams);
    return jsonFetch<DatabaseResponseDTO[]>(url, {
        signal: signal,
    });
};

const getTable = (databaseId: number, tableId: number, fields: string[], signal: AbortSignal) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_espaceco_databases_get_table", { databaseId, tableId, fields: fields });
    return jsonFetch<TableDetailedDTO>(url, {
        signal: signal,
    });
};

const database = {
    get: get,
    getAll: getAll,
    searchBy,
    getTable,
};

export default database;
