import { Extent } from "ol/extent";
import {
    AttributeDTO,
    BasicRecipients,
    DocumentDTO,
    EmailPlannerDTO,
    GridDTO,
    LayerTools,
    RefLayerTools,
    ReportStatusesDTO,
    LayerRole,
    SharedGeorem,
    SharedThemesDTO,
    ThemeDTO,
    UserDTO,
    PermissionLevel,
    DatabaseResponseDTO,
    TableDetailedDTO,
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

export const geometryTypes = ["Point", "MultiPoint", "LineString", "MultiLineString", "Polygon", "MultiPolygon"] as const;
export type LayerGeometryType = (typeof geometryTypes)[number];

export type CommunityFeatureTypeLayer = {
    id: number;
    table: number;
    database: number;
    database_name: string;
    database_title: string;
    table_name: string;
    table_title: string;
    geometry_type: LayerGeometryType;
    role: LayerRole;
    // snapto: string | null;
    tools: LayerTools[];
    ref_tools: Record<RefLayerTools, number[]>;
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

/* Pour les bases de données */
export const arrDBOptions = ["none", "add", "reuse", "import"] as const;
export type DBOption = (typeof arrDBOptions)[number];

export interface IPermission {
    id: number;
    title: string;
    level: PermissionLevel;
}

export interface ITablePermission extends IPermission {
    columns: IPermission[];
}

export interface IDatabasePermission extends IPermission {
    tables: ITablePermission[];
}

export interface IDBItemOption {
    id: number;
    title: string;
}

export type DBItemKind = "table" | "column";

export type PartialDatabase = Pick<DatabaseResponseDTO, "id" | "title">;
export type PartialTable = Pick<TableDetailedDTO, "id" | "title">;

/* Les fonctionnalités (outils) */
export type CommunityTools = "display" | "navigation" | "measure" | "report";

export const arrDisplayTools = ["zoom_control", "rotate_control", "overviewmap_control", "print"] as const;
export type DisplayTools = (typeof arrDisplayTools)[number];

export const arrNavigationTools = ["search_address", "search_lonlat", "locate_control", "search", "save_positions"] as const;
export type NavigationTools = (typeof arrNavigationTools)[number];

export const arrMeasureTools = ["measure_distance", "measure_area", "measure_azimut"] as const;
export type MeasureTools = (typeof arrMeasureTools)[number];

export const arrReportTools = ["georem"] as const;
export type ReportTools = (typeof arrReportTools)[number];

export type RefToolLayer = {
    id: string;
    name: string;
};

export type RefToolsConfig = {
    active: boolean;
    layers: RefToolLayer[];
};

export type RefTools = Record<RefLayerTools, RefToolsConfig>;
export interface ICommunityLayer extends Pick<CommunityFeatureTypeLayer, "id" | "table_title" | "geometry_type" | "tools"> {
    ref_tools: RefTools;
}

export type CommunityLayers = Record<number, ICommunityLayer>;
export type CommunitiesLayers = Record<string, CommunityLayers>;
export type RefLayersType = Record<RefLayerTools, Record<number, string>>;

/*************************************************************************************/

export type TableTheme = Record<string, { database: string; table: string; attributes: AttributeDTO[] }>;

// LES FORMULAIRES
export type ZoomAndCenteringFormType = {
    position: number[];
    zoom: number;
    minZoom: number;
    maxZoom: number;
    extent: Extent | null;
};

export type ToolsFormType = {
    functionalities: string[];
    layer_tools: CommunityLayers;
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
