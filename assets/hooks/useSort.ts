export enum SortOrderEnum {
    ASCENDING = 1,
    DESCENDING = -1,
}

const availableSortOrder = Object.values(SortOrderEnum);

function getSortedList<T>(list: T[], sortBy: string, sortOrder: SortOrderEnum): T[] {
    return [...list].sort((a, b) => {
        if (typeof a[sortBy] === "string") {
            return a[sortBy].localeCompare(b[sortBy]) * sortOrder;
        } else if (typeof a[sortBy] === "number") {
            return (a[sortBy] - b[sortBy]) * sortOrder;
        }
        return 0;
    });
}

interface IUseSortResult<T> {
    sortBy: string;
    sortOrder: SortOrderEnum;
    sortedItems: T[];
}

type SortParams = {
    sortBy?: string;
    sortOrder?: number;
};

/** Trie une liste ; les valeurs viennent du useSearch typé de la route appelante */
export function useSort<T>(
    data: T[],
    sortParams: SortParams,
    availableSortBy = ["name"],
    defaultSortBy = "name",
    defaultSortOrder = SortOrderEnum.ASCENDING
): IUseSortResult<T> {
    let sortBy = sortParams.sortBy ?? defaultSortBy;
    if (!availableSortBy.includes(sortBy)) {
        sortBy = defaultSortBy;
    }
    let sortOrder = sortParams.sortOrder ?? defaultSortOrder;
    if (!availableSortOrder.includes(sortOrder)) {
        sortOrder = defaultSortOrder;
    }
    return {
        sortBy,
        sortOrder,
        sortedItems: getSortedList(data, sortBy, sortOrder),
    };
}
