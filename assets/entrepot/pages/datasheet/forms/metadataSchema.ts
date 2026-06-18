import * as yup from "yup";
import territories from "geopf-extensions-openlayers/src/packages/Controls/Territories/Territories.json";

import { MetadataHierarchyLevel, type Metadata } from "@/@types/app";
import { LanguageType, regex } from "@/utils";

// ---------------------------------------------------------------------------
// Types intermédiaires pour les champs composés
// ---------------------------------------------------------------------------

export const PRODUCER_ROLES = ["pointOfContact", "custodian", "author", "owner", "resourceProvider"] as const;
export type ProducerRole = (typeof PRODUCER_ROLES)[number];

// ---------------------------------------------------------------------------
// Vocabulaires ISO 19139 pour la section licences / conditions d'utilisation
// ---------------------------------------------------------------------------

/** Type de condition (encart) - MD_LegalConstraints / MD_SecurityConstraints / MD_Constraints */
export const CONSTRAINT_TYPES = ["legal", "security", "other"] as const;
export type ConstraintType = (typeof CONSTRAINT_TYPES)[number];

/** Sous-types de contrainte (sous-encart) */
export const SUB_CONSTRAINT_TYPES = ["useConstraints", "accessConstraints", "useLimitation", "classification", "otherConstraints"] as const;
export type SubConstraintType = (typeof SUB_CONSTRAINT_TYPES)[number];

/** Valeurs MD_RestrictionCode (useConstraints, accessConstraints) */
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

/**
 * Codelist INSPIRE LimitationsOnPublicAccess (otherConstraints) -
 * "noLimitations" et "conditionsUnknown" sont ajoutés par l'IGN hors INSPIRE.
 */
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

/** Valeurs MD_ClassificationCode (classification) */
export const CLASSIFICATION_CODES = ["unclassified", "restricted", "confidential", "secret", "topSecret"] as const;
export type ClassificationCode = (typeof CLASSIFICATION_CODES)[number];

// NOTE : « quaterly » est la graphie historique du vocabulaire frequency_code (cf. maintenance_frequency.json et l'API Entrepôt).
// Ne pas corriger ici sans corriger simultanément le fichier JSON et le mapping API.
export const UPDATE_FREQUENCIES = [
    "continual",
    "daily",
    "weekly",
    "fortnightly",
    "monthly",
    "quaterly",
    "biannually",
    "annually",
    "asNeeded",
    "irregular",
    "notPlanned",
    "unknown",
] as const;
export type UpdateFrequency = (typeof UPDATE_FREQUENCIES)[number];

export type Territory = (typeof territories)[number];

// ---------------------------------------------------------------------------
// Helpers partagés
// ---------------------------------------------------------------------------

/**
 * Chaîne de caractères trimée sur les deux extrémités.
 * Utiliser à la place de `yup.string()` pour tous les champs texte du formulaire :
 * trim + required = interdit les chaînes vides ou ne contenant que des espaces.
 */
const stringTrimmed = () => yup.string().transform((v: unknown) => (typeof v === "string" ? v.trim() : v));

// ---------------------------------------------------------------------------
// Schéma Yup principal - toutes les sections de la fiche de données
// ---------------------------------------------------------------------------

type MasterSchemaDeps = {
    existingDatasheetNames: string[];
    isEditMode: boolean;
    checkFileIdentifier: (fileIdentifier: string) => Promise<boolean>;
};

