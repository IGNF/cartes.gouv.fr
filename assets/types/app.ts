import {
    AccessCreateDto,
    AccessDetailsResponseDto,
    AnnexDetailResponseDto,
    BasicInfoDto,
    CheckingExecutionDetailResponseDto,
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
    firstName: string;
    lastName: string;
    roles: string[];
    communitiesMember: CommunityMemberDto[];
    accountCreationDate: string;
    lastApiCallDate: string;
};

/** datastore */
export type Datastore = DatastoreDetailResponseDto;

/** fiche de donnée */
export type Datasheet = {
    name: string;
    date: string;
    categories: string[];
    nb_publications: number;
    thumbnail?: DatasheetThumbnailAnnexe;
};

export type DatasheetThumbnailAnnexe = Annexe & { url: string };

export type DatasheetDetailed = Datasheet & {
    vector_db_list: VectorDb[] | undefined;
    pyramid_list: Pyramid[] | undefined;
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
export type Pyramid = StoredData & {
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
    OfferingDetailResponseDtoTypeEnum as OfferingTypeEnum,
    UploadPrivateDetailResponseDtoStatusEnum as UploadStatusEnum,
    UploadPrivateDetailResponseDtoTypeEnum as UploadTypeEnum,
    UploadPrivateDetailResponseDtoVisibilityEnum as UploadVisibilityEnum,
} from "./entrepot";
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
export type Configuration = ConfigurationDetailResponseDto & { styles?: CartesStyle[] };

export type Offering = OfferingDetailResponseDto;
export enum OfferingStatusEnum {
    PUBLISHING = "PUBLISHING",
    MODIFYING = "MODIFYING",
    PUBLISHED = "PUBLISHED",
    UNPUBLISHING = "UNPUBLISHING",
    UNSTABLE = "UNSTABLE",
}

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

/** endpoints */
export type DatastoreEndpoint = DatastoreEndpointResponseDto;
export type EndpointTypes = `${EndpointDetailResponseDtoTypeEnum}`;

export type CheckOrProcessingExecutionLogs = [string];
export type CheckDetailed = CheckingExecutionDetailResponseDto & {
    logs: CheckOrProcessingExecutionLogs;
};

export type ProcessingExecution = ProcessingExecutionDetailResponseDto;

export type StoredDataReport = {
    stored_data: StoredData;
    input_upload: Upload & {
        file_tree: UploadTree;
        checks: [CheckDetailed];
    };
    processing_executions: [
        ProcessingExecution & {
            output: ProcessingExecutionOutputStoredDataDto;
            logs: CheckOrProcessingExecutionLogs;
        },
    ];
};

export type UserRightsResponseDto = {
    user: string;
    rights: CommunityUserResponseDtoRightsEnum[];
};

export type UserKeysWithAccessesResponseDto = UserKeyResponseDto & { accesses: AccessDetailsResponseDto[] };
export type UserKeyDetailedWithAccessesResponseDto = UserKeyDetailsResponseDtoUserKeyInfoDto & { accesses: AccessDetailsResponseDto[] };

export type Annexe = AnnexDetailResponseDto;

/* Pour le formulaire d'ajout d'une cle d'acces */
export type IPListName = "whitelist" | "blacklist";

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
    ip_list?: {
        name: IPListName;
        addresses: string[];
    };
    user_agent: string;
    referer: string;
    accesses: AccessCreateDto[];
};
