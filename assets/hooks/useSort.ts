import { useRoute } from "@/router/router";

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

export function useSort<T>(data: T[], availableSortBy = ["name"], defaultSortBy = "name", defaultSortOrder = SortOrderEnum.ASCENDING): IUseSortResult<T> {
    const { params } = useRoute();
    let sortBy = params["sortBy"] ?? defaultSortBy;
    if (!availableSortBy.includes(sortBy)) {
        sortBy = defaultSortBy;
    }
    let sortOrder = params["sortOrder"] ? parseInt(params["sortOrder"]) : defaultSortOrder;
    if (!availableSortOrder.includes(sortOrder)) {
        sortOrder = defaultSortOrder;
    }
    return {
        sortBy,
        sortOrder,
        sortedItems: getSortedList(data, sortBy, sortOrder),
    };
}
