import { LanguageType } from "@/utils";
import { SummaryProps } from "@codegouvfr/react-dsfr/Summary";
import {
    AccessCreateDto,
    AccessDetailsResponseDto,
    AnnexDetailResponseDto,
    BasicInfoDto,
    BoundingBox,
    CheckingExecutionDetailResponseDto,
    CheckingExecutionDetailResponseDtoStatusEnum,
    CommunityMemberDto,
    CommunityUserResponseDtoRightsEnum,
    ConfigurationAltimetryDetailsContent,
    ConfigurationDetailResponseDto,
    ConfigurationItineraryIsocurveDetailsContent,
    ConfigurationWfsDetailsContent,
    ConfigurationWmsRasterDetailsContent,
    ConfigurationWmsVectorDetailsContent,
    ConfigurationWmtsTmsDetailsContent,
    DatastoreDetailResponseDto,
    DatastoreEndpointResponseDto,
    EndpointDetailResponseDtoTypeEnum,
    HashInfoDto,
    MetadataResponseDto,
    OAuth2InfoDto,
    OfferingDetailResponseDto,
    ProcessingExecutionDetailResponseDto,
    ProcessingExecutionOutputStoredDataDto,
    StoredDataDetailsRelationDto,
    StoredDataPrivateDetailResponseDto,
    StoredDataPrivateDetailResponseDtoTypeEnum,
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
export type StoredData = StoredDataPrivateDetailResponseDto;
export {
    StoredDataPrivateDetailResponseDtoStatusEnum as StoredDataStatusEnum,
    StoredDataPrivateDetailResponseDtoTypeEnum as StoredDataTypeEnum,
    StoredDataPrivateDetailResponseDtoVisibilityEnum as StoredDataVisibilityEnum,
} from "./entrepot";
export type StoredDataRelation = StoredDataDetailsRelationDto;

/** stored_data (donnée stockée) du type VECTOR-DB */
export type VectorDb = StoredData & {
    type: StoredDataPrivateDetailResponseDtoTypeEnum.VECTORDB;
    tags: {
        proc_int_id?: string;
        upload_id?: string;
        datasheet_name?: string;
    };
};

/** stored_data (donnée stockée) du type ROK4-PYRAMID-VECTOR */
export type PyramidVector = StoredData & {
    type: StoredDataPrivateDetailResponseDtoTypeEnum.ROK4PYRAMIDVECTOR;
    tags: {
        datasheet_name?: string;
        upload_id?: string;
        vectordb_id?: string;
        proc_int_id?: string;
        proc_pyr_creat_id?: string;
        is_sample?: "true" | "false";
    };
};

/** stored_data (donnée stockée) du type ROK4-PYRAMID-VECTOR */
export type PyramidRaster = StoredData & {
    type: StoredDataPrivateDetailResponseDtoTypeEnum.ROK4PYRAMIDRASTER;
    tags: {
        datasheet_name?: string;
        upload_id?: string;
        proc_int_id?: string;
        vectordb_id?: string;
        proc_pyr_creat_id?: string;
    };
};

/** upload (livraison) */
export type Upload = UploadPrivateDetailResponseDto & {
    tags: {
        datasheet_name?: string;
        proc_int_id?: string;
        vectordb_id?: string;
        data_upload_path?: string;
        integration_progress?: string;
        integration_current_step?: string;
    };
};

export {
    ConfigurationDetailResponseDtoStatusEnum as ConfigurationStatusEnum,
    ConfigurationDetailResponseDtoTypeEnum as ConfigurationTypeEnum,
    OfferingStatusEnum,
    OfferingDetailResponseDtoTypeEnum as OfferingTypeEnum,
    UploadPrivateDetailResponseDtoStatusEnum as UploadStatusEnum,
    UploadPrivateDetailResponseDtoTypeEnum as UploadTypeEnum,
    UploadPrivateDetailResponseDtoVisibilityEnum as UploadVisibilityEnum,
} from "./entrepot";
export { EndpointDetailResponseDtoTypeEnum as EndpointTypeEnum };
export type UploadTree = UploadTreeElementResponseDto[];

/** user, objet représentant l'utilisateur de l'API Entrepot */
export type EntrepotUser = UserDetailsResponseDto;

/** les styles */
type StyleLayer = {
    name?: string;
    annexe_id: string;
    url: string;
};

export type CartesStyle = {
    name: string;
    current?: boolean;
    layers: StyleLayer[];
};

export type StyleForm = {
    style_name: string;
    style_files: Record<string, FileList>;
};

export type StyleFormat = "mapbox" | "sld" | "qml";

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
    vector_layers: unknown[];
};

/** configuration & offerings */
export type Configuration = ConfigurationDetailResponseDto & {
    styles?: CartesStyle[];
    tags: {
        datasheet_name?: string;
    };
    pyramid?: PyramidVector | PyramidRaster;
};

export type Offering = OfferingDetailResponseDto;

export type Service = Offering & {
    configuration: Configuration;
    tms_metadata?: TmsMetadata;
    share_url?: string;
};

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
export type DatastoreEndpoint = DatastoreEndpointResponseDto;

export type CheckOrProcessingExecutionLogs = [string];
export type CheckDetailed = CheckingExecutionDetailResponseDto & {
    logs?: CheckOrProcessingExecutionLogs;
};
export { CheckingExecutionDetailResponseDtoStatusEnum as CheckStatusEnum };

export type ProcessingExecution = ProcessingExecutionDetailResponseDto;

export type StoredDataReport = {
    stored_data: StoredData;
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

export type UserKeyWithAccessesResponseDto = UserKeyResponseDto & { accesses: AccessDetailsResponseDto[] };
export type UserKeyDetailedWithAccessesResponseDto = UserKeyDetailsResponseDtoUserKeyInfoDto & { accesses: AccessDetailsResponseDto[] };

export type Annexe = AnnexDetailResponseDto;

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

export type Metadata = MetadataResponseDto & {
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
