import { declareComponentKeys, type Translations } from "../../../../i18n/i18n";

const ValidationMetadatas = () => {
    return null;
};

export default ValidationMetadatas;

export const { i18n } = declareComponentKeys<
    | "metadatas.technical_name_error"
    | "metadatas.technical_name_regex"
    | "metadatas.technical_name_unicity_error"
    | "metadatas.public_name_error"
    | "metadatas.description_error"
    | "metadatas.identifier_error"
    | "metadatas.identifier_regex"
    | "metadatas.category_error"
    | "metadatas.email_contact_required_error"
    | "metadatas.email_contact_error"
    | "metadatas.creation_date_error"
    | "metadatas.organization_error"
    | "metadatas.organization_email_required_error"
    | "metadatas.organization_email_error"
    | "metadatas.language_error"
    | "metadatas.charset_error"
    | "metadatas.encoding_error"
    | "metadatas.projection_error"
    | "attribution.text_required_error"
    | "attribution.url_required_error"
    | "attribution.url_error"
    | "share_with_error"
>()({
    ValidationMetadatas,
});

export const ValidationMetadatasFrTranslations: Translations<"fr">["ValidationMetadatas"] = {
    "metadatas.technical_name_error": "Le nom technique est obligatoire",
    "metadatas.technical_name_regex": "Le nom technique ne doit contenir que des lettres, chiffres, tirets (-), underscores (_), ou points (.)",
    "metadatas.technical_name_unicity_error": "Ce nom technique existe déjà",
    "metadatas.public_name_error": "L'intitulé (nom public) est obligatoire",
    "metadatas.description_error": "Un résumé est obligatoire",
    "metadatas.identifier_error": "L'identificateur est obligatoire",
    "metadatas.identifier_regex": "L'identificateur ne doit contenir que des lettres, chiffres, tirets (-), underscores (_), ou points (.)",
    "metadatas.category_error": "La catégorie thématique est obligatoire",
    "metadatas.email_contact_required_error": "l'email de contact est obligatoire",
    "metadatas.email_contact_error": "l'email de contact n'est pas correct",
    "metadatas.creation_date_error": "La date de création de la ressource est obligatoire",
    "metadatas.organization_error": "l'organisme est obligatoire",
    "metadatas.organization_email_required_error": "l'email de l'organisme est obligatoire",
    "metadatas.organization_email_error": "l'email de l'organisme n'est pas correct",
    "metadatas.language_error": "La langue est obligatoire",
    "metadatas.charset_error": "Le jeu de caractères est obligatoire",
    "metadatas.encoding_error": "l'encodage de la ressource est obligatoire",
    "metadatas.projection_error": "La projection est obligatoire",
    "attribution.text_required_error": "Le texte à afficher est obligatoire",
    "attribution.url_required_error": "l'url est obligatoire",
    "attribution.url_error": "l'url n'est pas correcte",
    share_with_error: "La restriction d'accès est obligatoire",
};

export const ValidationMetadatasEnTranslations: Translations<"en">["ValidationMetadatas"] = {
    "metadatas.technical_name_error": "Technical name is required",
    "metadatas.technical_name_regex": "Technical name must contain only letters, numbers, hyphens (-), underscores (_), or dots (.)",
    "metadatas.technical_name_unicity_error": "This technical name already exists",
    "metadatas.public_name_error": "Title (public name) is required",
    "metadatas.description_error": "A summary is required",
    "metadatas.identifier_error": "Identifier is required",
    "metadatas.identifier_regex": "Identifier must contain only letters, numbers, hyphens (-), underscores (_), or dots (.)",
    "metadatas.category_error": "Thematic category is required",
    "metadatas.email_contact_required_error": "Contact email is required",
    "metadatas.email_contact_error": "Contact email is not correct",
    "metadatas.creation_date_error": "Creation date is required",
    "metadatas.organization_error": "Organization is required",
    "metadatas.organization_email_required_error": "Organization email is required",
    "metadatas.organization_email_error": "Organization email is not correct",
    "metadatas.language_error": "La langue est obligatoire",
    "metadatas.charset_error": "Dataset is required",
    "metadatas.encoding_error": "Encoding of the resource is required",
    "metadatas.projection_error": "Projection is required",
    "attribution.text_required_error": "Text to display is required",
    "attribution.url_required_error": "Url is required",
    "attribution.url_error": "Url is not correct",
    share_with_error: "Access restriction is required",
};
