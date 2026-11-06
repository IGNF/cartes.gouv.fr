import { useSearch } from "@tanstack/react-router";

import { integerParam, stringParam } from "@/router/searchParams";

export enum SortOrderEnum {
    ASCENDING = 1,
    DESCENDING = -1,
}

const availableSortOrder = Object.values(SortOrderEnum);

function getSortedList<T>(list: T[], sortBy: string, sortOrder: SortOrderEnum): T[] {
    const valueOf = (item: T) => (item as Record<string, unknown>)[sortBy];
    return [...list].sort((a, b) => {
        const valueA = valueOf(a);
        const valueB = valueOf(b);
        if (typeof valueA === "string" && typeof valueB === "string") {
            return valueA.localeCompare(valueB) * sortOrder;
        } else if (typeof valueA === "number" && typeof valueB === "number") {
            return (valueA - valueB) * sortOrder;
        }
        return 0;
    });
}

interface IUseSortResult<T> {
    sortBy: string;
    sortOrder: SortOrderEnum;
    sortedItems: T[];
}

export function useSort<T>(data: T[], availableSortBy = ["name"], defaultSortBy = "name", defaultSortOrder = SortOrderEnum.ASCENDING): IUseSortResult<T> {
    const search = useSearch({ strict: false });
    let sortBy = stringParam(search.sortBy) ?? defaultSortBy;
    if (!availableSortBy.includes(sortBy)) {
        sortBy = defaultSortBy;
    }
    let sortOrder = integerParam(search.sortOrder) ?? defaultSortOrder;
    if (!availableSortOrder.includes(sortOrder)) {
        sortOrder = defaultSortOrder;
    }
    return {
        sortBy,
        sortOrder,
        sortedItems: getSortedList(data, sortBy, sortOrder),
    };
}