export const buildMetadataSchema = ({ existingDatasheetNames, isEditMode, checkFileIdentifier }: MasterSchemaDeps) =>
    yup.object({
        // Section description
        name: stringTrimmed()
            .required("Le nom de la fiche de données est obligatoire")
            .max(99, "Le nom ne peut pas dépasser 99 caractères")
            .matches(regex.datasheet_name, "Le nom contient des caractères non autorisés")
            .test("is-unique", "Une fiche de données portant ce nom existe déjà", (value) => {
                if (isEditMode) return true;
                if (!value) return true;
                return !existingDatasheetNames.includes(value);
            }),
        description: stringTrimmed().required("La description est obligatoire"),
        // File recadré produit par la modale ImageCropModal (validation taille/format faite dans la modale).
        // null = image existante supprimée ; undefined = inchangé ; File = nouveau recadrage.
        thumbnail: yup
            .mixed<File>()
            .nullable()
            .optional()
            .test("is-file", "Fichier invalide", (value) => value === undefined || value === null || value instanceof File),
        themes: yup.array(yup.string().defined()).min(1, "Sélectionnez au moins une thématique").required("Sélectionnez au moins une thématique"),
        keywords_inspire: yup.array(yup.string().defined()).optional(),
        keywords_additional: yup.array(yup.string().defined()).optional(),
        file_identifier: stringTrimmed()
            .required("L'identifiant de fichier est obligatoire")
            .matches(regex.file_identifier, "L'identifiant de fichier contient des caractères non autorisés")
            .test("is-file-identifier-unique", "Cet identifiant unique est déjà utilisé", async (value) => {
                if (isEditMode) return true;
                if (!value) return true;
                try {
                    return await checkFileIdentifier(value);
                } catch {
                    return true;
                }
            }),

        // Section producteur (tableau)
        producers: yup
            .array(
                yup.object({
                    organization_name: stringTrimmed().required("Le nom de l'organisme est obligatoire"),
                    organization_email: stringTrimmed()
                        .email("Format d'adresse électronique invalide")
                        .required("L'adresse électronique de l'organisme est obligatoire"),
                    // Rôle ISO 19115. L'index 0 est verrouillé sur "pointOfContact" côté UI ;
                    // un rôle vide ("") échoue le oneOf → validation "rôle obligatoire" pour les autres cartes.
                    role: yup
                        .mixed<ProducerRole>()
                        .oneOf([...PRODUCER_ROLES], "Le rôle du producteur est obligatoire")
                        .required("Le rôle du producteur est obligatoire"),
                    // File recadré produit par la modale ImageCropModal (validation taille/format faite dans la modale).
                    // null = logo supprimé (réservé pour un usage futur) ; undefined = inchangé ; File = nouveau recadrage.
                    logo_file: yup
                        .mixed<File>()
                        .nullable()
                        .optional()
                        .test("is-file", "Fichier invalide", (value) => value === undefined || value === null || value instanceof File),
                    address_number: stringTrimmed().optional(),
                    address_street: stringTrimmed().optional(),
                    // Code postal : chiffres uniquement (optionnel, libellé "(optionnel)")
                    address_postal_code: stringTrimmed().optional().matches(/^\d*$/, "Le code postal ne doit contenir que des chiffres"),
                    address_city: stringTrimmed().optional(),
                })
            )
            .min(1, "Au moins un producteur est requis")
            // Invariant structurel : la 1ère carte est verrouillée sur "pointOfContact" côté UI.
            // Ce test protège contre des defaultValues/reset incohérents (ex. métadonnées chargées
            // en mode édition non normalisées via normalizeProducers).
            .test("first-is-point-of-contact", "Le premier producteur doit être le contact", (producers) => producers?.[0]?.role === "pointOfContact")
            .required(),

        // Section date
        // Note : publication_date (= date de création de la fiche) et revision_date (= date de modification des
        // métadonnées ou d'un service) ne sont pas saisies ici ; elles seront remplies automatiquement lors du
        // mapping de soumission (TODO API dans DatasheetCreateNext / DatasheetViewNext).
        date_creation: yup.date().typeError("Format de date invalide (JJ/MM/AAAA)").required("La date de création est obligatoire"),
        update_frequency: yup
            .mixed<UpdateFrequency>()
            .oneOf([...UPDATE_FREQUENCIES], "La fréquence de mise à jour est obligatoire")
            .required("La fréquence de mise à jour est obligatoire"),

        // Section emprise spatiale
        territories: yup.array(yup.mixed<Territory>().defined()).min(1, "Sélectionnez au moins un territoire").required(),

        // Section licences / conditions d'utilisation (ISO 19139 resource_constraints)
        // Chaque entrée = une condition (encart), contenant des sous-contraintes (sous-encarts).
        // Le mapping vers le XML de soumission est TODO (hors périmètre de cette branche).
        // Au moins une condition requise.
        resource_constraints: yup
            .array(
                yup.object({
                    type: yup
                        .mixed<ConstraintType>()
                        .oneOf([...CONSTRAINT_TYPES], "Le type de condition est obligatoire")
                        .required("Le type de condition est obligatoire"),
                    constraints: yup
                        .array(
                            yup.object({
                                type: yup
                                    .mixed<SubConstraintType>()
                                    .oneOf([...SUB_CONSTRAINT_TYPES], "Le type de contrainte est obligatoire")
                                    .required("Le type de contrainte est obligatoire"),
                                // locked : sous-encart compagnon auto-ajouté (non supprimable, type verrouillé côté UI)
                                locked: yup.boolean().required().default(false),
                                // useConstraints / accessConstraints → MD_RestrictionCode
                                restriction_code: yup.string().when("type", {
                                    is: (t: SubConstraintType) => t === "useConstraints" || t === "accessConstraints",
                                    then: (s) =>
                                        s
                                            .oneOf([...RESTRICTION_CODES], "La valeur de la contrainte est obligatoire")
                                            .required("La valeur de la contrainte est obligatoire"),
                                    otherwise: (s) => s.optional(),
                                }),
                                // otherConstraints → LimitationsOnPublicAccess
                                limitation_code: yup.string().when("type", {
                                    is: "otherConstraints",
                                    then: (s) =>
                                        s
                                            .oneOf([...PUBLIC_ACCESS_LIMITATIONS], "La limitation d'accès est obligatoire")
                                            .required("La limitation d'accès est obligatoire"),
                                    otherwise: (s) => s.optional(),
                                }),
                                // classification → MD_ClassificationCode
                                classification_code: yup.string().when("type", {
                                    is: "classification",
                                    then: (s) =>
                                        s.oneOf([...CLASSIFICATION_CODES], "La classification est obligatoire").required("La classification est obligatoire"),
                                    otherwise: (s) => s.optional(),
                                }),
                                // useLimitation : URL optionnelle + description obligatoire
                                url: yup.string().when("type", {
                                    is: "useLimitation",
                                    then: (s) => s.url("L'URL n'est pas valide").optional(),
                                    otherwise: (s) => s.optional(),
                                }),
                                description: yup.string().when("type", {
                                    is: "useLimitation",
                                    then: (s) => s.required("La description est obligatoire"),
                                    otherwise: (s) => s.optional(),
                                }),
                            })
                        )
                        .min(1, "Au moins une contrainte est requise")
                        .required(),
                })
            )
            .min(1, "Ajoutez au moins une condition de licence")
            .required("Ajoutez au moins une condition de licence"),

        // Section informations sur les métadonnées
        resource_genealogy: stringTrimmed().optional(),
        hierarchy_level: yup.mixed<MetadataHierarchyLevel>().oneOf(Object.values(MetadataHierarchyLevel)).required("Le type de données est obligatoire"),
        language: yup
            .object({
                language: stringTrimmed().defined(),
                code: stringTrimmed().defined(),
            })
            .required("La langue est obligatoire") as yup.ObjectSchema<LanguageType>,
        charset: stringTrimmed().required("Le jeu de caractères est obligatoire"),
    });

