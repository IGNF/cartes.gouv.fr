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

export const arrLayerTools = ["draw", "modify", "translate", "delete", "split", "snap_mandatory", "copy_paste"] as const;
export type LayerTools = (typeof arrLayerTools)[number];

export const arrRefLayerTools = ["snap", "shortestpath"] as const;
export type RefLayerTools = (typeof arrRefLayerTools)[number];

export type LayerType = "feature-type" | "geoservice";
export type LayerRole = "edit" | "ref" | "visu" | "ref-edit";
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
    role: LayerRole;
    snapto: string | null;
    preferred_style: number | null;
    tools: LayerTools[] | null;
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

export const arrPermissionLevel = ["NONE", "VIEW", "EDIT"] as const;
export type PermissionLevel = (typeof arrPermissionLevel)[number];

export type PermissionResponseDTO = {
    id: number;
    database: number;
    table: number | null;
    column: number | null;
    level: PermissionLevel;
};

export interface ColumnDetailedDTO {
    table_id: number;
    crs: string | null;
    enum: (string | null)[] | null;
    default_value: string | null;
    read_only: boolean;
    id: number;
    type: string;
    target_table: number | null;
    target_entity: string | null;
    name: string;
    short_name: string | null;
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
export interface TableDTO {
    id: number;
    name: string;
    title: string;
}

// TODO A VOIR PLUS TARD LES STYLES
export interface TableDetailedDTO extends TableDTO {
    database_id: number;
    database: string;
    database_versioning: boolean;
    full_name: string;
    id_name: string;
    geometry_name: string;
    crs?: string | null; // TODO enlever le ?
    extent?: number[] | null; // TODO enlever le ?
    min_zoom_level: number;
    max_zoom_level: number;
    tile_zoom_level: number | null;
    read_only: boolean;
    columns: ColumnDetailedDTO[];
    description: string | null;
    // thematic_ids?: null;
    // position: number;
    // style: Style;
    // styles?: (null)[] | null;
    wfs: string;
    wfs_transactions: string;
}

export interface DatabaseResponseDTO {
    id: number;
    name: string;
    title: string;
    database_type: "standard" | "bduni";
    versioning: boolean;
    conflict: boolean;
    extent: string;
    description: string | null;
    full_download_allowed: boolean;
    // mailers: ???
    writable_time_range: string;
}

export interface DatabaseDetailedResponseDTO extends DatabaseResponseDTO {
    tables: TableDTO[];
    // styles: ????
}

export { SharedGeoremOptions };
