import { useRoute } from "@/router/router";

interface IUseSearchResult<T> {
    search: string;
    searchedItems: T[];
}

export function useSearch<T>(data: T[], searchProperty = "name"): IUseSearchResult<T> {
    const { params } = useRoute();
    const search = params["search"] ?? "";
    return {
        search,
        searchedItems: search ? data.filter((d) => d[searchProperty].toLowerCase().includes(search.toLowerCase())) : data,
    };
}
