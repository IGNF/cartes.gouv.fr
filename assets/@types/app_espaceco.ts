import { Extent } from "ol/extent";
import {
    AttributeDTO,
    BasicRecipients,
    DocumentDTO,
    EmailPlannerDTO,
    GridDTO,
    LayerToolsType,
    ReportStatusesDTO,
    RoleType,
    SharedGeorem,
    SharedThemesDTO,
    ThemeDTO,
    UserDTO,
} from "./espaceco";

export type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>;

export type GetResponse<T> = {
    content: T[];
    totalPages: number;
    previousPage: number;
    nextPage: number;
};

export const arrCommunityListFilters = ["listed", "iam_member", "affiliation"] as const;
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

export type Role = "pending" | "member" | "admin" | "invited";
export type CommunityMember = UserType & {
    grids: GridDTO[];
    role: Role;
    active: boolean;
    date: string;
};

export type CommunityMemberDetailed = {
    user_id: number;
    community_name: string;
    community_id: number;
    grids: GridDTO[];
    role: Role;
    active: boolean;
    date: string;
};

export type Profile = {
    community_id: number;
    themes: ThemeDTO[];
};

export type UserMe = {
    id: number;
    email: string;
    username: string;
    surname: string | null;
    description: string | null;
    administrator: boolean;
    profile: Profile;
    shared_themes: SharedThemesDTO[];
    communities_member: CommunityMemberDetailed[];
};

export type LayerGeometryType = "Point" | "MultiPoint" | "LineString" | "MultiLineString" | "Polygon" | "MultiPolygon";

export type CommunityLayer = {
    table: number;
    database: number;
    role: RoleType;
    snapto: string | null;
    tools: LayerToolsType[] | null;
    database_name: string;
    database_title: string;
    table_name: string;
    table_title: string;
    geometry_type: LayerGeometryType;
};

export const autofillKeywords = [
    "id",
    "userId",
    "userName",
    "date",
    "document1",
    "document2",
    "document3",
    "document4",
    "lon",
    "lat",
    "municipalityInsee",
    "municipalityName",
    "departmentInsee",
    "departmentName",
    "groupId",
    "groupName",
] as const;

export type AutofillKeywordsType = (typeof autofillKeywords)[number];

/* FORMULAIRES */
export type CommunityFormMode = "creation" | "edition";

export type DocumentFormType = AtLeast<DocumentDTO, "id" | "title"> & { file?: File };

export const MembershipRequestValues = ["open", "not_open", "partially_open"] as const;
export type MembershipRequestType = (typeof MembershipRequestValues)[number];

export type OpenWithEmailType = {
    email: string;
    grids: GridDTO[];
};

export type DescriptionFormType = {
    name: string;
    description?: string;
    editorial?: string;
    keywords?: string[];
    logo?: unknown | null;
    listed: boolean;
    membershipRequest: MembershipRequestType;
    openWithEmail: OpenWithEmailType[];
};

/* Les fonctionnalités (outils) */
export type CommunityToolsType = "navigation" | "measure" | "report" | "other";

export const navigationTools = [
    "savePositions",
    "locateControl",
    "zoomControl",
    "rotateControl",
    "overviewMapControl",
    "searchAddress",
    "searchLonlat",
] as const;
export type NavigationToolsType = (typeof navigationTools)[number];

export const otherTools = ["search", "print"] as const;
export type OtherToolsType = (typeof otherTools)[number];

export const reportTools = ["georem"] as const;
export type ReportToolsType = (typeof reportTools)[number];

export const measureTools = ["measureDistance", "measureArea", "measureAzimut"] as const;
export type MeasureToolsType = (typeof measureTools)[number];

/*************************************************************************************/

export type TableTheme = Record<string, { database: string; table: string; attributes: AttributeDTO[] }>;

// LES FORMULAIRES
export type ZoomAndCenteringFormType = {
    position: number[];
    zoom: number;
    minZoom: number;
    maxZoom: number;
    extent?: Extent | null;
};

/* export type ToolsFormType = {
    navigationTools?: NavigationToolsType[];
    reportTools?: ReportToolsType[];
    measureTools?: MeasureToolsType[];
    otherTools?: OtherToolsType[];
}; */

export type ToolsFormType = {
    functionalities: string[];
};

export type ReportFormType = {
    attributes: ThemeDTO[];
    report_statuses: ReportStatusesDTO;
    shared_themes?: SharedThemesDTO[];
    shared_georem: SharedGeorem;
    all_members_can_valid: boolean;
};

/* email planners */
export const EmailPlannerKeywords = ["id", "author", "group", "comment", "status", "openingDate", "updatingDate", "closingDate", "validator"] as const;
export type KeywordsType = (typeof EmailPlannerKeywords)[number];

export const BasicRecipientsArray: string[] = [...BasicRecipients] as string[];

export const EmailPlannerTypes = ["basic", "personal"] as const;
export type EmailPlannerType = (typeof EmailPlannerTypes)[number];

export type EmailPlannerAddType = Omit<EmailPlannerDTO, "id">;

export type EmailPlannerFormType = Omit<EmailPlannerDTO, "id" | "recipients" | "event" | "cancel_event" | "themes" | "condition"> & {
    id?: number;
    event: string;
    cancel_event: string;
    recipients: string[];
    statuses?: string[];
    themes?: string[];
};

export const isUser = (v: UserDTO | string): v is UserDTO => {
    return (v as UserDTO).username !== undefined;
};
