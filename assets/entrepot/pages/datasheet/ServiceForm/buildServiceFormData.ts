import { type ServiceFormValues, type ServiceType } from "./serviceFormSchema";

/**
 * Requête multipart attendue par les routes `publish` : champ `data` (JSON lu par MultipartPayloadMapper côté Symfony)
 * et fichiers `thumbnail` et `attribution_logo`. La donnée stockée voyage dans l’URL.
 */
export function buildServiceFormData(type: ServiceType, values: ServiceFormValues): FormData {
    const payload: Record<string, unknown> = {
        title: values.title,
        technical_name: values.technical_name,
        themes: values.themes,
        access: values.access,
        attribution: values.attribution_enabled ? { title: values.attribution_title, url: values.attribution_url } : null,
    };

    if (type === "wfs") {
        payload.tables = values.tables
            .filter((table) => table.selected)
            .map(({ native_name, title, public_name, description, keywords }) => ({ native_name, title, public_name, description, keywords }));
    }

    const formData = new FormData();
    formData.set("data", JSON.stringify(payload));
    if (values.thumbnail instanceof File) {
        formData.set("thumbnail", values.thumbnail);
    }
    if (values.attribution_enabled && values.attribution_logo instanceof File) {
        formData.set("attribution_logo", values.attribution_logo);
    }

    return formData;
}
