// Lecture des paramètres de recherche dans les validateSearch : TanStack parse chaque valeur en JSON (`?q=12` arrive en nombre)

export function stringParam(value: unknown): string | undefined {
    return typeof value === "string" || typeof value === "number" || typeof value === "boolean" ? String(value) : undefined;
}

// paramètre requis absent : le routeur l’enveloppe dans SearchParamError, rendu en page introuvable
export function requiredStringParam(value: unknown, name: string): string {
    const string = stringParam(value);
    if (string === undefined || string === "") {
        throw new Error(`paramètre de recherche requis manquant : ${name}`);
    }
    return string;
}

// entier, comme parseInt : une valeur décimale est tronquée
export function integerParam(value: unknown): number | undefined {
    const number = typeof value === "string" ? parseInt(value, 10) : value;
    return typeof number === "number" && Number.isFinite(number) ? Math.trunc(number) : undefined;
}

// page ou taille de page : une valeur inférieure à 1 est ignorée
export function positiveIntegerParam(value: unknown): number | undefined {
    const number = integerParam(value);
    return number !== undefined && number >= 1 ? number : undefined;
}

export function enumParam<T extends string | number>(value: unknown, allowed: readonly T[]): T | undefined {
    return allowed.find((item) => item === value || (typeof item === "number" && item === integerParam(value)));
}
