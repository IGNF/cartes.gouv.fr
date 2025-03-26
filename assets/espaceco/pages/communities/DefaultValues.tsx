import WKT from "ol/format/WKT";
import Point from "ol/geom/Point";
import {
    CommunitiesLayers,
    DescriptionFormType,
    MembershipRequestType,
    ReportFormType,
    ToolsFormType,
    ZoomAndCenteringFormType,
} from "../../../@types/app_espaceco";
import { CommunityResponseDTO } from "../../../@types/espaceco";
import olDefaults from "../../../data/ol-defaults.json";
import { getDefaultStatuses } from "./management/reports/Utils";
import { allFunctionalities } from "./management/tools/Functionalities";

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

    return {
        position: p,
        zoom: community.zoom ?? olDefaults.zoom,
        minZoom: community.min_zoom ?? 5,
        maxZoom: community.max_zoom ?? 18,
        extent: community.extent,
    };
};

const getFunctionalities = (functionalities: string[]) => {
    return functionalities.filter((f) => allFunctionalities.includes(f));
};

const getToolsDefaultValues = (community: CommunityResponseDTO, editableLayers: CommunitiesLayers): ToolsFormType => {
    const layerTools = Object.values(editableLayers).reduce((accumulator, layers) => {
        const lays = Object.entries(layers).reduce((acc, [id, config]) => {
            acc[id] = config;
            return acc;
        }, {});
        accumulator = { ...accumulator, ...lays };
        return accumulator;
    }, {});

    return {
        functionalities: getFunctionalities(community.functionalities),
        layer_tools: layerTools,
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

export { getDescriptionDefaultValues, getReportsDefaultValues, getToolsDefaultValues, getZoomAndCenteringDefaultValues, getFunctionalities };
