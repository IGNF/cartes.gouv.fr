export enum FilterEnum {
    ALL = 0,
    PUBLISHED = 1,
    NOT_PUBLISHED = 2,
}

export enum SortByEnum {
    NAME = 1,
    NB_SERVICES = 2,
}

export enum SortOrderEnum {
    ASCENDING = 1,
    DESCENDING = -1,
}

export type Sort = { by: SortByEnum; order: SortOrderEnum };
