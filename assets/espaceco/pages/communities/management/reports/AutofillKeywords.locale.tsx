import { AutofillKeywordsType } from "../../../../../@types/app_espaceco";
import { declareComponentKeys } from "../../../../../i18n/i18n";
import { Translations } from "../../../../../i18n/types";

// traductions
const { i18n } = declareComponentKeys<{ K: "title"; P: { keyword: AutofillKeywordsType }; R: string }>()("AutofillKeywords");
export type I18n = typeof i18n;

export const AutofillKeywordsFrTranslations: Translations<"fr">["AutofillKeywords"] = {
    title: ({ keyword }) => {
        switch (keyword) {
            case "id":
                return "Identifiant du signalement";
            case "userId":
                return "Identifiant de l'auteur du signalement";
            case "userName":
                return "Nom de l'auteur du signalement";
            case "date":
                return "Date du signalement";
            case "document1":
                return "Identifiant du premier document";
            case "document2":
                return "Identifiant du deuxième document";
            case "document3":
                return "Identifiant du troisième document";
            case "document4":
                return "Identifiant du quatrième document";
            case "lon":
                return "Longitude du signalement";
            case "lat":
                return "Latitude du signalement";
            case "municipalityInsee":
                return "Code insee de la commune";
            case "municipalityName":
                return "Nom de la commune";
            case "departmentInsee":
                return "Numéro du département";
            case "departmentName":
                return "Nom du département";
            case "groupId":
                return "Identifiant du groupe auquel est lié le signalement";
            case "groupName":
                return "Nom du groupe auquel est lié le signalement";
        }
    },
};

//TODO Ajouter les traductions
export const AutofillKeywordsEnTranslations: Translations<"en">["AutofillKeywords"] = {
    title: ({ keyword }) => `${keyword}`,
};
