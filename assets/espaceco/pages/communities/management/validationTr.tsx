import { declareComponentKeys } from "i18nifty";
import { Translations } from "../../../../i18n/i18n";

// traductions
export const { i18n } = declareComponentKeys<
    | "trimmed_error"
    | "description.name.mandatory"
    | "description.name.minlength"
    | "description.name.maxlength"
    | "description.desc.mandatory"
    | "description.desc.maxlength"
    | "description.logo.size_error"
    | "description.logo.dimensions_error"
    | "description.logo.format_error"
    | { K: "zoom.extent.nan"; P: { field: string }; R: string }
    | { K: "zoom.extent.mandatory"; P: { field: string }; R: string }
    | { K: "zoom.f1_less_than_f2"; P: { field1: string; field2: string }; R: string }
    | { K: "zoom.less_than"; P: { field: string; v: number }; R: string }
    | { K: "zoom.greater_than"; P: { field: string; v: number }; R: string }
    | "description.modal.document.name.mandatory"
    | "description.modal.document.name.minlength"
    | "description.modal.document.file.mandatory"
    | "description.modal.document.file.size_error"
>()("ManageCommunityValidations");

export const ManageCommunityValidationsFrTranslations: Translations<"fr">["ManageCommunityValidations"] = {
    trimmed_error: "La chaîne de caractères ne doit contenir aucun espace en début et fin",
    "description.name.mandatory": "Le nom est obligatoire",
    "description.name.minlength": "Le nom doit faire au moins 2 caractères",
    "description.name.maxlength": "Le nom ne doit pas dépasser 80 caractères",
    "description.desc.mandatory": "La description est obligatoire",
    "description.desc.maxlength": "La description ne doit pas faire plus de 1024 caractères",
    "description.logo.size_error": "La taille du fichier ne peut excéder 5 Mo",
    "description.logo.dimensions_error": "Les dimensions maximales de l'image sont de 400px x 400px",
    "description.logo.format_error": "Le fichier doit être au format jpeg ou png",
    "zoom.extent.nan": ({ field }) => `${field} n'est pas un nombre`,
    "zoom.extent.mandatory": ({ field }) => `La valeur ${field} est obligatoire`,
    "zoom.f1_less_than_f2": ({ field1, field2 }) => `La valeur de ${field1} doit être inférieure à la valeur de ${field2}`,
    "zoom.less_than": ({ field, v }) => `La valeur de ${field} doit être inférieure ou égale à ${v}`,
    "zoom.greater_than": ({ field, v }) => `La valeur de ${field} doit être supérieure ou égale à ${v}`,
    "description.modal.document.name.mandatory": "Le nom est obligatoire",
    "description.modal.document.name.minlength": "Le nom doit faire au moins 7 caractères",
    "description.modal.document.file.mandatory": "Le fichier est obligatoire",
    "description.modal.document.file.size_error": "La taille du fichier ne peut excéder 5 Mo",
};

export const ManageCommunityValidationsEnTranslations: Translations<"en">["ManageCommunityValidations"] = {
    trimmed_error: undefined,
    "description.name.mandatory": undefined,
    "description.name.minlength": undefined,
    "description.name.maxlength": undefined,
    "description.desc.mandatory": undefined,
    "description.desc.maxlength": undefined,
    "description.logo.size_error": undefined,
    "description.logo.dimensions_error": undefined,
    "description.logo.format_error": undefined,
    "zoom.extent.nan": ({ field }) => `${field} is not a number`,
    "zoom.extent.mandatory": ({ field }) => `${field} value is mandatory`,
    "zoom.f1_less_than_f2": ({ field1, field2 }) => `${field1} value must be less then ${field2} value`,
    "zoom.less_than": ({ field, v }) => `${field} value must be less or equal to ${v}`,
    "zoom.greater_than": ({ field, v }) => `${field} value must be greater or equal to ${v}`,
    "description.modal.document.name.mandatory": undefined,
    "description.modal.document.name.minlength": undefined,
    "description.modal.document.file.mandatory": undefined,
    "description.modal.document.file.size_error": undefined,
};