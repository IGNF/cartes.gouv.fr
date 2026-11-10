import { type ApiError } from "@/modules/jsonFetch";
import { type ServiceFormOutput, type ServiceType } from "./serviceFormSchema";

/**
 * Requête multipart des routes `publish` : champ `data` (JSON lu par MultipartPayloadMapper côté Symfony)
 * et fichiers `thumbnail`, `attribution_logo`. La donnée stockée voyage dans l’URL.
 */
export function buildServiceFormData(type: ServiceType, values: ServiceFormOutput): FormData {
    const { attribution } = values;
    const payload: Record<string, unknown> = {
        title: values.title,
        technical_name: values.technical_name,
        themes: values.themes,
        access: values.access,
        attribution: attribution.enabled ? { title: attribution.title, url: attribution.url } : null,
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
    if (attribution.enabled && attribution.logo instanceof File) {
        formData.set("attribution_logo", attribution.logo);
    }

    return formData;
}

/**
 * Le back ne reçoit que les tables cochées : `tables[i]` d’une erreur 422 désigne la i-ème table cochée du formulaire.
 */
export function mapTableViolationPaths(error: ApiError, tables: readonly { selected: boolean }[]): ApiError {
    const formIndexes = tables.flatMap((table, index) => (table.selected ? [index] : []));

    return {
        ...error,
        violations: error.violations?.map((violation) => ({
            ...violation,
            propertyPath: violation.propertyPath.replace(/^tables\[(\d+)\]/, (match, sent: string) => {
                const formIndex = formIndexes[Number(sent)];
                return formIndex === undefined ? match : `tables[${formIndex}]`;
            }),
        })),
    };
}
