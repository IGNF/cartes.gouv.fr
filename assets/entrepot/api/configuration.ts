import { jsonFetch } from "@/modules/jsonFetch";
import SymfonyRouting from "@/modules/Routing";

// configuration sans offre : l’API refuse (409) une configuration encore publiée
const remove = (datastoreId: string, configurationId: string) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_configuration_delete", { datastoreId, configurationId });
    return jsonFetch<null>(url, { method: "DELETE" });
};

const configuration = { remove };

export default configuration;
