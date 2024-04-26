export type GetResponse<T> = {
    content: T[];
    totalPages: number;
    previousPage: number;
    nextPage: number;
};

export const arrCommunityListFilters = ["public", "iam_member", "affiliation"];
export type CommunityListFilter = (typeof arrCommunityListFilters)[number];
