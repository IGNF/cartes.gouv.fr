import { type FieldPath, type UseFormSetError } from "react-hook-form";

import { type CartesApiException } from "./jsonFetch";

/**
 * Applique les erreurs de validation du backend sur un formulaire React Hook Form.
 *
 * Le backend renvoie les erreurs de validation (HTTP 422) sous la forme :
 * ```json
 * { "details": { "errors": { "producers[0].organization_email": "...", ... } } }
 * ```
 * Cette fonction les convertit en appels `setError(path, { type: "server", message })`,
 * en normalisant les chemins Symfony (`[0]`) en chemins RHF (`.0`).
 *
 * @returns `true` si au moins une erreur a été appliquée, `false` sinon.
 */
export function applyApiValidationErrors<TFieldValues extends Record<string, unknown>>(error: unknown, setError: UseFormSetError<TFieldValues>): boolean {
    const exception = error as CartesApiException | undefined;

    if (!exception || typeof exception !== "object") return false;

    const details = exception.details as { errors?: Record<string, string> } | undefined;
    const errors = details?.errors;

    if (!errors || typeof errors !== "object") return false;

    const paths = Object.keys(errors);
    if (paths.length === 0) return false;

    paths.forEach((symfonyPath) => {
        // Convertit "producers[0].organization_email" → "producers.0.organization_email"
        const rhfPath = symfonyPath.replace(/\[(\d+)\]/g, ".$1") as FieldPath<TFieldValues>;
        setError(rhfPath, { type: "server", message: errors[symfonyPath] });
    });

    return true;
}
