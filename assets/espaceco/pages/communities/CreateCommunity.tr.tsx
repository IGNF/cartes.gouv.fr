import { declareComponentKeys } from "i18nifty";
import { Translations } from "../../../i18n/i18n";

// traductions
export const { i18n } = declareComponentKeys<"title" | { K: "step_title"; P: { stepNumber: number }; R: string }>()("CreateCommunity");

export const CreateCommunityFrTranslations: Translations<"fr">["CreateCommunity"] = {
    title: "Création d'un guichet",
    step_title: ({ stepNumber }) => {
        switch (stepNumber) {
            case 1:
                return "Description";
            case 2:
                return "Base de données";
            case 3:
                return "Couches";
            case 4:
                return "Zoom et centrage";
            case 5:
                return "Outils";
            case 6:
                return "Signalements";
            default:
                return "";
        }
    },
};

export const CreateCommunityEnTranslations: Translations<"en">["CreateCommunity"] = {
    title: "Create community",
    step_title: ({ stepNumber }) => `step ${stepNumber}`,
};
