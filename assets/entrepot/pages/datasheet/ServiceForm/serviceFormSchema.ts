import { type TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";
import { z } from "zod";

import { ConfigurationTypeEnum, type DatasheetDetailed, type DatastoreEndpoint, SERVICE_ACCESSES, type ServiceAccess } from "@/@types/app";
import { type ComponentKey } from "@/i18n/types";
import { regex, SERVICE_TYPES, type ServiceType } from "@/utils";
import { TAG_VALUE_MAX_LENGTH } from "../DatasetAdd/datasetAddSchema";
import { type SldError, validateSld } from "./validateSld";

type T = TranslationFunction<"ServiceForm", ComponentKey>;

type ServiceEndpointType = ConfigurationTypeEnum.WFS | ConfigurationTypeEnum.WMSVECTOR | ConfigurationTypeEnum.WMSRASTER | ConfigurationTypeEnum.WMTSTMS;

/** type de configuration Entrepôt (et d’endpoint) du type de flux */
export const SERVICE_CONFIGURATION_TYPES: Record<ServiceType, ServiceEndpointType> = {
    wfs: ConfigurationTypeEnum.WFS,
    wms: ConfigurationTypeEnum.WMSVECTOR,
    tms: ConfigurationTypeEnum.WMTSTMS,
    wmts: ConfigurationTypeEnum.WMTSTMS,
};

/** un flux WMS publié depuis une pyramide raster est un WMS raster */
export const isRasterPyramid = (datasheet: DatasheetDetailed | undefined, storedDataId: string): boolean =>
    (datasheet?.pyramid_raster_list ?? []).some((item) => item._id === storedDataId);

export const configurationTypeFor = (type: ServiceType, rasterPyramid: boolean): ServiceEndpointType =>
    type === "wms" && rasterPyramid ? ConfigurationTypeEnum.WMSRASTER : SERVICE_CONFIGURATION_TYPES[type];

/** tables à choisir : WFS, WMS sur une base vecteur ; ni WMS raster, ni WMTS, ni TMS */
export const hasTables = (type: ServiceType, rasterPyramid: boolean): boolean => type === "wfs" || (type === "wms" && !rasterPyramid);

export { SERVICE_ACCESSES, type ServiceAccess };
export { SERVICE_TYPES, type ServiceType };

const isFull = (item: DatastoreEndpoint) => item.use >= item.quota;

// premier endpoint du type et de l’ouverture, comme le back
const endpointFor = (endpoints: DatastoreEndpoint[], configurationType: ConfigurationTypeEnum, open: boolean) =>
    endpoints.find((item) => item.endpoint.type.toUpperCase() === configurationType && item.endpoint.open === open);

export const isEndpointFull = (endpoints: DatastoreEndpoint[] | undefined, configurationType: ConfigurationTypeEnum, open: boolean): boolean => {
    const item = endpoints && endpointFor(endpoints, configurationType, open);
    return item !== undefined && isFull(item);
};

/** accès offerts par les endpoints non pleins de l’entrepôt pour ce type de configuration (le back refuse un accès sans endpoint) */
export const availableServiceAccesses = (
    endpoints: DatastoreEndpoint[] | undefined,
    configurationType: ConfigurationTypeEnum,
    savedAccess?: ServiceAccess
): readonly ServiceAccess[] => {
    const savedOpen = savedAccess === undefined ? undefined : savedAccess === "public";
    const usable = (open: boolean) => {
        // l’endpoint du flux enregistré reste proposé, et seul lui tant que les endpoints ne sont pas lus
        if (open === savedOpen) return true;
        if (!endpoints) return savedOpen === undefined;
        const item = endpointFor(endpoints, configurationType, open);
        return item !== undefined && !isFull(item);
    };
    return SERVICE_ACCESSES.filter((access) => usable(access === "public"));
};

// WMS : vecteur ou raster selon la donnée choisie
const endpointTypesOf = (type: ServiceType) => [...new Set([false, true].map((raster) => configurationTypeFor(type, raster)))];

/** carte de type désactivée : tous les endpoints présents derrière elle sont pleins ; un type sans endpoint est ignoré */
const presentEndpoints = (endpoints: DatastoreEndpoint[], type: ServiceType) =>
    endpointTypesOf(type).flatMap((configurationType) => [true, false].flatMap((open) => endpointFor(endpoints, configurationType, open) ?? []));

export const isServiceTypeFull = (endpoints: DatastoreEndpoint[] | undefined, type: ServiceType): boolean => {
    if (!endpoints) return false;
    const present = presentEndpoints(endpoints, type);
    return present.length > 0 && present.every(isFull);
};

/** plus rien à publier : aucun endpoint présent n’a de place, un type sans endpoint comptant comme plein */
export const isDatastoreFull = (endpoints: DatastoreEndpoint[] | undefined): boolean =>
    !!endpoints && !SERVICE_TYPES.some((type) => presentEndpoints(endpoints, type).some((item) => !isFull(item)));

/** endpoints pleins derrière la carte de type, ouvert avant privé */
export const fullServiceEndpoints = (endpoints: DatastoreEndpoint[] | undefined, type: ServiceType) =>
    endpointTypesOf(type).flatMap((configurationType) =>
        [true, false].flatMap((open) => {
            const item = endpoints && endpointFor(endpoints, configurationType, open);
            return item && isFull(item) ? [{ configurationType, open }] : [];
        })
    );

/** même regex que WfsTableFormDTO : nom technique d’une table WFS en minuscules */
export const WFS_TABLE_TECHNICAL_NAME_REGEX = /^[a-z_][a-z0-9_.-]*$/;

export const SERVICE_IMAGE_ACCEPT = ["jpg", "jpeg", "png"];
export const SERVICE_IMAGE_MAX_SIZE_MB = 5;

/** formats d’infobulle, même liste que WmsVectorFeatureInfoService::FORMATS */
export const FEATURE_INFO_FORMATS = ["list", "table"] as const;

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
    /** modification : noms techniques enregistrés par table (`native_name` → `public_name`) ; nom facultatif, ancien nom accepté hors de la règle des minuscules, pas de plafond de tables en WFS */
    savedTablePublicNames?: Readonly<Record<string, string>>;
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
    if (type === "tms") return t("validation.stored_data.required_tms");
    return t("validation.stored_data.required");
};

