import { declareComponentKeys } from "@/i18n";
import { type Translations } from "@/i18n/types";

const { i18n } = declareComponentKeys<
    | "title"
    | "mandatory_fields"
    | "loading"
    | "load_error"
    | "publishing"
    | "error_title"
    | "metadata_missing.title"
    | "metadata_missing.description"
    | "metadata_missing.link"
    | "cancel"
    | "submit"
    | "section.type"
    | "section.description"
    | "section.tables"
    | "section.access"
    | "type.legend"
    | "type.help_link"
    | "type.wfs"
    | "type.wms"
    | "type.tms"
    | "type.wmts"
    | "type.wfs.description"
    | "type.wms.description"
    | "type.tms.description"
    | "type.wmts.description"
    | "type.vector"
    | "type.raster"
    | "stored_data.label"
    | "stored_data.placeholder"
    | "title.label"
    | "title.hint"
    | "technical_name.label"
    | "technical_name.hint"
    | { K: "image.hint"; P: { max: number }; R: string }
    | "thumbnail.label"
    | "thumbnail.modal_title"
    | "themes.label"
    | "themes.hint"
    | "tables.no_stored_data"
    | "tables.loading"
    | "tables.load_error"
    | "tables.none"
    | "tables.legend"
    | "tables.hint"
    | "table.title.label"
    | "table.title.hint"
    | "table.public_name.label"
    | "table.public_name.hint"
    | "table.description.label"
    | "table.keywords.label"
    | "table.keywords.hint"
    | "access.legend"
    | "access.public"
    | "access.public.hint"
    | "access.restricted_visible"
    | "access.restricted_visible.hint"
    | "access.restricted"
    | "access.restricted.hint"
    | "attribution.title"
    | "attribution.explanation"
    | "attribution.enabled"
    | "attribution.text.label"
    | "attribution.url.label"
    | "attribution.url.hint"
    | "attribution.logo.label"
    | "attribution.logo.modal_title"
    | "validation.stored_data.required"
    | "validation.title.required"
    | "validation.technical_name.required"
    | "validation.technical_name.chars"
    | "validation.technical_name.taken"
    | { K: "validation.technical_name.prefix"; P: { prefix: string }; R: string }
    | "validation.technical_name.prefix_only"
    | "validation.themes.required"
    | { K: "validation.themes.max"; P: { max: number }; R: string }
    | "validation.tables.required"
    | "validation.table.title.required"
    | "validation.table.public_name.required"
    | "validation.table.public_name.chars"
    | "validation.table.description.required"
    | "validation.access.unavailable"
    | "validation.attribution.text.required"
    | "validation.attribution.url.required"
    | "validation.attribution.url.invalid"
>()("ServiceForm");

export type I18n = typeof i18n;

