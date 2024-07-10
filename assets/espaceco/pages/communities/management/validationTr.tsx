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
};
