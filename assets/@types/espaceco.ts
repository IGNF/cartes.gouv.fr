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
    grids: Grids[];
    logo_url: string | null;
    keywords?: string[];
}

export interface Grids {
    name: string;
    title: string;
    type: string;
    deleted: boolean;
    extent: number[];
}

export interface CommunityPatchDTO extends Partial<Omit<CommunityResponseDTO, "logo_url">> {
    logo: File | null;
}
