import * as yup from "yup";

import { MetadataHierarchyLevel } from "@/@types/app";
import { LanguageType, regex } from "@/utils";

// ---------------------------------------------------------------------------
// Types intermédiaires pour les champs composés
// ---------------------------------------------------------------------------

export type ProducerFormValues = {
    organizationName: string;
    organizationEmail: string;
    logoFile?: FileList;
    addressNumber?: string;
    addressStreet?: string;
    addressPostalCode?: string;
    addressCity?: string;
};

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
                    role: yup.string().required("Le rôle du producteur est obligatoire"),
                    logoFile: yup.mixed<FileList>().optional(),
                    addressNumber: yup.string().optional(),
                    addressStreet: yup.string().optional(),
                    addressPostalCode: yup.string().optional(),
                    addressCity: yup.string().optional(),
                })
            )
            .min(1, "Au moins un producteur est requis")
            .required(),

        // Section date
        creationDate: yup.date().typeError("Format de date invalide (JJ/MM/AAAA)").required("La date de création est obligatoire"),
        updateFrequency: yup.string().required("La fréquence de mise à jour est obligatoire"),

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
    producers: [{ organizationName: "", organizationEmail: "", role: "contact" }],
    updateFrequency: "",
    territories: [],
    licenses: [],
    resourceGenealogy: "",
    hierarchyLevel: MetadataHierarchyLevel.Dataset,
    charset: "utf8",
};
