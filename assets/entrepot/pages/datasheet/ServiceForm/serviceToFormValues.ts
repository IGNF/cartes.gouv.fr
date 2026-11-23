import markdownit from "markdown-it";

import { type ConfigurationFeatureInfo, OfferingTypeEnum, type Service, type VectorDb } from "@/@types/app";
import { type ConfigurationUsedDataRelationWfsDetailsContent, type ConfigurationUsedDataRelationWmsVectorDetailsContent } from "@/@types/entrepot";
import { filterGeometricRelations } from "@/helpers";
import { getThematicCategories } from "@/utils";
import { type ServiceFormValues, type ServiceTableFormValues } from "./serviceFormSchema";

const md = markdownit();
const themeCodesByLabel = new Map(getThematicCategories().map((category) => [category.text, category.code]));

// les anciens formulaires TMS et raster enregistraient la description encodée en JSON
const decodeDescription = (abstract: string): string | undefined => {
    if (abstract.length >= 2 && abstract.startsWith('"') && abstract.endsWith('"')) {
        try {
            const decoded: unknown = JSON.parse(abstract);
            if (typeof decoded === "string") return decoded;
        } catch {
            // chaîne entre guillemets mais pas du JSON : gardée telle quelle
        }
    }
    return undefined;
};

/** texte simple d’une description markdown des anciens formulaires, paragraphes séparés par une ligne vide */
export const markdownToText = (markdown: string): string =>
    md
        .parse(markdown, {})
        .flatMap((token) => {
            if (token.type === "inline") {
                return [(token.children ?? []).map((child) => (child.type === "softbreak" || child.type === "hardbreak" ? "\n" : child.content)).join("")];
            }
            return token.type === "fence" || token.type === "code_block" ? [token.content.trimEnd()] : [];
        })
        .join("\n\n");

// codes joints par « , » ; les anciens formulaires écrivaient les libellés, dont certains contiennent « , » : la plus longue jonction connue l’emporte
const readThemes = (tag: string): string[] => {
    const parts = tag.split(", ").filter((part) => part !== "");
    const themes: string[] = [];
    for (let start = 0; start < parts.length;) {
        let end = parts.length;
        while (end > start + 1 && !themeCodesByLabel.has(parts.slice(start, end).join(", "))) end--;
        const theme = parts.slice(start, end).join(", ");
        themes.push(themeCodesByLabel.get(theme) ?? theme);
        start = end;
    }
    return themes;
};

/** attributs proposés dans l’infobulle, par table géométrique : colonnes non géométriques par ordre alphabétique */
export const featureInfoColumns = (vectorDb: VectorDb | undefined): Record<string, string[]> =>
    Object.fromEntries(
        filterGeometricRelations(vectorDb?.type_infos?.relations ?? [], true).map((relation) => [
            relation.name,
            Object.entries("attributes" in relation ? relation.attributes : {})
                .filter(([, type]) => !type.startsWith("geometry"))
                .map(([name]) => name)
                .sort((a, b) => a.localeCompare(b)),
        ])
    );

/** une ligne par table géométrique de la base, aucune cochée */
export const defaultTables = (vectorDb: VectorDb): ServiceTableFormValues[] => {
    const columns = featureInfoColumns(vectorDb);
    return filterGeometricRelations(vectorDb.type_infos?.relations ?? [], true).map((relation) =>
        columns[relation.name].length === 0 ? { ...defaultTable(relation.name), featureinfo_unavailable: true } : defaultTable(relation.name)
    );
};

const defaultTable = (name: string): ServiceTableFormValues => ({
    native_name: name,
    selected: false,
    title: name,
    public_name: name.toLowerCase(),
    description: "",
    keywords: [],
    style: undefined,
    featureinfo_attributes: [],
});

