import { LanguageType } from "@/utils";
import { SummaryProps } from "@codegouvfr/react-dsfr/Summary";
import {
    AccessCreateDto,
    AccessDetailResponseDto,
    AnnexStandardDetailResponseDto,
    BasicInfoDto,
    BoundingBox,
    CheckingExecutionStandardDetailResponseDto,
    CheckingExecutionStandardDetailResponseDtoStatusEnum,
    CommunityDetailResponseDto,
    CommunityMemberDto,
    CommunityUserResponseDtoRightsEnum,
    ConfigurationAltimetryDetailsContent,
    ConfigurationItineraryIsocurveDetailsContent,
    ConfigurationStandardDetailResponseDto,
    ConfigurationWfsDetailsContent,
    ConfigurationWmsRasterDetailsContent,
    ConfigurationWmsVectorDetailsContent,
    ConfigurationWmtsTmsDetailsContent,
    DatastoreDetailResponseDto,
    DatastoreEndpointStandardResponseDto,
    EndpointDetailResponseDtoTypeEnum,
    HashInfoDto,
    MetadataStandardResponseDto,
    OAuth2InfoDto,
    OfferingStandardDetailResponseDto,
    PermissionStandardListResponseDto,
    ProcessingExecutionOutputStoredDataDto,
    ProcessingExecutionStandardDetailResponseDto,
    StaticFileStandardDetailResponseDto,
    StoredDataDetailsRelationDto,
    StoredDataPrivateDetailResponseDto,
    StoredDataPrivateDetailResponseDtoTypeEnum,
    StoredDataRok4PyramidRasterDetailsDto,
    StoredDataRok4PyramidVectorDetailsDto,
    StoredDataVectorDbDetailsDto,
    UploadPrivateDetailResponseDto,
    UploadTreeElementResponseDto,
    UserDetailsResponseDto,
    UserKeyDetailsResponseDtoUserKeyInfoDto,
    UserKeyResponseDto,
} from "./entrepot";

/** user */
export type CartesUser = {
    id: string;
    email: string;
    user_name: string;
    first_name?: string | null;
    last_name?: string | null;
    roles: string[];
    communities_member: CommunityMemberDto[];
    account_creation_date?: string;
    last_login_date?: string;
    documents_quota?: number;
    documents_use?: number;
    keys_quota?: number;
    keys_use?: number;
};

/** datastore */
export type Datastore = DatastoreDetailResponseDto & {
    is_sandbox?: boolean;
};

export type Community = CommunityDetailResponseDto & {
    is_sandbox?: boolean;
};

/** fiche de donnée */
export type Datasheet = {
    name: string;
    nb_publications: number;
    thumbnail?: DatasheetThumbnailAnnexe;
};

export type DatasheetThumbnailAnnexe = Annexe & { url: string };

export type DatasheetDocument = {
    type: DatasheetDocumentTypeEnum;
    url: string;
    name: string;
    description?: string;
    id: string;
};

export enum DatasheetDocumentTypeEnum {
    File = "file",
    Link = "link",
}

export type DatasheetDetailed = Datasheet & {
    vector_db_list: VectorDb[] | undefined;
    pyramid_vector_list: PyramidVector[] | undefined;
    pyramid_raster_list: PyramidRaster[] | undefined;
    upload_list: Upload[] | undefined;
    service_list: Service[] | undefined;
};

/** stored_data (donnée stockée) */
export interface StoredData extends StoredDataPrivateDetailResponseDto {
    tags: {
        datasheet_name?: string;
        producer?: string;
        production_year?: string;
    };
}
export {
    StoredDataPrivateDetailResponseDtoStatusEnum as StoredDataStatusEnum,
    StoredDataPrivateDetailResponseDtoTypeEnum as StoredDataTypeEnum,
} from "./entrepot";
export type StoredDataRelation = StoredDataDetailsRelationDto;

/** stored_data (donnée stockée) du type VECTOR-DB */
export interface VectorDb extends StoredData {
    type: StoredDataPrivateDetailResponseDtoTypeEnum.VECTORDB;
    tags: StoredData["tags"] & {
        proc_int_id?: string;
        upload_id?: string;
    };
    type_infos?: StoredDataVectorDbDetailsDto;
}

/** stored_data (donnée stockée) du type ROK4-PYRAMID-VECTOR */
export interface PyramidVector extends StoredData {
    type: StoredDataPrivateDetailResponseDtoTypeEnum.ROK4PYRAMIDVECTOR;
    tags: StoredData["tags"] & {
        upload_id?: string;
        vectordb_id?: string;
        proc_int_id?: string;
        proc_pyr_creat_id?: string;
        is_sample?: "true" | "false";
    };
    type_infos?: StoredDataRok4PyramidVectorDetailsDto;
}

