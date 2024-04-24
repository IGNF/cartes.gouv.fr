export type GetResponse<T> = {
    content: T[];
    totalPages: number;
    previousPage: number;
    nextPage: number;
};

export type CommunityListFilter = "public" | "iam_member" | "affiliation";