export type MetadataFormValues = yup.InferType<ReturnType<typeof buildMetadataSchema>>;

// Ligne du tableau "producers", dérivée du schéma Yup (source de vérité unique)
export type ProducerFormValues = MetadataFormValues["producers"][number];

// Types dérivés pour la section licences (source de vérité unique : schéma Yup)
export type ResourceConstraintFormValues = NonNullable<MetadataFormValues["resource_constraints"]>[number];
export type SubConstraintFormValues = ResourceConstraintFormValues["constraints"][number];

// ---------------------------------------------------------------------------
// Dictionnaire des champs par section
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Valeurs par défaut pour l'initialisation du formulaire
// ---------------------------------------------------------------------------

export const defaultMetadataValues: Partial<MetadataFormValues> = {
    name: "",
    description: "",
    themes: [],
    keywords_inspire: [],
    keywords_additional: [],
    file_identifier: "",
    producers: [{ organization_name: "", organization_email: "", role: "pointOfContact" }],
    update_frequency: undefined,
    territories: [],
    resource_genealogy: "",
    hierarchy_level: MetadataHierarchyLevel.Dataset,
    charset: "utf8",
    date_creation: new Date(),
    language: { code: "fre", language: "français" },
};

// ---------------------------------------------------------------------------
// Fabriques de valeurs par défaut pour la section licences
// ---------------------------------------------------------------------------

