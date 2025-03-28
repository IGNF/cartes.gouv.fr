import { useRoute } from "@/router/router";

interface IUsePaginationResult<T> {
    limit: number;
    page: number;
    paginatedItems: T[];
    totalPages: number;
}

export function usePagination<T>(data: T[], availableLimits = [20], defaultPage = 1, defaultLimit = 20): IUsePaginationResult<T> {
    const { params } = useRoute();
    let limit = params["limit"] ? parseInt(params["limit"]) : defaultLimit;
    if (!availableLimits.includes(limit)) {
        limit = defaultLimit;
    }
    const totalPages = Math.ceil(data.length / limit);
    let page = params["page"] ? parseInt(params["page"]) : defaultPage;
    if (page > totalPages) {
        page = totalPages;
    } else if (page < 1) {
        page = 1;
    }
    return {
        limit,
        page,
        paginatedItems: data?.slice((page - 1) * limit, page * limit),
        totalPages,
    };
}