// le schéma objet reste sans raffinement : la modification en retire des champs
const buildServiceFormObject = ({
    t,
    type,
    rasterPyramid = false,
    existingLayerNames,
    layerNamePrefix,
    availableAccesses,
    savedTablePublicNames,
}: SchemaDeps) => {
    const edit = savedTablePublicNames !== undefined;
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
            // modification WMS vecteur : fichier de style enregistré, gardé sans nouveau fichier
            saved_style_id: z.string().optional(),
            // modification : table enregistrée absente de la base, affichée mais non cochable
            missing: z.boolean().optional(),
            // WMS vecteur : attributs affichés dans l’infobulle
            featureinfo_attributes: z.array(z.string()),
            // WMS vecteur : table sans colonne à afficher, donc sans infobulle
            featureinfo_unavailable: z.boolean().optional(),
        })
        // champs obligatoires seulement sur les tables cochées
        .superRefine(async (table, ctx) => {
            if (!table.selected) return;
            if (type === "wms") {
                if (table.style === undefined) {
                    if (table.saved_style_id === undefined) ctx.addIssue({ code: "custom", path: ["style"], message: t("validation.table.style.required") });
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
                // modification : vide = l’Entrepôt sert `native_name`
                if (!edit) ctx.addIssue({ code: "custom", path: ["public_name"], message: t("validation.table.public_name.required") });
            } else if (!WFS_TABLE_TECHNICAL_NAME_REGEX.test(table.public_name) && savedTablePublicNames?.[table.native_name] !== table.public_name) {
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
            } else if (
                // domaine de premier niveau exigé, comme Assert\Url(requireTld: true) côté serveur
                !z.url({ protocol: /^https?$/, hostname: /\.[a-z]{2,}$/i }).safeParse(attribution.url).success
            ) {
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
        description: type === "wfs" ? z.string() : z.string().trim().min(1, t("validation.description.required")),
        tables: hasTables(type, rasterPyramid)
            ? z
                  .array(tableSchema)
                  .refine((tables) => tables.some((table) => table.selected), t("validation.tables.required"))
                  .refine(
                      // plafond des fichiers de style du WMS vecteur, publication WFS comprise ; pas en modification WFS
                      (tables) => (edit && type === "wfs") || tables.filter((table) => table.selected).length <= SERVICE_TABLES_MAX,
                      t("validation.tables.max", { max: SERVICE_TABLES_MAX })
                  )
            : z.array(tableSchema),
        access: z
            .enum(SERVICE_ACCESSES, { error: t(availableAccesses.length === 0 ? "validation.access.unavailable" : "validation.access.required") })
            .refine((access) => availableAccesses.includes(access), t("validation.access.unavailable")),
        attribution: attributionSchema,
        featureinfo: z.object({ enabled: z.boolean(), format: z.enum(FEATURE_INFO_FORMATS) }),
    });
};

type FeatureInfoValues = {
    featureinfo: { enabled: boolean };
    tables: { selected: boolean; featureinfo_attributes: string[]; featureinfo_unavailable?: boolean }[];
};

// WMS vecteur, infobulles activées : au moins un attribut par table cochée
const checkFeatureInfo =
    ({ t, type, rasterPyramid = false }: Pick<SchemaDeps, "t" | "type" | "rasterPyramid">) =>
    (values: FeatureInfoValues, ctx: z.RefinementCtx) => {
        if (type !== "wms" || rasterPyramid || !values.featureinfo.enabled) return;
        values.tables.forEach((table, index) => {
            if (table.selected && !table.featureinfo_unavailable && table.featureinfo_attributes.length === 0) {
                ctx.addIssue({ code: "custom", path: ["tables", index, "featureinfo_attributes"], message: t("validation.featureinfo.attributes.required") });
            }
        });
    };

export const buildServiceFormSchema = (deps: SchemaDeps) => buildServiceFormObject(deps).superRefine(checkFeatureInfo(deps));

// type, donnée stockée et nom technique figés en modification
export const buildServiceEditFormSchema = (
    deps: Omit<SchemaDeps, "existingLayerNames" | "layerNamePrefix"> & { savedTablePublicNames: Readonly<Record<string, string>> }
) =>
    buildServiceFormObject({ ...deps, existingLayerNames: [] })
        .omit({ stored_data_id: true, technical_name: true })
        .superRefine(checkFeatureInfo(deps));

export type ServiceEditFormValues = z.input<ReturnType<typeof buildServiceEditFormSchema>>;
export type ServiceEditFormOutput = z.output<ReturnType<typeof buildServiceEditFormSchema>>;

export type ServiceFormValues = z.input<ReturnType<typeof buildServiceFormSchema>>;
export type ServiceFormOutput = z.output<ReturnType<typeof buildServiceFormSchema>>;
export type ServiceTableFormValues = ServiceFormValues["tables"][number];

// pas d’accès par défaut : l’utilisateur le choisit
export const serviceFormDefaultValues: Omit<ServiceFormValues, "access"> = {
    stored_data_id: "",
    title: "",
    technical_name: "",
    description: "",
    thumbnail: undefined,
    themes: [],
    tables: [],
    attribution: { enabled: false, title: "", url: "", logo: undefined },
    featureinfo: { enabled: false, format: "list" },
};
