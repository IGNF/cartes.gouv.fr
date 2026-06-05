import * as yup from "yup";

import { MetadataHierarchyLevel } from "@/@types/app";
import { LanguageType, regex } from "@/utils";

// ---------------------------------------------------------------------------
// Types intermédiaires pour les champs composés
// ---------------------------------------------------------------------------

export const PRODUCER_ROLES = ["pointOfContact", "custodian", "author", "owner", "resourceProvider"] as const;
export type ProducerRole = (typeof PRODUCER_ROLES)[number];

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

export type LicenseFormValues = {
    conditionType: string;
    constraintType: string;
};

// ---------------------------------------------------------------------------
// Schéma Yup principal — toutes les sections de la fiche de données
// ---------------------------------------------------------------------------

type MasterSchemaDeps = {
    existingDatasheetNames: string[];
    isEditMode: boolean;
    checkFileIdentifier: (fileIdentifier: string) => Promise<boolean>;
};

export const buildMetadataSchema = ({ existingDatasheetNames, isEditMode, checkFileIdentifier }: MasterSchemaDeps) =>
    yup.object({
        // Section description
        name: yup
            .string()
            .required("Le nom de la fiche de données est obligatoire")
            .max(99, "Le nom ne peut pas dépasser 99 caractères")
            .matches(regex.datasheet_name, "Le nom contient des caractères non autorisés")
            .transform((v) => v?.trim())
            .test("is-unique", "Une fiche de données portant ce nom existe déjà", (value) => {
                if (isEditMode) return true;
                if (!value) return true;
                return !existingDatasheetNames.includes(value);
            }),
        description: yup.string().required("La description est obligatoire"),
        thumbnail: yup.mixed<FileList>().optional(),
        themes: yup.array(yup.string().defined()).min(1, "Sélectionnez au moins une thématique").required("Sélectionnez au moins une thématique"),
        inspireKeywords: yup.array(yup.string().defined()).optional(),
        additionalKeywords: yup.array(yup.string().defined()).optional(),
        fileIdentifier: yup
            .string()
            .required("L'identifiant de fichier est obligatoire")
            .matches(regex.file_identifier, "L'identifiant de fichier contient des caractères non autorisés")
            .test("is-file-identifier-unique", "Cet identifiant unique est déjà utilisé", async (value) => {
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
                    organizationName: yup.string().required("Le nom de l'organisme est obligatoire"),
                    organizationEmail: yup
                        .string()
                        .email("Format d'adresse électronique invalide")
                        .required("L'adresse électronique de l'organisme est obligatoire"),
                    // Rôle ISO 19115. L'index 0 est verrouillé sur "pointOfContact" côté UI ;
                    // un rôle vide ("") échoue le oneOf → validation "rôle obligatoire" pour les autres cartes.
                    role: yup
                        .mixed<ProducerRole>()
                        .oneOf([...PRODUCER_ROLES], "Le rôle du producteur est obligatoire")
                        .required("Le rôle du producteur est obligatoire"),
                    logoFile: yup.mixed<FileList>().optional(),
                    addressNumber: yup.string().optional(),
                    addressStreet: yup.string().optional(),
                    addressPostalCode: yup.string().optional(),
                    addressCity: yup.string().optional(),
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
        creationDate: yup.date().typeError("Format de date invalide (JJ/MM/AAAA)").required("La date de création est obligatoire"),
        updateFrequency: yup
            .mixed<UpdateFrequency>()
            .oneOf([...UPDATE_FREQUENCIES], "La fréquence de mise à jour est obligatoire")
            .required("La fréquence de mise à jour est obligatoire"),

        // Section emprise spatiale
        territories: yup.array(yup.string().defined()).min(1, "Sélectionnez au moins un territoire").required(),

        // Section licences
        licenses: yup
            .array(
                yup.object({
                    conditionType: yup.string().required("Le type de condition est obligatoire"),
                    constraintType: yup.string().required("Le type de contrainte est obligatoire"),
                })
            )
            .optional()
            .default([]),

        // Section informations sur les métadonnées
        resourceGenealogy: yup.string().optional(),
        hierarchyLevel: yup.mixed<MetadataHierarchyLevel>().oneOf(Object.values(MetadataHierarchyLevel)).required("Le type de données est obligatoire"),
        language: yup
            .object({
                language: yup.string().defined(),
                code: yup.string().defined(),
            })
            .required("La langue est obligatoire") as yup.ObjectSchema<LanguageType>,
        charset: yup.string().required("Le jeu de caractères est obligatoire"),
    });

export type MetadataFormValues = yup.InferType<ReturnType<typeof buildMetadataSchema>>;

// Ligne du tableau "producers", dérivée du schéma Yup (source de vérité unique)
export type ProducerFormValues = MetadataFormValues["producers"][number];

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
    inspireKeywords: [],
    additionalKeywords: [],
    fileIdentifier: "",
    producers: [{ organizationName: "", organizationEmail: "", role: "pointOfContact" }],
    updateFrequency: undefined,
    territories: [],
    licenses: [],
    resourceGenealogy: "",
    hierarchyLevel: MetadataHierarchyLevel.Dataset,
    charset: "utf8",
};

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
    return [{ organizationName: "", organizationEmail: "", role: "pointOfContact" }, ...producers];
}
