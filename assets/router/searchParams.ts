// Coercition des search params : TanStack parse chaque valeur via JSON.parse (un nombre arrive en number, le reste en string)

export function numberParam(value: unknown, fallback: number): number {
    if (value === undefined || value === null || value === "") {
        return fallback;
    }
    const num = Number(value);
    return Number.isNaN(num) ? fallback : num;
}

export function stringParam(value: unknown, fallback: string): string {
    return value === undefined || value === null ? fallback : String(value);
}

export function optionalStringParam(value: unknown): string | undefined {
    return value === undefined || value === null ? undefined : String(value);
}

// Param requis absent → erreur enveloppée dans SearchParamError par le router → 404 via l'errorComponent racine
export function requiredStringParam(value: unknown, name: string): string {
    if (value === undefined || value === null || value === "") {
        throw new Error(`paramètre de recherche requis manquant : ${name}`);
    }
    return String(value);
}
