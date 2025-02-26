import { CommunityFeatureTypeLayer } from "@/@types/app_espaceco";
import { jsonFetch } from "../../modules/jsonFetch";
import SymfonyRouting from "../../modules/Routing";
import { LayerTools, RefLayerTools } from "@/@types/espaceco";

const fields = ["id", "database", "table", "role", "tools", "ref_tools"];

const getFeatureTypes = (communityId: number, signal: AbortSignal) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_espaceco_community_layer_get_feature_types", {
        communityId,
        fields: fields,
    });
    return jsonFetch<Record<string, CommunityFeatureTypeLayer[]>>(url, {
        signal: signal,
    });
};

const update = (communityId: number, layerTools: Record<number, { tools: LayerTools[]; ref_tools: Record<RefLayerTools, number[]> }>) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_espaceco_community_layer_update", { communityId });
    return jsonFetch<Record<string, CommunityFeatureTypeLayer[]>>(
        url,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        },
        {
            layer_tools: layerTools,
            fields: fields,
        }
    );
};

const communityLayers = {
    getFeatureTypes,
    update,
};

export default communityLayers;
