import { declareComponentKeys } from "@/i18n";
import { type Translations } from "@/i18n/types";

const { i18n } = declareComponentKeys<
    | "title"
    | "mandatory_fields"
    | "error_title"
    | "adding"
    | "cancel"
    | "submit"
    | "section.dataset"
    | "section.producer"
    | "section.themes"
    | "section.temporal"
    | "section.spatial"
    | "file.label"
    | "file.hint"
    | "file.formats_help"
    | "file.uploading"
    | "file.upload_failed"
    | { K: "file.shapefile_component"; P: { name: string }; R: string }
    | { K: "file.extension"; P: { name: string }; R: string }
    | "file.size"
    | "formats_modal.title"
    | "formats_modal.limits"
    | "formats_modal.formats"
    | "formats_modal.gpkg"
    | "formats_modal.shp"
    | "formats_modal.geojson"
    | "formats_modal.csv"
    | "formats_modal.csv_columns"
    | "formats_modal.sql"
    | "formats_modal.sql_rules"
    | "name.label"
    | "description.label"
    | "producer.label"
    | "producer.hint"
    | "producer.changed_warning"
    | "producer_short.label"
    | { K: "producer_short.hint"; P: { max: number }; R: string }
    | "themes.label"
    | "themes.hint"
    | "production_date.label"
    | "production_date.hint"
    | "srid.label"
    | "srid.placeholder"
    | "zone.label"
    | "zone.hint"
    | "email_notification"
    | "validation.file"
    | "validation.name.required"
    | { K: "validation.name.max"; P: { max: number }; R: string }
    | "validation.name.chars"
    | "validation.description.required"
    | { K: "validation.description.max"; P: { max: number }; R: string }
    | "validation.producer.required"
    | "validation.producer.length"
    | { K: "validation.producer_short.max"; P: { max: number }; R: string }
    | "validation.themes.required"
    | { K: "validation.themes.max"; P: { max: number }; R: string }
    | "validation.production_date.required"
    | "validation.production_date.future"
    | "validation.srid.required"
    | { K: "validation.srid.unknown"; P: { srid: string }; R: string }
    | "validation.zone.required"
    | { K: "validation.zone.max"; P: { max: number }; R: string }
>()("DatasetAdd");

export type I18n = typeof i18n;

