import { LanguageType } from "@/utils";
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
    ConfigurationStandardDetailResponseDto,
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
export type Datastore = DatastoreDetailResponseDto;

export type Community = CommunityDetailResponseDto;

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
    /** date d’ajout (ISO 8601), absente des documents ajoutés avant le 17/11/2026 */
    creation?: string;
    /** nom d’origine d’un fichier, absent des documents ajoutés avant le 17/11/2026 */
    file_name?: string;
};

export enum DatasheetDocumentTypeEnum {
    File = "file",
    Link = "link",
}

export type DatasheetStoredDataItem<SD extends StoredData = StoredData> = Pick<
    SD,
    | "_id"
    | "name"
    | "description"
    | "type"
    | "open"
    | "status"
    | "srs"
    | "contact"
    | "edition"
    | "size"
    | "last_event"
    | "tags"
    | "creation"
    | "public_activity"
> & {
    bbox?: BoundingBox | null;
};

export type DatasheetUploadItem = Pick<
    Upload,
    "_id" | "name" | "description" | "type" | "open" | "status" | "srs" | "contact" | "size" | "last_event" | "tags" | "creation"
> & {
    bbox?: BoundingBox | null;
};

export type DatasheetDetailed = Datasheet & {
    vector_db_list: DatasheetStoredDataItem<VectorDb>[] | undefined;
    pyramid_vector_list: DatasheetStoredDataItem<PyramidVector>[] | undefined;
    pyramid_raster_list: DatasheetStoredDataItem<PyramidRaster>[] | undefined;
    upload_list: DatasheetUploadItem[] | undefined;
};

/** stored_data (donnée stockée) */
export interface StoredData extends StoredDataPrivateDetailResponseDto {
    tags: {
        datasheet_name?: string;
        producer?: string;
        production_year?: string;
        /** thématiques choisies au dépôt, jointes par « , » */
        theme?: string;
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

/** état de l’intégration d’une livraison, calculé par le backend à chaque lecture */
export type UploadIntegration = {
    steps: Record<string, string>;
    status: "waiting" | "in_progress" | "failed" | "successful";
    /** action que le POST d’avancement exécuterait, null s’il n’y a rien à faire */
    next_action: "send_files" | "launch_processing" | "delete_upload" | null;
    vectordb_id: string | null;
    datasheet_name: string | null;
};

/** upload (livraison) */
export type Upload = UploadPrivateDetailResponseDto & {
    tags: {
        datasheet_name?: string;
        proc_int_id?: string;
        vectordb_id?: string;
        data_upload_path?: string;
        producer?: string;
        production_year?: string;
    };
};

export {
    ConfigurationStatus as ConfigurationStatusEnum,
    ConfigurationType as ConfigurationTypeEnum,
    OfferingStatus as OfferingStatusEnum,
    ConfigurationType as OfferingTypeEnum,
    UploadPrivateDetailResponseDtoStatusEnum as UploadStatusEnum,
    UploadPrivateDetailResponseDtoTypeEnum as UploadTypeEnum,
} from "./entrepot";
export { EndpointDetailResponseDtoTypeEnum as EndpointTypeEnum };
export type UploadTree = UploadTreeElementResponseDto[];

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
    vector_layers: { id: string }[];
};

/** configuration & offerings */
/** données libres de la configuration, voir docs/developer/entrepot/extra.md */
export type ConfigurationExtra = {
    _search?: {
        /** vignette du flux, affichée dans la liste des flux et dans Explorer les cartes */
        url_vignette?: string;
    };
};

export type Configuration = ConfigurationStandardDetailResponseDto & {
    extra?: ConfigurationExtra;
    styles?: CartesStyle[];
    tags: {
        datasheet_name?: string;
        /** thématiques séparées par « , » */
        theme?: string;
    };
    pyramid?: PyramidVector | PyramidRaster;
};

export type Offering = OfferingStandardDetailResponseDto;

/** service est un offering avec des informations supplémentaires (configuration complète, métadonnées TMS ou l'URL de diffusion) */
export interface Service extends Offering {
    configuration: Configuration;
    tms_metadata?: TmsMetadata;
    share_url?: string;
    /** calculé par le serveur ; null quand les permissions n’ont pas pu être lues */
    access?: "public" | "restricted_visible" | "restricted" | null;
}

/** flux de la liste d’une fiche : pyramide réduite à son type, ni styles ni métadonnées TMS */
export type ServiceListItem = Omit<Service, "configuration" | "tms_metadata"> & {
    configuration: Omit<Configuration, "pyramid" | "styles"> & { pyramid?: Pick<PyramidVector | PyramidRaster, "type"> | null };
};

export interface DatasheetServiceList {
    services: ServiceListItem[];
    configurations_without_offering: Configuration[];
}

export enum MetadataHierarchyLevel {
    Dataset = "dataset",
    Series = "series",
}

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

export type CswOnlineResourceType = "layer" | "style" | "capabilities" | "document" | "other";

export type CswOnlineResource = {
    type: CswOnlineResourceType;
    name: string;
    url: string;
    protocol: string | null;
    description: string | null;
    open: boolean;
};

export type CswMetadataTerritory = {
    id: string;
    title: string;
    bbox: number[];
};

export type CswMetadataProducer = {
    organization_name: string;
    organization_email: string;
    role: string;
    address_number_and_streetname?: string | null;
    address_postal_code?: string | null;
    address_city?: string | null;
};

export type CswMetadataSubConstraint = {
    type: string;
    restriction_code?: string | null;
    limitation_code?: string | null;
    classification_code?: string | null;
    url?: string | null;
    description?: string | null;
};

export type CswMetadataResourceConstraint = {
    type: string;
    constraints: CswMetadataSubConstraint[];
};

export type CswMetadata = {
    file_identifier?: string;
    hierarchy_level?: MetadataHierarchyLevel;
    resource_genealogy?: string;
    language?: LanguageType;
    charset?: string;
    name?: string;
    description?: string;
    date_creation?: string;
    date_publication?: string;
    date_revision?: string;
    themes?: string[];
    keywords_inspire?: string[];
    keywords_additional?: string[];
    update_frequency?: string;
    producers?: CswMetadataProducer[];
    resource_constraints?: CswMetadataResourceConstraint[];
    scale?: number;
    resolution?: number;
    online_resources?: CswOnlineResource[];
    territories?: CswMetadataTerritory[];
    thumbnail_url?: string;
};

export type Metadata = MetadataStandardResponseDto & {
    csw_metadata?: CswMetadata;
    tags: {
        datasheet_name?: string;
    };
};

export type DatastoreCleanupContentResponse = {
    entities: DatastoreCleanupEntitiesCount;
};

export type DatastoreCleanupEntitiesCount = Record<string, number>;

export type FailedCleanupItem = {
    type: string;
    id: string;
};