/** URL de référence de la Licence Ouverte Etalab - sert aussi à la détection dans l'UI. */
export const OPEN_LICENSE_URL = "https://www.etalab.gouv.fr/wp-content/uploads/2018/11/open-licence.pdf";

/**
 * Sous-contrainte "limite d'usage" verrouillée (compagnon auto-ajouté, non supprimable).
 * Utilisée comme compagnon de useConstraints/accessConstraints quand la valeur n'est pas
 * « otherRestrictions », et comme seul sous-encart des conditions « autre ».
 */
export function makeLockedUseLimitation(overrides?: Partial<SubConstraintFormValues>): SubConstraintFormValues {
    return { type: "useLimitation", locked: true, description: "", ...overrides };
}

/**
 * Sous-contrainte "autre contrainte" verrouillée (compagnon auto-ajouté quand la valeur
 * useConstraints/accessConstraints est « otherRestrictions »).
 */
export function makeLockedOtherConstraints(): SubConstraintFormValues {
    return { type: "otherConstraints", locked: true, limitation_code: "noLimitations" };
}

/** Sous-contraintes par défaut pour une condition légale (2 sous-encarts). */
export function makeLegalDefaults(): SubConstraintFormValues[] {
    return [{ type: "useConstraints", locked: false, restriction_code: "license" }, makeLockedUseLimitation()];
}

/** Sous-contraintes par défaut pour une condition de sécurité (2 sous-encarts). */
export function makeSecurityDefaults(): SubConstraintFormValues[] {
    return [{ type: "classification", locked: true, classification_code: "" }, makeLockedUseLimitation()];
}

/** Sous-contrainte par défaut pour une condition « autre » (1 sous-encart). */
export function makeOtherDefaults(): SubConstraintFormValues[] {
    return [makeLockedUseLimitation()];
}

/**
 * Retourne les sous-contraintes par défaut selon le type de condition.
 * Utilisé lors du changement de type d'une condition (réinitialise le tableau).
 */
export function makeDefaultConstraints(conditionType: ConstraintType): SubConstraintFormValues[] {
    switch (conditionType) {
        case "legal":
            return makeLegalDefaults();
        case "security":
            return makeSecurityDefaults();
        case "other":
            return makeOtherDefaults();
    }
}

/**
 * Condition préremplie « Licence Ouverte / Open License (Etalab) ».
 * Ajoute une condition légale avec accès libre (noLimitations) et useLimitation pointant
 * vers la licence Etalab. Le bouton « Ajouter une licence ouverte » est désactivé dès
 * qu'une condition contenant cette URL est déjà présente.
 */
export function makeOpenLicenseCondition(): ResourceConstraintFormValues {
    return {
        type: "legal",
        constraints: [
            { type: "accessConstraints", locked: false, restriction_code: "otherRestrictions" },
            makeLockedOtherConstraints(),
            { type: "useConstraints", locked: false, restriction_code: "license" },
            makeLockedUseLimitation({
                url: OPEN_LICENSE_URL,
                description: "Licence Ouverte / Open License (compatible ODC-BY, CC-BY 2.0)",
            }),
        ],
    };
}

// ---------------------------------------------------------------------------
// Helpers de mapping pour la soumission
// ---------------------------------------------------------------------------

/**
 * Applique la règle métier du gestionnaire (custodian) au moment de la soumission.
 *
 * Le rôle "custodian" est obligatoire dans les métadonnées ISO 19115 finales.
 * Si l'utilisateur n'a déclaré aucun producteur ayant ce rôle, le contact
 * (pointOfContact, toujours présent en index 0) est dupliqué en tant que gestionnaire.
 * La liste d'entrée n'est pas mutée.
 *
 * @param producers Lignes du formulaire (l'index 0 est garanti "pointOfContact" côté UI).
 * @returns La liste des producteurs, complétée d'un gestionnaire dérivé du contact si nécessaire.
 */
export function withCustodianFallback(producers: ProducerFormValues[]): ProducerFormValues[] {
    if (producers.some((p) => p.role === "custodian")) return producers;
    const pointOfContact = producers.find((p) => p.role === "pointOfContact");
    if (!pointOfContact) return producers; // défensif : ne devrait pas arriver (index 0 verrouillé)
    return [...producers, { ...pointOfContact, role: "custodian" }];
}

