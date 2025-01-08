import { declareComponentKeys } from "i18nifty";
import { Translations } from "../../../i18n/types";

// traductions
const { i18n } = declareComponentKeys<"forbidden_access" | "title" | { K: "step_title"; P: { stepNumber: number }; R: string } | "loading" | "fetch_failed">()(
    "CreateCommunity"
);
export type I18n = typeof i18n;

export const CreateCommunityFrTranslations: Translations<"fr">["CreateCommunity"] = {
    forbidden_access: "Vous n'avez pas le droit d'accéder à cette page",
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
    loading: "Recherche du guichet en cours ...",
    fetch_failed: "La récupération des informations sur le guichet a échoué",
};

export const CreateCommunityEnTranslations: Translations<"en">["CreateCommunity"] = {
    forbidden_access: "Forbidden access to this page",
    title: "Create community",
    step_title: ({ stepNumber }) => `step ${stepNumber}`,
    loading: "Fetching community ...",
    fetch_failed: "Fetching community failed",
};
