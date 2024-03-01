export default class Cleaner {
    private keepEmptyStrings: boolean;

    constructor(keepEmptyStrings = false) {
        this.keepEmptyStrings = keepEmptyStrings;
    }

    cleanObject(values): object | null {
        const result = {};
        for (const property in values) {
            const clean = this.clean(values[property]);
            if (clean !== null) result[property] = clean;
        }
        return Object.keys(result).length !== 0 ? result : null;
    }

    cleanArray(array) {
        const result: unknown[] = [];
        array.forEach((v) => {
            const clean = this.clean(v);
            if (clean !== null) result.push(clean);
        });
        return result.length !== 0 ? result : null;
    }

    private clean(value: unknown) {
        if (typeof value === "string") {
            const trimmed = value.trim();
            return trimmed !== "" ? trimmed : this.keepEmptyStrings ? "" : null;
        } else if (Array.isArray(value)) {
            return this.cleanArray(value);
        } else if (typeof value === "object") {
            return this.cleanObject(value);
        } else return value === undefined ? null : value;
    }
}