export const ServiceFormFrTranslations: Translations<"fr">["ServiceForm"] = {
    title: "Créer un flux",
    mandatory_fields: "Sauf mention contraire « (optionnel) » dans le label, tous les champs sont obligatoires.",
    loading: "Chargement de la fiche de données",
    load_error: "La fiche de données n’a pas pu être chargée",
    publishing: "Publication du flux en cours",
    error_title: "Le flux n’a pas été publié",
    "metadata_missing.title": "Renseignez d’abord la description de la fiche de données",
    "metadata_missing.description": "La publication d’un flux s’appuie sur la description de la fiche.",
    "metadata_missing.link": "Compléter la description",
    cancel: "Annuler",
    submit: "Publier le flux",
    "section.type": "Type de flux",
    "section.description": "Description du flux",
    "section.tables": "Tables",
    "section.access": "Droits et accès",
    "type.legend": "Type de flux",
    "type.help_link": "Comment choisir le type de flux à publier ?",
    "type.wfs": "Flux WFS",
    "type.wms": "Flux WMS",
    "type.tms": "Flux TMS",
    "type.wmts": "Flux WMTS",
    "type.wfs.description": "Web Feature Service",
    "type.wms.description": "Web Map Service",
    "type.tms.description": "Tile Map Service",
    "type.wmts.description": "Web Map Tile Service",
    "type.vector": "Vecteur",
    "type.raster": "Raster",
    "stored_data.label": "Jeu de données",
    "stored_data.placeholder": "Sélectionner une option",
    "title.label": "Titre du flux",
    "title.hint": "Titre concis et non-technique permettant aux utilisateurs de comprendre de quel flux il s’agit",
    "technical_name.label": "Nom technique du flux",
    "technical_name.hint":
        "Le nom technique du flux ne doit pas contenir d’espace ni de caractères spéciaux et doit être unique. Il permet d’identifier le flux dans les services qui l’utiliseront.",
    "image.hint": ({ max }) => `Taille maximale : ${max} Mo. Formats supportés : jpg, png.`,
    "thumbnail.label": "Vignette (optionnel)",
    "thumbnail.modal_title": "Ajouter une vignette",
    "themes.label": "Thématiques",
    "themes.hint": "Vous pouvez sélectionner plusieurs thématiques",
    "tables.no_stored_data": "Veuillez sélectionner un jeu de données vecteur",
    "tables.loading": "Chargement des tables",
    "tables.load_error": "Les tables du jeu de données n’ont pas pu être chargées",
    "tables.none": "Ce jeu de données n’a aucune table géométrique",
    "tables.legend": "Tables à publier",
    "tables.hint": "Par défaut aucune table n’est cochée.",
    "table.title.label": "Titre de la table",
    "table.title.hint": "Titre concis et non-technique permettant aux utilisateurs de comprendre de quelle table il s’agit",
    "table.public_name.label": "Nom technique de la table",
    "table.public_name.hint":
        "Le nom technique de la table ne doit pas contenir d’espace ni de caractères spéciaux et doit être unique. Il permet d’identifier la table dans les services qui utiliseront le flux.",
    "table.description.label": "Résumé de la table",
    "table.keywords.label": "Mot-clés (optionnels)",
    "table.keywords.hint": "Utilisez l’auto-complétion ou saisissez librement des mots-clés en appuyant sur Entrée après chaque mot.",
    "access.legend": "Accès",
    "access.public": "Accès libre pour tous",
    "access.public.hint": "En acceptant, le service sera accessible à tout utilisateur, dans cartes.gouv.fr ou tout autre outil tiers.",
    "access.restricted_visible": "Flux restreint mais visible pour tous sur cartes.gouv.fr",
    "access.restricted_visible.hint":
        "Le service sera visible sur cartes.gouv.fr mais une clé d’accès sera nécessaire pour accéder au flux dans les outils tiers.",
    "access.restricted": "Flux restreint pour tous",
    "access.restricted.hint": "Le service ne sera visible qu’aux utilisateurs disposant d’une clé d’accès, dans cartes.gouv.fr ou tout autre outil tiers.",
    "attribution.title": "Droits et attributions",
    "attribution.explanation":
        "Ajouter une attribution pour que les utilisateurs de vos services affichent une mention sur leurs cartes. Elle indique la source de données et permet un renvoi vers un site internet ou une licence.",
    "attribution.enabled": "Ajouter une attribution",
    "attribution.text.label": "Texte à afficher",
    "attribution.url.label": "URL de l’attribution",
    "attribution.url.hint": "Site web de l’organisme producteur, conditions d’utilisation des données ou toute autre URL en lien avec les données",
    "attribution.logo.label": "Logo (optionnel)",
    "attribution.logo.modal_title": "Ajouter un logo",
    "validation.stored_data.required": "Veuillez sélectionner un jeu de données vecteur",
    "validation.title.required": "Le titre du flux est obligatoire",
    "validation.technical_name.required": "Le nom technique du flux est obligatoire",
    "validation.technical_name.chars": "Le nom technique ne doit contenir ni espace ni caractère spécial",
    "validation.technical_name.taken": "Ce nom technique existe déjà",
    "validation.technical_name.prefix": ({ prefix }) => `Le nom technique doit commencer par « ${prefix}. »`,
    "validation.technical_name.prefix_only": "Le nom technique doit contenir au moins un caractère après le préfixe de l’entrepôt",
    "validation.themes.required": "Sélectionnez au moins une thématique",
    "validation.themes.max": ({ max }) => `Retirez des thématiques : la sélection dépasse la limite de ${max} caractères`,
    "validation.tables.required": "Veuillez choisir au moins une table",
    "validation.table.title.required": "Le titre de la table est obligatoire",
    "validation.table.public_name.required": "Le nom technique de la table est obligatoire",
    "validation.table.public_name.chars": "Le nom technique de la table ne doit contenir que des minuscules, chiffres, tirets, points et tirets bas",
    "validation.table.description.required": "Le résumé de la table est obligatoire",
    "validation.access.unavailable": "Ce type d’accès n’est pas disponible pour cet entrepôt",
    "validation.attribution.text.required": "Le texte de l’attribution est obligatoire",
    "validation.attribution.url.required": "L’URL de l’attribution est obligatoire",
    "validation.attribution.url.invalid": "L’URL de l’attribution n’est pas valide",
};

