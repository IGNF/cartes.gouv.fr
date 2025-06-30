import { KeywordsType } from "../../../../../../@types/app_espaceco";
import { declareComponentKeys } from "../../../../../../i18n/i18n";
import { Translations } from "../../../../../../i18n/types";

// traductions
const { i18n } = declareComponentKeys<{ K: "getTitle"; P: { keyword: KeywordsType }; R: string } | { K: "getText"; P: { keyword: KeywordsType }; R: string }>()(
    "EmailPlannerKeywords"
);
export type I18n = typeof i18n;

export const EmailPlannerKeywordsFrTranslations: Translations<"fr">["EmailPlannerKeywords"] = {
    getTitle: ({ keyword }) => {
        switch (keyword) {
            case "author":
                return "Insérer le nom de l'auteur du signalement";
            case "closingDate":
                return "Insérer la date de validation du signalement";
            case "comment":
                return "Insérer le commentaire du signalement";
            case "group":
                return "Insérer le nom du guichet associé au signalement";
            case "id":
                return "Insérer l'identifiant du signalement";
            case "openingDate":
                return "Insérer la date de création du signalement";
            case "status":
                return "Insérer le statut du signalement";
            case "updatingDate":
                return "Insérer la date de modification du signalement";
            case "validator":
                return "Insérer l'identifiant du validateur ";
        }
    },
    getText: ({ keyword }) => {
        switch (keyword) {
            case "author":
                return "Auteur";
            case "closingDate":
                return "Date de validation";
            case "comment":
                return "Commentaire";
            case "group":
                return "Guichet";
            case "id":
                return "Identifiant";
            case "openingDate":
                return "Date de création";
            case "status":
                return "Statut";
            case "updatingDate":
                return "Date de modification";
            case "validator":
                return "Validateur ";
        }
    },
};

export const EmailPlannerKeywordsEnTranslations: Translations<"en">["EmailPlannerKeywords"] = {
    getTitle: ({ keyword }) => `Insert ${keyword}`,
    getText: ({ keyword }) => `${keyword}`,
};
