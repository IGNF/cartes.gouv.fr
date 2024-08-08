export interface CommunityResponseDTO {
    id: number;
    description: string | null;
    detailed_description?: string | null;
    name: string;
    active: boolean;
    shared_georem: "all" | "restrained" | "personal";
    email: string | null;
    attributes: object[];
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
