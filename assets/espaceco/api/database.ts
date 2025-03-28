import { DatabaseResponseDTO } from "@/@types/espaceco";
import { jsonFetch } from "@/modules/jsonFetch";
import SymfonyRouting from "@/modules/Routing";

const getAll = (signal: AbortSignal) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_espaceco_databases_get_all");
    return jsonFetch<DatabaseResponseDTO[]>(url, {
        signal: signal,
    });
};

const database = {
    getAll,
};

export default database;
