export type GetResponse<T> = {
    content: T[];
    totalPages: number;
    previousPage: number;
    nextPage: number;
};
