import { type TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";
import { z } from "zod";

import { ConfigurationTypeEnum, type DatasheetDetailed } from "@/@types/app";
import { type ComponentKey } from "@/i18n/types";
import { regex } from "@/utils";
import { TAG_VALUE_MAX_LENGTH } from "../DatasetAdd/datasetAddSchema";
import { type SldError, validateSld } from "./validateSld";

type T = TranslationFunction<"ServiceForm", ComponentKey>;

export const SERVICE_TYPES = ["wfs", "wms", "tms", "wmts"] as const;
export type ServiceType = (typeof SERVICE_TYPES)[number];

/** types dont le formulaire est livré ; les autres cartes restent visibles mais désactivées */
export const IMPLEMENTED_SERVICE_TYPES: readonly ServiceType[] = ["wfs", "wms", "wmts"];

/** type de configuration Entrepôt (et d’endpoint) du type de flux */
export const SERVICE_CONFIGURATION_TYPES: Record<ServiceType, ConfigurationTypeEnum> = {
    wfs: ConfigurationTypeEnum.WFS,
    wms: ConfigurationTypeEnum.WMSVECTOR,
    tms: ConfigurationTypeEnum.WMTSTMS,
    wmts: ConfigurationTypeEnum.WMTSTMS,
};

/** un flux WMS publié depuis une pyramide raster est un WMS raster */
export const isRasterPyramid = (datasheet: DatasheetDetailed | undefined, storedDataId: string): boolean =>
    (datasheet?.pyramid_raster_list ?? []).some((item) => item._id === storedDataId);

export const configurationTypeFor = (type: ServiceType, rasterPyramid: boolean): ConfigurationTypeEnum =>
    type === "wms" && rasterPyramid ? ConfigurationTypeEnum.WMSRASTER : SERVICE_CONFIGURATION_TYPES[type];

/** type de flux publié depuis une pyramide raster (route pyramid-raster), undefined pour les autres routes, TMS compris */
export const rasterPyramidPublishType = (
    type: ServiceType,
    rasterPyramid: boolean
): ConfigurationTypeEnum.WMSRASTER | ConfigurationTypeEnum.WMTSTMS | undefined => {
    if (type === "wmts") return ConfigurationTypeEnum.WMTSTMS;
    if (type === "wms" && rasterPyramid) return ConfigurationTypeEnum.WMSRASTER;
    return undefined;
};

export const SERVICE_ACCESSES = ["public", "restricted_visible", "restricted"] as const;
export type ServiceAccess = (typeof SERVICE_ACCESSES)[number];

/** même regex que WfsTableFormDTO : nom technique d’une table WFS en minuscules */
export const WFS_TABLE_TECHNICAL_NAME_REGEX = /^[a-z_][a-z0-9_.-]*$/;

export const SERVICE_IMAGE_ACCEPT = ["jpg", "jpeg", "png"];
export const SERVICE_IMAGE_MAX_SIZE_MB = 5;

/** même limite que ServiceFormDTO::DESCRIPTION_MAX_LENGTH */
export const SERVICE_DESCRIPTION_MAX_LENGTH = 300;

/** même limite que ServiceFormDTO::TABLES_MAX */
export const SERVICE_TABLES_MAX = 10;

type SchemaDeps = {
    t: T;
    type: ServiceType;
    /** donnée choisie = pyramide raster (toujours en WMTS) : un flux sans tables ni styles */
    rasterPyramid?: boolean;
    /** noms de couches déjà pris pour ce type de flux */
    existingLayerNames: readonly string[];
    /** préfixe imposé par l’entrepôt aux noms techniques, suivi de « _ » */
    layerNamePrefix?: string;
    /** accès offerts par les endpoints de l’entrepôt pour ce type de flux */
    availableAccesses: readonly ServiceAccess[];
};

// undefined : inchangée, null : supprimée, File : nouvelle image
const imageFile = z.instanceof(File).nullish();

// fichier modifié ou déplacé sur le disque après son choix : le navigateur refuse de le lire
type StyleFileError = SldError | { code: "unreadable" };

// un même fichier n’est relu qu’une fois par table, même quand le formulaire revalide à chaque changement
const sldValidations = new WeakMap<File, Map<string, Promise<StyleFileError[]>>>();
// shortcut: lu en UTF-8 ; noms de table GeoPackage en ASCII (GpkgFormatHandler), autres formats non contrôlés, à revoir si un nom accentué est refusé à tort
const validateSldFile = (file: File, tableName: string): Promise<StyleFileError[]> => {
    const byTable = sldValidations.get(file) ?? new Map<string, Promise<StyleFileError[]>>();
    sldValidations.set(file, byTable);
    const validation =
        byTable.get(tableName) ??
        file
            .text()
            .then((text) => validateSld(text, tableName))
            .catch((): StyleFileError[] => {
                // échec non gardé : le prochain envoi relit le fichier
                byTable.delete(tableName);
                return [{ code: "unreadable" }];
            });
    byTable.set(tableName, validation);
    return validation;
};

const sldErrorMessage = (t: T, error: StyleFileError): string =>
    error.code === "layer_name" ? t("validation.table.style.layer_name", { expected: error.expected }) : t(`validation.table.style.${error.code}`);

const storedDataRequiredMessage = (t: T, type: ServiceType): string => {
    if (type === "wms") return t("validation.stored_data.required_wms");
    if (type === "wmts") return t("validation.stored_data.required_wmts");
    return t("validation.stored_data.required");
};

export const buildServiceFormSchema = ({ t, type, rasterPyramid = false, existingLayerNames, layerNamePrefix, availableAccesses }: SchemaDeps) => {
    const tableSchema = z
        .object({
            native_name: z.string(),
            selected: z.boolean(),
            title: z.string().trim(),
            public_name: z.string().trim(),
            description: z.string().trim(),
            keywords: z.array(z.string()),
            // fichier SLD (WMS vecteur)
            style: z.instanceof(File).optional(),
        })
        // champs obligatoires seulement sur les tables cochées
        .superRefine(async (table, ctx) => {
            if (!table.selected) return;
            if (type === "wms") {
                if (table.style === undefined) {
                    ctx.addIssue({ code: "custom", path: ["style"], message: t("validation.table.style.required") });
                } else if (!table.style.name.toLowerCase().endsWith(".sld")) {
                    ctx.addIssue({ code: "custom", path: ["style"], message: t("validation.table.style.extension") });
                } else {
                    const [error] = await validateSldFile(table.style, table.native_name);
                    if (error !== undefined) ctx.addIssue({ code: "custom", path: ["style"], message: sldErrorMessage(t, error) });
                }
            }
            if (type !== "wfs") return;
            if (table.title === "") ctx.addIssue({ code: "custom", path: ["title"], message: t("validation.table.title.required") });
            if (table.public_name === "") {
                ctx.addIssue({ code: "custom", path: ["public_name"], message: t("validation.table.public_name.required") });
            } else if (!WFS_TABLE_TECHNICAL_NAME_REGEX.test(table.public_name)) {
                ctx.addIssue({ code: "custom", path: ["public_name"], message: t("validation.table.public_name.chars") });
            }
            if (table.description === "") ctx.addIssue({ code: "custom", path: ["description"], message: t("validation.table.description.required") });
        });

    const attributionSchema = z
        .object({
            enabled: z.boolean(),
            title: z.string().trim(),
            url: z.string().trim(),
            logo: imageFile,
        })
        .superRefine((attribution, ctx) => {
            if (!attribution.enabled) return;
            if (attribution.title === "") ctx.addIssue({ code: "custom", path: ["title"], message: t("validation.attribution.text.required") });
            if (attribution.url === "") {
                ctx.addIssue({ code: "custom", path: ["url"], message: t("validation.attribution.url.required") });
            } else if (!z.url({ protocol: /^https?$/ }).safeParse(attribution.url).success) {
                ctx.addIssue({ code: "custom", path: ["url"], message: t("validation.attribution.url.invalid") });
            }
        });

    return z.object({
        stored_data_id: z.string().min(1, storedDataRequiredMessage(t, type)),
        title: z.string().trim().min(1, t("validation.title.required")),
        technical_name: z
            .string()
            .trim()
            .min(1, t("validation.technical_name.required"))
            .regex(regex.technical_name, t("validation.technical_name.chars"))
            .refine((value) => !existingLayerNames.includes(value), t("validation.technical_name.taken"))
            .refine(
                (value) => !layerNamePrefix || value.startsWith(`${layerNamePrefix}_`),
                t("validation.technical_name.prefix", { prefix: layerNamePrefix ?? "" })
            )
            .refine((value) => !layerNamePrefix || value !== `${layerNamePrefix}_`, t("validation.technical_name.prefix_only")),
        thumbnail: imageFile,
        themes: z
            .array(z.string())
            .min(1, t("validation.themes.required"))
            .refine((themes) => themes.join(", ").length <= TAG_VALUE_MAX_LENGTH, t("validation.themes.max", { max: TAG_VALUE_MAX_LENGTH })),
        // une entrée par table géométrique de la base choisie, cochée ou non
        // WFS : pas de description du flux, chaque table a la sienne
        description:
            type === "wfs"
                ? z.string()
                : z
                      .string()
                      .trim()
                      .min(1, t("validation.description.required"))
                      .max(SERVICE_DESCRIPTION_MAX_LENGTH, t("validation.description.max", { max: SERVICE_DESCRIPTION_MAX_LENGTH })),
        tables:
            type === "wfs" || (type === "wms" && !rasterPyramid)
                ? z
                      .array(tableSchema)
                      .refine((tables) => tables.some((table) => table.selected), t("validation.tables.required"))
                      .refine(
                          (tables) => tables.filter((table) => table.selected).length <= SERVICE_TABLES_MAX,
                          t("validation.tables.max", { max: SERVICE_TABLES_MAX })
                      )
                : z.array(tableSchema),
        access: z.enum(SERVICE_ACCESSES).refine((access) => availableAccesses.includes(access), t("validation.access.unavailable")),
        attribution: attributionSchema,
    });
};

export type ServiceFormValues = z.input<ReturnType<typeof buildServiceFormSchema>>;
export type ServiceFormOutput = z.output<ReturnType<typeof buildServiceFormSchema>>;
export type ServiceTableFormValues = ServiceFormValues["tables"][number];

export const serviceFormDefaultValues: ServiceFormValues = {
    stored_data_id: "",
    title: "",
    technical_name: "",
    description: "",
    thumbnail: undefined,
    themes: [],
    tables: [],
    access: "public",
    attribution: { enabled: false, title: "", url: "", logo: undefined },
};
