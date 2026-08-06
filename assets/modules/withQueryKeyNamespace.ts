/**
 * Préfixe toutes les query keys d'un domaine ("entrepot", "espaceco"...)
 * pour éviter les collisions entre les caches des deux domaines.
 */
export function withQueryKeyNamespace<T extends Record<string, (...args: never[]) => string[]>>(namespace: string, keys: T): T {
    return Object.fromEntries(Object.entries(keys).map(([name, fn]) => [name, (...args: never[]) => [namespace, ...fn(...args)]])) as T;
}
