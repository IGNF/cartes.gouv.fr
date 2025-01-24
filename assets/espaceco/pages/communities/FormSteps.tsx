import { CommunityFormMode } from "../../../@types/app_espaceco";

enum COMMUNITY_FORM_STEPS {
    DESCRIPTION = 1,
    DATABASE = 2,
    LAYERS = 3,
    ZOOM_AND_CENTERING = 4,
    TOOLS = 5,
    REPORTS = 6,
    GRIDS = 7,
    MEMBERS = 8,
}

const getMaxSteps = (mode: CommunityFormMode) => (mode === "creation" ? COMMUNITY_FORM_STEPS.REPORTS : COMMUNITY_FORM_STEPS.MEMBERS);

export { COMMUNITY_FORM_STEPS, getMaxSteps };
