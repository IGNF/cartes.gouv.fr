import { type ServiceFormValues, type ServiceType } from "./serviceFormSchema";

/**
 * Requête multipart attendue par les routes `publish` : champ `data` (JSON lu par MultipartPayloadMapper côté Symfony),
 * fichiers `thumbnail`, `attribution_logo` et `style_files[<table>]` (WMS-V). La donnée stockée voyage dans l’URL.
 */
export function buildServiceFormData(type: ServiceType, values: ServiceFormValues): FormData {
    const payload: Record<string, unknown> = {
        title: values.title,
        technical_name: values.technical_name,
        themes: values.themes,
        access: values.access,
        attribution: values.attribution_enabled ? { title: values.attribution_title, url: values.attribution_url } : null,
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
    }

    if (type === "wms") {
        payload.selected_tables = selectedTables.map((table) => table.native_name);
    }

    const formData = new FormData();
    formData.set("data", JSON.stringify(payload));
    if (type === "wms") {
        for (const table of selectedTables) {
            if (table.style instanceof File) {
                // entre crochets, PHP garde tels quels les espaces et points du nom de table
                formData.set(`style_files[${table.native_name}]`, table.style);
            }
        }
    }
    if (values.thumbnail instanceof File) {
        formData.set("thumbnail", values.thumbnail);
    }
    if (values.attribution_enabled && values.attribution_logo instanceof File) {
        formData.set("attribution_logo", values.attribution_logo);
    }

    return formData;
}
