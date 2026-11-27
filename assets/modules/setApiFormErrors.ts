import { type FieldPath, type FieldValues, type UseFormSetError } from "react-hook-form";

import { isApiError } from "./apiError";

/**
 * Reporte les `violations` d’une réponse 422 (Problem Details) sur les champs d’un formulaire React Hook Form.
 * Les chemins Symfony `producers[0].email` deviennent `producers.0.email` ; seul le premier message par champ est gardé.
 *
 * @returns `true` si au moins une erreur a été posée
 */
export function setApiFormErrors<TFieldValues extends FieldValues>(error: unknown, setError: UseFormSetError<TFieldValues>): boolean {
    if (!isApiError(error) || !error.violations?.length) {
        return false;
    }

    const seen = new Set<string>();
    for (const violation of error.violations) {
        const path = violation.propertyPath.replace(/\[(\d+)\]/g, ".$1");
        if (path === "" || seen.has(path)) {
            continue;
        }
        seen.add(path);
        setError(path as FieldPath<TFieldValues>, { type: "server", message: violation.title });
    }

    return seen.size > 0;
}