/** stored_data (donnée stockée) du type ROK4-PYRAMID-VECTOR */
export interface PyramidRaster extends StoredData {
    type: StoredDataPrivateDetailResponseDtoTypeEnum.ROK4PYRAMIDRASTER;
    tags: StoredData["tags"] & {
        upload_id?: string;
        proc_int_id?: string;
        vectordb_id?: string;
        proc_pyr_creat_id?: string;
    };
    type_infos?: StoredDataRok4PyramidRasterDetailsDto;
}

/** upload (livraison) */
export type Upload = UploadPrivateDetailResponseDto & {
    tags: {
        datasheet_name?: string;
        proc_int_id?: string;
        vectordb_id?: string;
        data_upload_path?: string;
        integration_progress?: string;
        integration_current_step?: string;
        producer?: string;
        production_year?: string;
    };
};

export {
    ConfigurationStandardDetailResponseDtoStatusEnum as ConfigurationStatusEnum,
    ConfigurationStandardDetailResponseDtoTypeEnum as ConfigurationTypeEnum,
    OfferingStandardDetailResponseDtoStatusEnum as OfferingStatusEnum,
    OfferingStandardDetailResponseDtoTypeEnum as OfferingTypeEnum,
    UploadPrivateDetailResponseDtoStatusEnum as UploadStatusEnum,
    UploadPrivateDetailResponseDtoTypeEnum as UploadTypeEnum,
} from "./entrepot";
export { EndpointDetailResponseDtoTypeEnum as EndpointTypeEnum };
export type UploadTree = UploadTreeElementResponseDto[];

/** user, objet représentant l'utilisateur de l'API Entrepot */
export type EntrepotUser = UserDetailsResponseDto;

/** les styles */
export type StyleLayer = {
    name?: string;
    annexe_id: string;
    url: string;
};

export type CartesStyle = {
    name: string;
    technical_name: string;
    current?: boolean;
    layers: StyleLayer[];
};

export type StyleForm = {
    style_name: string;
    style_files: Record<string, string>;
};

export enum StyleFormatEnum {
    Mapbox = "mapbox",
    SLD = "sld",
    QML = "qml",
}
export type StyleFormat = `${StyleFormatEnum}`;

export interface GeostylerStyle {
    annexeId?: string;
    name?: string;
    style: string;
    format: StyleFormat;
}

export type GeostylerStyles = GeostylerStyle[];

