import { declareComponentKeys } from "../../../../../i18n/i18n";
import { Translations } from "../../../../../i18n/types";

const { i18n } = declareComponentKeys<"parameter" | "title" | "description" | "description_placeholder" | "back_to_default" | "min_statuses">()(
    "ReportStatuses"
);
export type I18n = typeof i18n;

export const ReportStatusesFrTranslations: Translations<"fr">["ReportStatuses"] = {
    parameter: "Paramétrer",
    title: "Titre",
    description: "Description",
    description_placeholder: "Entrer le texte d'aide pour vos utilisateurs.",
    back_to_default: "Revenir à la valeur par défault",
    min_statuses: "Vous pouvez supprimer un maximum de 2 statuts",
};

export const ReportStatusesEnTranslations: Translations<"en">["ReportStatuses"] = {
    parameter: "Parameter",
    title: "Title",
    description: "Description",
    description_placeholder: "Enter help text for your users.",
    back_to_default: "Go back to default value",
    min_statuses: "You can delete a maximum of 2 statuses",
};