export const ServiceFormEnTranslations: Translations<"en">["ServiceForm"] = {
    title: "Create a service",
    mandatory_fields: "Unless marked “(optional)”, all fields are mandatory.",
    loading: "Loading the datasheet",
    load_error: "The datasheet could not be loaded",
    publishing: "Publishing the service",
    error_title: "The service was not published",
    "metadata_missing.title": "Fill in the datasheet description first",
    "metadata_missing.description": "Publishing a service relies on the datasheet description.",
    "metadata_missing.link": "Complete the description",
    cancel: "Cancel",
    submit: "Publish the service",
    "section.type": "Service type",
    "section.description": "Service description",
    "section.tables": "Tables",
    "section.access": "Rights and access",
    "type.legend": "Service type",
    "type.help_link": "How to choose the type of service to publish?",
    "type.wfs": "WFS service",
    "type.wms": "WMS service",
    "type.tms": "TMS service",
    "type.wmts": "WMTS service",
    "type.wfs.description": "Web Feature Service",
    "type.wms.description": "Web Map Service",
    "type.tms.description": "Tile Map Service",
    "type.wmts.description": "Web Map Tile Service",
    "type.vector": "Vector",
    "type.raster": "Raster",
    "stored_data.label": "Dataset",
    "stored_data.placeholder": "Select an option",
    "title.label": "Service title",
    "title.hint": "Short, non-technical title that tells users what the service is about",
    "technical_name.label": "Service technical name",
    "technical_name.hint": "The technical name must be unique and contain no spaces or special characters. It identifies the service in the tools that use it.",
    "image.hint": ({ max }) => `Maximum size: ${max} MB. Supported formats: jpg, png.`,
    "thumbnail.label": "Thumbnail (optional)",
    "thumbnail.modal_title": "Add a thumbnail",
    "themes.label": "Themes",
    "themes.hint": "You can select several themes",
    "tables.no_stored_data": "Please select a vector dataset",
    "tables.loading": "Loading the tables",
    "tables.load_error": "The dataset tables could not be loaded",
    "tables.none": "This dataset has no geometric table",
    "tables.legend": "Tables to publish",
    "tables.hint": "No table is selected by default.",
    "table.title.label": "Table title",
    "table.title.hint": "Short, non-technical title that tells users what the table is about",
    "table.public_name.label": "Table technical name",
    "table.public_name.hint":
        "The technical name must be unique and contain no spaces or special characters. It identifies the table in the tools that use the service.",
    "table.description.label": "Table summary",
    "table.keywords.label": "Keywords (optional)",
    "table.keywords.hint": "Use autocompletion or type free keywords, pressing Enter after each one.",
    "access.legend": "Access",
    "access.public": "Open access for everyone",
    "access.public.hint": "The service will be available to any user, in cartes.gouv.fr or any third-party tool.",
    "access.restricted_visible": "Restricted service, visible to everyone on cartes.gouv.fr",
    "access.restricted_visible.hint": "The service will be visible on cartes.gouv.fr but an access key will be needed in third-party tools.",
    "access.restricted": "Restricted service for everyone",
    "access.restricted.hint": "The service will only be visible to users with an access key, in cartes.gouv.fr or any third-party tool.",
    "attribution.title": "Rights and attributions",
    "attribution.explanation":
        "Add an attribution so that users of your services display a notice on their maps. It gives the data source and links to a website or a licence.",
    "attribution.enabled": "Add an attribution",
    "attribution.text.label": "Text to display",
    "attribution.url.label": "Attribution URL",
    "attribution.url.hint": "Website of the producer, data terms of use or any other URL related to the data",
    "attribution.logo.label": "Logo (optional)",
    "attribution.logo.modal_title": "Add a logo",
    "validation.stored_data.required": "Please select a vector dataset",
    "validation.title.required": "The service title is required",
    "validation.technical_name.required": "The technical name is required",
    "validation.technical_name.chars": "The technical name must not contain spaces or special characters",
    "validation.technical_name.taken": "This technical name already exists",
    "validation.technical_name.prefix": ({ prefix }) => `The technical name must start with “${prefix}.”`,
    "validation.technical_name.prefix_only": "The technical name must contain at least one character after the datastore prefix",
    "validation.themes.required": "Select at least one theme",
    "validation.themes.max": ({ max }) => `Remove themes: the selection exceeds the ${max} character limit`,
    "validation.tables.required": "Please choose at least one table",
    "validation.table.title.required": "The table title is required",
    "validation.table.public_name.required": "The table technical name is required",
    "validation.table.public_name.chars": "The table technical name may only contain lowercase letters, digits, hyphens, dots and underscores",
    "validation.table.description.required": "The table summary is required",
    "validation.access.unavailable": "This access type is not available for this datastore",
    "validation.attribution.text.required": "The attribution text is required",
    "validation.attribution.url.required": "The attribution URL is required",
    "validation.attribution.url.invalid": "The attribution URL is not valid",
};
