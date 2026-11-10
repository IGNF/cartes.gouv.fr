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
    | "field.address"
    | "field.numberAndStreetname"
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
    | "field.scale"
    | "field.scale.info"
    | { K: "field.scale.option"; P: { scale: number }; R: string }
    | "field.scale.placeholder"
    | "field.resolution"
    | "field.resolution.hint"
    // Messages de validation
    | "validation.name.required"
    | "validation.name.max"
    | "validation.name.chars"
    | "validation.name.unique"
    | "validation.description"
    | "validation.themes"
    | "validation.fileIdentifier.required"
    | "validation.fileIdentifier.chars"
    | "validation.fileIdentifier.unique"
    | "validation.organizationName"
    | "validation.organizationEmail"
    | "validation.producerRole"
    | "validation.postalCode"
    | "validation.producers.required"
    | "validation.producers.firstIsPointOfContact"
    | "validation.producers.uniqueRoles"
    | "validation.dateCreation"
    | "validation.updateFrequency"
    | "validation.territories"
    | "validation.scale"
    | "validation.resolution"
    | "validation.conditionType"
    | "validation.constraints"
    | "validation.conditions"
    | "validation.restrictionCode"
    | "validation.limitationCode"
    | "validation.classificationCode"
    | "validation.url"
    | "validation.constraintDescription"
    | "validation.hierarchyLevel"
    | "validation.language"
    | "validation.charset"
>()("DatasheetSections");

export type I18n = typeof i18n;