export const DatasetAddFrTranslations: Translations<"fr">["DatasetAdd"] = {
    title: "Ajouter une donnée",
    mandatory_fields: "Sauf mention contraire « (optionnel) » dans le label, tous les champs sont obligatoires.",
    error_title: "La donnée n’a pas été ajoutée",
    adding: "Ajout de la donnée en cours",
    cancel: "Annuler",
    submit: "Ajouter",
    "section.dataset": "Jeu de données",
    "section.producer": "Producteur",
    "section.themes": "Thématiques",
    "section.temporal": "Référence temporelle",
    "section.spatial": "Référence spatiale",
    "file.label": "Ajouter un fichier",
    "file.hint":
        "Taille maximale : 2 Go. Types de données acceptés : Vecteur. Formats de fichiers acceptés : GeoPackage, Shapefile, GeoJSON, CSV, SQL ou zip contenant l’un de ces formats.",
    "file.formats_help": "Plus d’informations sur les formats acceptés",
    "file.uploading": "Téléversement du fichier en cours",
    "file.upload_failed": "Le téléversement du fichier a échoué",
    "file.shapefile_component": ({ name }) =>
        `Le fichier ${name} semble faire partie d’un Shapefile. Déposez une archive zip contenant tous les fichiers composants.`,
    "file.extension": ({ name }) => `L’extension du fichier ${name} n’est pas acceptée`,
    "file.size": "La taille du fichier ne peut pas excéder 2 Go",
    "formats_modal.title": "Configurer vos fichiers",
    "formats_modal.limits": "Taille maximale : 2 Go. Types de données acceptés : Vecteurs.",
    "formats_modal.formats": "Formats de fichiers acceptés :",
    "formats_modal.gpkg": "GeoPackage (.gpkg ou .zip avec au moins un .gpkg)",
    "formats_modal.shp": "Shapefile (.zip avec .shp, .shx, .dbf et .prj, .cpg, .qix, .xml)",
    "formats_modal.geojson": "GeoJSON (.geojson ou .zip avec au moins un .geojson)",
    "formats_modal.csv": "CSV (.csv ou .zip avec au moins un .csv).",
    "formats_modal.csv_columns":
        "Le fichier doit inclure : une colonne géométrie nommée json, geom, the_geom, wkb ou wkt, ou pour les points, deux colonnes coordonnées nommées lon et lat, x et y ou longitude et latitude.",
    "formats_modal.sql": "SQL (.sql ou .zip avec au moins un .sql).",
    "formats_modal.sql_rules":
        "Seules les instructions suivantes sont permises : CREATE TABLE, CREATE VIEW, CREATE INDEX, CREATE SEQUENCE, ALTER TABLE, ALTER SEQUENCE. Aucun nom de schéma ne doit être présent (ex : public.table interdit).",
    "name.label": "Nom du jeu de données",
    "description.label": "Description",
    "producer.label": "Nom de l’organisme",
    "producer.hint": "Utilisez l’auto-complétion ou saisissez directement un nom",
    "producer.changed_warning":
        "Attention : vous avez renseigné un organisme différent du responsable de la donnée, pensez à vérifier que la partie « Producteurs » de la description de la fiche est correctement complétée.",
    "producer_short.label": "Acronyme de l’organisme (optionnel)",
    "producer_short.hint": ({ max }) => `${max} caractères maximum, en majuscules`,
    "themes.label": "Thématiques",
    "themes.hint": "Vous pouvez sélectionner plusieurs thématiques",
    "production_date.label": "Date de production de la donnée",
    "production_date.hint": "Format attendu : JJ/MM/AAAA",
    "srid.label": "Projection",
    "srid.placeholder": "Sélectionnez une projection",
    "zone.label": "Étendue spatiale",
    "zone.hint": "Saisissez au moins 3 caractères, ou une valeur libre si aucun territoire proposé ne convient",
    email_notification: "Recevoir une alerte par courriel lorsque le chargement est terminé.",
    "validation.file": "Veuillez déposer un fichier de données",
    "validation.name.required": "Le nom du jeu de données est obligatoire",
    "validation.name.max": ({ max }) => `Le nom du jeu de données ne peut pas dépasser ${max} caractères`,
    "validation.name.chars":
        "Le nom du jeu de données doit commencer par une lettre ou un underscore et ne contenir que des lettres non accentuées, chiffres, tirets, points ou underscores",
    "validation.description.required": "La description est obligatoire",
    "validation.description.max": ({ max }) => `La description ne peut pas dépasser ${max} caractères`,
    "validation.producer.required": "Le nom de l’organisme est obligatoire",
    "validation.producer.length": "Le nom de l’organisme doit comporter entre 2 et 99 caractères",
    "validation.producer_short.max": ({ max }) => `L’acronyme ne peut pas dépasser ${max} caractères`,
    "validation.themes.required": "Sélectionnez au moins une thématique",
    "validation.themes.max": ({ max }) => `Retirez des thématiques : la sélection dépasse la limite de ${max} caractères`,
    "validation.production_date.required": "La date de production est obligatoire",
    "validation.production_date.future": "La date de production ne peut pas être dans le futur",
    "validation.srid.required": "La projection est obligatoire",
    "validation.srid.unknown": ({ srid }) => `Projection ${srid} inconnue`,
    "validation.zone.required": "L’étendue spatiale est obligatoire",
    "validation.zone.max": ({ max }) => `L’étendue spatiale ne peut pas dépasser ${max} caractères`,
};

