import { declareComponentKeys } from "i18nifty";
import { Translations } from "../../../i18n/types";
import { COMMUNITY_FORM_STEPS } from "./FormSteps";

// traductions
const { i18n } = declareComponentKeys<
    "no_rights" | "forbidden_access" | "back_to_list" | "previous_step" | "title" | { K: "step_title"; P: { step: COMMUNITY_FORM_STEPS }; R: string }
>()("CreateCommunity");
export type I18n = typeof i18n;

export const CreateCommunityFrTranslations: Translations<"fr">["CreateCommunity"] = {
    no_rights: "Vous n'avez pas les droits de créer un guichet. Il faut être admin ou gestionnaire d'au moins un guichet",
    forbidden_access: "Vous n'avez pas le droit d'accéder à cette page",
    back_to_list: "Retour à la liste des guichets",
    previous_step: "Etape précédente",
    title: "Création d'un guichet",
    step_title: ({ step }) => {
        switch (step) {
            case COMMUNITY_FORM_STEPS.DESCRIPTION:
                return "Description";
            // TODO REMETTRE
            /* case COMMUNITY_FORM_STEPS.DATABASE:
                return "Base de données";
            
            case COMMUNITY_FORM_STEPS.LAYERS:
                return "Couches";  */
            case COMMUNITY_FORM_STEPS.ZOOM_AND_CENTERING:
                return "Zoom et centrage";
            case COMMUNITY_FORM_STEPS.TOOLS:
                return "Outils";
            case COMMUNITY_FORM_STEPS.REPORTS:
                return "Signalements";
            default:
                return "";
        }
    },
};

export const CreateCommunityEnTranslations: Translations<"en">["CreateCommunity"] = {
    no_rights: undefined,
    forbidden_access: "Forbidden access to this page",
    back_to_list: "Back to communities list",
    previous_step: "Previous step",
    title: "Create community",
    step_title: ({ step }) => `step ${step}`,
};
