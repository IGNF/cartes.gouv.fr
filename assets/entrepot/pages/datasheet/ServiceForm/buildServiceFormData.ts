import { type ApiError } from "@/modules/jsonFetch";
import { type ServiceFormOutput, type ServiceType } from "./serviceFormSchema";

/**
 * Requête multipart des routes `publish` : champ `data` (JSON lu par MultipartPayloadMapper côté Symfony)
 * et fichiers `thumbnail`, `attribution_logo`, `style_files[<table>]` (WMS vecteur). La donnée stockée voyage dans l’URL.
 */
export function buildServiceFormData(type: ServiceType, values: ServiceFormOutput, rasterPyramid = false): FormData {
    // WMS raster et WMTS : ni tables ni fichiers de style
    const wmsVector = type === "wms" && !rasterPyramid;
    const { attribution } = values;
    const payload: Record<string, unknown> = {
        title: values.title,
        technical_name: values.technical_name,
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
 * (`tables[i]` = i-ème table cochée, `selected_tables` = leurs noms), le logo voyage comme fichier `attribution_logo`
 * et le style d’une table comme fichier `style_files[<table>]`.
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
        return path.replace(/^tables\[(\d+)\]/, (match, sent: string) => {
            const formIndex = formIndexes[Number(sent)];
            return formIndex === undefined ? match : `tables[${formIndex}]`;
        });
    };

    return { ...error, violations: error.violations?.map((violation) => ({ ...violation, propertyPath: toFormPath(violation.propertyPath) })) };
}
