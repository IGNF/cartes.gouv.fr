import { declareComponentKeys } from "@/i18n";
import { type Translations } from "@/i18n/types";

const { i18n } = declareComponentKeys<
    | "loading"
    | "load_error"
    | "tag.data"
    | "tag.upload"
    | "type.vector_db"
    | "type.pyramid_vector"
    | "type.pyramid_raster"
    | "type.upload"
    | "not_provided"
    | "section.description"
    | "section.producer"
    | "section.date"
    | "section.extent"
    | "section.structure"
    | "section.report"
    | "field.technical_name"
    | "field.size"
    | "field.type"
    | "field.id"
    | "field.srs"
    | "field.tms"
    | "field.levels"
    | "field.channels_format"
    | "field.channels_number"
    | "field.compression"
    | "field.nodata_value"
    | "field.producer"
    | "field.date"
    | "field.zone"
    | "field.extent"
    | "structure.attribute"
    | "structure.type"
    | "structure.primary_key"
    | "report.creation"
    | "report.update"
    | "report.status"
    | "report.steps"
    | "report.no_upload"
    | "report.no_processing"
    | "report.no_checks"
    | { K: "step.upload"; P: { number: number }; R: string }
    | { K: "step.checks"; P: { number: number }; R: string }
    | { K: "step.processing"; P: { number: number; name: string }; R: string }
    | "step.name"
    | "step.files"
    | "step.execution_id"
    | "step.output_id"
    | "logs.title"
    | "logs.loading"
    | "logs.error"
    | "logs.empty"
    | "status.waiting"
    | "status.progress"
    | "status.checking"
    | "status.success"
    | "status.closed"
    | "status.open"
    | "status.deleted"
    | "status.failure"
    | "status.aborted"
>()("DataDetails");
export type I18n = typeof i18n;

export const DataDetailsFrTranslations: Translations<"fr">["DataDetails"] = {
    loading: "Chargement de la donnée",
    load_error: "La donnée n’a pas pu être chargée",
    "tag.data": "Données",
    "tag.upload": "Livraison",
    "type.vector_db": "Base vecteur",
    "type.pyramid_vector": "Pyramide vecteur",
    "type.pyramid_raster": "Pyramide raster",
    "type.upload": "Vecteur",
    not_provided: "Non renseigné",
    "section.description": "Description",
    "section.producer": "Producteur",
    "section.date": "Date",
    "section.extent": "Emprise spatiale",
    "section.structure": "Structure",
    "section.report": "Rapport",
    "field.technical_name": "Nom technique",
    "field.size": "Poids",
    "field.type": "Type",
    "field.id": "Identifiant technique",
    "field.srs": "Projection",
    "field.tms": "Grille (TMS)",
    "field.levels": "Niveaux",
    "field.channels_format": "Format des canaux",
    "field.channels_number": "Nombre de canaux",
    "field.compression": "Compression",
    "field.nodata_value": "Valeur de non-donnée",
    "field.producer": "Nom de l’organisme",
    "field.date": "Date de production",
    "field.zone": "Territoires concernés",
    "field.extent": "Emprise",
    "structure.attribute": "Attribut",
    "structure.type": "Type",
    "structure.primary_key": " (clé primaire)",
    "report.creation": "Date de création",
    "report.update": "Date de modification",
    "report.status": "Statut",
    "report.steps": "Étapes de publication",
    "report.no_upload": "Aucune livraison n’est associée à cette donnée.",
    "report.no_processing": "Aucune information sur les traitements de génération de cette donnée n’a été trouvée.",
    "report.no_checks": "Aucune vérification n’a été lancée.",
    "step.upload": ({ number }) => `${number}. Dépôt des données`,
    "step.checks": ({ number }) => `${number}. Vérifications`,
    "step.processing": ({ number, name }) => `${number}. Traitement : ${name}`,
    "step.name": "Nom",
    "step.files": "Fichiers déposés",
    "step.execution_id": "Identifiant technique de l’exécution",
    "step.output_id": "Identifiant technique de la donnée en sortie",
    "logs.title": "Journal",
    "logs.loading": "Chargement du journal",
    "logs.error": "Impossible de récupérer les journaux",
    "logs.empty": "Pas de journal trouvé",
    "status.waiting": "En attente de lancement",
    "status.progress": "En cours d’exécution",
    "status.checking": "En cours de vérification",
    "status.success": "Réussie",
    "status.closed": "Fermée",
    "status.open": "Ouverte",
    "status.deleted": "Supprimée",
    "status.failure": "Échouée",
    "status.aborted": "Annulée",
};

export const DataDetailsEnTranslations: Translations<"en">["DataDetails"] = {
    loading: "Loading the data",
    load_error: "The data could not be loaded",
    "tag.data": "Data",
    "tag.upload": "Upload",
    "type.vector_db": "Vector database",
    "type.pyramid_vector": "Vector pyramid",
    "type.pyramid_raster": "Raster pyramid",
    "type.upload": "Vector",
    not_provided: "Not provided",
    "section.description": "Description",
    "section.producer": "Producer",
    "section.date": "Date",
    "section.extent": "Spatial extent",
    "section.structure": "Structure",
    "section.report": "Report",
    "field.technical_name": "Technical name",
    "field.size": "Size",
    "field.type": "Type",
    "field.id": "Technical identifier",
    "field.srs": "Projection",
    "field.tms": "Tile matrix set (TMS)",
    "field.levels": "Levels",
    "field.channels_format": "Channel format",
    "field.channels_number": "Number of channels",
    "field.compression": "Compression",
    "field.nodata_value": "No-data value",
    "field.producer": "Organisation name",
    "field.date": "Production date",
    "field.zone": "Areas covered",
    "field.extent": "Extent",
    "structure.attribute": "Attribute",
    "structure.type": "Type",
    "structure.primary_key": " (primary key)",
    "report.creation": "Creation date",
    "report.update": "Last update",
    "report.status": "Status",
    "report.steps": "Publication steps",
    "report.no_upload": "No upload is linked to this data.",
    "report.no_processing": "No information was found about the processings that generated this data.",
    "report.no_checks": "No check was run.",
    "step.upload": ({ number }) => `${number}. Data upload`,
    "step.checks": ({ number }) => `${number}. Checks`,
    "step.processing": ({ number, name }) => `${number}. Processing: ${name}`,
    "step.name": "Name",
    "step.files": "Uploaded files",
    "step.execution_id": "Execution technical identifier",
    "step.output_id": "Output data technical identifier",
    "logs.title": "Log",
    "logs.loading": "Loading the log",
    "logs.error": "The logs could not be retrieved",
    "logs.empty": "No log found",
    "status.waiting": "Waiting to start",
    "status.progress": "Running",
    "status.checking": "Being checked",
    "status.success": "Succeeded",
    "status.closed": "Closed",
    "status.open": "Open",
    "status.deleted": "Deleted",
    "status.failure": "Failed",
    "status.aborted": "Aborted",
};