export const DatasetAddEnTranslations: Translations<"en">["DatasetAdd"] = {
    title: "Add data",
    mandatory_fields: "Unless marked “(optional)”, all fields are mandatory.",
    error_title: "The data was not added",
    adding: "Adding the data",
    cancel: "Cancel",
    submit: "Add",
    "section.dataset": "Dataset",
    "section.producer": "Producer",
    "section.themes": "Themes",
    "section.temporal": "Temporal reference",
    "section.spatial": "Spatial reference",
    "file.label": "Add a file",
    "file.hint": "Maximum size: 2 GB. Accepted data: vector. Accepted formats: GeoPackage, Shapefile, GeoJSON, CSV, SQL or a zip containing one of them.",
    "file.formats_help": "More about accepted formats",
    "file.uploading": "Uploading the file",
    "file.upload_failed": "The file upload failed",
    "file.shapefile_component": ({ name }) => `${name} looks like part of a Shapefile. Upload a zip archive containing all its files.`,
    "file.extension": ({ name }) => `The extension of ${name} is not accepted`,
    "file.size": "The file cannot exceed 2 GB",
    "formats_modal.title": "Configure your files",
    "formats_modal.limits": "Maximum size: 2 GB. Accepted data: vector.",
    "formats_modal.formats": "Accepted file formats:",
    "formats_modal.gpkg": "GeoPackage (.gpkg or .zip with at least one .gpkg)",
    "formats_modal.shp": "Shapefile (.zip with .shp, .shx, .dbf and .prj, .cpg, .qix, .xml)",
    "formats_modal.geojson": "GeoJSON (.geojson or .zip with at least one .geojson)",
    "formats_modal.csv": "CSV (.csv or .zip with at least one .csv).",
    "formats_modal.csv_columns":
        "The file must include a geometry column named json, geom, the_geom, wkb or wkt, or for points two coordinate columns named lon and lat, x and y or longitude and latitude.",
    "formats_modal.sql": "SQL (.sql or .zip with at least one .sql).",
    "formats_modal.sql_rules":
        "Only CREATE TABLE, CREATE VIEW, CREATE INDEX, CREATE SEQUENCE, ALTER TABLE and ALTER SEQUENCE are allowed. No schema name may appear (e.g. public.table is forbidden).",
    "name.label": "Dataset name",
    "description.label": "Description",
    "producer.label": "Organisation name",
    "producer.hint": "Use autocompletion or type a name",
    "producer.changed_warning":
        "Warning: this organisation differs from the data custodian. Check that the “Producers” part of the datasheet description is complete.",
    "producer_short.label": "Organisation acronym (optional)",
    "producer_short.hint": ({ max }) => `${max} characters maximum, uppercase`,
    "themes.label": "Themes",
    "themes.hint": "You can select several themes",
    "production_date.label": "Production date",
    "production_date.hint": "Expected format: DD/MM/YYYY",
    "srid.label": "Projection",
    "srid.placeholder": "Select a projection",
    "zone.label": "Spatial extent",
    "zone.hint": "Type at least 3 characters, or free text if no proposed territory fits",
    email_notification: "Receive an email when loading is complete.",
    "validation.file": "Please upload a data file",
    "validation.name.required": "The dataset name is mandatory",
    "validation.name.max": ({ max }) => `The dataset name cannot exceed ${max} characters`,
    "validation.name.chars":
        "The dataset name must start with a letter or an underscore and contain only unaccented letters, digits, hyphens, dots or underscores",
    "validation.description.required": "The description is mandatory",
    "validation.description.max": ({ max }) => `The description cannot exceed ${max} characters`,
    "validation.producer.required": "The organisation name is mandatory",
    "validation.producer.length": "The organisation name must be between 2 and 99 characters",
    "validation.producer_short.max": ({ max }) => `The acronym cannot exceed ${max} characters`,
    "validation.themes.required": "Select at least one theme",
    "validation.themes.max": ({ max }) => `Remove themes: the selection exceeds ${max} characters`,
    "validation.production_date.required": "The production date is mandatory",
    "validation.production_date.future": "The production date cannot be in the future",
    "validation.srid.required": "The projection is mandatory",
    "validation.srid.unknown": ({ srid }) => `Unknown projection ${srid}`,
    "validation.zone.required": "The spatial extent is mandatory",
    "validation.zone.max": ({ max }) => `The spatial extent cannot exceed ${max} characters`,
};
