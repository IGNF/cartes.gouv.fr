import * as yup from "yup";

import { regex } from "@/utils";

export const SERVICE_TYPES = ["wfs", "wms", "tms", "wmts"] as const;
export type ServiceType = (typeof SERVICE_TYPES)[number];

export const SERVICE_ACCESSES = ["public", "restricted_visible", "restricted"] as const;
export type ServiceAccess = (typeof SERVICE_ACCESSES)[number];

export type WfsTableFormValues = {
    native_name: string;
    selected: boolean;
    title: string;
    public_name: string;
    description: string;
    keywords: string[];
};

export type ServiceFormValues = {
    stored_data_id: string;
    title: string;
    technical_name: string;
    /** undefined : inchangée, null : supprimée, File : nouvelle image */
    thumbnail?: File | null;
    themes: string[];
    /** une entrée par table de la base vecteur, cochée ou non (WFS) */
    tables: WfsTableFormValues[];
    access: ServiceAccess;
    attribution_enabled: boolean;
    attribution_title: string;
    attribution_url: string;
    attribution_logo?: File | null;
};

export const defaultServiceFormValues: ServiceFormValues = {
    stored_data_id: "",
    title: "",
    technical_name: "",
    thumbnail: undefined,
    themes: [],
    tables: [],
    access: "public",
    attribution_enabled: false,
    attribution_title: "",
    attribution_url: "",
    attribution_logo: undefined,
};

export const isServiceType = (value: string | undefined): value is ServiceType => SERVICE_TYPES.includes(value as ServiceType);

/** nom technique d’une table WFS : minuscules seulement */
export const WFS_TABLE_TECHNICAL_NAME_REGEX = /^[a-z_][a-z0-9_.-]*$/;

const isImageFile = (value: unknown) => value === undefined || value === null || value instanceof File;

type BuildServiceFormSchemaParams = {
    /** type de flux choisi : décide des sections validées (tables pour WFS) */
    type: ServiceType;
    /** noms de couches déjà pris pour ce type de flux */
    existingLayerNames: string[];
    /** préfixe imposé par l’entrepôt aux noms techniques, suivi d’un point */
    layerNamePrefix?: string;
};

export function buildServiceFormSchema({ type, existingLayerNames, layerNamePrefix }: BuildServiceFormSchemaParams) {
    const requiredWhenSelected = (message: string) => (schema: yup.StringSchema) => schema.required(message);

    const wfsTableSchema = yup.object({
        native_name: yup.string().required(),
        selected: yup.boolean().required(),
        title: yup
            .string()
            .trim()
            .when("selected", { is: true, then: requiredWhenSelected("Le titre de la table est obligatoire") }),
        public_name: yup
            .string()
            .trim()
            .when("selected", {
                is: true,
                then: (schema) =>
                    schema
                        .required("Le nom technique de la table est obligatoire")
                        .matches(
                            WFS_TABLE_TECHNICAL_NAME_REGEX,
                            "Le nom technique de la table ne doit contenir que des minuscules, chiffres, tirets, points et tirets bas"
                        ),
            }),
        description: yup
            .string()
            .trim()
            .when("selected", { is: true, then: requiredWhenSelected("Le résumé de la table est obligatoire") }),
        keywords: yup.array(yup.string().required()).default([]),
    });

    const tablesSchema = yup.array(wfsTableSchema).default([]);

    return yup.object({
        stored_data_id: yup.string().required("Veuillez sélectionner un jeu de données vecteur"),
        title: yup.string().trim().required("Le titre du flux est obligatoire"),
        technical_name: yup
            .string()
            .trim()
            .required("Le nom technique du flux est obligatoire")
            .matches(regex.technical_name, "Le nom technique ne doit contenir ni espace ni caractère spécial")
            .test("is-unique", "Ce nom technique existe déjà", (value) => !value || !existingLayerNames.includes(value))
            .test(
                "has-prefix",
                "Le nom technique doit commencer par le préfixe défini dans la configuration de l’entrepôt",
                (value) => !value || !layerNamePrefix || value.startsWith(`${layerNamePrefix}.`)
            )
            .test(
                "not-prefix-only",
                "Le nom technique doit contenir au moins un caractère après le préfixe de l’entrepôt",
                (value) => !value || !layerNamePrefix || value !== `${layerNamePrefix}.`
            ),
        thumbnail: yup.mixed<File>().nullable().optional().test("is-file", "Fichier invalide", isImageFile),
        themes: yup.array(yup.string().required()).min(1, "Sélectionnez au moins une thématique").required(),
        tables:
            type === "wfs"
                ? tablesSchema.test("at-least-one", "Veuillez choisir au moins une table", (tables) => (tables ?? []).some((table) => table.selected))
                : tablesSchema,
        access: yup
            .string()
            .oneOf([...SERVICE_ACCESSES])
            .required(),
        attribution_enabled: yup.boolean().required(),
        attribution_title: yup
            .string()
            .trim()
            .when("attribution_enabled", { is: true, then: requiredWhenSelected("Le texte de l’attribution est obligatoire") }),
        attribution_url: yup
            .string()
            .trim()
            .when("attribution_enabled", {
                is: true,
                then: (schema) => schema.required("L’URL de l’attribution est obligatoire").url("L’URL de l’attribution n’est pas valide"),
            }),
        attribution_logo: yup.mixed<File>().nullable().optional().test("is-file", "Fichier invalide", isImageFile),
    });
}
