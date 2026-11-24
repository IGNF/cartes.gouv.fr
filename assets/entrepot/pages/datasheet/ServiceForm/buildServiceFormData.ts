import { type ApiError } from "@/modules/jsonFetch";
import { configurationTypeFor, type ServiceEditFormOutput, type ServiceFormOutput, type ServiceType } from "./serviceFormSchema";

/**
 * Requête multipart de la route de publication : champ `data` (JSON lu par MultipartPayloadMapper côté Symfony, avec le type de configuration et la donnée stockée)
 * et fichiers `thumbnail`, `attribution_logo`, `style_files[<table>]` (WMS vecteur).
 */
export function buildServiceFormData(type: ServiceType, values: ServiceFormOutput, rasterPyramid = false): FormData {
    return buildFormData(type, values, rasterPyramid, {
        type: configurationTypeFor(type, rasterPyramid),
        stored_data_id: values.stored_data_id,
        technical_name: values.technical_name,
    });
}

/** Requête multipart de la route de modification : `data` de la publication sans type, donnée stockée ni nom technique, avec les retraits d’images (valeur null). */
export function buildServiceEditFormData(type: ServiceType, values: ServiceEditFormOutput, rasterPyramid = false): FormData {
    return buildFormData(type, values, rasterPyramid, {
        remove_thumbnail: values.thumbnail === null,
        remove_attribution_logo: values.attribution.logo === null,
    });
}

function buildFormData(type: ServiceType, values: ServiceEditFormOutput, rasterPyramid: boolean, fields: Record<string, unknown>): FormData {
    // WMS raster, WMTS et TMS : ni tables ni fichiers de style
    const wmsVector = type === "wms" && !rasterPyramid;
    const { attribution } = values;
    const payload: Record<string, unknown> = {
        ...fields,
        title: values.title,
        themes: values.themes,
        access: values.access,
        attribution: attribution.enabled ? { title: attribution.title, url: attribution.url } : null,
    };

    const selectedTables = values.tables.filter((table) => table.selected);
    if (type === "wfs") {
        payload.tables = selectedTables.map(({ native_name, title, public_name, description, keywords }) => ({
            native_name,
            title,
            public_name,
            description,
            keywords,
        }));
    } else {
        payload.description = values.description;
    }
    if (wmsVector) {
        payload.selected_tables = selectedTables.map((table) => table.native_name);
        // attributs dans l’ordre alphabétique, celui du modèle généré
        payload.featureinfo = values.featureinfo.enabled
            ? {
                  format: values.featureinfo.format,
                  // une table sans colonne à afficher n’a pas d’infobulle
                  attributes: Object.fromEntries(
                      selectedTables
                          .filter((table) => table.featureinfo_attributes.length > 0)
                          .map((table) => [table.native_name, [...table.featureinfo_attributes].sort((a, b) => a.localeCompare(b))])
                  ),
              }
            : null;
    }

    const formData = new FormData();
    formData.set("data", JSON.stringify(payload));
    if (wmsVector) {
        for (const table of selectedTables) {
            if (table.style instanceof File) formData.set(`style_files[${table.native_name}]`, table.style);
        }
    }
    if (values.thumbnail instanceof File) {
        formData.set("thumbnail", values.thumbnail);
    }
    if (attribution.enabled && attribution.logo instanceof File) {
        formData.set("attribution_logo", attribution.logo);
    }

    return formData;
}

/**
 * Ramène les chemins d’une erreur 422 sur les champs du formulaire : le back ne reçoit que les tables cochées
 * (`tables[i]` = i-ème table cochée, `selected_tables` = leurs noms), le logo voyage comme fichier `attribution_logo`,
 * le style d’une table comme fichier `style_files[<table>]` et ses attributs d’infobulle sous `featureinfo.attributes[<table>]`.
 */
export function mapServiceViolationPaths(error: ApiError, tables: readonly { native_name: string; selected: boolean }[]): ApiError {
    const formIndexes = tables.flatMap((table, index) => (table.selected ? [index] : []));
    const toFormPath = (path: string) => {
        if (path === "attribution_logo") return "attribution.logo";
        if (path === "selected_tables") return "tables";
        const styleTable = /^style_files\[(.*)\]$/.exec(path)?.[1];
        if (styleTable !== undefined) {
            const formIndex = tables.findIndex((table) => table.native_name === styleTable);
            return formIndex === -1 ? path : `tables[${formIndex}].style`;
        }
        // `featureinfo.attributes[<table>]`, suivi de `[i]` pour un attribut
        const featureInfoTable = /^featureinfo\.attributes\[([^\]]*)\]/.exec(path)?.[1];
        if (featureInfoTable !== undefined) {
            const formIndex = tables.findIndex((table) => table.native_name === featureInfoTable);
            return formIndex === -1 ? path : `tables[${formIndex}].featureinfo_attributes`;
        }
        return path.replace(/^tables\[(\d+)\]/, (match, sent: string) => {
            const formIndex = formIndexes[Number(sent)];
            return formIndex === undefined ? match : `tables[${formIndex}]`;
        });
    };

    return { ...error, violations: error.violations?.map((violation) => ({ ...violation, propertyPath: toFormPath(violation.propertyPath) })) };
}
