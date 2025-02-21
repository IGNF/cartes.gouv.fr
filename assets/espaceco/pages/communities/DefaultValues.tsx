import WKT from "ol/format/WKT";
import Point from "ol/geom/Point";
import {
    DescriptionFormType,
    MembershipRequestType,
    PartialCommunityFeatureTypeLayer,
    ReportFormType,
    ToolsFormType,
    ZoomAndCenteringFormType,
} from "../../../@types/app_espaceco";
import { CommunityResponseDTO } from "../../../@types/espaceco";
import olDefaults from "../../../data/ol-defaults.json";
import { getDefaultStatuses } from "./management/reports/Utils";
import { allFunctionalities } from "./management/tools/Functionalities";
import { getAvailableRefTools, getLayerTools } from "./management/tools/LayerTools";

const getDescriptionDefaultValues = (community: CommunityResponseDTO): DescriptionFormType => {
    const values: Partial<DescriptionFormType> = {
        name: community.name || "",
        description: community.description ?? "",
        editorial: community.editorial ?? "",
        keywords: community.keywords ?? [],
        logo: null,
        listed: community.listed ?? true,
        openWithEmail: community.open_with_email ?? [],
    };

    let membershipRequest: MembershipRequestType | undefined;
    if (community.open_with_email !== null) {
        membershipRequest = "partially_open";
    } else membershipRequest = community.open_without_affiliation === true ? "open" : "not_open";
    values["membershipRequest"] = membershipRequest;

    return values as DescriptionFormType;
};

const getZoomAndCenteringDefaultValues = (community: CommunityResponseDTO): ZoomAndCenteringFormType => {
    let p;
    if (community.position) {
        const feature = new WKT().readFeature(community.position, {
            dataProjection: "EPSG:4326",
        });
        p = feature.getGeometry() ? (feature.getGeometry() as Point).getCoordinates() : olDefaults.center;
    } else p = olDefaults.center;

    const values = {
        position: p,
        zoom: community.zoom ?? olDefaults.zoom,
        minZoom: community.min_zoom ?? 5,
        maxZoom: community.max_zoom ?? 18,
        extent: community.extent,
    };

    return values;
};

const getToolsDefaultValues = (
    community: CommunityResponseDTO,
    editableLayers: Record<string, Record<number, PartialCommunityFeatureTypeLayer>>
): ToolsFormType => {
    const functionalities = community.functionalities;

    const layerTools = getLayerTools(editableLayers);
    const refTools = {};
    for (const layers of Object.values(editableLayers)) {
        for (const [id, config] of Object.entries(layers)) {
            const availableRefTools = getAvailableRefTools(config.geometry_type);
            if (!availableRefTools.length) {
                continue;
            }

            const emptyTools = availableRefTools.reduce((acc, tool) => {
                acc[tool] = [];
                return acc;
            }, {});

            const tools = Array.isArray(config.ref_tools) ? {} : config.ref_tools;
            refTools[id] = Object.keys(tools).length === 0 ? emptyTools : config.ref_tools;
        }
    }

    return {
        functionalities: functionalities.filter((f) => allFunctionalities.includes(f)),
        layer_tools: layerTools,
        ref_tools: refTools,
    };
};

const getReportsDefaultValues = (community: CommunityResponseDTO): ReportFormType => {
    return {
        report_statuses: community.report_statuses ?? getDefaultStatuses(),
        shared_georem: community.shared_georem,
        all_members_can_valid: community.all_members_can_valid,
        attributes: community.attributes,
    };
};

export { getDescriptionDefaultValues, getReportsDefaultValues, getToolsDefaultValues, getZoomAndCenteringDefaultValues };
