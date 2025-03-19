import { CommunityFormMode } from "../../../@types/app_espaceco";

// TODO REMETTRE
/* enum COMMUNITY_FORM_STEPS {
    DESCRIPTION = 1,
    DATABASE = 2,
    LAYERS = 3,
    ZOOM_AND_CENTERING = 4,
    TOOLS = 5,
    REPORTS = 6,
    GRIDS = 7,
    MEMBERS = 8,
} */

// PROVISOIRE
enum COMMUNITY_FORM_STEPS {
    DESCRIPTION = 1,
    ZOOM_AND_CENTERING = 2,
    TOOLS = 3,
    REPORTS = 4,
    GRIDS = 5,
    MEMBERS = 6,
}

const getMaxSteps = (mode: CommunityFormMode) => (mode === "creation" ? COMMUNITY_FORM_STEPS.REPORTS : COMMUNITY_FORM_STEPS.MEMBERS);

export { COMMUNITY_FORM_STEPS, getMaxSteps };
