import {
    ConfigurationDetailResponseDto,
    ConfigurationDetailResponseDtoStatusEnum,
    DatastoreDetailResponseDto,
    DatastoreEndpointResponseDto,
    EndpointDetailResponseDtoTypeEnum,
    OfferingDetailResponseDto,
    StoredDataPrivateDetailResponseDto,
    StoredDataPrivateDetailResponseDtoStatusEnum,
    StoredDataPrivateDetailResponseDtoTypeEnum,
    StoredDataPrivateDetailResponseDtoVisibilityEnum,
    UploadDetailResponseDto,
    UploadTreeElementResponseDto,
    UserDetailsResponseDto,
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

export type StoredData = StoredDataPrivateDetailResponseDto;

export const StoredDataTypes = StoredDataPrivateDetailResponseDtoTypeEnum;
export const StoredDataStatuses = StoredDataPrivateDetailResponseDtoStatusEnum;
export const StoredDataVisibilities = StoredDataPrivateDetailResponseDtoVisibilityEnum;

/** stored_data (donnée stockée) */
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

/** user */
export type EntrepotUser = UserDetailsResponseDto;

/** configuration & offerings */
export type Configuration = ConfigurationDetailResponseDto;
export const ConfigurationStatuses = ConfigurationDetailResponseDtoStatusEnum;

export type Offering = OfferingDetailResponseDto;
export type Service = Offering & {
    configuration: Configuration;
};

/** endpoints */
export type DatastoreEndpoint = DatastoreEndpointResponseDto;
export const EndpointTypes = EndpointDetailResponseDtoTypeEnum;
