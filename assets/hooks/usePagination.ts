interface IUsePaginationResult<T> {
    paginatedItems: T[];
    totalPages: number;
    /** page affichée, ramenée entre 1 et totalPages (la liste a pu raccourcir) */
    page: number;
}

export function usePagination<T>(data: T[], page = 1, limit = 20): IUsePaginationResult<T> {
    const totalPages = Math.ceil(data.length / limit);
    const currentPage = Math.max(1, Math.min(page, totalPages));
    return {
        paginatedItems: data.slice((currentPage - 1) * limit, currentPage * limit),
        totalPages,
        page: currentPage,
    };
}
