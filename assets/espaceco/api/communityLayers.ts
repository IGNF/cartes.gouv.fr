import { CommunityLayer } from "../../@types/app_espaceco";
import { jsonFetch } from "../../modules/jsonFetch";
import SymfonyRouting from "../../modules/Routing";

const getFeatureTypes = (communityId: number, fields: string[], signal: AbortSignal) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_espaceco_community_layer_get_feature_types", {
        communityId,
        fields: fields,
    });
    return jsonFetch<CommunityLayer[]>(url, {
        signal: signal,
    });
};

const communityLayers = {
    getFeatureTypes,
};

export default communityLayers;
