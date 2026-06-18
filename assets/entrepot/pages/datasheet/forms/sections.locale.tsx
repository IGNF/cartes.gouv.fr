import { declareComponentKeys } from "@/i18n";
import { type Translations } from "@/i18n/types";

import {
    type ClassificationCode,
    type ConstraintType,
    type PublicAccessLimitation,
    type RestrictionCode,
    type SubConstraintType,
    type ProducerRole,
    type UpdateFrequency,
} from "./metadataSchema";

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
    | "field.thumbnail.modalTitle"
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
    | "field.logo.modalTitle"
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
    | { K: "field.updateFrequency.option"; P: { code: UpdateFrequency }; R: string }
    | "field.updateFrequency.placeholder"
    // Section emprise spatiale
    | "field.territories"
    | "field.territories.hint"
    // Section licences / conditions d'utilisation
    | "license.add"
    | "license.addOpenLicense"
    | "license.remove"
    | "license.card.title"
    | { K: "license.conditionType"; P: { type: ConstraintType }; R: string }
    | "license.conditionType.placeholder"
    | "license.constraint.add"
    | "license.constraint.remove"
    | "license.constraint.fold"
    | "license.constraint.unfold"
    | "license.constraint.card.title"
    | { K: "license.subConstraintType"; P: { type: SubConstraintType }; R: string }
    | "license.subConstraintType.placeholder"
    | "field.conditionType"
    | "field.constraintType"
    | "field.constraintValue"
    | "field.constraintUrl"
    | "field.constraintUrl.hint"
    | "field.constraintDescription"
    | "field.constraintDescription.hint"
    | "field.constraintRestriction"
    | { K: "license.restrictionCode"; P: { code: RestrictionCode }; R: string }
    | "license.restrictionCode.placeholder"
    | { K: "license.limitationCode"; P: { code: PublicAccessLimitation }; R: string }
    | "license.limitationCode.placeholder"
    | { K: "license.classificationCode"; P: { code: ClassificationCode }; R: string }
    | "license.classificationCode.placeholder"
    // Section informations sur les métadonnées
    | "field.resourceGenealogy"
    | "field.resourceGenealogy.info"
    | "field.hierarchyLevel"
    | "field.hierarchyLevel.dataset"
    | "field.hierarchyLevel.series"
    | "field.hierarchyLevel.dataset.hint"
    | "field.hierarchyLevel.series.hint"
    | "field.language"
    | "field.charset"
    | "field.charset.info"
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
    "field.thumbnail.hint": "Taille maximale : 2 Mo. Formats supportés : jpg, jpeg, png et svg.",
    "field.thumbnail.modalTitle": "Ajouter une vignette",
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
    "field.logo.modalTitle": "Ajouter un logo",
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
    "field.updateFrequency.option": ({ code }) => {
        const labels: Record<UpdateFrequency, string> = {
            continual: "En continu",
            daily: "Journalière",
            weekly: "Hebdomadaire",
            fortnightly: "Bimensuelle",
            monthly: "Mensuelle",
            quaterly: "Trimestrielle",
            biannually: "Biannuelle",
            annually: "Annuelle",
            asNeeded: "En fonction du besoin",
            irregular: "Irrégulière",
            notPlanned: "Non planifiée",
            unknown: "Inconnue",
        };
        return labels[code];
    },
    "field.updateFrequency.placeholder": "Sélectionnez une fréquence",

    "field.territories": "Territoires concernés",
    "field.territories.hint": "Saisissez au moins 3 caractères",

    "license.add": "Ajouter une condition",
    "license.addOpenLicense": "Ajouter une licence ouverte",
    "license.remove": "Supprimer",
    "license.card.title": "Condition",
    "license.conditionType": ({ type }) => {
        const labels: Record<ConstraintType, string> = {
            legal: "Conditions légales",
            security: "Contraintes de sécurité",
            other: "Autres contraintes",
        };
        return labels[type];
    },
    "license.conditionType.placeholder": "Sélectionnez un type de condition",
    "license.constraint.add": "Ajouter une contrainte",
    "license.constraint.remove": "Supprimer",
    "license.constraint.fold": "Replier",
    "license.constraint.unfold": "Déplier",
    "license.constraint.card.title": "Contrainte",
    "license.subConstraintType": ({ type }) => {
        const labels: Record<SubConstraintType, string> = {
            useConstraints: "Contrainte d'usage",
            accessConstraints: "Contrainte d'accès",
            useLimitation: "Limite d'usage",
            otherConstraints: "Autre contrainte",
            classification: "Classification",
        };
        return labels[type];
    },
    "license.subConstraintType.placeholder": "Sélectionnez un type de contrainte",
    "field.conditionType": "Type de condition",
    "field.constraintType": "Type de contrainte",
    "field.constraintValue": "Valeur",
    "field.constraintUrl": "URL (optionnel)",
    "field.constraintUrl.hint": "Lien vers la licence ou les conditions complètes",
    "field.constraintDescription": "Description",
    "field.constraintDescription.hint": "Décrivez les conditions d'utilisation",
    "field.constraintRestriction": "Restriction",
    "license.restrictionCode": ({ code }) => {
        const labels: Record<RestrictionCode, string> = {
            copyright: "Droit d'auteur",
            patent: "Brevet",
            patentPending: "Brevet en cours",
            trademark: "Marque déposée",
            license: "Licence",
            intellectualPropertyRights: "Droits de propriété intellectuelle",
            restricted: "Restreint",
            otherRestrictions: "Autres contraintes",
        };
        return labels[code];
    },
    "license.restrictionCode.placeholder": "Sélectionnez une valeur",
    "license.limitationCode": ({ code }) => {
        const labels: Record<PublicAccessLimitation, string> = {
            noLimitations: "Pas de contraintes prévues selon la loi.",
            conditionsUnknown: "Conditions inconnues",
            INSPIRE_Directive_Article13_1a: "Article 13(1)(a) – Confidentialité des travaux des autorités publiques",
            INSPIRE_Directive_Article13_1b: "Article 13(1)(b) – Relations internationales, sécurité publique ou défense nationale",
            INSPIRE_Directive_Article13_1c: "Article 13(1)(c) – Bonne marche de la justice",
            INSPIRE_Directive_Article13_1d: "Article 13(1)(d) – Confidentialité des informations commerciales ou industrielles",
            INSPIRE_Directive_Article13_1e: "Article 13(1)(e) – Droits de propriété intellectuelle",
            INSPIRE_Directive_Article13_1f: "Article 13(1)(f) – Confidentialité des données à caractère personnel",
            INSPIRE_Directive_Article13_1g: "Article 13(1)(g) – Intérêts ou protection du fournisseur volontaire d'informations",
            INSPIRE_Directive_Article13_1h: "Article 13(1)(h) – Protection de l'environnement",
        };
        return labels[code];
    },
    "license.limitationCode.placeholder": "Sélectionnez une limitation",
    "license.classificationCode": ({ code }) => {
        const labels: Record<ClassificationCode, string> = {
            unclassified: "Non classifié",
            restricted: "Diffusion restreinte",
            confidential: "Confidentiel",
            secret: "Secret",
            topSecret: "Très secret",
        };
        return labels[code];
    },
    "license.classificationCode.placeholder": "Sélectionnez une classification",

    "field.resourceGenealogy": "Généalogie de la ressource (optionnel)",
    "field.resourceGenealogy.info":
        "La généalogie de la donnée correspond à la description des données sources, méthodes et protocoles qui ont servi à la production de votre donnée.",
    "field.hierarchyLevel": "Type de données",
    "field.hierarchyLevel.dataset": "Jeu de données",
    "field.hierarchyLevel.series": "Collection de données",
    "field.hierarchyLevel.dataset.hint": "Ensemble de données décrivant un même sujet ou une même thématique.",
    "field.hierarchyLevel.series.hint": "Regroupement de jeux de données décrits appartenant à un même sujet, thématique, programme ou politique publique.",
    "field.language": "Langue de la donnée et ses métadonnées",
    "field.charset": "Jeu de caractères de la donnée et ses métadonnées",
    "field.charset.info":
        "Le jeu de caractères de la donnée restitue les caractères spécifiques d'une langue, comme les accents ou les caractères spéciaux. Le format UTF-8 est couramment utilisé pour le français.",
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
    "field.thumbnail.hint": "Max size: 2 MB. Supported formats: jpg, jpeg, png and svg.",
    "field.thumbnail.modalTitle": "Add a thumbnail",
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
    "field.logo.modalTitle": "Add a logo",
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
    "field.updateFrequency.option": ({ code }) => {
        const labels: Record<UpdateFrequency, string> = {
            continual: "Continual",
            daily: "Daily",
            weekly: "Weekly",
            fortnightly: "Fortnightly",
            monthly: "Monthly",
            quaterly: "Quarterly",
            biannually: "Biannually",
            annually: "Annually",
            asNeeded: "As needed",
            irregular: "Irregular",
            notPlanned: "Not planned",
            unknown: "Unknown",
        };
        return labels[code];
    },
    "field.updateFrequency.placeholder": "Select a frequency",

    "field.territories": "Concerned territories",
    "field.territories.hint": "Type at least 3 characters",

    "license.add": "Add a condition",
    "license.addOpenLicense": "Add an open license",
    "license.remove": "Remove",
    "license.card.title": "Condition",
    "license.conditionType": ({ type }) => {
        const labels: Record<ConstraintType, string> = {
            legal: "Legal conditions",
            security: "Security constraints",
            other: "Other constraints",
        };
        return labels[type];
    },
    "license.conditionType.placeholder": "Select a condition type",
    "license.constraint.add": "Add a constraint",
    "license.constraint.remove": "Remove",
    "license.constraint.fold": "Fold",
    "license.constraint.unfold": "Unfold",
    "license.constraint.card.title": "Constraint",
    "license.subConstraintType": ({ type }) => {
        const labels: Record<SubConstraintType, string> = {
            useConstraints: "Use constraint",
            accessConstraints: "Access constraint",
            useLimitation: "Use limitation",
            otherConstraints: "Other constraint",
            classification: "Classification",
        };
        return labels[type];
    },
    "license.subConstraintType.placeholder": "Select a constraint type",
    "field.conditionType": "Condition type",
    "field.constraintType": "Constraint type",
    "field.constraintValue": "Value",
    "field.constraintUrl": "URL (optional)",
    "field.constraintUrl.hint": "Link to the licence or full conditions",
    "field.constraintDescription": "Description",
    "field.constraintDescription.hint": "Describe the terms of use",
    "field.constraintRestriction": "Restriction",
    "license.restrictionCode": ({ code }) => {
        const labels: Record<RestrictionCode, string> = {
            copyright: "Copyright",
            patent: "Patent",
            patentPending: "Patent pending",
            trademark: "Trademark",
            license: "License",
            intellectualPropertyRights: "Intellectual property rights",
            restricted: "Restricted",
            otherRestrictions: "Other constraints",
        };
        return labels[code];
    },
    "license.restrictionCode.placeholder": "Select a value",
    "license.limitationCode": ({ code }) => {
        const labels: Record<PublicAccessLimitation, string> = {
            noLimitations: "No constraints required by law.",
            conditionsUnknown: "Conditions unknown",
            INSPIRE_Directive_Article13_1a: "Article 13(1)(a) – Confidentiality of proceedings of public authorities",
            INSPIRE_Directive_Article13_1b: "Article 13(1)(b) – International relations, public security or national defence",
            INSPIRE_Directive_Article13_1c: "Article 13(1)(c) – Course of justice",
            INSPIRE_Directive_Article13_1d: "Article 13(1)(d) – Confidentiality of commercial or industrial information",
            INSPIRE_Directive_Article13_1e: "Article 13(1)(e) – Intellectual property rights",
            INSPIRE_Directive_Article13_1f: "Article 13(1)(f) – Confidentiality of personal data",
            INSPIRE_Directive_Article13_1g: "Article 13(1)(g) – Interests or protection of voluntary information suppliers",
            INSPIRE_Directive_Article13_1h: "Article 13(1)(h) – Protection of the environment",
        };
        return labels[code];
    },
    "license.limitationCode.placeholder": "Select a limitation",
    "license.classificationCode": ({ code }) => {
        const labels: Record<ClassificationCode, string> = {
            unclassified: "Unclassified",
            restricted: "Restricted",
            confidential: "Confidential",
            secret: "Secret",
            topSecret: "Top secret",
        };
        return labels[code];
    },
    "license.classificationCode.placeholder": "Select a classification",

    "field.resourceGenealogy": "Resource genealogy (optional)",
    "field.resourceGenealogy.info": "Describes the source data, methods and protocols used to produce your dataset.",
    "field.hierarchyLevel": "Data type",
    "field.hierarchyLevel.dataset": "Dataset",
    "field.hierarchyLevel.series": "Data collection",
    "field.hierarchyLevel.dataset.hint": "Set of data describing the same subject or theme.",
    "field.hierarchyLevel.series.hint": "Grouping of datasets belonging to the same subject, theme, programme or public policy.",
    "field.language": "Language of the data and its metadata",
    "field.charset": "Character set of the data and its metadata",
    "field.charset.info":
        "The character set of the data reproduces the specific characters of a language, such as accents or special characters. The UTF-8 format is commonly used for French.",
};
