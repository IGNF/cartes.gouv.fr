import statuses from "../data/report_statuses.json";
import { OpenWithEmailType } from "./app_espaceco";

export interface ConstraintsDTO {
    minLength?: number;
    maxLength?: number;
    minValue?: string;
    maxValue?: string;
    pattern?: string;
}

export const AttributeTypes = ["text", "integer", "double", "checkbox", "list", "date"];

export type AttributeType = (typeof AttributeTypes)[number];

export type ValuesType = (string | null)[] | Record<string, string | null> | null;

export type AttributeDTO = {
    name: string;
    title?: string;
    type: AttributeType;
    default?: string | null;
    mandatory?: boolean;
    multiple?: boolean;
    //values?: string[] | null;
    values?: ValuesType;
    help?: string | null;
    /* input_constraints?: ConstraintsDTO | null;
    json_schema?: object | null;
    required?: boolean;
    condition_field?: string; */
    autofill?: string;
};

export type AttributeAutofillDTO = {
    name: string;
    type: string;
    autofill: string;
};
export interface ThemeDTO {
    theme: string;
    database?: string;
    table?: string;
    attributes: AttributeDTO[];
    autofilled_attributes: AttributeAutofillDTO[];
    help?: string;
    global?: boolean;
}

export type UserSharedThemesDTO = {
    community_id: number;
    community_name: string;
    themes: ThemeDTO[];
};

export type SharedThemesDTO = {
    community_id: number;
    community_name: string;
    themes: string[];
};

export type ReportStatusesType = keyof typeof statuses;

export type ReportStatusParams = {
    title: string;
    description?: string;
    active: boolean;
};
export type ReportStatusesDTO = Record<string, ReportStatusParams>;

/* Email planners */
export const TriggerEvents = ["georem_created", "georem_status_changed"] as const;
export type TriggerEventType = (typeof TriggerEvents)[number];

export const CancelEvents = ["georem_status_changed", "none"] as const;
export type CancelEventType = (typeof CancelEvents)[number];

export const BasicRecipients = ["Auteur", "Gestionnaire", "Majec"] as const;
export type RecipientType = (typeof BasicRecipients)[number];

export type EmailPlannerDTO = {
    id: number;
    subject: string;
    body: string;
    delay: number;
    repeat: boolean;
    recipients: string[];
    event: TriggerEventType;
    cancel_event: CancelEventType;
    condition: { status: string[] } | null;
    themes: string[];
};

const SharedGeoremOptions = ["all", "restrained", "personal"];
export type SharedGeorem = (typeof SharedGeoremOptions)[number];
export interface CommunityResponseDTO {
    id: number;
    description: string | null;
    editorial: string | null;
    functionalities: string[];
    name: string;
    active: boolean;
    listed: boolean;
    shared_georem: "all" | "restrained" | "personal";
    shared_extractions: boolean;
    email: string | null;
    attributes: ThemeDTO[];
    default_comment: string | null;
    position: string | null;
    zoom: number;
    min_zoom: number | null;
    max_zoom: number | null;
    extent: number[] | null;
    all_members_can_valid: boolean;
    open_without_affiliation: boolean;
    open_with_email: OpenWithEmailType[];
    offline_allowed: boolean;
    /** @format date-time */
    creation: string;
    grids: GridDTO[];
    logo_url: string | null;
    keywords?: string[];
    documents: DocumentDTO[];
    report_statuses?: ReportStatusesDTO;
    shared_themes?: SharedThemesDTO[];
}

export interface UserDTO {
    id: number;
    username: string;
    firstname?: string;
    surname?: string;
}

const layerTools = ["add_feature", "edit_geometry", "move_feature", "delete_feature", "cut_feature", "copy_paste_feature"] as const;
export type LayerToolsType = (typeof layerTools)[number];

export type LayerType = "feature-type" | "geoservice";
export type RoleType = "edit" | "ref" | "visu" | "ref-edit";
export interface LayerResponseDTO {
    table: number | null;
    database: number | null;
    type: LayerType;
    id: number;
    geoservice: {
        id: number;
        title: string;
        description: string;
    } | null;
    opacity: number;
    visibility: boolean;
    order: number;
    role: RoleType;
    snapto: string | null;
    preferred_style: number | null;
    tools: LayerToolsType[] | null;
}
export interface DocumentDTO {
    id: number;
    title: string;
    description: string | null;
    filename: string;
    short_fileName: string;
    mime_type: string;
    size: number;
    width: number | null;
    height: number | null;
    date: string;
    geometry: string | null;
    uri: string | null;
    download_uri: string;
}

export interface GridDTO {
    name: string;
    title: string;
    type: GridType;
    deleted: boolean;
    extent?: number[];
}

export interface GridType {
    name: string;
    title: string;
}
export interface CommunityPatchDTO extends Partial<Omit<CommunityResponseDTO, "logo_url">> {
    logo: File | null;
}

export interface PermissionResponseDTO {
    id: number;
    database: number;
    table: number | null;
    column: number | null;
    level: "NONE" | "VIEW" | "EXPORT" | "EDIT" | "ADMIN";
}

export interface ColumnDTO {
    table_id: number;
    crs: string | null;
    enum: object | string[] | null;
    default_value: string | null;
    read_only: boolean;
    id: number;
    type: string;
    target_table: string | null;
    target_entity: string | null;
    name: string;
    short_name: string;
    title: string;
    description: string | null;
    min_length: number | null;
    max_length: number | null;
    nullable: boolean;
    unique: boolean;
    srid: number | null;
    position: number;
    min_value: string | null;
    max_value: string | null;
    pattern: string | null;
    is3d: boolean;
    constraint: object | null;
    condition_field: string | null;
    computed: boolean;
    automatic: boolean;
    custom_id: boolean;
    formula: string | null;
    json_schema: object | null;
    jeux_attributs: object | null;
    queryable: boolean;
    required: boolean;
    mime_types: string | null;
}

export interface TableResponseDTO {
    database_id: number;
    database: string;
    database_versioning: boolean;
    full_name: string;
    id_name: string;
    geometry_name: string;
    min_zoom_level: number | null;
    max_zoom_level: number | null;
    tile_zoom_level: number | null;
    read_only: boolean;
    id: number;
    name: string;
    title: string;
    description: string | null;
    thematic_ids: string[] | null;
    position: number;
    wfs: string;
    wfs_transactions: string;
    columns: ColumnDTO[];
}

export { SharedGeoremOptions };