/** metadata pour TMS */
export type TmsMetadata = {
    name: string;
    description: string;
    minzoom: number;
    maxzoom: number;
    crs: string;
    center: number[];
    bounds: number[];
    format: string;
    tiles: string[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vector_layers: any[];
};

/** configuration & offerings */
export type Configuration = ConfigurationStandardDetailResponseDto & {
    styles?: CartesStyle[];
    tags: {
        datasheet_name?: string;
    };
    pyramid?: PyramidVector | PyramidRaster;
};

export type Offering = OfferingStandardDetailResponseDto;

/** service est un offering avec des informations supplémentaires (configuration complète, métadonnées TMS ou l'URL de diffusion) */
export interface Service extends Offering {
    configuration: Configuration;
    tms_metadata?: TmsMetadata;
    share_url?: string;
}

export type TypeInfosWithBbox =
    | ConfigurationAltimetryDetailsContent
    | ConfigurationItineraryIsocurveDetailsContent
    | ConfigurationWfsDetailsContent
    | ConfigurationWmsRasterDetailsContent
    | ConfigurationWmsVectorDetailsContent
    | ConfigurationWmtsTmsDetailsContent;

export enum MetadataHierarchyLevel {
    Dataset = "dataset",
    Series = "series",
}

export type MetadataFormValuesType = {
    metadata_file_content?: FileList;
    identifier?: string;
    public_name?: string;
    description?: string;
    email_contact?: string;
    creation_date?: string;
    resource_genealogy?: string;
    hierarchy_level?: MetadataHierarchyLevel;
    organization?: string;
    organization_email?: string;
    category?: string[];
    keywords?: string[];
    free_keywords?: string[];
    charset?: string;
    projection?: string;
    // encoding?: string;
    resolution?: string;
    language?: LanguageType;
    frequency_code?: string;
};

export type AttributionFormValuesType = {
    attribution_text?: string;
    attribution_url?: string;
};

export type ServiceFormValuesBaseType = {
    technical_name?: string;
    public_name?: string;
    service_name?: string;
    description?: string;
    share_with?: string;
    allow_view_data?: boolean;
} & MetadataFormValuesType &
    AttributionFormValuesType;

/** endpoints */
export type DatastoreEndpoint = DatastoreEndpointStandardResponseDto;

export type CheckOrProcessingExecutionLogs = [string];
export type CheckDetailed = CheckingExecutionStandardDetailResponseDto & {
    logs?: CheckOrProcessingExecutionLogs;
};
export { CheckingExecutionStandardDetailResponseDtoStatusEnum as CheckStatusEnum };

export type ProcessingExecution = ProcessingExecutionStandardDetailResponseDto;
export { ProcessingExecutionStandardDetailResponseDtoStatusEnum as ProcessingExecutionStatusEnum } from "./entrepot";

export type StoredDataReport = {
    stored_data: VectorDb | PyramidVector | PyramidRaster;
    input_upload:
        | (Upload & {
              file_tree: UploadTree;
              checks: CheckDetailed[];
          })
        | null;
    processing_executions: StoredDataReportProcessingExecution[];
};

export type UploadReport = {
    input_upload: Upload & {
        file_tree: UploadTree;
        checks: CheckDetailed[];
    };
};

export type StoredDataReportProcessingExecution = ProcessingExecution & {
    output: ProcessingExecutionOutputStoredDataDto;
    logs?: CheckOrProcessingExecutionLogs;
};

export type UserRightsResponseDto = {
    user: string;
    rights: CommunityUserResponseDtoRightsEnum[];
};

export type DatastorePermission = PermissionStandardListResponseDto;

export type UserKeyWithAccessesResponseDto = UserKeyResponseDto & { accesses: AccessDetailResponseDto[] };
export type UserKeyDetailedWithAccessesResponseDto = UserKeyDetailsResponseDtoUserKeyInfoDto & { accesses: AccessDetailResponseDto[] };

export type Annexe = AnnexStandardDetailResponseDto;

export type StaticFile = StaticFileStandardDetailResponseDto;

/* Pour le formulaire d'ajout d'une cle d'acces */
export type IPListName = "none" | "whitelist" | "blacklist";

export enum UserKeyInfoDtoTypeEnum {
    HASH = "HASH",
    HEADER = "HEADER",
    BASIC = "BASIC",
    OAUTH2 = "OAUTH2",
}

export type KeyFormValuesType = {
    name: string;
    type: UserKeyInfoDtoTypeEnum;
    type_infos?: BasicInfoDto | HashInfoDto | OAuth2InfoDto;
    ip_list_name: IPListName;
    ip_list_addresses: string[];
    user_agent: string;
    referer: string;
    accesses: AccessCreateDto[];
};

export type CswMetadataLayer = {
    name?: string;
    gmd_online_resource_protocol?: string;
    gmd_online_resource_url?: string;
    offering_id?: string;
    open?: boolean;
};

export type CswStyleFile = {
    name?: string;
    description?: string;
    url?: string;
};

export type CswCapabilitiesFile = CswStyleFile;

export type CswDocument = {
    name?: string;
    description?: string | null;
    url?: string;
};

export type CswMetadata = {
    file_identifier?: string;
    hierarchy_level?: MetadataHierarchyLevel;
    resource_genealogy?: string;
    language?: LanguageType;
    charset?: string;
    title?: string;
    abstract?: string;
    creation_date?: string;
    topic_categories?: string[];
    inspire_keywords?: string[];
    free_keywords?: string[];
    frequency_code?: string;
    contact_email?: string;
    organisation_name?: string;
    organisation_email?: string;
    resolution?: string;
    layers?: CswMetadataLayer[];
    bbox?: BoundingBox | null;
    style_files?: CswStyleFile[];
    capabilities_files?: CswCapabilitiesFile[];
    documents?: CswDocument[];
};

export type Metadata = MetadataStandardResponseDto & {
    csw_metadata?: CswMetadata;
    tags: {
        datasheet_name?: string;
    };
};

export type GeonetworkMetadataLayers = {
    name?: string;
    endpointType?: string;
    endpointUrl?: string;
    offeringId?: string;
};

export type GeonetworkMetadataResponse = {
    contact_email: string;
    private_layers: GeonetworkMetadataLayers[];
};

/* Liens dans les composants de type Summary */
export type SummaryLink = SummaryProps["links"][number];

export const arrUserCategories = ["Individual", "Professional"] as const;
export type UserCategory = (typeof arrUserCategories)[number];
