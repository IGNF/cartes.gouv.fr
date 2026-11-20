import { format, isValid, parseISO } from "date-fns";
import { type TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";
import { z } from "zod";

import { MetadataHierarchyLevel, type CswMetadata } from "@/@types/app";
import { type ComponentKey } from "@/i18n/types";
import { regex } from "@/utils";

import scales from "@/data/md_resolutions.json";

type T = TranslationFunction<"DatasheetSections", ComponentKey>;

export const PRODUCER_ROLES = ["pointOfContact", "contact", "custodian", "author", "owner", "resourceProvider"] as const;
export type ProducerRole = (typeof PRODUCER_ROLES)[number];

/** Type de condition : MD_LegalConstraints, MD_SecurityConstraints, MD_Constraints */
export const CONSTRAINT_TYPES = ["legal", "security", "other"] as const;
export type ConstraintType = (typeof CONSTRAINT_TYPES)[number];

export const SUB_CONSTRAINT_TYPES = ["useConstraints", "accessConstraints", "useLimitation", "classification", "otherConstraints"] as const;
export type SubConstraintType = (typeof SUB_CONSTRAINT_TYPES)[number];

/** MD_RestrictionCode (useConstraints, accessConstraints) */
export const RESTRICTION_CODES = [
    "copyright",
    "patent",
    "patentPending",
    "trademark",
    "license",
    "intellectualPropertyRights",
    "restricted",
    "otherRestrictions",
] as const;
export type RestrictionCode = (typeof RESTRICTION_CODES)[number];

/** Vocabulaires INSPIRE LimitationsOnPublicAccess et ConditionsApplyingToAccessAndUse (otherConstraints) */
export const PUBLIC_ACCESS_LIMITATIONS = [
    "noLimitations",
    "conditionsUnknown",
    "INSPIRE_Directive_Article13_1a",
    "INSPIRE_Directive_Article13_1b",
    "INSPIRE_Directive_Article13_1c",
    "INSPIRE_Directive_Article13_1d",
    "INSPIRE_Directive_Article13_1e",
    "INSPIRE_Directive_Article13_1f",
    "INSPIRE_Directive_Article13_1g",
    "INSPIRE_Directive_Article13_1h",
] as const;
export type PublicAccessLimitation = (typeof PUBLIC_ACCESS_LIMITATIONS)[number];

/** MD_ClassificationCode */
export const CLASSIFICATION_CODES = ["unclassified", "restricted", "confidential", "secret", "topSecret"] as const;
export type ClassificationCode = (typeof CLASSIFICATION_CODES)[number];

/** MD_MaintenanceFrequencyCode, comme DatasheetMetadataDTO::UPDATE_FREQUENCIES */
export const UPDATE_FREQUENCIES = [
    "continual",
    "daily",
    "weekly",
    "fortnightly",
    "monthly",
    "quarterly",
    "biannually",
    "annually",
    "asNeeded",
    "irregular",
    "notPlanned",
    "unknown",
] as const;
export type UpdateFrequency = (typeof UPDATE_FREQUENCIES)[number];

/** Dénominateurs d’échelle, comme DatasheetMetadataDTO::SCALES */
export const SCALES: readonly number[] = scales;

/** Territoire sélectionné : unité administrative géocodée, bbox = [ouest, sud, est, nord] */
export type Territory = { id: string; title: string; bbox: number[] };

// les expressions de @/utils portent le drapeau g : une copie sans état évite les échecs une fois sur deux
const DATASHEET_NAME_REGEX = new RegExp(regex.datasheet_name.source);
const FILE_IDENTIFIER_REGEX = new RegExp(regex.file_identifier.source);

// pages voisines de donnees/$datasheetName : une fiche de ce nom serait inatteignable
const RESERVED_DATASHEET_NAMES = new Set(["creer", "integration"]);

const isRestriction = (type: SubConstraintType) => type === "useConstraints" || type === "accessConstraints";

// champ texte facultatif : une saisie vide vaut « absent »
const optionalText = () =>
    z
        .string()
        .trim()
        .optional()
        .transform((value) => (value === "" ? undefined : value));

const subConstraintSchema = (t: T) => {
    // locked : compagne ajoutée par le formulaire (type figé, non supprimable), jamais envoyée
    const locked = z.boolean().default(false);

    return z.discriminatedUnion("type", [
        z.object({
            type: z.literal(["useConstraints", "accessConstraints"]),
            locked,
            restriction_code: z.enum(RESTRICTION_CODES, t("validation.restrictionCode")),
        }),
        z.object({
            type: z.literal("otherConstraints"),
            locked,
            limitation_code: z.enum(PUBLIC_ACCESS_LIMITATIONS, t("validation.limitationCode")),
        }),
        z.object({
            type: z.literal("classification"),
            locked,
            classification_code: z.enum(CLASSIFICATION_CODES, t("validation.classificationCode")),
        }),
        z.object({
            type: z.literal("useLimitation"),
            locked,
            url: z.union([z.literal(""), z.url(t("validation.url"))]).optional(),
            description: z.string().trim().min(1, t("validation.constraintDescription")),
        }),
    ]);
};

type SchemaDeps = {
    t: T;
    isEditMode: boolean;
    /** identifiant déjà enregistré : pas de contrôle de disponibilité */
    fileIdentifierLocked?: boolean;
    /** préfixe du datastore, suivi de « _ » dans les nouveaux identifiants */
    fileIdentifierPrefix?: string;
    existingDatasheetNames: string[];
    /** true si l’identifiant est libre ; une erreur autre qu’un identifiant pris ne bloque pas */
    isFileIdentifierAvailable: (fileIdentifier: string) => Promise<boolean>;
};

export const buildMetadataSchema = ({
    t,
    isEditMode,
    fileIdentifierLocked = false,
    fileIdentifierPrefix,
    existingDatasheetNames,
    isFileIdentifierAvailable,
}: SchemaDeps) =>
    z.object({
        // section description
        name: z
            .string()
            .trim()
            .min(1, t("validation.name.required"))
            .max(99, t("validation.name.max"))
            // le nom devient l’étiquette de la fiche à la création ; les titres déjà enregistrés gardent leurs caractères
            .refine((name) => isEditMode || DATASHEET_NAME_REGEX.test(name), t("validation.name.chars"))
            .refine((name) => isEditMode || !RESERVED_DATASHEET_NAMES.has(name), t("validation.name.reserved"))
            .refine((name) => isEditMode || !existingDatasheetNames.includes(name), t("validation.name.unique")),
        description: z.string().trim().min(1, t("validation.description")),
        // undefined = vignette inchangée ; null = supprimée ; File = nouvelle
        thumbnail: z.instanceof(File).nullable().optional(),
        themes: z.array(z.string()).min(1, t("validation.themes")),
        keywords_inspire: z.array(z.string()).default([]),
        keywords_additional: z.array(z.string()).default([]),
        file_identifier: z
            .string()
            .trim()
            .min(1, t("validation.fileIdentifier.required"))
            .regex(FILE_IDENTIFIER_REGEX, t("validation.fileIdentifier.chars"))
            // un identifiant déjà enregistré garde son préfixe, éventuellement suivi de « . »
            .refine(
                (fileIdentifier) => fileIdentifierLocked || !fileIdentifierPrefix || fileIdentifier.startsWith(`${fileIdentifierPrefix}_`),
                t("validation.fileIdentifier.prefix", { prefix: fileIdentifierPrefix ?? "" })
            )
            .refine(
                (fileIdentifier) => fileIdentifierLocked || !fileIdentifierPrefix || fileIdentifier !== `${fileIdentifierPrefix}_`,
                t("validation.fileIdentifier.prefixOnly")
            )
            .refine(async (fileIdentifier) => fileIdentifierLocked || (await isFileIdentifierAvailable(fileIdentifier)), t("validation.fileIdentifier.unique")),

        // section producteurs ; la première carte est le point de contact
        producers: z
            .array(
                z.object({
                    organization_name: z.string().trim().min(1, t("validation.organizationName")),
                    organization_email: z
                        .string()
                        .trim()
                        .pipe(z.email(t("validation.organizationEmail"))),
                    role: z.enum(PRODUCER_ROLES, t("validation.producerRole")),
                    address_number_and_streetname: optionalText(),
                    address_postal_code: optionalText().refine((code) => code === undefined || /^\d+$/.test(code), t("validation.postalCode")),
                    address_city: optionalText(),
                })
            )
            .min(1, t("validation.producers.required"))
            .superRefine((producers, ctx) => {
                if (producers[0] && producers[0].role !== "pointOfContact") {
                    ctx.addIssue({ code: "custom", path: [0, "role"], message: t("validation.producers.firstIsPointOfContact") });
                }
                const seen = new Set<ProducerRole>();
                producers.forEach((producer, index) => {
                    if (seen.has(producer.role)) {
                        ctx.addIssue({ code: "custom", path: [index, "role"], message: t("validation.producers.uniqueRoles") });
                    }
                    seen.add(producer.role);
                });
            }),

        // section dates
        date_creation: z.date(t("validation.dateCreation")),
        update_frequency: z.enum(UPDATE_FREQUENCIES, t("validation.updateFrequency")),

        // section emprise spatiale
        territories: z.array(z.object({ id: z.string(), title: z.string(), bbox: z.array(z.number()).length(4) })).min(1, t("validation.territories")),
        scale: z.number(t("validation.scale")).refine((scale) => SCALES.includes(scale), t("validation.scale")),
        // champ numérique vide : NaN ou chaîne vide selon la saisie
        resolution: z.preprocess(
            (value) => (value === "" || value === null || (typeof value === "number" && Number.isNaN(value)) ? undefined : value),
            z.coerce.number(t("validation.resolution")).positive(t("validation.resolution")).optional()
        ),

        // section licences : au moins une condition (écart connu à #1050, décision 3)
        resource_constraints: z
            .array(
                z.object({
                    type: z.enum(CONSTRAINT_TYPES, t("validation.conditionType")),
                    constraints: z.array(subConstraintSchema(t)).min(1, t("validation.constraints")),
                })
            )
            .min(1, t("validation.conditions")),

        // section informations sur les métadonnées
        resource_genealogy: optionalText(),
        hierarchy_level: z.enum(MetadataHierarchyLevel, t("validation.hierarchyLevel")),
        language: z.object({ code: z.string().min(1), language: z.string().min(1) }, t("validation.language")),
        charset: z.string().trim().min(1, t("validation.charset")),
    });

export type MetadataSchema = ReturnType<typeof buildMetadataSchema>;
/** valeurs saisies (entrée du schéma) */
export type MetadataFormValues = z.input<MetadataSchema>;
/** valeurs validées (sortie du schéma), base du payload */
export type MetadataValues = z.output<MetadataSchema>;
export type ProducerFormValues = MetadataFormValues["producers"][number];
export type ResourceConstraintFormValues = MetadataFormValues["resource_constraints"][number];
export type SubConstraintFormValues = ResourceConstraintFormValues["constraints"][number];

export const defaultMetadataValues: Partial<MetadataFormValues> = {
    name: "",
    description: "",
    themes: [],
    keywords_inspire: [],
    keywords_additional: [],
    file_identifier: "",
    producers: [{ organization_name: "", organization_email: "", role: "pointOfContact" }],
    territories: [],
    resource_constraints: [],
    resource_genealogy: "",
    hierarchy_level: MetadataHierarchyLevel.Dataset,
    charset: "utf8",
    date_creation: new Date(),
    language: { code: "fre", language: "français" },
};

// ---------------------------------------------------------------------------
// Conditions d’utilisation : valeurs ajoutées par le formulaire
// ---------------------------------------------------------------------------

/** URL de la Licence Ouverte Etalab, sert aussi à détecter une licence déjà ajoutée */
export const OPEN_LICENSE_URL = "https://www.etalab.gouv.fr/wp-content/uploads/2018/11/open-licence.pdf";

export function makeLockedUseLimitation(overrides?: { url?: string; description?: string }): SubConstraintFormValues {
    return { type: "useLimitation", locked: true, description: "", ...overrides };
}

export function makeLockedOtherConstraints(): SubConstraintFormValues {
    return { type: "otherConstraints", locked: true, limitation_code: "noLimitations" };
}

/** Sous-contraintes d’une nouvelle condition, selon son type */
export function makeDefaultConstraints(conditionType: ConstraintType): SubConstraintFormValues[] {
    switch (conditionType) {
        case "legal":
            return [{ type: "useConstraints", locked: false, restriction_code: "license" }, makeLockedUseLimitation()];
        case "security":
            return [{ type: "classification", locked: true, classification_code: "unclassified" }, makeLockedUseLimitation()];
        case "other":
            return [makeLockedUseLimitation()];
    }
}

/** Condition légale « Licence Ouverte / Open License (Etalab) » : accès libre et licence */
export function makeOpenLicenseCondition(): ResourceConstraintFormValues {
    return {
        type: "legal",
        constraints: [
            { type: "accessConstraints", locked: false, restriction_code: "otherRestrictions" },
            makeLockedOtherConstraints(),
            { type: "useConstraints", locked: false, restriction_code: "license" },
            makeLockedUseLimitation({ url: OPEN_LICENSE_URL, description: "Licence Ouverte / Open License (compatible ODC-BY, CC-BY 2.0)" }),
        ],
    };
}

/**
 * Compagne verrouillée attendue après une restriction d’usage ou d’accès : otherConstraints pour otherRestrictions, useLimitation sinon.
 * Le lecteur XML renvoie chaque restriction suivie de sa compagne ; `locked` se recalcule par position.
 */
function isCompanionOf(previous: SubConstraintFormValues | undefined, sub: SubConstraintFormValues): boolean {
    if (previous === undefined || !isRestriction(previous.type) || !("restriction_code" in previous)) {
        return false;
    }
    return previous.restriction_code === "otherRestrictions" ? sub.type === "otherConstraints" : sub.type === "useLimitation";
}

/** `locked` recalculé à la lecture (B3) : compagnes des restrictions, classification et première limite d’usage des autres conditions */
export function withLockedFlags(condition: ResourceConstraintFormValues): ResourceConstraintFormValues {
    let firstUseLimitationSeen = false;

    return {
        ...condition,
        constraints: condition.constraints.map((sub, index, all) => {
            let locked = false;
            if (condition.type === "legal") {
                locked = isCompanionOf(all[index - 1], sub);
            } else if (sub.type === "classification") {
                locked = true;
            } else if (sub.type === "useLimitation" && !firstUseLimitationSeen) {
                locked = true;
                firstUseLimitationSeen = true;
            }
            return { ...sub, locked };
        }),
    };
}

// ---------------------------------------------------------------------------
// Envoi et lecture
// ---------------------------------------------------------------------------

/** Gestionnaire et contact des métadonnées copiés du point de contact s’ils manquent (le serveur replie ces copies à la lecture) */
function withPointOfContactCopies(producers: MetadataValues["producers"]): MetadataValues["producers"] {
    const pointOfContact = producers.find((producer) => producer.role === "pointOfContact");
    if (pointOfContact === undefined) {
        return producers;
    }
    const missing = (["custodian", "contact"] as const).filter((role) => !producers.some((producer) => producer.role === role));

    return [...producers, ...missing.map((role) => ({ ...pointOfContact, role }))];
}

/**
 * Corps multipart des routes de création et de modification : champ `data` (DatasheetMetadataDTO en JSON),
 * fichier `thumbnail` pour remplacer la vignette, champ `delete_thumbnail` pour la supprimer.
 */
export function buildMetadataFormData(values: MetadataValues): FormData {
    const { thumbnail, date_creation, producers, resource_constraints, ...rest } = values;

    const data = {
        ...rest,
        producers: withPointOfContactCopies(producers),
        // date locale (B4) : toISOString décalerait d’un jour avant 2 h du matin en heure d’été
        date_creation: format(date_creation, "yyyy-MM-dd"),
        resource_constraints: resource_constraints.map((condition) => ({
            type: condition.type,
            constraints: condition.constraints.map(({ locked: _locked, ...sub }) => ("url" in sub && sub.url === "" ? { ...sub, url: undefined } : sub)),
        })),
    };

    const formData = new FormData();
    formData.set("data", JSON.stringify(data));
    if (thumbnail instanceof File) {
        formData.set("thumbnail", thumbnail);
    } else if (thumbnail === null) {
        formData.set("delete_thumbnail", "1");
    }

    return formData;
}

/** Valeurs initiales du formulaire en modification, depuis la fiche de métadonnées lue par le serveur */
export function mapMetadataToFormValues(csw: CswMetadata | undefined, datasheetName: string): Partial<MetadataFormValues> {
    if (csw === undefined) {
        return { ...defaultMetadataValues, name: datasheetName };
    }

    const dateCreation = csw.date_creation ? parseISO(csw.date_creation) : undefined;
    const producers = (csw.producers ?? []).map((producer) => ({
        organization_name: producer.organization_name,
        organization_email: producer.organization_email,
        role: (PRODUCER_ROLES as readonly string[]).includes(producer.role) ? (producer.role as ProducerRole) : "pointOfContact",
        // champs texte : "" comme dans le DOM, sinon le formulaire serait modifié dès son chargement
        address_number_and_streetname: producer.address_number_and_streetname ?? "",
        address_postal_code: producer.address_postal_code ?? "",
        address_city: producer.address_city ?? "",
    }));

    return {
        ...defaultMetadataValues,
        name: csw.name ?? datasheetName,
        description: csw.description ?? "",
        file_identifier: csw.file_identifier ?? "",
        themes: csw.themes ?? [],
        keywords_inspire: csw.keywords_inspire ?? [],
        keywords_additional: csw.keywords_additional ?? [],
        // fiche sans point de contact (fichier ancien) : carte vide en tête, à compléter
        producers:
            producers[0]?.role === "pointOfContact" ? producers : [{ organization_name: "", organization_email: "", role: "pointOfContact" }, ...producers],
        date_creation: dateCreation && isValid(dateCreation) ? dateCreation : undefined,
        update_frequency: (UPDATE_FREQUENCIES as readonly string[]).includes(csw.update_frequency ?? "")
            ? (csw.update_frequency as UpdateFrequency)
            : undefined,
        territories: csw.territories ?? [],
        // le serveur envoie null pour une valeur absente
        scale: csw.scale ?? undefined,
        resolution: csw.resolution ?? undefined,
        resource_constraints: (csw.resource_constraints ?? []).map((condition) =>
            withLockedFlags({
                type: condition.type as ConstraintType,
                // le serveur envoie null pour les champs absents, le schéma les attend absents
                constraints: condition.constraints.map(
                    (sub) =>
                        ({
                            ...Object.fromEntries(Object.entries(sub).filter(([, value]) => value !== null)),
                            ...(sub.type === "useLimitation" ? { url: sub.url ?? "" } : {}),
                            locked: false,
                        }) as SubConstraintFormValues
                ),
            })
        ),
        resource_genealogy: csw.resource_genealogy ?? "",
        hierarchy_level: csw.hierarchy_level ?? MetadataHierarchyLevel.Dataset,
        language: csw.language ?? defaultMetadataValues.language,
        charset: csw.charset ?? defaultMetadataValues.charset,
    };
}