export const DatasheetSectionsFrTranslations: Translations<"fr">["DatasheetSections"] = {
    "section.description": "Description",
    "section.producer": "Producteur",
    "section.date": "Date",
    "section.spatialCoverage": "Emprise spatiale",
    "section.license": "Licences et conditions d’utilisation",
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

    "field.organizationName": "Nom de l’organisme",
    "field.organizationName.hint": "Utilisez l’auto-complétion ou saisissez directement un nom",
    "field.organizationEmail": "Adresse électronique de contact",
    "field.organizationEmail.hint": "Format attendu : nom@domaine.fr",
    "field.producerRole": "Rôle",
    "field.address": "Adresse postale (optionnel)",
    "field.numberAndStreetname": "Numéro et voie",

    "producer.add": "Ajouter un producteur",
    "producer.remove": "Supprimer",
    "producer.card.title": "Producteur",
    "producer.role": ({ role }) => {
        const labels: Record<ProducerRole, string> = {
            pointOfContact: "Contact",
            contact: "Contact des métadonnées",
            custodian: "Gestionnaire",
            author: "Auteur",
            owner: "Propriétaire",
            resourceProvider: "Fournisseur",
        };
        return labels[role];
    },
    "producer.role.placeholder": "Sélectionnez un rôle",
    "producer.custodianHint":
        "Ce contact sera également utilisé comme gestionnaire de la donnée et comme contact des métadonnées, sauf si vous ajoutez des producteurs dédiés avec ces rôles (« Gestionnaire » et « Contact des métadonnées »).",

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
            quarterly: "Trimestrielle",
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
            useConstraints: "Contrainte d’usage",
            accessConstraints: "Contrainte d’accès",
            useLimitation: "Limite d’usage",
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
    "field.constraintDescription.hint": "Décrivez les conditions d’utilisation",
    "field.constraintRestriction": "Restriction",
    "license.restrictionCode": ({ code }) => {
        const labels: Record<RestrictionCode, string> = {
            copyright: "Droit d’auteur",
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
            INSPIRE_Directive_Article13_1g: "Article 13(1)(g) – Intérêts ou protection du fournisseur volontaire d’informations",
            INSPIRE_Directive_Article13_1h: "Article 13(1)(h) – Protection de l’environnement",
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
        "Le jeu de caractères de la donnée restitue les caractères spécifiques d’une langue, comme les accents ou les caractères spéciaux. Le format UTF-8 est couramment utilisé pour le français.",
    "field.scale": "Échelle",
    "field.scale.info": "Échelle à laquelle la visualisation des données est la plus pertinente",
    "field.scale.option": ({ scale }) => `1:${scale.toLocaleString("fr-FR")}`,
    "field.scale.placeholder": "Sélectionner une échelle",
    "field.resolution": "Résolution (optionnel)",
    "field.resolution.hint": "Nombre de mètres correspondant à un pixel",
    "validation.name.required": "Le nom de la fiche de données est obligatoire",
    "validation.name.max": "Le nom ne peut pas dépasser 99 caractères",
    "validation.name.chars": "Le nom contient des caractères non autorisés",
    "validation.name.unique": "Une fiche de données portant ce nom existe déjà",
    "validation.description": "La description est obligatoire",
    "validation.themes": "Sélectionnez au moins une thématique",
    "validation.fileIdentifier.required": "L’identifiant de fichier est obligatoire",
    "validation.fileIdentifier.chars": "L’identifiant de fichier contient des caractères non autorisés",
    "validation.fileIdentifier.unique": "Cet identifiant de fichier est déjà utilisé",
    "validation.organizationName": "Le nom de l’organisme est obligatoire",
    "validation.organizationEmail": "L’adresse électronique de l’organisme est obligatoire et doit être valide",
    "validation.producerRole": "Le rôle du producteur est obligatoire",
    "validation.postalCode": "Le code postal ne doit contenir que des chiffres",
    "validation.producers.required": "Au moins un producteur est requis",
    "validation.producers.firstIsPointOfContact": "Le premier producteur doit être le point de contact",
    "validation.producers.uniqueRoles": "Chaque rôle ne peut être attribué qu’à un seul producteur",
    "validation.dateCreation": "La date de création est obligatoire",
    "validation.updateFrequency": "La fréquence de mise à jour est obligatoire",
    "validation.territories": "Sélectionnez au moins un territoire",
    "validation.scale": "L’échelle est obligatoire",
    "validation.resolution": "La résolution doit être un nombre positif",
    "validation.conditionType": "Le type de condition est obligatoire",
    "validation.constraints": "Au moins une contrainte est requise",
    "validation.conditions": "Ajoutez au moins une condition de licence",
    "validation.restrictionCode": "La valeur de la contrainte est obligatoire",
    "validation.limitationCode": "La limitation d’accès est obligatoire",
    "validation.classificationCode": "La classification est obligatoire",
    "validation.url": "L’URL n’est pas valide",
    "validation.constraintDescription": "La description est obligatoire",
    "validation.hierarchyLevel": "Le type de données est obligatoire",
    "validation.language": "La langue est obligatoire",
    "validation.charset": "Le jeu de caractères est obligatoire",
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
    "field.address": "Postal address (optional)",
    "field.numberAndStreetname": "Number and street",

    "producer.add": "Add a producer",
    "producer.remove": "Remove",
    "producer.card.title": "Producer",
    "producer.role": ({ role }) => {
        const labels: Record<ProducerRole, string> = {
            pointOfContact: "Contact",
            contact: "Metadata contact",
            custodian: "Custodian",
            author: "Author",
            owner: "Owner",
            resourceProvider: "Resource provider",
        };
        return labels[role];
    },
    "producer.role.placeholder": "Select a role",
    "producer.custodianHint":
        "This contact will also be used as the data custodian and as the metadata contact, unless you add dedicated producers with those roles (« Custodian » and « Metadata contact »).",

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
            quarterly: "Quarterly",
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
    "field.scale": "Scale",
    "field.scale.info": "Scale at which the data is best viewed",
    "field.scale.option": ({ scale }) => `1:${scale.toLocaleString("en-GB")}`,
    "field.scale.placeholder": "Select a scale",
    "field.resolution": "Resolution (optional)",
    "field.resolution.hint": "Number of meters per pixel",
    "validation.name.required": "The datasheet name is required",
    "validation.name.max": "The name cannot exceed 99 characters",
    "validation.name.chars": "The name contains forbidden characters",
    "validation.name.unique": "A datasheet with this name already exists",
    "validation.description": "The description is required",
    "validation.themes": "Select at least one theme",
    "validation.fileIdentifier.required": "The file identifier is required",
    "validation.fileIdentifier.chars": "The file identifier contains forbidden characters",
    "validation.fileIdentifier.unique": "This file identifier is already used",
    "validation.organizationName": "The organization name is required",
    "validation.organizationEmail": "The organization email is required and must be valid",
    "validation.producerRole": "The producer role is required",
    "validation.postalCode": "The postal code must only contain digits",
    "validation.producers.required": "At least one producer is required",
    "validation.producers.firstIsPointOfContact": "The first producer must be the point of contact",
    "validation.producers.uniqueRoles": "Each role can only be given to one producer",
    "validation.dateCreation": "The creation date is required",
    "validation.updateFrequency": "The update frequency is required",
    "validation.territories": "Select at least one territory",
    "validation.scale": "The scale is required",
    "validation.resolution": "The resolution must be a positive number",
    "validation.conditionType": "The condition type is required",
    "validation.constraints": "At least one constraint is required",
    "validation.conditions": "Add at least one license condition",
    "validation.restrictionCode": "The constraint value is required",
    "validation.limitationCode": "The access limitation is required",
    "validation.classificationCode": "The classification is required",
    "validation.url": "The URL is not valid",
    "validation.constraintDescription": "The description is required",
    "validation.hierarchyLevel": "The data type is required",
    "validation.language": "The language is required",
    "validation.charset": "The character set is required",
};
