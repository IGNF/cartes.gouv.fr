import { useSearch as useRouteSearch } from "@tanstack/react-router";

import { stringParam } from "@/router/searchParams";

interface IUseSearchResult<T> {
    search: string;
    searchedItems: T[];
}

export function useSearch<T>(data: T[], searchProperty = "name"): IUseSearchResult<T> {
    const search = stringParam(useRouteSearch({ strict: false }).search) ?? "";
    const matches = (item: T) => {
        const value = (item as Record<string, unknown>)[searchProperty];
        return typeof value === "string" && value.toLowerCase().includes(search.toLowerCase());
    };
    return {
        search,
        searchedItems: search ? data.filter(matches) : data,
    };
}
