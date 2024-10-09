export type GetResponse<T> = {
    content: T[];
    totalPages: number;
    previousPage: number;
    nextPage: number;
};

export const arrCommunityListFilters = ["public", "iam_member", "affiliation"];
export type CommunityListFilter = (typeof arrCommunityListFilters)[number];

export type Address = {
    country: string;
    city: string;
    x: number;
    y: number;
    zipcode: string;
    street: string;
    classification: number;
    kind: string;
    fulltext: string;
    metropole: boolean;
};

export type Poi = {
    country: string;
    city: string;
    x: number;
    y: number;
    zipcode: string;
    zipcodes: string[];
    poiType: string[];
    street: string;
    classification: number;
    kind: string;
    fulltext: string;
    metropole: boolean;
};

export type SearchResult = {
    status: string;
    results: (Address | Poi)[];
};

export type SearchGridFilters = {
    searchBy?: ("name" | "title")[];
    fields?: ("name" | "title" | "type" | "extent" | "deleted")[];
    adm?: boolean;
};

export type CommunityMember = {
    user_id: number;
    username: string;
    firstname: string | null;
    surname: string | null;
    emprises: string[]; // TODO renommer en grids
    role: "pending" | "member" | "admin";
    active: boolean;
    date: string;
};

/* FORMULAIRES */
export type DescriptionFormType = {
    name: string;
    description?: string;
    keywords?: string[];
};
