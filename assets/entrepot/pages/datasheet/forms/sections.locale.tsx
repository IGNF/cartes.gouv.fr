import { declareComponentKeys } from "@/i18n";
import { type Translations } from "@/i18n/types";

import { type ProducerRole } from "./metadataSchema";

const { i18n } = declareComponentKeys<
    // Titres de sections
    | "section.description"
    | "section.producer"
    | "section.date"
    | "section.spatialCoverage"
    | "section.license"
    | "section.metadataInfo"
    // Champs section description
    | "field.name"
    | "field.description"
    | "field.thumbnail"
    | "field.thumbnail.hint"
    | "field.themes"
    | "field.inspireKeywords"
    | "field.additionalKeywords"
    | "field.fileIdentifier"
    | "field.fileIdentifier.hint"
    // Champs producteur / contact (partagés)
    | "field.organizationName"
    | "field.organizationName.hint"
    | "field.organizationEmail"
    | "field.organizationEmail.hint"
    | "field.producerRole"
    | "field.logo"
    | "field.logo.hint"
    | "field.address"
    | "producer.add"
    | "producer.remove"
    | "producer.card.title"
    | { K: "producer.role"; P: { role: ProducerRole }; R: string }
    | "producer.role.placeholder"
    | "producer.custodianHint"
    // Section date
    | "field.creationDate"
    | "field.creationDate.hint"
    | "field.updateFrequency"
    // Section emprise spatiale
    | "field.territories"
    | "field.territories.hint"
    // Section licences
    | "field.conditionType"
    | "field.constraintType"
    | "license.add"
    | "license.remove"
    | "license.card.title"
    // Section informations sur les métadonnées
    | "field.resourceGenealogy"
    | "field.resourceGenealogy.hint"
    | "field.hierarchyLevel"
    | "field.hierarchyLevel.dataset"
    | "field.hierarchyLevel.series"
    | "field.hierarchyLevel.dataset.hint"
    | "field.hierarchyLevel.series.hint"
    | "field.language"
    | "field.charset"
>()("DatasheetSections");

export type I18n = typeof i18n;

export const DatasheetSectionsFrTranslations: Translations<"fr">["DatasheetSections"] = {
    "section.description": "Description",
    "section.producer": "Producteur",
    "section.date": "Date",
    "section.spatialCoverage": "Emprise spatiale",
    "section.license": "Licences et conditions d'utilisation",
    "section.metadataInfo": "À propos de la donnée",

    "field.name": "Nom de la fiche de données",
    "field.description": "Description",
    "field.thumbnail": "Vignette (optionnel)",
    "field.thumbnail.hint": "Taille maximale : 2 Mo. Formats supportés : jpg, jpeg et png.",
    "field.themes": "Thématiques",
    "field.inspireKeywords": "Mots-clés INSPIRE (optionnel)",
    "field.additionalKeywords": "Mots-clés additionnels (optionnel)",
    "field.fileIdentifier": "Identifiant unique",
    "field.fileIdentifier.hint": "Format attendu : sans caractères spéciaux et sans espaces. Exemple : IGN_BD-ORTHO",

    "field.organizationName": "Nom de l'organisme",
    "field.organizationName.hint": "Utilisez l'auto-complétion ou saisissez directement un nom",
    "field.organizationEmail": "Adresse électronique de contact",
    "field.organizationEmail.hint": "Format attendu : nom@domaine.fr",
    "field.producerRole": "Rôle",
    "field.logo": "Logo (optionnel)",
    "field.logo.hint": "Taille maximale : 2 Mo. Formats supportés : jpg, jpeg et svg.",
    "field.address": "Adresse postale (optionnel)",

    "producer.add": "Ajouter un producteur",
    "producer.remove": "Supprimer",
    "producer.card.title": "Producteur",
    "producer.role": ({ role }) => {
        const labels: Record<ProducerRole, string> = {
            pointOfContact: "Contact",
            custodian: "Gestionnaire",
            author: "Auteur",
            owner: "Propriétaire",
            resourceProvider: "Fournisseur",
        };
        return labels[role];
    },
    "producer.role.placeholder": "Sélectionnez un rôle",
    "producer.custodianHint":
        "Ce contact sera également utilisé comme gestionnaire de la donnée, sauf si vous ajoutez un producteur ayant le rôle « Gestionnaire ».",

    "field.creationDate": "Date de création",
    "field.creationDate.hint": "Format attendu : JJ/MM/AAAA",
    "field.updateFrequency": "Fréquence de mise à jour",

    "field.territories": "Territoires concernés",
    "field.territories.hint": "Saisissez au moins 3 caractères",

    "field.conditionType": "Type de condition",
    "field.constraintType": "Type de contrainte",
    "license.add": "Ajouter une condition",
    "license.remove": "Supprimer",
    "license.card.title": "Condition",

    "field.resourceGenealogy": "Généalogie de la ressource (optionnel)",
    "field.resourceGenealogy.hint":
        "La généalogie de la donnée correspond à la description des données sources, méthodes et protocoles qui ont servi à la production de votre donnée.",
    "field.hierarchyLevel": "Type de données",
    "field.hierarchyLevel.dataset": "Jeu de données",
    "field.hierarchyLevel.series": "Collection de données",
    "field.hierarchyLevel.dataset.hint": "Ensemble de données décrivant un même sujet ou une même thématique.",
    "field.hierarchyLevel.series.hint": "Regroupement de jeux de données décrits appartenant à un même sujet, thématique, programme ou politique publique.",
    "field.language": "Langue de la donnée et ses métadonnées",
    "field.charset": "Jeu de caractères de la donnée et ses métadonnées",
};

