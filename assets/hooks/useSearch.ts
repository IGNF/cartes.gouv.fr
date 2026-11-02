import { routeStringParam, useRoute } from "@/router/router";

interface IUseSearchResult<T> {
    search: string;
    searchedItems: T[];
}

export function useSearch<T>(data: T[], searchProperty = "name"): IUseSearchResult<T> {
    const { params } = useRoute();
    const search = routeStringParam(params, "search") ?? "";
    const matches = (item: T) => {
        const value = (item as Record<string, unknown>)[searchProperty];
        return typeof value === "string" && value.toLowerCase().includes(search.toLowerCase());
    };
    return {
        search,
        searchedItems: search ? data.filter(matches) : data,
    };
}
