import { EmailPlannerDTO, GridDTO, ReportStatusesDTO, SharedGeorem, SharedThemesDTO, ThemeDTO, UserDTO } from "./espaceco";

export type GetResponse<T> = {
    content: T[];
    totalPages: number;
    previousPage: number;
    nextPage: number;
};

export const arrCommunityListFilters = ["public", "iam_member", "affiliation"] as const;
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

export type UserType = {
    user_id: number;
    username: string;
    firstname: string | null;
    surname: string | null;
};

export type Role = "pending" | "member" | "admin";
export type CommunityMember = UserType & {
    grids: GridDTO[];
    role: Role;
    active: boolean;
    date: string;
};

/* FORMULAIRES */
export type ReportFormType = {
    attributes: ThemeDTO[];
    report_statuses: ReportStatusesDTO;
    email_planners?: EmailPlannerDTO[];
    shared_themes?: SharedThemesDTO[];
    shared_georem: SharedGeorem;
    all_members_can_valid: boolean;
};

export type DescriptionFormType = {
    name: string;
    description?: string;
    keywords?: string[];
};

/* email planners */
export const EmailPlannerTypes = ["basic", "personal"] as const;
export type EmailPlannerType = (typeof EmailPlannerTypes)[number];

export type EmailPlannerFormType = Omit<EmailPlannerDTO, "id" | "recipients" | "themes" | "condition"> & {
    id?: number;
    recipients?: string[];
    condition?: { status: string[] };
    themes: string[];
};

const isUser = (v: UserDTO | string): v is UserDTO => {
    return (v as UserDTO).username !== undefined;
};

export { isUser };
