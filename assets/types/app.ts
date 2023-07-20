import {
    DatastoreDetailResponseDto,
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
export type Data = {
    data_name: string;
    date: string;
    categories: string[];
    nb_publications: number;
};

export type DataDetailed = Data & {
    vector_db_list: VectorDb[] | undefined;
};

export type StoredData = Partial<StoredDataPrivateDetailResponseDto>;

export const StoredDataTypes = StoredDataPrivateDetailResponseDtoTypeEnum;
export const StoredDataStatuses = StoredDataPrivateDetailResponseDtoStatusEnum;
export const StoredDataVisibilities = StoredDataPrivateDetailResponseDtoVisibilityEnum;

/** stored_data (donnée stockée) */
export interface VectorDb extends StoredData {
    type: StoredDataPrivateDetailResponseDtoTypeEnum.VECTORDB;
}

/** upload (livraison) */
export type Upload = UploadDetailResponseDto;
export type UploadTree = UploadTreeElementResponseDto;

/** user */
export type EntrepotUser = UserDetailsResponseDto;
