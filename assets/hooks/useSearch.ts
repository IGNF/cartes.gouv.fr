interface IUseSearchResult<T> {
    search: string;
    searchedItems: T[];
}

/** Filtre une liste par recherche textuelle ; la valeur vient du useSearch typé de la route appelante */
export function useSearch<T>(data: T[], search: string, searchProperty = "name"): IUseSearchResult<T> {
    return {
        search,
        searchedItems: search ? data.filter((d) => d[searchProperty].toLowerCase().includes(search.toLowerCase())) : data,
    };
}