// WMS vecteur : tables enregistrées par `name`, avec leur fichier de style et les attributs d’infobulle encore présents dans la table ; même règle qu’en WFS pour une table disparue
const wmsVectorTables = (
    relations: ConfigurationUsedDataRelationWmsVectorDetailsContent[],
    vectorDb: VectorDb,
    featureInfo: ConfigurationFeatureInfo | null | undefined
): ServiceTableFormValues[] => {
    const savedStyles = new Map(relations.map((relation) => [relation.name, relation.style]));
    const columns = featureInfoColumns(vectorDb);
    const tables = defaultTables(vectorDb).map((table) =>
        savedStyles.has(table.native_name)
            ? {
                  ...table,
                  selected: true,
                  saved_style_id: savedStyles.get(table.native_name),
                  featureinfo_attributes: (featureInfo?.attributes[table.native_name] ?? []).filter((name) => columns[table.native_name]?.includes(name)),
              }
            : table
    );
    const missing = relations.filter((relation) => !tables.some((table) => table.native_name === relation.name));
    return [...tables, ...missing.map((relation) => ({ ...defaultTable(relation.name), missing: true, saved_style_id: relation.style }))];
};

// tables de la base, cochées et remplies depuis les relations enregistrées ; une relation dont la table a disparu reste affichée, non cochable
const wfsTables = (relations: ConfigurationUsedDataRelationWfsDetailsContent[], vectorDb: VectorDb): ServiceTableFormValues[] => {
    const saved = new Map(relations.map((relation) => [relation.native_name, relation]));
    const tables = defaultTables(vectorDb).map((table) => {
        const relation = saved.get(table.native_name);
        return relation ? toTable(relation, { selected: true }) : table;
    });
    const missing = relations.filter((relation) => !tables.some((table) => table.native_name === relation.native_name));
    return [...tables, ...missing.map((relation) => toTable(relation, { selected: false, missing: true }))];
};

const toTable = (
    relation: ConfigurationUsedDataRelationWfsDetailsContent,
    state: Pick<ServiceTableFormValues, "selected" | "missing">
): ServiceTableFormValues => ({
    native_name: relation.native_name,
    title: relation.title,
    public_name: relation.public_name ?? "",
    description: relation.abstract,
    keywords: relation.keywords ?? [],
    style: undefined,
    featureinfo_attributes: [],
    ...state,
});

/**
 * Valeurs du formulaire d’un flux publié. `vectorDb` : base du flux WFS ou WMS vecteur, pour proposer toutes ses tables ; sans elle, aucune table.
 */
export function serviceToFormValues(service: Service, vectorDb?: VectorDb): ServiceFormValues {
    const { configuration } = service;
    const typeInfos = configuration.type_infos;
    const abstract = "abstract" in typeInfos && typeof typeInfos.abstract === "string" ? typeInfos.abstract : "";
    const decoded = decodeDescription(abstract);
    const usedData = typeInfos.used_data[0];
    const relations = usedData && "relations" in usedData ? usedData.relations : [];
    const readTables = (db: VectorDb) =>
        service.type === OfferingTypeEnum.WMSVECTOR
            ? wmsVectorTables(relations as ConfigurationUsedDataRelationWmsVectorDetailsContent[], db, configuration.featureinfo)
            : wfsTables(relations as ConfigurationUsedDataRelationWfsDetailsContent[], db);

    return {
        stored_data_id: usedData?.stored_data ?? "",
        title: configuration.name,
        technical_name: configuration.layer_name,
        // markdown seulement dans les descriptions encodées des anciens formulaires
        description: decoded === undefined ? abstract : markdownToText(decoded),
        thumbnail: undefined,
        themes: readThemes(configuration.tags.theme ?? ""),
        tables: vectorDb ? readTables(vectorDb) : [],
        // accès inconnu (permissions non lues) : la page ne permet pas la modification
        access: service.access ?? "restricted",
        attribution: {
            enabled: Boolean(configuration.attribution),
            title: configuration.attribution?.title ?? "",
            url: configuration.attribution?.url ?? "",
            logo: undefined,
        },
        featureinfo: {
            enabled: Object.keys(configuration.featureinfo?.attributes ?? {}).length > 0,
            format: configuration.featureinfo?.format ?? "list",
        },
    };
}
