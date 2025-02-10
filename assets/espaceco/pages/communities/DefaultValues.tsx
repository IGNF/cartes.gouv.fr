import WKT from "ol/format/WKT";
import Point from "ol/geom/Point";
import { DescriptionFormType, MembershipRequestType, ReportFormType, ToolsFormType, ZoomAndCenteringFormType } from "../../../@types/app_espaceco";
import { CommunityResponseDTO } from "../../../@types/espaceco";
import olDefaults from "../../../data/ol-defaults.json";
import { COMMUNITY_FORM_STEPS } from "./FormSteps";
import { getDefaultStatuses } from "./management/reports/Utils";
import { allTools } from "./management/tools/Functionalities";

const getDefaultValues = (community: CommunityResponseDTO, step: COMMUNITY_FORM_STEPS) => {
    switch (step) {
        case COMMUNITY_FORM_STEPS.DESCRIPTION:
            return getDescriptionDefaultValues(community);
        case COMMUNITY_FORM_STEPS.ZOOM_AND_CENTERING:
            return getZoomAndCenteringDefaultValues(community);
        case COMMUNITY_FORM_STEPS.TOOLS:
            return getToolsDefaultValues(community);
        case COMMUNITY_FORM_STEPS.REPORTS:
            return getReportsDefaultValues(community);
        default:
            return {};
    }
};

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

const getToolsDefaultValues = (community: CommunityResponseDTO): ToolsFormType => {
    /* const values: ToolsFormType = {
        navigationTools: getTools(community.functionalities, "navigation") as NavigationToolsType[],
        measureTools: getTools(community.functionalities, "measure") as MeasureToolsType[],
        reportTools: getTools(community.functionalities, "report") as ReportToolsType[],
        otherTools: getTools(community.functionalities, "other") as OtherToolsType[],
    };
    return values; */
    const functionalities = community.functionalities ?? [];
    return {
        functionalities: functionalities.filter((f) => allTools.includes(f)),
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

export { getDefaultValues };