// ---------------------------------------------------------------------------
// Types et helpers pour la soumission au backend
// ---------------------------------------------------------------------------

/**
 * Payload JSON envoyé au backend (champs de fichier exclus — envoyés séparément via annexes).
 * Correspond au DatasheetMetadataDTO PHP.
 */
export type MetadataPayload = {
    name: string;
    description: string;
    themes: string[];
    keywords_inspire: string[];
    keywords_additional: string[];
    file_identifier: string;
    producers: Array<{
        organization_name: string;
        organization_email: string;
        role: string;
        address_number?: string | null;
        address_street?: string | null;
        address_postal_code?: string | null;
        address_city?: string | null;
    }>;
    date_creation: string;
    update_frequency: string;
    territories: Array<{ id: string; title: string; bbox: number[] }>;
    resource_constraints: Array<{
        type: string;
        constraints: Array<{
            type: string;
            locked: boolean;
            restriction_code?: string | null;
            limitation_code?: string | null;
            classification_code?: string | null;
            url?: string | null;
            description?: string | null;
        }>;
    }>;
    resource_genealogy?: string | null;
    hierarchy_level: string;
    language: { code: string; language: string };
    charset: string;
};

/**
 * Construit le payload JSON à envoyer au backend à partir des valeurs du formulaire.
 * - Applique `withCustodianFallback` pour garantir la présence du gestionnaire ISO 19115.
 * - Exclut les champs de fichiers (thumbnail, logo_file) — envoyés séparément via annexes.
 * - Formate `date_creation` (Date → ISO YYYY-MM-DD).
 * - Mappe `territories` (objets Territory) → tableau d'identifiants.
 */
export function buildMetadataPayload(values: MetadataFormValues): MetadataPayload {
    const producers = withCustodianFallback(values.producers).map(
        ({ organization_name, organization_email, role, address_number, address_street, address_postal_code, address_city }) => ({
            organization_name,
            organization_email,
            role,
            address_number: address_number ?? null,
            address_street: address_street ?? null,
            address_postal_code: address_postal_code ?? null,
            address_city: address_city ?? null,
        })
    );

    const date_creation =
        values.date_creation instanceof Date ? values.date_creation.toISOString().slice(0, 10) : ((values.date_creation as string | undefined) ?? "");

    const territories = (values.territories ?? [])
        .filter((t) => typeof t === "object" && t !== null && "id" in t)
        .map((t) => {
            const territory = t as { id: string | number; title?: string; bbox?: number[] };
            return {
                id: String(territory.id),
                title: territory.title ?? String(territory.id),
                bbox: Array.isArray(territory.bbox) ? territory.bbox : [],
            };
        });

    const resource_constraints = (values.resource_constraints ?? []).map((condition) => ({
        type: condition.type,
        constraints: condition.constraints.map(({ type, locked, restriction_code, limitation_code, classification_code, url, description }) => ({
            type,
            locked,
            restriction_code: restriction_code ?? null,
            limitation_code: limitation_code ?? null,
            classification_code: classification_code ?? null,
            url: url ?? null,
            description: description ?? null,
        })),
    }));

    return {
        name: values.name,
        description: values.description,
        themes: values.themes,
        keywords_inspire: values.keywords_inspire ?? [],
        keywords_additional: values.keywords_additional ?? [],
        file_identifier: values.file_identifier,
        producers,
        date_creation,
        update_frequency: values.update_frequency ?? "",
        territories,
        resource_constraints,
        resource_genealogy: values.resource_genealogy ?? null,
        hierarchy_level: values.hierarchy_level,
        language: { code: values.language.code, language: values.language.language },
        charset: values.charset,
    };
}

/**
 * Convertit une métadonnée renvoyée par l'API (`api.metadata.getByDatasheetName`) en valeurs
 * initiales du formulaire pour le mode édition.
 *
 * Les champs nouveaux (issus du nouveau design) absents des métadonnées existantes
 * utilisent les valeurs par défaut de `defaultMetadataValues` (migration incrémentale).
 */
