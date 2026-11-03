import { routeNumberParam, useRoute } from "@/router/router";

export enum FilterEnum {
    ALL = 0,
    ENABLED = 1,
    DISABLED = 2,
}

export type IFilters = Record<string, FilterEnum | FilterEnum[]>;

const availableValues = Object.values(FilterEnum);

type FilterTests<T> = Record<FilterEnum.ENABLED | FilterEnum.DISABLED, (item: T, key: string) => boolean>;

const valueOf = (item: unknown, key: string) => (item as Record<string, unknown>)[key];

const defaultTests: FilterTests<unknown> = {
    [FilterEnum.ENABLED]: (item, key) => Boolean(valueOf(item, key)),
    [FilterEnum.DISABLED]: (item, key) => !valueOf(item, key),
};

function getFilteredList<T>(list: T[], filters: IFilters, tests: FilterTests<T>): T[] {
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

export function useFilters<T>(data: T[], availableFilters: string[], tests: FilterTests<T> = defaultTests): IUseFiltersResult<T> {
    const { params } = useRoute();
    const filters = Object.fromEntries(
        availableFilters.map((key) => {
            const value = routeNumberParam(params, key) ?? FilterEnum.ALL;
            return [key, availableValues.includes(value) ? value : FilterEnum.ALL];
        })
    );
    return {
        filteredItems: getFilteredList(data, filters, tests),
        filters,
    };
}