export const DatasheetSectionsEnTranslations: Translations<"en">["DatasheetSections"] = {
    "section.description": "Description",
    "section.producer": "Producer",
    "section.date": "Date",
    "section.spatialCoverage": "Spatial coverage",
    "section.license": "Licenses and terms of use",
    "section.metadataInfo": "About the data",

    "field.name": "Dataset name",
    "field.description": "Description",
    "field.thumbnail": "Thumbnail (optional)",
    "field.thumbnail.hint": "Max size: 2 MB. Supported formats: jpg, jpeg and svg.",
    "field.themes": "Themes",
    "field.inspireKeywords": "INSPIRE keywords (optional)",
    "field.additionalKeywords": "Additional keywords (optional)",
    "field.fileIdentifier": "Unique identifier",
    "field.fileIdentifier.hint": "Expected format: no special characters and no spaces. Example: IGN_BD-ORTHO",

    "field.organizationName": "Organization name",
    "field.organizationName.hint": "Use auto-completion or type a name directly",
    "field.organizationEmail": "Contact email",
    "field.organizationEmail.hint": "Expected format: name@domain.com",
    "field.producerRole": "Role",
    "field.logo": "Logo (optional)",
    "field.logo.hint": "Max size: 2 MB. Supported formats: jpg, jpeg and svg.",
    "field.address": "Postal address (optional)",

    "producer.add": "Add a producer",
    "producer.remove": "Remove",
    "producer.card.title": "Producer",
    "producer.role": ({ role }) => {
        const labels: Record<ProducerRole, string> = {
            pointOfContact: "Contact",
            custodian: "Custodian",
            author: "Author",
            owner: "Owner",
            resourceProvider: "Resource provider",
        };
        return labels[role];
    },
    "producer.role.placeholder": "Select a role",
    "producer.custodianHint": "This contact will also be used as the data custodian, unless you add a producer with the « Custodian » role.",

    "field.creationDate": "Creation date",
    "field.creationDate.hint": "Expected format: DD/MM/YYYY",
    "field.updateFrequency": "Update frequency",

    "field.territories": "Concerned territories",
    "field.territories.hint": "Type at least 3 characters",

    "field.conditionType": "Condition type",
    "field.constraintType": "Constraint type",
    "license.add": "Add a condition",
    "license.remove": "Remove",
    "license.card.title": "Condition",

    "field.resourceGenealogy": "Resource genealogy (optional)",
    "field.resourceGenealogy.hint": "Describes the source data, methods and protocols used to produce your dataset.",
    "field.hierarchyLevel": "Data type",
    "field.hierarchyLevel.dataset": "Dataset",
    "field.hierarchyLevel.series": "Data collection",
    "field.hierarchyLevel.dataset.hint": "Set of data describing the same subject or theme.",
    "field.hierarchyLevel.series.hint": "Grouping of datasets belonging to the same subject, theme, programme or public policy.",
    "field.language": "Language of the data and its metadata",
    "field.charset": "Character set of the data and its metadata",
};
