import {
    AnnexDetailResponseDto,
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
    OfferingDetailResponseDto,
    ProcessingExecutionDetailResponseDto,
    ProcessingExecutionOutputStoredDataDto,
    StoredDataDetailsRelationDto,
    StoredDataPrivateDetailResponseDto,
    StoredDataPrivateDetailResponseDtoTypeEnum,
    UploadPrivateDetailResponseDto,
    UploadTreeElementResponseDto,
    UserDetailsResponseDto,
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
    StoredDataPrivateDetailResponseDtoTypeEnum as StoredDataTypeEnum,
    StoredDataPrivateDetailResponseDtoStatusEnum as StoredDataStatusEnum,
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
    UploadPrivateDetailResponseDtoTypeEnum as UploadTypeEnum,
    UploadPrivateDetailResponseDtoStatusEnum as UploadStatusEnum,
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

/** configuration & offerings */
export type Configuration = ConfigurationDetailResponseDto & { styles: CartesStyle[] };
export {
    ConfigurationDetailResponseDtoStatusEnum as ConfigurationStatusEnum,
    ConfigurationDetailResponseDtoTypeEnum as ConfigurationTypeEnum,
} from "./entrepot";

export type Offering = OfferingDetailResponseDto;
export { OfferingDetailResponseDtoTypeEnum as OfferingTypeEnum } from "./entrepot";

export type Service = Offering & {
    configuration: Configuration;
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

export type Annexe = AnnexDetailResponseDto;
