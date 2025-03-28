import { DatabaseResponseDTO } from "@/@types/espaceco";
import { jsonFetch } from "@/modules/jsonFetch";
import SymfonyRouting from "@/modules/Routing";

const get = (databaseIds: number[], signal: AbortSignal) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_espaceco_databases_get", { dbIds: databaseIds });
    return jsonFetch<DatabaseResponseDTO[]>(url, {
        signal: signal,
    });
};

const database = {
    get,
};

export default database;