export function mapMetadataToFormValues(apiMetadata: Metadata | undefined): Partial<MetadataFormValues> {
    if (!apiMetadata?.csw_metadata) return defaultMetadataValues;

    const csw = apiMetadata.csw_metadata;

    // Producteurs : lecture directe depuis le tableau unifié
    // On force le cast du role (string) vers ProducerRole — les valeurs proviennent du XML qu'on a nous-mêmes écrit.
    const producers = normalizeProducers(
        (csw.producers ?? []).map((p) => ({
            organization_name: p.organization_name,
            organization_email: p.organization_email,
            role: (PRODUCER_ROLES.includes(p.role as ProducerRole) ? p.role : "pointOfContact") as ProducerRole,
            address_number: p.address_number ?? undefined,
            address_street: p.address_street ?? undefined,
            address_postal_code: p.address_postal_code ?? undefined,
            address_city: p.address_city ?? undefined,
        }))
    );

    // date_creation : chaîne ISO → Date
    let date_creation: Date | undefined;
    if (csw.date_creation) {
        const d = new Date(csw.date_creation);
        date_creation = isNaN(d.getTime()) ? undefined : d;
    }

    // Langue
    let language: { code: string; language: string } | undefined;
    if (csw.language) {
        language = csw.language;
    }

    return {
        ...defaultMetadataValues,
        name: csw.name ?? apiMetadata.tags?.datasheet_name ?? "",
        description: csw.description ?? "",
        file_identifier: apiMetadata.file_identifier ?? "",
        themes: csw.themes ?? [],
        keywords_inspire: csw.keywords_inspire ?? [],
        keywords_additional: csw.keywords_additional ?? [],
        producers,
        date_creation,
        update_frequency: (csw.update_frequency as UpdateFrequency | undefined) ?? undefined,
        resource_genealogy: csw.resource_genealogy ?? "",
        hierarchy_level: (csw.hierarchy_level as MetadataHierarchyLevel | undefined) ?? MetadataHierarchyLevel.Dataset,
        language: language ?? undefined,
        charset: csw.charset ?? defaultMetadataValues.charset,
        // territories : reconstruits depuis csw.territories ; on ne dispose que de id/title/bbox,
        // les champs optionnels supplémentaires de Territory (description, zoom, etc.) sont absents
        // mais ne sont pas utilisés par le formulaire — on caste explicitement.
        territories: (csw.territories ?? []).map((t) => ({ id: t.id, title: t.title, bbox: t.bbox }) as unknown as Territory),
        // resource_constraints : reconstruits depuis csw.resource_constraints
        resource_constraints: (csw.resource_constraints ?? []).map((condition) => ({
            type: (CONSTRAINT_TYPES.includes(condition.type as ConstraintType) ? condition.type : "other") as ConstraintType,
            constraints: condition.constraints.map((sub) => ({
                type: (SUB_CONSTRAINT_TYPES.includes(sub.type as SubConstraintType) ? sub.type : "useLimitation") as SubConstraintType,
                locked: sub.locked ?? false,
                restriction_code: sub.restriction_code ?? undefined,
                limitation_code: sub.limitation_code ?? undefined,
                classification_code: sub.classification_code ?? undefined,
                url: sub.url ?? undefined,
                description: sub.description ?? undefined,
            })),
        })),
    };
}

// ---------------------------------------------------------------------------

/**
 * Normalise la liste des producteurs pour satisfaire l'invariant du formulaire :
 * le pointOfContact doit être en index 0 (carte verrouillée côté UI, ProducerSection).
 *
 * - Si un pointOfContact existe ailleurs dans la liste, il est déplacé en tête.
 * - S'il n'en existe aucun (ex. métadonnées legacy sans rôle), une ligne contact
 *   vide est insérée en tête pour que l'utilisateur la complète.
 * Ne mute pas la liste d'entrée.
 *
 * À utiliser lors du mapping métadonnées API → valeurs du formulaire (mode édition),
 * avant de passer les données en defaultValues à MetadataForm.
 */
export function normalizeProducers(producers: ProducerFormValues[]): ProducerFormValues[] {
    const contactIndex = producers.findIndex((p) => p.role === "pointOfContact");
    if (contactIndex === 0) return producers;
    if (contactIndex > 0) {
        return [producers[contactIndex], ...producers.filter((_, i) => i !== contactIndex)];
    }
    // Aucun pointOfContact trouvé : insérer une ligne vide en tête
    return [{ organization_name: "", organization_email: "", role: "pointOfContact" }, ...producers];
}
