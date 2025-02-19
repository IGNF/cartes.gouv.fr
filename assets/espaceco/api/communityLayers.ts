import { CommunityFeatureTypeLayer } from "@/@types/app_espaceco";
import { jsonFetch } from "../../modules/jsonFetch";
import SymfonyRouting from "../../modules/Routing";

const getFeatureTypes = (communityId: number, signal: AbortSignal) => {
    const fields = ["id", "database", "table", "role", "tools", "ref_tools"];
    const url = SymfonyRouting.generate("cartesgouvfr_api_espaceco_community_layer_get_feature_types", {
        communityId,
        fields: fields,
    });
    return jsonFetch<Record<string, CommunityFeatureTypeLayer[]>>(url, {
        signal: signal,
    });
};

const communityLayers = {
    getFeatureTypes,
};

export default communityLayers;
