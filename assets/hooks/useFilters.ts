export enum FilterEnum {
    ALL = 0,
    ENABLED = 1,
    DISABLED = 2,
}

export type IFilters = Record<string, FilterEnum | FilterEnum[]>;

const availableValues = Object.values(FilterEnum);

const defaultTests = {
    [FilterEnum.ENABLED]: (item, key) => Boolean(item[key]),
    [FilterEnum.DISABLED]: (item, key) => !item[key],
};

function getFilteredList<T>(list: T[], filters: IFilters, tests = defaultTests): T[] {
    const entries = Object.entries(filters);
    if (entries.length === 0) {
        return list;
    }

    let filtered: T[] = list;
    for (const [key, value] of entries) {
        if ((value instanceof Array && value.includes(FilterEnum.ENABLED)) || value === FilterEnum.ENABLED) {
            filtered = filtered.filter((item) => tests[FilterEnum.ENABLED](item, key));
        }
        if ((value instanceof Array && value.includes(FilterEnum.DISABLED)) || value === FilterEnum.DISABLED) {
            filtered = filtered.filter((item) => tests[FilterEnum.DISABLED](item, key));
        }
    }
    return filtered;
}

interface IUseFiltersResult<T> {
    filteredItems: T[];
    filters: IFilters;
}

/** Filtre une liste ; les valeurs viennent du useSearch typé de la route appelante (clé → valeur brute) */
export function useFilters<T>(data: T[], filterValues: Record<string, unknown>, availableFilters: string[], tests = defaultTests): IUseFiltersResult<T> {
    const filters = Object.fromEntries(
        availableFilters.map((key) => {
            const raw = filterValues[key];
            const value = raw !== undefined && raw !== null ? Number(raw) : FilterEnum.ALL;
            return [key, availableValues.includes(value) ? value : FilterEnum.ALL];
        })
    );
    return {
        filteredItems: getFilteredList(data, filters, tests),
        filters,
    };
}
