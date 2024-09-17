export interface ConstraintsDTO {
    minLength?: number;
    maxLength?: number;
    minValue?: string;
    maxValue?: string;
    pattern?: string;
}

export const AttributeTypes = ["text", "integer", "double", "checkbox", "list", "date"];
export type AttributeType = (typeof AttributeTypes)[number];
export interface AttributeDTO {
    name: string;
    type: AttributeType;
    default?: string;
    mandatory?: boolean;
    values?: string[];
    help?: string;
    title?: string;
    input_constraints?: ConstraintsDTO;
    json_schema?: object;
    required?: boolean;
    condition_field?: string;
}

export interface ThemeDTO {
    theme: string;
    database?: string;
    table?: string;
    attributes: AttributeDTO[];
    help?: string;
    global?: boolean;
}

export interface CommunityResponseDTO {
    id: number;
    description: string | null;
    detailed_description?: string | null;
    name: string;
    active: boolean;
    shared_georem: "all" | "restrained" | "personal";
    email: string | null;
    attributes: ThemeDTO[];
    default_comment: string | null;
    position: string | null;
    zoom: number;
    zoom_min: number | null;
    zoom_max: number | null;
    extent: number[] | null;
    all_members_can_valid: boolean;
    open_without_affiliation: boolean;
    open_with_email?: string[];
    offline_allowed: boolean;
    shared_extractions: boolean;
    /** @format date-time */
    creation: string;
    grids: Grid[];
    logo_url: string | null;
    keywords?: string[];
    documents?: DocumentDTO[];
}

export interface DocumentDTO {
    id: number;
    short_fileName: string;
    mime_type: string;
    description?: string;
    title: string;
    type: string;
    size?: number;
    width?: number;
    height?: number;
    date: string;
    geometry?: string;
    uri: string;
}
export interface Grid {
    name: string;
    title: string;
    type: GridType;
    deleted: boolean;
    extent: number[];
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
