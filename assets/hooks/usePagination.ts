interface IUsePaginationResult<T> {
    paginatedItems: T[];
    totalPages: number;
}

export function usePagination<T>(data: T[], page = 1, limit = 20): IUsePaginationResult<T> {
    const totalPages = Math.ceil(data.length / limit);
    if (page > totalPages) {
        page = totalPages;
    } else if (page < 1) {
        page = 1;
    }
    return {
        paginatedItems: data?.slice((page - 1) * limit, page * limit),
        totalPages,
    };
}
