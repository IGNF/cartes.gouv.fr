import WKT from "ol/format/WKT";
import Point from "ol/geom/Point";
import { DescriptionFormType, MembershipRequestType, ToolsFormType, ZoomAndCenteringFormType } from "../../../@types/app_espaceco";
import { CommunityResponseDTO } from "../../../@types/espaceco";
import olDefaults from "../../../data/ol-defaults.json";
import { COMMUNITY_FORM_STEPS } from "./FormSteps";
import { allTools } from "./management/tools/Functionalities";

const getDefaultValues = (community: CommunityResponseDTO, step: COMMUNITY_FORM_STEPS) => {
    switch (step) {
        case COMMUNITY_FORM_STEPS.DESCRIPTION:
            return getDescriptionDefaultValues(community);
        case COMMUNITY_FORM_STEPS.ZOOM_AND_CENTERING:
            return getZoomAndCenteringDefaultValues(community);
        case COMMUNITY_FORM_STEPS.TOOLS:
            return getToolsDefaultValues(community);
        default:
            return {};
    }
};

const getDescriptionDefaultValues = (community: CommunityResponseDTO): DescriptionFormType => {
    const values = {
        name: community.name || "",
        description: community.description ?? "",
        editorial: community.editorial ?? "",
        keywords: community.keywords ?? [],
        logo: null,
        listed: community.listed ?? true,
    };

    let membershipRequest: MembershipRequestType | undefined;
    if (!community) {
        membershipRequest = "open";
    } else {
        // TODO VOIR AVEC LA MISE A JOUR DE L'API
        const isOpenWithEmail = community.open_with_email !== null;
        membershipRequest = community.open_without_affiliation === true ? "open" : isOpenWithEmail ? "partially_open" : "not_open";
    }
    values["membershipRequest"] = membershipRequest;

    values["openWithEmail"] = [];
    // TODO Supprimer condition community.open_with_email
    if (community && community.open_with_email) {
        values["openWithEmail"] = community.open_with_email;
    }

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
        zoomMin: community.zoom_min ?? olDefaults.zoom_levels.TOP,
        zoomMax: community.zoom_max ?? olDefaults.zoom_levels.BOTTOM,
        extent: community.extent,
    };
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

export { getDefaultValues };
