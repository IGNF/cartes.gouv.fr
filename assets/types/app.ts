import {
    ConfigurationDetailResponseDto,
    ConfigurationDetailResponseDtoStatusEnum,
    DatastoreDetailResponseDto,
    DatastoreEndpointResponseDto,
    EndpointDetailResponseDtoTypeEnum,
    OfferingDetailResponseDto,
    StoredDataDetailsRelationDto,
    StoredDataPrivateDetailResponseDto,
    StoredDataPrivateDetailResponseDtoStatusEnum,
    StoredDataPrivateDetailResponseDtoTypeEnum,
    StoredDataPrivateDetailResponseDtoVisibilityEnum,
    UploadDetailResponseDto,
    UploadTreeElementResponseDto,
    UserDetailsResponseDto,
    ConfigurationAltimetryDetailsContent,
    ConfigurationItineraryIsocurveDetailsContent,
    ConfigurationWfsDetailsContent,
    ConfigurationWmsRasterDetailsContent,
    ConfigurationWmsVectorDetailsContent,
    ConfigurationWmtsTmsDetailsContent,
} from "./entrepot";

/** datastore */
export type Datastore = DatastoreDetailResponseDto;

/** fiche de donnée */
export type Datasheet = {
    name: string;
    date: string;
    categories: string[];
    nb_publications: number;
};

export type DatasheetDetailed = Datasheet & {
    vector_db_list: VectorDb[] | undefined;
    upload_list: Upload[] | undefined;
    service_list: Service[] | undefined;
};

/** stored_data (donnée stockée) */
export type StoredData = StoredDataPrivateDetailResponseDto;

export const StoredDataTypes = StoredDataPrivateDetailResponseDtoTypeEnum;
export const StoredDataStatuses = StoredDataPrivateDetailResponseDtoStatusEnum;
export const StoredDataVisibilities = StoredDataPrivateDetailResponseDtoVisibilityEnum;
export type StoredDataRelation = StoredDataDetailsRelationDto;

/** stored_data (donnée stockée) du type VECTOR-DB */
export type VectorDb = StoredData & {
    type: StoredDataPrivateDetailResponseDtoTypeEnum.VECTORDB;
    tags: {
        proc_int_id: string;
        upload_id: string;
        datasheet_name: string;
    };
};

/** upload (livraison) */
export type Upload = UploadDetailResponseDto & {
    tags: {
        datasheet_name: string;
        proc_int_id: string;
        vectordb_id: string;
        data_upload_path: string;
        integration_progress: string;
        integration_current_step: string;
    };
};
export type UploadTree = UploadTreeElementResponseDto;

/** user, objet représentant l'utilisateur de l'API Entrepot */
export type EntrepotUser = UserDetailsResponseDto;

/** configuration & offerings */
export type Configuration = ConfigurationDetailResponseDto;
export const ConfigurationStatuses = ConfigurationDetailResponseDtoStatusEnum;

export type Offering = OfferingDetailResponseDto;
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
export const EndpointTypes = EndpointDetailResponseDtoTypeEnum;
