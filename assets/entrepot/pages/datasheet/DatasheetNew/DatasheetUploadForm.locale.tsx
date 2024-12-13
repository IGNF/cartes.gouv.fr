import { declareComponentKeys } from "i18nifty";
import { Translations } from "../../../../i18n/types";

const { i18n } = declareComponentKeys<
    | { K: "title"; P: { datasheetName: string | undefined }; R: string }
    | { K: "back_to"; P: { datasheetName: string | undefined }; R: string }
    | "datasheet.name"
    | "datasheet.name_hint"
    | "datasheet.name_mandatory_error"
    | "datasheet.name_max_length_error"
    | "datasheet.name_regex_error"
    | { K: "datasheet.name_already_exists_error"; P: { datasheetName: string }; R: string }
    | "datasheet.creation_running"
    | "upload"
    | "upload_hint"
    | "upload_nofile_error"
    | { K: "upload_extension_error"; P: { filename: string }; R: string }
    | { K: "upload_max_size_error"; P: { maxSize: number }; R: string }
    | "upload_running"
    | "technical_name"
    | "technical_name_hint"
    | "technical_name_mandatory_error"
    | "projection"
    | "projection_mandatory_error"
    | "select_projection"
    | "upload_file"
    | "data_infos_title"
>()("DatasheetUploadForm");
export type I18n = typeof i18n;

export const DatasheetUploadFormFrTranslations: Translations<"fr">["DatasheetUploadForm"] = {
    title: ({ datasheetName }) => (datasheetName === undefined ? "Créer une fiche de données" : "Ajouter un fichier de données"),
    back_to: ({ datasheetName }) => (datasheetName === undefined ? "Retour à ma liste de données" : "Retour à ma fiche de données"),
    "datasheet.name": "Nom de votre fiche de donnée",
    "datasheet.name_hint": "Ce nom vous permettra d’identifier votre donnée dans la géoplateforme, soyez aussi clair que possible.",
    "datasheet.name_mandatory_error": "Le nom de la donnée est obligatoire",
    "datasheet.name_max_length_error": "Le nombre maximal de caractères pour le nom de la fiche de donnée est de 99",
    "datasheet.name_regex_error":
        "Le nom de la fiche de donnée ne peut contenir que des caractères alphanumériques, espaces blancs et certains caractères spéciaux",
    "datasheet.name_already_exists_error": ({ datasheetName }) => `Une fiche de donnée existe déjà avec le nom "${datasheetName}"`,
    "datasheet.creation_running": "Création de la fiche en cours ...",
    upload: "Déposez votre fichier de données",
    // NB: la taille maximale doit correspondre à celle effectivement implémentée dans DatasheetUploadForm
    upload_hint: "Taille maximale : 1 Go. Formats de fichiers autorisés : Geopackage ou archive zip contenant un Geopackage (recommandé)",
    upload_nofile_error: "Aucun fichier téléversé",
    upload_extension_error: ({ filename }) => `L’extension du fichier ${filename} n'est pas correcte`,
    upload_max_size_error: ({ maxSize }) => `La taille maximale pour un fichier est de ${maxSize}`,
    upload_running: "Téléversement en cours ...",
    technical_name: "Nom technique de votre donnée",
    technical_name_hint: "Ce nom technique est invisible par votre utilisateur final. Il apparaitra uniquement dans votre espace de travail",
    technical_name_mandatory_error: "Le nom technique de la donnée est obligatoire",
    projection: "Projection de vos données",
    projection_mandatory_error: "La projection (srid) est obligatoire",
    select_projection: "Selectionnez une projection",
    upload_file: "Déposer votre fichier",
    data_infos_title: "Les données suivantes ont été détectées. Modifiez les si besoin",
};

export const DatasheetUploadFormEnTranslations: Translations<"en">["DatasheetUploadForm"] = {
    title: undefined,
    back_to: undefined,
    "datasheet.name": undefined,
    "datasheet.name_hint": undefined,
    "datasheet.name_mandatory_error": undefined,
    "datasheet.name_max_length_error": undefined,
    "datasheet.name_regex_error": undefined,
    "datasheet.name_already_exists_error": undefined,
    "datasheet.creation_running": undefined,
    upload: undefined,
    upload_hint: undefined,
    upload_nofile_error: undefined,
    upload_extension_error: undefined,
    upload_max_size_error: undefined,
    upload_running: undefined,
    technical_name: undefined,
    technical_name_hint: undefined,
    technical_name_mandatory_error: undefined,
    projection: undefined,
    projection_mandatory_error: undefined,
    select_projection: undefined,
    upload_file: undefined,
    data_infos_title: undefined,
};
