/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

type UtilRequiredKeys<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

export enum OfferingStatus {
    PUBLISHING = "PUBLISHING",
    MODIFYING = "MODIFYING",
    PUBLISHED = "PUBLISHED",
    UNPUBLISHING = "UNPUBLISHING",
    UNSTABLE = "UNSTABLE",
    UNPUBLISHED = "UNPUBLISHED",
}

export enum ConfigurationType {
    WMSVECTOR = "WMS-VECTOR",
    WFS = "WFS",
    WMTSTMS = "WMTS-TMS",
    WMSRASTER = "WMS-RASTER",
    DOWNLOAD = "DOWNLOAD",
    ITINERARYISOCURVE = "ITINERARY-ISOCURVE",
    ALTIMETRY = "ALTIMETRY",
    SEARCH = "SEARCH",
    VECTORTMS = "VECTOR-TMS",
    APIFEATURES = "API-FEATURES",
}

export enum ConfigurationStatus {
    UNPUBLISHED = "UNPUBLISHED",
    PUBLISHED = "PUBLISHED",
    SYNCHRONIZING = "SYNCHRONIZING",
}

/** Le type de stockage */
export enum StorageType {
    POSTGRESQL = "POSTGRESQL",
    S3 = "S3",
    FILESYSTEM = "FILESYSTEM",
    OPENSEARCH = "OPENSEARCH",
    POSTGRESQLROUTING = "POSTGRESQL-ROUTING",
}

export interface UserKeyCreateDtoUserKeyInfoDto {
    blacklist?: string[];
    /** @minLength 1 */
    name: string;
    referer?: string;
    type?: UserKeyCreateDtoUserKeyInfoDtoTypeEnum;
    type_infos: UserKeyInfoDto;
    user_agent?: string;
    whitelist?: string[];
}

export interface PermissionCreateDto {
    /** @format date-time */
    end_date?: string;
    /** @minLength 1 */
    licence: string;
    name?: string;
    /**
     * @minItems 1
     * @uniqueItems true
     */
    offerings: string[];
    only_oauth?: boolean;
    type?: PermissionCreateDtoTypeEnum;
}

export interface AccessCreateDto {
    /**
     * Identifiants des offres
     * @minItems 1
     * @uniqueItems true
     */
    offerings: string[];
    /**
     * Identifiant de la permission
     * @format uuid
     */
    permission: string;
}

/** Information sur l'accès */
export interface AccessDetailResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /** Informations sur l'offre (les champs endpoint, configuration, urls, extra, creation et update ne sont pas retournés par défaut) */
    offering: OfferingStandardListResponseDto;
    /** Information sur la permission */
    permission?: PermissionResponseDto;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

/** Information sur l'accès avec clé */
export interface AccessDetailWithKeyResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    key: UserKeyResponseDto;
    /** Informations sur l'offre (les champs endpoint, configuration, urls, extra, creation et update ne sont pas retournés par défaut) */
    offering: OfferingStandardListResponseDto;
    /** Information sur la permission */
    permission?: PermissionResponseDto;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

/** Paramètres de l'annexe à téléverser */
export interface AnnexCreateDto {
    /** @format binary */
    file: File;
    /**
     * Liste des étiquettes
     * @uniqueItems true
     */
    labels?: string[];
    /**
     * Chemins dans l'URL publique
     * @minItems 1
     * @uniqueItems true
     */
    paths: string[];
    /** État de publication */
    published?: boolean;
}

/** Informations détaillées sur l'annexe */
export interface AnnexExtendedDetailResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Identifiant de la communauté rattachée
     * @format uuid
     */
    community: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /**
     * Identifiant du datastore rattaché
     * @format uuid
     */
    datastore: string;
    /** @uniqueItems true */
    labels?: string[];
    mime_type: string;
    /**
     * Identifiant de l'organisme rattaché
     * @format uuid
     */
    organization?: string;
    /** @uniqueItems true */
    paths: string[];
    published: boolean;
    /** @format int64 */
    size: number;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
    extra?: Record<string, any>;
}

/** Informations sur l'annexe */
export interface AnnexExtendedListResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Identifiant de la communauté rattachée
     * @format uuid
     */
    community: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /**
     * Identifiant du datastore rattaché
     * @format uuid
     */
    datastore: string;
    /** @uniqueItems true */
    labels?: string[];
    mime_type: string;
    /**
     * Identifiant de l'organisme rattaché
     * @format uuid
     */
    organization?: string;
    /** @uniqueItems true */
    paths: string[];
    published: boolean;
    /** @format int64 */
    size: number;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

/** Informations détaillées sur l'annexe */
export interface AnnexStandardDetailResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /** @uniqueItems true */
    labels?: string[];
    mime_type: string;
    /** @uniqueItems true */
    paths: string[];
    published: boolean;
    /** @format int64 */
    size: number;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
    extra?: Record<string, any>;
}

/** Informations sur l'annexe */
export interface AnnexStandardListResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /** @uniqueItems true */
    labels?: string[];
    mime_type: string;
    /** @uniqueItems true */
    paths: string[];
    published: boolean;
    /** @format int64 */
    size: number;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

/** Paramètres modifiables de l'annexe */
export interface AnnexUpdateDto {
    /** @uniqueItems true */
    labels?: string[];
    /** @uniqueItems true */
    paths?: string[];
    published?: boolean;
    extra?: Record<string, any>;
}

/** Producteur */
export interface AuthorDto {
    /** Email */
    email: string;
    /** Nom */
    name: string;
}

/** Information sur l'auteur */
export interface AuthorResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    first_name: string;
    last_name: string;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

export interface BasicInfoDto {
    login?: string;
    password?: string;
}

/** Bounding box (en degrés) */
export interface BoundingBox {
    east: number;
    north: number;
    south: number;
    west: number;
}

/** Callback à exécuter à la fin de l'exécution */
export interface Callback {
    /** URL associée au callback */
    entity_url?: string;
    /**
     * Liste des adresses emails de destination
     * @maxItems 20
     * @minItems 1
     * @example ["example@mail.fr"]
     */
    to_address: string[];
    /** Type de callback */
    type: CallbackTypeEnum;
}

/** Catégories */
export interface CategoryDto {
    label: string;
    term: string;
}

/** Executions de vérification liées à la livraison */
export interface CheckResponseDto {
    asked?: CheckingExecutionListDto[];
    failed?: CheckingExecutionListDto[];
    in_progress?: CheckingExecutionListDto[];
    passed?: CheckingExecutionListDto[];
}

/** Paramètres de la vérification à créer */
export interface CheckingCreateDto {
    /** @uniqueItems true */
    default_uploads_check?: CheckingCreateDtoDefaultUploadsCheckEnum[];
    /**
     * Description de la vérification
     * @minLength 1
     */
    description: string;
    /**
     * Nom de la vérification. ce nom doit être unique pour la plateforme
     * @minLength 1
     */
    name: string;
    /**
     * Nom technique de la vérification tel que connu par l'orchestrateur
     * @minLength 1
     */
    orchestrator_job_name: string;
    /**
     * Priorité de la vérification
     * @default "STANDARD"
     */
    priority?: CheckingCreateDtoPriorityEnum;
}

/** Informations sur la vérification */
export interface CheckingExecutionCheckResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    name: string;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

/** Informations détaillées sur l'exécution de vérification */
export interface CheckingExecutionExtendedDetailResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /** Callback à exécuter à la fin de l'exécution */
    callback?: Callback;
    /** Informations sur la vérification */
    check: CheckingExecutionCheckResponseDto;
    /**
     * Identifiant de la communauté rattachée
     * @format uuid
     */
    community: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /**
     * Identifiant du datastore rattaché
     * @format uuid
     */
    datastore: string;
    /** @format date-time */
    finish?: string;
    /**
     * Identifiant de l'organisme rattaché
     * @format uuid
     */
    organization?: string;
    /** @format date-time */
    start?: string;
    status: CheckingExecutionExtendedDetailResponseDtoStatusEnum;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
    /** Informations sur la livraison */
    upload: CheckingExecutionUploadResponseDto;
}

/** Informations sur l'exécution de vérification liée à la livraison */
export interface CheckingExecutionListDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /** Informations sur la vérification */
    check: CheckingExecutionCheckResponseDto;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

/** Informations sur l'exécution de vérification */
export interface CheckingExecutionListResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /** Informations sur la vérification */
    check: CheckingExecutionCheckResponseDto;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    status: CheckingExecutionListResponseDtoStatusEnum;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

/** Informations détaillées sur l'exécution de vérification */
export interface CheckingExecutionStandardDetailResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /** Callback à exécuter à la fin de l'exécution */
    callback?: Callback;
    /** Informations sur la vérification */
    check: CheckingExecutionCheckResponseDto;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /** @format date-time */
    finish?: string;
    /** @format date-time */
    start?: string;
    status: CheckingExecutionStandardDetailResponseDtoStatusEnum;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
    /** Informations sur la livraison */
    upload: CheckingExecutionUploadResponseDto;
}

/** Informations sur la livraison */
export interface CheckingExecutionUploadResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    name: string;
    type: CheckingExecutionUploadResponseDtoTypeEnum;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

/** Informations sur la vérification */
export interface CheckingExtendedDetailResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /** @uniqueItems true */
    default_uploads_check?: CheckingExtendedDetailResponseDtoDefaultUploadsCheckEnum[];
    /** Description de la vérification */
    description: string;
    /** Nom de la vérification. ce nom doit être unique pour la plateforme */
    name: string;
    /** Nom technique de la vérification tel que connu par l'orchestrateur */
    orchestrator_job_name?: string;
    /** Priorité de la vérification */
    priority?: CheckingExtendedDetailResponseDtoPriorityEnum;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

/** Informations sur la vérification */
export interface CheckingListResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /** Description de la vérification */
    description: string;
    /** Nom de la vérification. ce nom doit être unique pour la plateforme */
    name: string;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

/** Informations détaillées sur la vérification */
export interface CheckingStandardDetailResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /** @uniqueItems true */
    default_uploads_check?: CheckingStandardDetailResponseDtoDefaultUploadsCheckEnum[];
    /** Description de la vérification */
    description: string;
    /** Nom de la vérification. ce nom doit être unique pour la plateforme */
    name: string;
    /** Priorité de la vérification */
    priority?: CheckingStandardDetailResponseDtoPriorityEnum;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

/** Nouveaux paramètres de la vérification à modifier (ceux non fournis sont laissés en l'état) */
export interface CheckingUpdateDto {
    /** @uniqueItems true */
    default_uploads_check?: CheckingUpdateDtoDefaultUploadsCheckEnum[];
    /** Description de la vérification */
    description?: string;
    /** Nom de la vérification. ce nom doit être unique pour la plateforme */
    name?: string;
    /** Nom technique de la vérification tel que connu par l'orchestrateur */
    orchestrator_job_name?: string;
    /** Priorité de la vérification */
    priority?: CheckingUpdateDtoPriorityEnum;
}

/** Commentaire */
export interface CommentResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /** Information sur l'auteur */
    author: AuthorResponseDto;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    text: string;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

/** Texte du commentaire à ajouter */
export interface CommentSaveDto {
    /** @minLength 1 */
    text: string;
}

export interface CommunityAddUserDto {
    /** @uniqueItems true */
    rights?: CommunityAddUserDtoRightsEnum[];
}

/** Paramètres de la communauté à créer */
export interface CommunityCreateDto {
    /** Nom du contact de la communauté */
    contact?: string;
    /** Description de la communauté */
    description?: string;
    /**
     * Nom de la communauté
     * @minLength 1
     */
    name: string;
    public?: boolean;
    /**
     * ID du superviseur de la communauté
     * @format uuid
     */
    supervisor: string;
    /**
     * Nom technique de la communauté
     * @minLength 0
     * @maxLength 30
     * @pattern ^[A-Za-z0-9_\-\.]+$
     */
    technical_name: string;
}

/** Informations sur l'entrepôt lié */
export interface CommunityDatastoreResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    active?: boolean;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

/** Informations détaillées sur la communauté */
export interface CommunityDetailResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /** Nom du contact de la communauté */
    contact: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /** Informations sur l'entrepôt lié */
    datastore?: CommunityDatastoreResponseDto;
    /** Description de la communauté */
    description?: string;
    /** Nom de la communauté */
    name: string;
    /** Informations sur l'organisme de la communauté */
    organization?: CommunityOrganizationResponseDto;
    /** Valeur définissant si la communauté est publique ou non */
    public: boolean;
    /** Informations sur le superviseur de la communauté */
    supervisor: CommunitySupervisorResponseDto;
    /** Nom technique de la communauté */
    technical_name: string;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

/** Informations sur la communauté */
export interface CommunityListResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /** Nom du contact de la communauté */
    contact: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /** Description de la communauté */
    description?: string;
    /** Nom de la communauté */
    name: string;
    /** Informations sur l'organisme de la communauté */
    organization?: CommunityOrganizationResponseDto;
    /** Valeur définissant si la communauté est publique ou non */
    public: boolean;
    /** Nom technique de la communauté */
    technical_name: string;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

export interface CommunityMemberDto {
    community?: CommunityUserDto;
    rights?: CommunityMemberDtoRightsEnum[];
}

/** Informations sur l'organisme de la communauté */
export interface CommunityOrganizationResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /** Nom de l'organisme */
    name?: string;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

/** Informations sur le superviseur de la communauté */
export interface CommunitySupervisorResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /** Courriel du superviseur */
    email?: string;
    /** Prénom du superviseur */
    first_name?: string;
    /** Nom du superviseur */
    last_name?: string;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

/** Nouveaux paramètres de la communauté à modifier (ceux non fournis sont laissés en l'état) */
export interface CommunityUpdateDto {
    /** Nom du contact de la communauté */
    contact?: string;
    /** Description de la communauté */
    description?: string;
    /** Nom de la communauté */
    name?: string;
    /** Valeur définissant si la communauté est publique ou non */
    public?: boolean;
    /**
     * ID du superviseur de la communauté
     * @format uuid
     */
    supervisor?: string;
}

export interface CommunityUserDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /**
     * Datastore de la communauté
     * @format uuid
     */
    datastore: string;
    /** Description de la communauté */
    description?: string;
    /** Nom de la communauté */
    name: string;
    public?: boolean;
    /**
     * Nom du superviseur de la communauté
     * @format uuid
     */
    supervisor: string;
    /** Nom technique de la communauté */
    technical_name: string;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

export interface CommunityUserResponseDto {
    /**
     * Date d'ajout de l'utilisateur à la communauté
     * @format date-time
     */
    creation: string;
    rights?: CommunityUserResponseDtoRightsEnum[];
    /**
     * Date de dernière mise à jour de l'utilisateur dans la communauté
     * @format date-time
     */
    update: string;
    user: UserDto;
}

/** ALTIMETRY */
export type ConfigurationAltimetryDetailsContent = ConfigurationDetailsContent & {
    /**
     * Description
     * @minLength 1
     */
    abstract: string;
    /** Bounding box (en degrés) */
    bbox?: BoundingBox;
    /**
     * Mots clés
     * @uniqueItems true
     */
    keywords?: string[];
    /**
     * Titre
     * @minLength 1
     */
    title: string;
    /**
     * Données utilisées
     * @minItems 1
     */
    used_data: ConfigurationUsedDataAltimetryDetailsContent[];
};

/** API-FEATURES */
export type ConfigurationApiFeatureDetailsContent = ConfigurationDetailsContent & {
    /** Bounding box (en degrés) */
    bbox?: BoundingBox;
    period?: string[];
    /** @minItems 1 */
    used_data: ConfigurationUsedDataApiFeatureDetailsContent[];
};

/** Métadonnées liées au propriétaire de la configuration */
export interface ConfigurationAttribution {
    /** Logo du propriétaire */
    logo?: ConfigurationAttributionLogo;
    /**
     * Nom du propriétaire
     * @minLength 1
     */
    title: string;
    /**
     * URL vers le site du propriétaire
     * @minLength 1
     */
    url: string;
}

/** Logo du propriétaire */
export interface ConfigurationAttributionLogo {
    /**
     * le format (mime-type) du logo
     * @pattern \w+/[-+.\w]+
     * @example "image/jpeg"
     */
    format: string;
    /**
     * la hauteur du logo
     * @format int64
     * @min 1
     */
    height: number;
    /**
     * l'URL d'accès au logo
     * @minLength 1
     */
    url: string;
    /**
     * la largeur du logo
     * @format int64
     * @min 1
     */
    width: number;
}

/** Informations sur la configuration de l'offre */
export interface ConfigurationBaseResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /** Nom de la configuration */
    name: string;
    status: ConfigurationStatus;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

/** Informations à fournir pour la déclaration d'une nouvelle configuration */
export interface ConfigurationCreateDto {
    /** Métadonnées liées au propriétaire de la configuration */
    attribution?: ConfigurationAttribution;
    /**
     * Nom technique de la ressource. Ce nom doit être unique sur la plateforme pour un type de configuration donné. Ne peut commencer que par un caractère alphabétique ou un tiret bas, puis uniquement des caractères alphanumériques, tiret, tiret bas, point
     * @pattern ^[A-Za-z_][A-Za-z0-9_\-.]*$
     */
    layer_name: string;
    /**
     * Métadonnées liées à la configuration
     * @uniqueItems true
     */
    metadata?: ConfigurationMetadata[];
    /**
     * Nom de la configuration
     * @minLength 1
     */
    name: string;
    type: ConfigurationType;
    type_infos:
        | ConfigurationAltimetryDetailsContent
        | ConfigurationApiFeatureDetailsContent
        | ConfigurationDownloadDetailsContent
        | ConfigurationItineraryIsocurveDetailsContent
        | ConfigurationSearchDetailsContent
        | ConfigurationVectorTmsDetailsContent
        | ConfigurationWfsDetailsContent
        | ConfigurationWmsRasterDetailsContent
        | ConfigurationWmsVectorDetailsContent
        | ConfigurationWmtsTmsDetailsContent;
}

export type ConfigurationDetailsContent = object;

/** DOWNLOAD */
export type ConfigurationDownloadDetailsContent = ConfigurationDetailsContent & {
    /** Description dans les différentes langues disponibles */
    abstract: Record<string, string>;
    /**
     * Mots clés
     * @uniqueItems true
     */
    keywords?: string[];
    /** Namespace de la ressource */
    namespace?: string;
    /** Identifiant produit de la ressource */
    product_identifier?: string;
    /** Droits applicables */
    rights?: string;
    /** Titre dans les différentes langues disponibles */
    title: Record<string, string>;
    /**
     * Données utilisées
     * @minItems 1
     */
    used_data: ConfigurationUsedDataDownloadDetailsContent[];
};

/** Événement */
export interface ConfigurationEventDto {
    /** @format date-time */
    date: string;
    /** Informations sur l'initiateur de l'évènement */
    initiator?: EventInitiatorDto;
    text?: string;
    title: string;
    /** @uniqueItems true */
    urls?: EndpointUrl[];
}

/** Informations détaillées sur la configuration */
export interface ConfigurationExtendedDetailResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /** Métadonnées liées au propriétaire de la configuration */
    attribution?: ConfigurationAttribution;
    /**
     * Identifiant de la communauté rattachée
     * @format uuid
     */
    community: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /**
     * Identifiant du datastore rattaché
     * @format uuid
     */
    datastore: string;
    /** Événement */
    last_event?: ConfigurationEventDto;
    /** Nom technique de la ressource. Ce nom doit être unique sur la plateforme pour un type de configuration donné. Ne peut commencer que par un caractère alphabétique ou un tiret bas, puis uniquement des caractères alphanumériques, tiret, tiret bas, point */
    layer_name: string;
    /**
     * Métadonnées liées à la configuration
     * @uniqueItems true
     */
    metadata?: ConfigurationMetadata[];
    /** Nom de la configuration */
    name: string;
    /**
     * Identifiant de l'organisme rattaché
     * @format uuid
     */
    organization?: string;
    status: ConfigurationStatus;
    tags: Record<string, string>;
    type: ConfigurationType;
    type_infos:
        | ConfigurationAltimetryDetailsContent
        | ConfigurationApiFeatureDetailsContent
        | ConfigurationDownloadDetailsContent
        | ConfigurationItineraryIsocurveDetailsContent
        | ConfigurationSearchDetailsContent
        | ConfigurationVectorTmsDetailsContent
        | ConfigurationWfsDetailsContent
        | ConfigurationWmsRasterDetailsContent
        | ConfigurationWmsVectorDetailsContent
        | ConfigurationWmtsTmsDetailsContent;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
    extra?: Record<string, any>;
}

/** Informations sur la configuration (les champs metadatas, attribution, last_event, tags, creation et update ne sont pas retournés par défaut) */
export interface ConfigurationExtendedListResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /** Métadonnées liées au propriétaire de la configuration */
    attribution?: ConfigurationAttribution;
    /**
     * Identifiant de la communauté rattachée
     * @format uuid
     */
    community: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /**
     * Identifiant du datastore rattaché
     * @format uuid
     */
    datastore: string;
    /** Événement */
    last_event?: ConfigurationEventDto;
    /** Nom technique de la ressource. Ce nom doit être unique sur la plateforme pour un type de configuration donné. Ne peut commencer que par un caractère alphabétique ou un tiret bas, puis uniquement des caractères alphanumériques, tiret, tiret bas, point */
    layer_name?: string;
    /**
     * Métadonnées liées à la configuration
     * @uniqueItems true
     */
    metadata?: ConfigurationMetadata[];
    /** Nom de la configuration */
    name?: string;
    /**
     * Identifiant de l'organisme rattaché
     * @format uuid
     */
    organization?: string;
    status?: ConfigurationStatus;
    /** Liste des étiquettes  de configuration (format clé/valeur) */
    tags?: Record<string, string>;
    type?: ConfigurationType;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

/** Informations à fournir pour modifier la configuration */
export interface ConfigurationFullUpdateDto {
    /** Métadonnées liées au propriétaire de la configuration */
    attribution?: ConfigurationAttribution;
    /**
     * Métadonnées liées à la configuration
     * @uniqueItems true
     */
    metadata?: ConfigurationMetadata[];
    /**
     * Nom de la configuration
     * @minLength 1
     */
    name: string;
    type: ConfigurationType;
    type_infos:
        | ConfigurationAltimetryDetailsContent
        | ConfigurationApiFeatureDetailsContent
        | ConfigurationDownloadDetailsContent
        | ConfigurationItineraryIsocurveDetailsContent
        | ConfigurationSearchDetailsContent
        | ConfigurationVectorTmsDetailsContent
        | ConfigurationWfsDetailsContent
        | ConfigurationWmsRasterDetailsContent
        | ConfigurationWmsVectorDetailsContent
        | ConfigurationWmtsTmsDetailsContent;
}

export interface ConfigurationGetFeatureInfoIsStoredDataWmtsTmsDetailsContent {
    /** Indique si on va utiliser directement la donnée stockée */
    stored_data: boolean;
}

export interface ConfigurationGetFeatureInfoServerUrlWmtsTmsDetailsContent {
    /** @minLength 1 */
    server_url: string;
}

/** Ressource cible du GetFeatureInfo */
export type ConfigurationGetFeatureInfoWmtsTmsDetailsContent =
    ConfigurationGetFeatureInfoIsStoredDataWmtsTmsDetailsContent | ConfigurationGetFeatureInfoServerUrlWmtsTmsDetailsContent;

/** ITINERARY-ISOCURVE */
export type ConfigurationItineraryIsocurveDetailsContent = ConfigurationDetailsContent & {
    /**
     * Description
     * @minLength 1
     */
    abstract: string;
    /** Bounding box (en degrés) */
    bbox?: BoundingBox;
    constraints?: JsonNode;
    /**
     * Mots clés
     * @uniqueItems true
     */
    keywords?: string[];
    /** Limites pour les calculs d'itinéraire (nombre d'étapes et de contraintes) et d'isochrone (durée et distance) */
    limits?: ConfigurationLimitsItineraryIsocurveDetailsContent;
    /** Projection(s) */
    srss?: string[];
    /**
     * Titre
     * @minLength 1
     */
    title: string;
    /**
     * Données utilisées
     * @minItems 1
     */
    used_data: ConfigurationUsedDataItineraryIsocurveDetailsContent[];
};

/** Limites pour les calculs d'itinéraire (nombre d'étapes et de contraintes) et d'isochrone (durée et distance) */
export interface ConfigurationLimitsItineraryIsocurveDetailsContent {
    /**
     * Nombre de contraintes maximal pour le service d'itinéraire
     * @format int32
     * @min 0
     * @max 6
     * @default 3
     */
    constraints?: number;
    /**
     * Distance maximale pour le calcul d'isochrone
     * @format int32
     * @min 0
     * @max 2000000
     * @default 1000000
     */
    distance?: number;
    /**
     * Durée maximale pour le calcul d'isochrone
     * @format int32
     * @min 0
     * @max 86400
     * @default 43200
     */
    duration?: number;
    /**
     * Nombre d'étapes maximal pour le service d'itinéraire
     * @format int32
     * @min 0
     * @max 25
     * @default 16
     */
    steps?: number;
}

/** Informations sur la métadonnée liée à la configuration */
export interface ConfigurationMetadata {
    /**
     * Le format (mime-type) de la métadonnée
     * @minLength 1
     * @pattern \w+/[-+.\w]+
     * @example "application/xml"
     */
    format: string;
    /** Le type de métadonnées */
    type: ConfigurationMetadataTypeEnum;
    /**
     * L'URL d'accès à la métadonnée'
     * @minLength 1
     */
    url: string;
}

export interface ConfigurationPartialUpdateDto {
    /** Nom de la configuration */
    name?: string;
    extra?: Record<string, any>;
}

export interface ConfigurationPrimariesApiFeatureDetailsContent {
    geometry?: string;
    instant?: string;
}

/** SEARCH */
export type ConfigurationSearchDetailsContent = ConfigurationDetailsContent & {
    /**
     * Description
     * @minLength 1
     */
    abstract: string;
    /**
     * Mots clés
     * @uniqueItems true
     */
    keywords?: string[];
    /**
     * Titre
     * @minLength 1
     */
    title: string;
    /**
     * Données utilisées
     * @minItems 1
     */
    used_data: ConfigurationUsedDataSearchDetailsContent[];
};

/** Informations détaillées sur la configuration */
export interface ConfigurationStandardDetailResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /** Métadonnées liées au propriétaire de la configuration */
    attribution?: ConfigurationAttribution;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /** Événement */
    last_event?: ConfigurationEventDto;
    /** Nom technique de la ressource. Ce nom doit être unique sur la plateforme pour un type de configuration donné. Ne peut commencer que par un caractère alphabétique ou un tiret bas, puis uniquement des caractères alphanumériques, tiret, tiret bas, point */
    layer_name: string;
    /**
     * Métadonnées liées à la configuration
     * @uniqueItems true
     */
    metadata?: ConfigurationMetadata[];
    /** Nom de la configuration */
    name: string;
    status: ConfigurationStatus;
    tags: Record<string, string>;
    type: ConfigurationType;
    type_infos:
        | ConfigurationAltimetryDetailsContent
        | ConfigurationApiFeatureDetailsContent
        | ConfigurationDownloadDetailsContent
        | ConfigurationItineraryIsocurveDetailsContent
        | ConfigurationSearchDetailsContent
        | ConfigurationVectorTmsDetailsContent
        | ConfigurationWfsDetailsContent
        | ConfigurationWmsRasterDetailsContent
        | ConfigurationWmsVectorDetailsContent
        | ConfigurationWmtsTmsDetailsContent;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
    extra?: Record<string, any>;
}

/** Informations sur la configuration (les champs metadatas, attribution, last_event, tags, creation et update ne sont pas retournés par défaut) */
export interface ConfigurationStandardListResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /** Métadonnées liées au propriétaire de la configuration */
    attribution?: ConfigurationAttribution;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /** Événement */
    last_event?: ConfigurationEventDto;
    /** Nom technique de la ressource. Ce nom doit être unique sur la plateforme pour un type de configuration donné. Ne peut commencer que par un caractère alphabétique ou un tiret bas, puis uniquement des caractères alphanumériques, tiret, tiret bas, point */
    layer_name?: string;
    /**
     * Métadonnées liées à la configuration
     * @uniqueItems true
     */
    metadata?: ConfigurationMetadata[];
    /** Nom de la configuration */
    name?: string;
    status?: ConfigurationStatus;
    /** Liste des étiquettes  de configuration (format clé/valeur) */
    tags?: Record<string, string>;
    type?: ConfigurationType;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

export interface ConfigurationUsedDataAltimetryDetailsContent {
    /** Informations sur la source des données */
    accuracy: ConfigurationUsedDataSourceAccuracyAltimetryDetailsContent;
    /** Bounding box (en degrés) */
    bbox?: BoundingBox;
    /** Informations sur la source des données */
    source: ConfigurationUsedDataSourceAccuracyAltimetryDetailsContent;
    /**
     * Identifiant de la donnée stockée
     * @format uuid
     */
    stored_data: string;
    /**
     * Titre
     * @minLength 1
     */
    title: string;
}

export interface ConfigurationUsedDataApiFeatureDetailsContent {
    /** @minLength 1 */
    abstract: string;
    primaries?: ConfigurationPrimariesApiFeatureDetailsContent;
    queryables?: string[];
    /** @minLength 1 */
    relation: string;
    schema?: JsonNode;
    sortables?: string[];
    /**
     * Identifiant de la donnée stockée
     * @format uuid
     */
    stored_data: string;
    /** @minLength 1 */
    title: string;
    total?: boolean;
    writable?: boolean;
}

export interface ConfigurationUsedDataAttributeItineraryIsocurveDetailsContent {
    default?: boolean;
    /**
     * Nom de l'attribut dans la table
     * @minLength 1
     */
    native_name: string;
    /**
     * Nom de l'attribut vu du service
     * @minLength 1
     * @pattern ^[A-Za-z0-9_-]+$
     */
    public_name: string;
    /** Nom de la table */
    table_name?: string;
}

/** Données utilisées */
export interface ConfigurationUsedDataDownloadDetailsContent {
    /** Description dans les différentes langues disponibles */
    abstract?: Record<string, string>;
    /** Format des fichiers */
    format?: string;
    /**
     * Mots clés
     * @uniqueItems true
     */
    keywords?: string[];
    /** Résolution des données */
    resolution?: string;
    /** Droits applicables */
    rights?: string;
    /**
     * Identifiant de la donnée stockée
     * @format uuid
     */
    stored_data: string;
    /**
     * Nom technique de la sous-ressource. Ce nom doit être unique au sein de la configuration. Uniquement des caractères alphanumériques, tiret, tiret bas, point
     * @minLength 1
     * @pattern ^[A-Za-z0-9_\-.]+$
     */
    sub_name: string;
    /** Thématique des données */
    thematic?: string;
    /** Titre dans les différentes langues disponibles */
    title?: Record<string, string>;
    /** Zone géographique concernée */
    zone?: string;
}

export interface ConfigurationUsedDataItineraryIsocurveDetailsContent {
    /**
     * Attributs retournés par l'API
     * @uniqueItems true
     */
    attributes?: ConfigurationUsedDataAttributeItineraryIsocurveDetailsContent[];
    /** Colonne de coût (pour stored data de type GRAPHE-DB) */
    cost_column?: string;
    /** Type de coût */
    cost_type?: ConfigurationUsedDataItineraryIsocurveDetailsContentCostTypeEnum;
    /** Méthode de calcul de coût (pour stored data de type GRAPHE-VALHALLA) */
    costing?: ConfigurationUsedDataItineraryIsocurveDetailsContentCostingEnum;
    /**
     * Optimisation de graphe à utiliser (e.g. plus court ou plus rapide)
     * @minLength 1
     */
    optimization: string;
    /**
     * Profil de graphe à utiliser (e.g. voiture ou piéton)
     * @minLength 1
     */
    profile: string;
    /** Colonne de coût inverse (pour stored data de type GRAPHE-DB) */
    reverse_cost_column?: string;
    /**
     * Identifiant de la donnée stockée
     * @format uuid
     */
    stored_data: string;
}

export interface ConfigurationUsedDataRelationVectorTmsDetailsContent {
    /**
     * Description
     * @minLength 1
     */
    abstract: string;
    /**
     * Nom de la table
     * @minLength 1
     */
    native_name: string;
    /** Nom public de la table */
    public_name?: string;
}

export interface ConfigurationUsedDataRelationWfsDetailsContent {
    /**
     * Description
     * @minLength 1
     */
    abstract: string;
    /**
     * Mots clés
     * @uniqueItems true
     */
    keywords?: string[];
    /**
     * Nom de la table
     * @minLength 1
     */
    native_name: string;
    /** Nom public de la table */
    public_name?: string;
    /**
     * Titre
     * @minLength 1
     */
    title: string;
}

export interface ConfigurationUsedDataRelationWmsVectorDetailsContent {
    /** @format uuid */
    ftl?: string;
    /**
     * Nom de la table
     * @minLength 1
     */
    name: string;
    /**
     * Lien vers une entité Static
     * @format uuid
     */
    style: string;
}

export interface ConfigurationUsedDataSearchDetailsContent {
    /**
     * Identifiant de la donnée stockée
     * @format uuid
     */
    stored_data: string;
}

/** Informations sur la source des données */
export type ConfigurationUsedDataSourceAccuracyAltimetryDetailsContent =
    ConfigurationUsedDataSourceAccuracyManualAltimetryDetailsContent | ConfigurationUsedDataSourceAccuracyPyramidAltimetryDetailsContent;

export interface ConfigurationUsedDataSourceAccuracyManualAltimetryDetailsContent {
    /**
     * Valeur unique pour la source des données
     * @minLength 1
     */
    value: string;
}

export interface ConfigurationUsedDataSourceAccuracyPyramidAltimetryDetailsContent {
    /** Mapping entre les valeurs de la pyramide et les valeurs effectivement renvoyées */
    mapping: Record<string, string>;
    /**
     * Identifiant de la donnée stockée
     * @format uuid
     */
    stored_data: string;
}

export interface ConfigurationUsedDataVectorTmsDetailsContent {
    /** @minItems 1 */
    relations: ConfigurationUsedDataRelationVectorTmsDetailsContent[];
    /**
     * Identifiant de la donnée stockée
     * @format uuid
     */
    stored_data: string;
}

export interface ConfigurationUsedDataWfsDetailsContent {
    expose_primary_key?: boolean;
    /** @minItems 1 */
    relations: ConfigurationUsedDataRelationWfsDetailsContent[];
    /**
     * Identifiant de la donnée stockée
     * @format uuid
     */
    stored_data: string;
}

export interface ConfigurationUsedDataWmsVectorDetailsContent {
    /** @minItems 1 */
    relations: ConfigurationUsedDataRelationWmsVectorDetailsContent[];
    /**
     * Identifiant de la donnée stockée
     * @format uuid
     */
    stored_data: string;
}

export interface ConfigurationUsedDataWmtsTmsDetailsContent {
    /** @minLength 1 */
    bottom_level: string;
    /**
     * Identifiant de la donnée stockée
     * @format uuid
     */
    stored_data: string;
    /** @minLength 1 */
    top_level: string;
}

/** VECTOR-TMS */
export type ConfigurationVectorTmsDetailsContent = ConfigurationDetailsContent & {
    /** @minItems 1 */
    used_data: ConfigurationUsedDataVectorTmsDetailsContent[];
};

/** WFS */
export type ConfigurationWfsDetailsContent = ConfigurationDetailsContent & {
    /** Bounding box (en degrés) */
    bbox?: BoundingBox;
    /** @minItems 1 */
    used_data: ConfigurationUsedDataWfsDetailsContent[];
};

/** WMS-RASTER */
export type ConfigurationWmsRasterDetailsContent = ConfigurationDetailsContent & {
    /** @minLength 1 */
    abstract: string;
    /** Bounding box (en degrés) */
    bbox?: BoundingBox;
    /** Résolution minimale de la couche */
    bottom_resolution?: number;
    /** Ressource cible du GetFeatureInfo */
    getfeatureinfo?: ConfigurationGetFeatureInfoWmtsTmsDetailsContent;
    /**
     * Interpolation utilisée pour les conversions de résolution
     * @default "BICUBIC"
     */
    interpolation?: ConfigurationWmsRasterDetailsContentInterpolationEnum;
    /**
     * Mots clés
     * @uniqueItems true
     */
    keywords?: string[];
    /** Identifiants des fichiers statiques de style Rok4 */
    styles?: string[];
    /** @minLength 1 */
    title: string;
    /** Résolution maximale de la couche */
    top_resolution?: number;
    /** @minItems 1 */
    used_data: ConfigurationUsedDataWmtsTmsDetailsContent[];
};

/** WMS-VECTOR */
export type ConfigurationWmsVectorDetailsContent = ConfigurationDetailsContent & {
    /** @minLength 1 */
    abstract: string;
    /** Bounding box (en degrés) */
    bbox?: BoundingBox;
    /**
     * Mots clés
     * @uniqueItems true
     */
    keywords?: string[];
    /** @minLength 1 */
    title: string;
    /** @minItems 1 */
    used_data: ConfigurationUsedDataWmsVectorDetailsContent[];
};

/** WMTS-TMS */
export type ConfigurationWmtsTmsDetailsContent = ConfigurationDetailsContent & {
    /** @minLength 1 */
    abstract: string;
    /** Bounding box (en degrés) */
    bbox?: BoundingBox;
    /** Ressource cible du GetFeatureInfo */
    getfeatureinfo?: ConfigurationGetFeatureInfoWmtsTmsDetailsContent;
    /**
     * Mots clés
     * @uniqueItems true
     */
    keywords?: string[];
    /** Identifiants des fichiers statiques de style Rok4 */
    styles?: string[];
    /** @minLength 1 */
    title: string;
    /** @minItems 1 */
    used_data: ConfigurationUsedDataWmtsTmsDetailsContent[];
};

/** Coordonnées d'origine du dallage (pour le type COPC) */
export interface Coordinate {
    /**
     * Longitude
     * @format double
     */
    x: number;
    /**
     * Latitude
     * @format double
     */
    y: number;
}

/** Communauté à laquelle l'entrepôt est rattaché */
export interface DatastoreCommunityResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    contact: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    public: boolean;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

/** Paramètres de l'entrepôt à créer */
export interface DatastoreCreateDto {
    /**
     * Liste des vérifications auxquelles l'entrepôt a accès
     * @uniqueItems true
     */
    checks?: string[];
    /**
     * Communauté à laquelle l'entrepôt est rattaché
     * @format uuid
     */
    community: string;
    /** Préfixe obligatoire pour le layer_name des configurations créées sur ce datastore */
    configuration_layer_name_prefix?: string;
    /**
     * Liste des points d'accès auxquels l'entrepôt a accès
     * @uniqueItems true
     */
    endpoints: DatastoreEndpointDto[];
    /** Préfixe obligatoire pour le file_identifier des métadonnées déposées sur ce datastore */
    metadata_file_identifier_prefix?: string;
    /**
     * Liste des traitements auxquels l'entrepôt a accès
     * @uniqueItems true
     */
    processings?: string[];
    /**
     * Datastore ouvert aux partages ou non
     * @default true
     */
    sharings?: boolean;
    /** Stockages que l'entrepôt utilise et quotas à ne pas dépasser */
    storages: DatastoreStoragesCreateDto;
}

/** Informations sur l'entrepôt */
export interface DatastoreDetailResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /** Datastore actif ou non */
    active: boolean;
    /**
     * Liste des vérifications auxquelles l'entrepôt a accès
     * @uniqueItems true
     */
    checks: string[];
    /** Communauté à laquelle l'entrepôt est rattaché */
    community: DatastoreCommunityResponseDto;
    /** Préfixe obligatoire pour le layer_name des configurations créées sur ce datastore */
    configuration_layer_name_prefix?: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /** Description de la communauté */
    description?: string;
    /**
     * Liste des points d'accès auxquels l'entrepôt a accès
     * @uniqueItems true
     */
    endpoints: DatastoreEndpointStandardResponseDto[];
    /** Préfixe obligatoire pour le file_identifier des métadonnées déposées sur ce datastore */
    metadata_file_identifier_prefix?: string;
    /** Nom de la communauté */
    name: string;
    /**
     * Liste des traitements auxquels l'entrepôt a accès
     * @uniqueItems true
     */
    processings: string[];
    /** Datastore ouvert aux partages ou non */
    sharings?: boolean;
    /** Stockages que l'entrepôt utilise et quotas à ne pas dépasser */
    storages: DatastoreStoragesResponseDto;
    /** Nom technique de la communauté */
    technical_name: string;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

/** Informations sur le point d'accès */
export interface DatastoreEndpointDto {
    /**
     * Identifiant du point d'accès
     * @format uuid
     */
    endpoint: string;
    /**
     * Nombre d'offres maximum
     * @format int64
     */
    quota: number;
}

/** Informations sur le point d'accès */
export interface DatastoreEndpointExtendedResponseDto {
    /**
     * Identifiant de la communauté rattachée
     * @format uuid
     */
    community: string;
    /**
     * Identifiant du datastore rattaché
     * @format uuid
     */
    datastore: string;
    /** Informations détaillées sur le point d'accès */
    endpoint: EndpointDetailResponseDto;
    /**
     * Identifiant de l'organisme rattaché
     * @format uuid
     */
    organization?: string;
    /**
     * Nombre d'offres maximum
     * @format int64
     */
    quota: number;
    /**
     * Nombre d'offres présentes
     * @format int64
     */
    use: number;
}

/** Informations sur le point d'accès */
export interface DatastoreEndpointStandardResponseDto {
    /** Informations détaillées sur le point d'accès */
    endpoint: EndpointDetailResponseDto;
    /**
     * Nombre d'offres maximum
     * @format int64
     */
    quota: number;
    /**
     * Nombre d'offres présentes
     * @format int64
     */
    use: number;
}

/** Informations sur l'entrepôt */
export interface DatastoreListResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /** Datastore actif ou non */
    active: boolean;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /** Nom de la communauté */
    name: string;
    /** Nom technique de la communauté */
    technical_name: string;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

/** Informations sur l'entrepôt */
export interface DatastoreListWithEndpointUsageResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /** Datastore actif ou non */
    active: boolean;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /** Nom de la communauté */
    name: string;
    /**
     * Quota en octets
     * @format int64
     */
    quota: number;
    /** Nom technique de la communauté */
    technical_name: string;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
    /**
     * Espace occupé en octets
     * @format int64
     */
    use: number;
}

/** Informations sur l'entrepôt */
export interface DatastoreListWithStorageUsageResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /** Datastore actif ou non */
    active: boolean;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /** Nom de la communauté */
    name: string;
    /**
     * Quota en octets pour les annexes
     * @format int64
     */
    storage_annexes_quota?: number;
    /**
     * Espace occupé en octets pour les annexes
     * @format int64
     */
    storage_annexes_use?: number;
    /**
     * Quota en octets pour les données stockées
     * @format int64
     */
    storage_data_quota?: number;
    /**
     * Espace occupé en octets pour les données stockées
     * @format int64
     */
    storage_data_use?: number;
    /**
     * Quota en octets pour les livraisons
     * @format int64
     */
    storage_uploads_quota?: number;
    /**
     * Espace occupé en octets pour les livraisons
     * @format int64
     */
    storage_uploads_use?: number;
    /** Nom technique de la communauté */
    technical_name: string;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

/** Informations sur l'entrepôt partagé */
export interface DatastoreSharingResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    active: boolean;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    description?: string;
    name: string;
    technical_name: string;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

/** Informations sur le stockage */
export interface DatastoreStorageDto {
    /**
     * Quota en octets
     * @format int64
     */
    quota: number;
    /**
     * Identifiant du stockage
     * @format uuid
     */
    storage: string;
}

/** Informations sur le stockage */
export interface DatastoreStorageResponseDto {
    /**
     * Quota en octets
     * @format int64
     */
    quota: number;
    /** Informations sur le stockage */
    storage: StorageListResponseDto;
    /**
     * Espace occupé en octets
     * @format int64
     */
    use: number;
}

/** Stockages que l'entrepôt utilise et quotas à ne pas dépasser */
export interface DatastoreStoragesCreateDto {
    /** Informations sur le stockage */
    annexes: DatastoreStorageDto;
    /**
     * Liste de stockages pour les données stockées
     * @uniqueItems true
     */
    data: DatastoreStorageDto[];
    /** Informations sur le stockage */
    uploads: DatastoreStorageDto;
}

/** Stockages que l'entrepôt utilise et quotas à ne pas dépasser */
export interface DatastoreStoragesResponseDto {
    /** Informations sur le stockage */
    annexes: DatastoreStorageResponseDto;
    /**
     * Liste de stockages pour les données stockées
     * @uniqueItems true
     */
    data: DatastoreStorageResponseDto[];
    /** Informations sur le stockage */
    uploads: DatastoreStorageResponseDto;
}

/** Stockages que l'entrepôt utilise et quotas à ne pas dépasser */
export interface DatastoreStoragesUpdateDto {
    /** Informations sur le stockage */
    annexes?: DatastoreStorageDto;
    /**
     * Liste de stockages pour les données stockées
     * @uniqueItems true
     */
    data?: DatastoreStorageDto[];
    /** Informations sur le stockage */
    uploads?: DatastoreStorageDto;
}

/** Nouvelle configuration de l'entrepôt */
export interface DatastoreUpdateDto {
    /** Datastore actif ou non */
    active?: boolean;
    /**
     * Liste des vérifications auxquelles l'entrepôt a accès
     * @uniqueItems true
     */
    checks?: string[];
    /**
     * Préfixe obligatoire pour le layer_name des configurations créées sur ce datastore
     * Une chaîne vide permet de supprimer le préfixe
     */
    configuration_layer_name_prefix?: string;
    /**
     * Liste des points d'accès auxquels l'entrepôt a accès
     * @uniqueItems true
     */
    endpoints: DatastoreEndpointDto[];
    /**
     * Préfixe obligatoire pour le file_identifier des métadonnées déposées sur ce datastore
     * Une chaîne vide permet de supprimer le préfixe
     */
    metadata_file_identifier_prefix?: string;
    /**
     * Liste des traitements auxquels l'entrepôt a accès
     * @uniqueItems true
     */
    processings?: string[];
    /** Datastore ouvert aux partages ou non */
    sharings?: boolean;
    /** Stockages que l'entrepôt utilise et quotas à ne pas dépasser */
    storages?: DatastoreStoragesUpdateDto;
}

/** Informations détaillées sur le document */
export interface DocumentDetailsResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    description?: string;
    labels?: string[];
    mime_type: string;
    /** Nom du document */
    name: string;
    public_url?: string;
    /**
     * La taille du document
     * @format int64
     */
    size: number;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
    extra?: Record<string, any>;
}

/** Informations sur le document */
export interface DocumentListResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /** Description du document */
    description?: string;
    /**
     * Liste des étiquettes
     * @uniqueItems true
     */
    labels?: string[];
    /** Le type mime du document */
    mime_type?: string;
    /** Nom du document */
    name?: string;
    /** URL publique du document */
    public_url?: string;
    /**
     * La taille du document
     * @format int64
     */
    size?: number;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

/** Paramètres du document à modifier */
export interface DocumentUpdateDto {
    /** Description du document */
    description?: string;
    /**
     * Liste des étiquettes
     * @uniqueItems true
     */
    labels?: string[];
    /** Nom du document */
    name?: string;
    /** URL publique du document */
    public_url?: boolean;
    extra?: Record<string, any>;
}

/** Paramètres du point d'accès à ajouter */
export interface EndpointCreateDto {
    /** Attribution obligatoire */
    force_attribution?: boolean;
    /** Métadonnée obligatoire */
    force_metadata?: boolean;
    /** @minLength 1 */
    metadata_fi: string;
    /**
     * Nom du point d'accès. ce nom doit être unique. le nom est insensible à la casse
     * @minLength 1
     */
    name: string;
    /** Point d'accès ouvert ? (sans contrôle des accès) */
    open: boolean;
    /** Synchronisation avec l'index de recherche */
    search_publish?: boolean;
    /**
     * Nom technique du point d'accès. ce nom technique doit être unique
     * @minLength 1
     * @pattern (^[a-z0-9-]+$|^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$)
     */
    technical_name: string;
    /** Type du point d'accès */
    type: EndpointCreateDtoTypeEnum;
    /**
     * @minItems 1
     * @uniqueItems true
     */
    urls: EndpointUrl[];
    /** Indique si le point d'accès est accessible en écriture (applicable uniquement pour le type API-FEATURES) */
    writable?: boolean;
}

/** Informations détaillées sur le point d'accès */
export interface EndpointDetailResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /** Attribution obligatoire */
    force_attribution?: boolean;
    /** Métadonnée obligatoire */
    force_metadata?: boolean;
    metadata_fi?: string;
    /** Nom du point d'accès. ce nom doit être unique. le nom est insensible à la casse */
    name: string;
    /** Point d'accès ouvert ? (sans contrôle des accès) */
    open: boolean;
    /** Synchronisation avec l'index de recherche */
    search_publish?: boolean;
    /** Nom technique du point d'accès. ce nom technique doit être unique */
    technical_name: string;
    /** Type du point d'accès */
    type: EndpointDetailResponseDtoTypeEnum;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
    /** @uniqueItems true */
    urls?: EndpointUrl[];
    /** Indique si le point d'accès est accessible en écriture (applicable uniquement pour le type API-FEATURES) */
    writable?: boolean;
}

/** Informations sur le point d'accès */
export interface EndpointListResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /** le nom du point d'accès */
    name: string;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

/** Paramètres du point d'accès à modifier */
export interface EndpointUpdateDto {
    /** Attribution obligatoire */
    force_attribution?: boolean;
    /** Métadonnée obligatoire */
    force_metadata?: boolean;
    metadata_fi?: string;
    /** Nom du point d'accès. ce nom doit être unique. le nom est insensible à la casse */
    name?: string;
    /** Synchronisation avec l'index de recherche */
    search_publish?: boolean;
    /** @uniqueItems true */
    urls?: EndpointUrl[];
    /** Indique si le point d'accès est accessible en écriture (applicable uniquement pour le type API-FEATURES) */
    writable?: boolean;
}

/** Liste des urls du point d'accès */
export interface EndpointUrl {
    /** Type de l'URL du point d'accès */
    type: EndpointUrlTypeEnum;
    /**
     * URL du point d'accès
     * @minLength 1
     */
    url: string;
}

/** Entrées */
export interface EntryDto {
    /** Catégories */
    categories: CategoryDto[];
    /** Description */
    content: string;
    /** Identifiant */
    id: string;
    links?: LinkDto[];
    /** Bounding box (en degrés) */
    polygon?: BoundingBox;
    /** Description */
    subtitle?: string;
    /** Nom */
    title: string;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    updated?: string;
}

/** Événement */
export interface EventDto {
    /** @format date-time */
    date: string;
    /** Informations sur l'initiateur de l'évènement */
    initiator?: EventInitiatorDto;
    text?: string;
    title: string;
}

/** Informations sur l'initiateur de l'évènement */
export interface EventInitiatorDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    first_name: string;
    last_name: string;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

/** Evénement */
export interface EventResponseDto {
    /** @format date-time */
    date: string;
    /** Information sur l'auteur */
    initiator: AuthorResponseDto;
    text?: string;
    title: string;
}

/** Paramètres d'une exécution de traitement à mettre à jour */
export interface ExecutionUpdateDto {
    /** Callback à exécuter à la fin de l'exécution */
    callback?: Callback;
}

export interface FeedDto {
    /** Producteur */
    author: AuthorDto;
    /** Entrées */
    entries: EntryDto[];
    /** Identifiant */
    id: string;
    links?: LinkDto[];
    /** Licence et conditions d'utilisation */
    rights: string;
    /** Description */
    subtitle?: string;
    /** Nom */
    title: string;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    updated?: string;
    xmlns?: string;
}

export interface HashInfoDto {
    hash?: string;
}

/** existing_upload */
export interface IdFieldDto {
    /**
     * Identifiant de la livraison
     * @format uuid
     */
    id: string;
}

export type JsonNode = object;

export interface LinkDto {
    /** URL */
    href: string;
    /** Type de lien */
    rel: string;
    /** Nom */
    title: string;
    /** Mime-type de la cible */
    type: string;
}

/** Informations détaillées sur la métadonnée */
export interface MetadataExtendedResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Identifiant de la communauté rattachée
     * @format uuid
     */
    community: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /**
     * Identifiant du datastore rattaché
     * @format uuid
     */
    datastore: string;
    endpoints?: EndpointListResponseDto[];
    file_identifier: string;
    level: MetadataExtendedResponseDtoLevelEnum;
    open_data: boolean;
    /**
     * Identifiant de l'organisme rattaché
     * @format uuid
     */
    organization?: string;
    tags?: Record<string, string>;
    type: MetadataExtendedResponseDtoTypeEnum;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
    extra?: Record<string, any>;
}

export interface MetadataPublicationDto {
    /** @format uuid */
    endpoint: string;
    /**
     * @minItems 1
     * @uniqueItems true
     */
    file_identifiers: string[];
}

/** Informations détaillées sur la métadonnée */
export interface MetadataStandardResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    endpoints?: EndpointListResponseDto[];
    file_identifier: string;
    level: MetadataStandardResponseDtoLevelEnum;
    open_data: boolean;
    tags?: Record<string, string>;
    type: MetadataStandardResponseDtoTypeEnum;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
    extra?: Record<string, any>;
}

export interface MetadataUpdateDto {
    open_data?: boolean;
    type?: MetadataUpdateDtoTypeEnum;
    extra?: Record<string, any>;
}

/** new_upload */
export interface NamedFieldDto {
    /** Nom de la livraison */
    name: string;
}

/** Informations détaillées sur la nomenclature */
export interface NomenclatureAdminResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /** Label de la nomenclature */
    label: string;
    /** Code de la nomenclature */
    term: string;
    /** Type de famille à laquelle appartient la nomenclature */
    type: NomenclatureAdminResponseDtoTypeEnum;
}

/** Paramètres de la nomenclature à créer */
export interface NomenclatureCreateDto {
    /** Label de la nomenclature */
    label: string;
    /** Code de la nomenclature */
    term: string;
    /** Type de famille à laquelle appartient la nomenclature */
    type: NomenclatureCreateDtoTypeEnum;
}

/** Informations sur la nomenclature */
export interface NomenclatureResponseDto {
    /** Label de la nomenclature */
    label: string;
    /** Code de la nomenclature */
    term: string;
    /** Type de famille à laquelle appartient la nomenclature */
    type: NomenclatureResponseDtoTypeEnum;
}

/** Informations sur la nomenclature */
export interface NomenclatureSimpleResponseDto {
    /** Label de la nomenclature */
    label: string;
    /** Code de la nomenclature */
    term: string;
}

/** Paramètres de la nomenclature à modifier */
export interface NomenclatureUpdateDto {
    /** Label de la nomenclature */
    label: string;
}

export type OAuth2InfoDto = object;

/** Informations détaillées sur l'offre */
export interface OfferingCatalogResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Indique si l'offre est disponible
     * @deprecated
     */
    available: boolean;
    /** Informations sur la configuration de l'offre */
    configuration: ConfigurationBaseResponseDto;
    contact: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /** Informations sur le point d'accès */
    endpoint: EndpointListResponseDto;
    /** Nom technique de la ressource. Ce nom doit être unique sur la plateforme pour un type de configuration donné. Ne peut commencer que par un caractère alphabétique ou un tiret bas, puis uniquement des caractères alphanumériques, tiret, tiret bas, point */
    layer_name: string;
    /** Indique si l'offre est ouverte sans clé d'accès */
    open: boolean;
    /** L'activité de la donnée stockée est-elle publique ? */
    public_activity: boolean;
    status: OfferingStatus;
    type: ConfigurationType;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
    /** @uniqueItems true */
    urls?: EndpointUrl[];
    extra?: Record<string, any>;
}

/** Paramètre pour la création de l'offre */
export interface OfferingCreateDto {
    /**
     * Identifiant du point d'accès de l'offre
     * @format uuid
     */
    endpoint: string;
    /**
     * Indique si l'offre est ouverte sans clé d'accès
     * @default false
     */
    open?: boolean;
    /** Identifiants des permissions associées à l'offre */
    permissions?: string[];
    public_activity?: boolean;
}

/** Informations détaillées sur l'offre */
export interface OfferingExtendedDetailResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Indique si l'offre est disponible
     * @deprecated
     */
    available: boolean;
    /**
     * Identifiant de la communauté rattachée
     * @format uuid
     */
    community: string;
    /** Informations sur la configuration de l'offre */
    configuration: ConfigurationBaseResponseDto;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /**
     * Identifiant du datastore rattaché
     * @format uuid
     */
    datastore: string;
    /** Informations sur le point d'accès */
    endpoint: EndpointListResponseDto;
    /** Nom technique de la ressource. Ce nom doit être unique sur la plateforme pour un type de configuration donné. Ne peut commencer que par un caractère alphabétique ou un tiret bas, puis uniquement des caractères alphanumériques, tiret, tiret bas, point */
    layer_name: string;
    /** Indique si l'offre est ouverte sans clé d'accès */
    open: boolean;
    /**
     * Identifiant de l'organisme rattaché
     * @format uuid
     */
    organization?: string;
    /** L'activité de la donnée stockée est-elle publique ? */
    public_activity: boolean;
    status: OfferingStatus;
    type: ConfigurationType;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
    /** @uniqueItems true */
    urls?: EndpointUrl[];
    extra?: Record<string, any>;
}

/** Informations sur l'offre (les champs endpoint, configuration, urls, extra, creation et update ne sont pas retournés par défaut) */
export interface OfferingExtendedListResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Indique si l'offre est disponible
     * @deprecated
     */
    available: boolean;
    /**
     * Identifiant de la communauté rattachée
     * @format uuid
     */
    community: string;
    /** Informations sur la configuration de l'offre */
    configuration: ConfigurationBaseResponseDto;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /**
     * Identifiant du datastore rattaché
     * @format uuid
     */
    datastore: string;
    /** Informations sur le point d'accès */
    endpoint: EndpointListResponseDto;
    /** Nom technique de la ressource. Ce nom doit être unique sur la plateforme pour un type de configuration donné. Ne peut commencer que par un caractère alphabétique ou un tiret bas, puis uniquement des caractères alphanumériques, tiret, tiret bas, point */
    layer_name: string;
    /** Indique si l'offre est ouverte sans clé d'accès */
    open: boolean;
    /**
     * Identifiant de l'organisme rattaché
     * @format uuid
     */
    organization?: string;
    /** L'activité de la donnée stockée est-elle publique ? */
    public_activity: boolean;
    status: OfferingStatus;
    type: ConfigurationType;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
    /** @uniqueItems true */
    urls?: EndpointUrl[];
    extra?: Record<string, any>;
}

/** Informations détaillées sur l'offre */
export interface OfferingStandardDetailResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Indique si l'offre est disponible
     * @deprecated
     */
    available: boolean;
    /** Informations sur la configuration de l'offre */
    configuration: ConfigurationBaseResponseDto;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /** Informations sur le point d'accès */
    endpoint: EndpointListResponseDto;
    /** Nom technique de la ressource. Ce nom doit être unique sur la plateforme pour un type de configuration donné. Ne peut commencer que par un caractère alphabétique ou un tiret bas, puis uniquement des caractères alphanumériques, tiret, tiret bas, point */
    layer_name: string;
    /** Indique si l'offre est ouverte sans clé d'accès */
    open: boolean;
    /** L'activité de la donnée stockée est-elle publique ? */
    public_activity: boolean;
    status: OfferingStatus;
    type: ConfigurationType;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
    /** @uniqueItems true */
    urls?: EndpointUrl[];
    extra?: Record<string, any>;
}

/** Informations sur l'offre (les champs endpoint, configuration, urls, extra, creation et update ne sont pas retournés par défaut) */
export interface OfferingStandardListResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Indique si l'offre est disponible
     * @deprecated
     */
    available: boolean;
    /** Informations sur la configuration de l'offre */
    configuration: ConfigurationBaseResponseDto;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /** Informations sur le point d'accès */
    endpoint: EndpointListResponseDto;
    /** Nom technique de la ressource. Ce nom doit être unique sur la plateforme pour un type de configuration donné. Ne peut commencer que par un caractère alphabétique ou un tiret bas, puis uniquement des caractères alphanumériques, tiret, tiret bas, point */
    layer_name: string;
    /** Indique si l'offre est ouverte sans clé d'accès */
    open: boolean;
    /** L'activité de la donnée stockée est-elle publique ? */
    public_activity: boolean;
    status: OfferingStatus;
    type: ConfigurationType;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
    /** @uniqueItems true */
    urls?: EndpointUrl[];
    extra?: Record<string, any>;
}

export interface OfferingUpdateDto {
    /**
     * Indique si l'offre est disponible
     * @deprecated
     */
    available?: boolean;
    /** Indique si l'offre est ouverte sans clé d'accès */
    open?: boolean;
    /** L'activité de l'offre est-elle publique ? */
    public_activity?: boolean;
    extra?: Record<string, any>;
}

/** Informations sur l'organisme */
export interface OrganizationCatalogResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /** Nom de l'organisme */
    name: string;
    /** SIREN de l'organisme */
    siren?: string;
    /** SIRET de l'organisme */
    siret?: string;
    /** N° de TVA intracommunautaire de l'organisme */
    tva_intracom?: string;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

/** Paramètres de l'organisme à créer */
export interface OrganizationCreateDto {
    /**
     * Identifiant de la nomenclature du modèle économique de l'organisme
     * @format uuid
     */
    economical_model?: string;
    /**
     * Nom de l'organisme
     * @minLength 0
     * @maxLength 99
     */
    name: string;
    /**
     * SIREN de l'organisme
     * @min 9
     * @max 9
     * @pattern ^[0-9]{9}$
     */
    siren?: string;
    /**
     * SIRET de l'organisme
     * @min 14
     * @max 14
     * @pattern ^[0-9]{14}$
     */
    siret?: string;
    /**
     * N° de TVA intracommunautaire de l'organisme
     * @min 13
     * @max 13
     * @pattern ^[A-Z]{2}[0-9]{11}$
     */
    tva_intracom?: string;
    /**
     * Quota de livraisons pour l'organisme (en octets)
     * @format int64
     * @min 0
     */
    uploads_quota: number;
}

/** Informations détaillées sur l'organisme */
export interface OrganizationDetailResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /** Informations sur la nomenclature */
    economical_model?: NomenclatureSimpleResponseDto;
    /** Nom de l'organisme */
    name: string;
    /** SIREN de l'organisme */
    siren?: string;
    /** SIRET de l'organisme */
    siret?: string;
    /** N° de TVA intracommunautaire de l'organisme */
    tva_intracom?: string;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
    /**
     * Quota de livraisons pour l'organisme (en octets)
     * @format int64
     */
    uploads_quota: number;
    extra?: Record<string, any>;
}

/** Informations sur l'organisme (les champs creation, siren, siret, tva_intracom, economical_model et uploads_quota ne sont pas retournés par défaut) */
export interface OrganizationListResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /** Informations sur la nomenclature */
    economical_model?: NomenclatureSimpleResponseDto;
    /** Nom de l'organisme */
    name: string;
    /** SIREN de l'organisme */
    siren?: string;
    /** SIRET de l'organisme */
    siret?: string;
    /** N° de TVA intracommunautaire de l'organisme */
    tva_intracom?: string;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
    /**
     * Quota de livraisons pour l'organisme (en octets)
     * @format int64
     */
    uploads_quota: number;
}

export interface OrganizationUpdateDto {
    /**
     * Identifiant de la nomenclature du modèle économique de l'organisme
     * @format uuid
     */
    economical_model?: string;
    /**
     * Quota de livraisons pour l'organisme (en octets)
     * @format int64
     * @min 0
     */
    uploads_quota?: number;
    extra?: Record<string, any>;
}

/**
 * Account beneficiary
 * Bénéficiaire de type compte utilisateur
 */
export interface PermissionAccountBeneficiaryResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    first_name: string;
    last_name: string;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

export type PermissionAccountCreateDto = UtilRequiredKeys<PermissionCreateDto, "licence" | "offerings"> & {
    /**
     * Compte utilisateurs auxquels la permission est rattachée
     * @minItems 1
     * @uniqueItems true
     */
    users: string[];
};

/** Information sur le bénéficiaire de la permission de l'entrepôt */
export type PermissionBeneficiaryDto = PermissionAccountBeneficiaryResponseDto | PermissionCommunityBeneficiaryResponseDto;

/**
 * Community beneficiary
 * Bénéficiaire de type communauté
 */
export interface PermissionCommunityBeneficiaryResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    contact?: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /** @minLength 1 */
    name: string;
    public?: boolean;
    /**
     * @minLength 1
     * @pattern ^[A-Za-z0-9_\-.]+$
     */
    technical_name: string;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

export type PermissionCommunityCreateDto = UtilRequiredKeys<PermissionCreateDto, "licence" | "offerings"> & {
    /**
     * Communautés auxquelles la permission est rattachée
     * @minItems 1
     * @uniqueItems true
     */
    communities: string[];
};

export interface PermissionDatastoreAuthorDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    active?: boolean;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    name?: string;
    technical_name?: string;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

/** Informations sur la permission */
export interface PermissionExtendedListResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /** Information sur le bénéficiaire de la permission de l'entrepôt */
    beneficiary?: PermissionBeneficiaryDto;
    /**
     * Identifiant de la communauté rattachée
     * @format uuid
     */
    community: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /**
     * Identifiant du datastore rattaché
     * @format uuid
     */
    datastore: string;
    datastore_author?: PermissionDatastoreAuthorDto;
    /**
     * Date de fin de la permission
     * @format date-time
     */
    end_date: string;
    /** Licence de la permission */
    licence: string;
    /** Nom de la permission */
    name?: string;
    /** @uniqueItems true */
    offerings?: PermissionOfferingResponseDto[];
    only_oauth?: boolean;
    /**
     * Identifiant de l'organisme rattaché
     * @format uuid
     */
    organization?: string;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

/** Information sur l'offre */
export interface PermissionOfferingDetailsResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Indique si l'offre est disponible
     * @deprecated
     */
    available: boolean;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /** Nom technique de la ressource. Ce nom doit être unique sur la plateforme pour un type de configuration donné. Ne peut commencer que par un caractère alphabétique ou un tiret bas, puis uniquement des caractères alphanumériques, tiret, tiret bas, point */
    layer_name: string;
    /** Indique si l'offre est ouverte sans clé d'accès */
    open: boolean;
    status: OfferingStatus;
    type: ConfigurationType;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
    /** @uniqueItems true */
    urls?: EndpointUrl[];
}

/** Information sur l'offre */
export interface PermissionOfferingResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Indique si l'offre est disponible
     * @deprecated
     */
    available: boolean;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /** Nom technique de la ressource. Ce nom doit être unique sur la plateforme pour un type de configuration donné. Ne peut commencer que par un caractère alphabétique ou un tiret bas, puis uniquement des caractères alphanumériques, tiret, tiret bas, point */
    layer_name: string;
    /** Indique si l'offre est ouverte sans clé d'accès */
    open: boolean;
    status: OfferingStatus;
    type: ConfigurationType;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

/** Information sur la permission */
export interface PermissionResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /**
     * Date de fin de la permission
     * @format date-time
     */
    end_date: string;
    /** Licence de la permission */
    licence: string;
    /** Nom de la permission */
    name?: string;
    only_oauth?: boolean;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

/** Informations sur la permission */
export interface PermissionStandardListResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /** Information sur le bénéficiaire de la permission de l'entrepôt */
    beneficiary?: PermissionBeneficiaryDto;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    datastore_author?: PermissionDatastoreAuthorDto;
    /**
     * Date de fin de la permission
     * @format date-time
     */
    end_date: string;
    /** Licence de la permission */
    licence: string;
    /** Nom de la permission */
    name?: string;
    /** @uniqueItems true */
    offerings?: PermissionOfferingResponseDto[];
    only_oauth?: boolean;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

/** Paramètres des permissions à créer */
export interface PermissionUpdateDto {
    /** @format date-time */
    end_date?: string;
    licence?: string;
    name?: string;
    /** @uniqueItems true */
    offerings?: string[];
}

/** Information sur la permission */
export interface PermissionWithOfferingsDetailsResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /**
     * Date de fin de la permission
     * @format date-time
     */
    end_date: string;
    /** Licence de la permission */
    licence: string;
    /** Nom de la permission */
    name?: string;
    /** @uniqueItems true */
    offerings?: PermissionOfferingDetailsResponseDto[];
    only_oauth?: boolean;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

/** Information sur la permission */
export interface PermissionWithOfferingsResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /**
     * Date de fin de la permission
     * @format date-time
     */
    end_date: string;
    /** Licence de la permission */
    licence: string;
    /** Nom de la permission */
    name?: string;
    /** @uniqueItems true */
    offerings?: PermissionOfferingResponseDto[];
    only_oauth?: boolean;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

/** Paramètres du traitement à créer */
export type ProcessingCreateDto = object;

/** Paramètres de l'exécution de traitement à créer */
export interface ProcessingExecutionCreateDto {
    /** Callback à exécuter à la fin de l'exécution */
    callback?: Callback;
    /** Données en entrée du traitement */
    inputs?: ProcessingExecutionCreateInputDto;
    output: ProcessingExecutionCreateOutputStoredDataDto | ProcessingExecutionCreateOutputUploadDto;
    /** Paramètres en entrée du traitement */
    parameters?: Record<string, object>;
    /**
     * Identifiant du traitement
     * @format uuid
     */
    processing: string;
}

/** Données en entrée du traitement */
export interface ProcessingExecutionCreateInputDto {
    /** Données stockées en entrée */
    stored_data?: string[];
    /** Livraisons en entrée */
    upload?: string[];
}

/** Donnée en sortie du traitement */
export type ProcessingExecutionCreateOutputDto = object;

/** stored_data */
export type ProcessingExecutionCreateOutputStoredDataDto = ProcessingExecutionCreateOutputDto & {
    stored_data?: StoredDataOutputDto;
};

/** upload */
export type ProcessingExecutionCreateOutputUploadDto = ProcessingExecutionCreateOutputDto & {
    upload?: UploadOutputDto;
};

/** Informations détaillées sur l'exécution de traitement */
export interface ProcessingExecutionExtendedDetailResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /** Callback à exécuter à la fin de l'exécution */
    callback?: Callback;
    /**
     * Identifiant de la communauté rattachée
     * @format uuid
     */
    community: string;
    /** Informations sur l'initiateur de l'évènement */
    created_by: EventInitiatorDto;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /**
     * Identifiant du datastore rattaché
     * @format uuid
     */
    datastore: string;
    /** @format date-time */
    finish?: string;
    inputs: ProcessingExecutionInputDto;
    /** @format date-time */
    launch?: string;
    /**
     * Identifiant de l'organisme rattaché
     * @format uuid
     */
    organization?: string;
    output: ProcessingExecutionOutputStoredDataDto | ProcessingExecutionOutputUploadDto;
    parameters: Record<string, object>;
    /** Traitement */
    processing: ProcessingExecutionProcessingDto;
    /** @format date-time */
    start?: string;
    status: ProcessingExecutionExtendedDetailResponseDtoStatusEnum;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

/** Informations sur les traitements */
export interface ProcessingExecutionExtendedListResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Identifiant de la communauté rattachée
     * @format uuid
     */
    community: string;
    /** Informations sur l'initiateur de l'évènement */
    created_by: EventInitiatorDto;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /**
     * Identifiant du datastore rattaché
     * @format uuid
     */
    datastore: string;
    /**
     * Date de fin du traitement
     * @format date-time
     */
    finish?: string;
    /**
     * Date de lancement du traitement
     * @format date-time
     */
    launch?: string;
    /**
     * Identifiant de l'organisme rattaché
     * @format uuid
     */
    organization?: string;
    /** Traitement */
    processing: ProcessingExecutionProcessingDto;
    /**
     * Date du démarrage du traitement
     * @format date-time
     */
    start?: string;
    /** Statut des exécutions à récupérer */
    status: ProcessingExecutionExtendedListResponseDtoStatusEnum;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

export interface ProcessingExecutionInputDto {
    stored_data: ProcessingExecutionStoredDataDto[];
    upload: ProcessingExecutionUploadDto[];
}

export type ProcessingExecutionOutputDto = object;

/** stored_data */
export type ProcessingExecutionOutputStoredDataDto = ProcessingExecutionOutputDto & {
    /** Informations simplifiée sur une donnée stockée */
    stored_data: ProcessingExecutionStoredDataDto;
};

/** upload */
export type ProcessingExecutionOutputUploadDto = ProcessingExecutionOutputDto & {
    /** Informations simplifiée sur une livraison */
    upload: ProcessingExecutionUploadDto;
};

/** Traitement */
export interface ProcessingExecutionProcessingDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    name: string;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

/** Informations détaillées sur l'exécution de traitement */
export interface ProcessingExecutionStandardDetailResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /** Callback à exécuter à la fin de l'exécution */
    callback?: Callback;
    /** Informations sur l'initiateur de l'évènement */
    created_by: EventInitiatorDto;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /** @format date-time */
    finish?: string;
    inputs: ProcessingExecutionInputDto;
    /** @format date-time */
    launch?: string;
    output: ProcessingExecutionOutputStoredDataDto | ProcessingExecutionOutputUploadDto;
    parameters: Record<string, object>;
    /** Traitement */
    processing: ProcessingExecutionProcessingDto;
    /** @format date-time */
    start?: string;
    status: ProcessingExecutionStandardDetailResponseDtoStatusEnum;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

/** Informations sur les traitements */
export interface ProcessingExecutionStandardListResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /** Informations sur l'initiateur de l'évènement */
    created_by: EventInitiatorDto;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /**
     * Date de fin du traitement
     * @format date-time
     */
    finish?: string;
    /**
     * Date de lancement du traitement
     * @format date-time
     */
    launch?: string;
    /** Traitement */
    processing: ProcessingExecutionProcessingDto;
    /**
     * Date du démarrage du traitement
     * @format date-time
     */
    start?: string;
    /** Statut des exécutions à récupérer */
    status: ProcessingExecutionStandardListResponseDtoStatusEnum;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

/** Informations simplifiée sur une donnée stockée */
export interface ProcessingExecutionStoredDataDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    name: string;
    srs: string;
    status: ProcessingExecutionStoredDataDtoStatusEnum;
    type: ProcessingExecutionStoredDataDtoTypeEnum;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

/** Informations simplifiée sur une livraison */
export interface ProcessingExecutionUploadDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    name: string;
    srs?: string;
    status: ProcessingExecutionUploadDtoStatusEnum;
    type: ProcessingExecutionUploadDtoTypeEnum;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

/** Informations détaillées sur le traitement */
export type ProcessingExtendedDetailResponseDto = object;

/** Types de données acceptés en entrée du traitement */
export interface ProcessingInputTypesDto {
    /**
     * Types de données stockées en entrée acceptés
     * @uniqueItems true
     */
    stored_data?: ProcessingInputTypesDtoStoredDataEnum[];
    /**
     * Types de livraisons en entrée acceptés
     * @uniqueItems true
     */
    upload?: ProcessingInputTypesDtoUploadEnum[];
}

/** Informations sur le traitement(les champs priority, input_types et output_types ne sont pas retournés par défaut) */
export interface ProcessingListResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /** Description du traitement */
    description?: string;
    /** Types de données acceptés en entrée du traitement */
    input_types?: ProcessingInputTypesDto;
    /** Nom du traitement. ce nom doit être unique pour la plateforme */
    name?: string;
    output_type?: ProcessingOutputTypeStoredDataDto | ProcessingOutputTypeUploadDto;
    /** Priorité de traitement */
    priority?: ProcessingListResponseDtoPriorityEnum;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

/** Types de données acceptés en sortie du traitement */
export type ProcessingOutputTypeDto = object;

/**
 * stored_data
 * Type de donnée stockée en sortie du traitement
 */
export type ProcessingOutputTypeStoredDataDto = ProcessingOutputTypeDto & {
    /**
     * Types de stockage cible du traitement
     * @minItems 1
     * @uniqueItems true
     */
    storage: ProcessingOutputTypeStoredDataDtoStorageEnum[];
    /** Type de donnée stockée */
    stored_data: ProcessingOutputTypeStoredDataDtoStoredDataEnum;
};

/**
 * upload
 * Type de livraison en sortie du traitement
 */
export type ProcessingOutputTypeUploadDto = ProcessingOutputTypeDto & {
    /** Type de livraison */
    upload: ProcessingOutputTypeUploadDtoUploadEnum;
};

/** Informations sur le traitement(les champs priority, input_types et output_types ne sont pas retournés par défaut) */
export interface ProcessingStandardDetailResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /** Description du traitement */
    description: string;
    /** Types de données acceptés en entrée du traitement */
    input_types: ProcessingInputTypesDto;
    /** Nom du traitement. ce nom doit être unique pour la plateforme */
    name: string;
    output_type: ProcessingOutputTypeStoredDataDto | ProcessingOutputTypeUploadDto;
    /** Priorité de traitement */
    priority: ProcessingStandardDetailResponseDtoPriorityEnum;
    /**
     * Vérifications nécessaires au lancement du traitement
     * @uniqueItems true
     */
    required_checks?: CheckingListResponseDto[];
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

/** Paramètres du traitement à modifier */
export interface ProcessingUpdateDto {
    /** Description du traitement */
    description?: string;
    /** Nom du traitement. ce nom doit être unique pour la plateforme */
    name?: string;
    /** Nom technique du traitement tel que connu par l'orchestrateur */
    orchestrator_job_name?: string;
    /** Priorité de traitement */
    priority?: ProcessingUpdateDtoPriorityEnum;
}

/** Partage avec un entrepôt */
export interface SharingOrVisibilityResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /** Nom */
    name: string;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

/** Paramètres du statique à ajouter */
export interface StaticFileCreateDto {
    /** Description du fichier statique */
    description?: string;
    /** @format binary */
    file: File;
    /**
     * Nom du fichier statique
     * @minLength 1
     */
    name: string;
    /** Type du fichier statique */
    type: StaticFileCreateDtoTypeEnum;
}

/**
 * DERIVATION-SQL
 * Informations spécifiques d'un fichier de dérivation SQL
 */
export type StaticFileDerivationSqlDetailsDto = StaticFileDetailsDto & {
    /** @uniqueItems true */
    used_variables?: string[];
};

/** les informations spécifiques liées au type de statique */
export type StaticFileDetailsDto = object;

/** Informations détaillées sur le fichier statique */
export interface StaticFileExtendedDetailResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Identifiant de la communauté rattachée
     * @format uuid
     */
    community: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /**
     * Identifiant du datastore rattaché
     * @format uuid
     */
    datastore: string;
    /** Description du fichier statique */
    description?: string;
    /** Nom du fichier statique */
    name: string;
    /**
     * Identifiant de l'organisme rattaché
     * @format uuid
     */
    organization?: string;
    /** Type du fichier statique */
    type: StaticFileExtendedDetailResponseDtoTypeEnum;
    type_infos: StaticFileDerivationSqlDetailsDto | StaticFileGeoserverFtlDetailsDto | StaticFileGeoserverStyleDetailsDto | StaticFileRok4StyleDetailsDto;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
    extra?: Record<string, any>;
}

/** Informations sur le fichier statique */
export interface StaticFileExtendedListResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Identifiant de la communauté rattachée
     * @format uuid
     */
    community: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /**
     * Identifiant du datastore rattaché
     * @format uuid
     */
    datastore: string;
    /** Description du fichier statique */
    description?: string;
    /** Nom du fichier statique */
    name: string;
    /**
     * Identifiant de l'organisme rattaché
     * @format uuid
     */
    organization?: string;
    /** Type du fichier statique */
    type: StaticFileExtendedListResponseDtoTypeEnum;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

/**
 * GEOSERVER-FTL
 * Informations spécifiques d'un fichier FTL Geoserver
 */
export type StaticFileGeoserverFtlDetailsDto = StaticFileDetailsDto & {
    /** @uniqueItems true */
    used_attributes?: string[];
};

/**
 * GEOSERVER-STYLE
 * Informations spécifiques d'un fichier de style SLD Geoserver
 */
export type StaticFileGeoserverStyleDetailsDto = StaticFileDetailsDto & {
    /**
     * Dénominateur de l'échelle maximale
     * @format double
     */
    max_scale_denominator?: number;
    /**
     * Dénominateur de l'échelle minimale
     * @format double
     */
    min_scale_denominator?: number;
    /** @uniqueItems true */
    used_attributes?: string[];
};

/**
 * ROK4-STYLE
 * Informations spécifiques d'un fichier de style Rok4
 */
export type StaticFileRok4StyleDetailsDto = StaticFileDetailsDto & {
    /** Identificateur du style ROK4 */
    identifier?: string;
    /** Url de la légende du style ROK4 */
    legend_url?: string;
};

/** Informations détaillées sur le fichier statique */
export interface StaticFileStandardDetailResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /** Description du fichier statique */
    description?: string;
    /** Nom du fichier statique */
    name: string;
    /** Type du fichier statique */
    type: StaticFileStandardDetailResponseDtoTypeEnum;
    type_infos: StaticFileDerivationSqlDetailsDto | StaticFileGeoserverFtlDetailsDto | StaticFileGeoserverStyleDetailsDto | StaticFileRok4StyleDetailsDto;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
    extra?: Record<string, any>;
}

/** Informations sur le fichier statique */
export interface StaticFileStandardListResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /** Description du fichier statique */
    description?: string;
    /** Nom du fichier statique */
    name: string;
    /** Type du fichier statique */
    type: StaticFileStandardListResponseDtoTypeEnum;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

/** Paramètres du statique à modifier */
export interface StaticFileUpdateDto {
    /** Description du fichier statique */
    description?: string;
    /** Nom du fichier statique */
    name?: string;
    extra?: Record<string, any>;
}

/** Paramètres du stockage à créer */
export interface StorageCreateDto {
    /** @uniqueItems true */
    labels?: string[];
    /**
     * Le nom du stockage. ce nom doit être unique pour la plateforme
     * @minLength 1
     */
    name: string;
    /** Le type de stockage */
    type: StorageCreateDtoTypeEnum;
    type_infos: StorageFileSystemDetailsDto | StorageOpenSearchDetailsDto | StoragePostgresqlDetailsDto | StorageS3DetailsDto;
}

/** Informations sur le stockage */
export interface StorageDetailResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /** @uniqueItems true */
    labels?: string[];
    /** Le nom du stockage. ce nom est unique pour la plateforme */
    name: string;
    /** Le type de stockage */
    type: StorageType;
    type_infos?: StorageFileSystemDetailsDto | StorageOpenSearchDetailsDto | StoragePostgresqlDetailsDto | StorageS3DetailsDto;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

/** Les informations spécifiques liées au type de stockage */
export type StorageDetailsDto = object;

/**
 * FILESYSTEM
 * Les informations spécifiques liées au stockage FILESYSTEM
 */
export type StorageFileSystemDetailsDto = StorageDetailsDto & {
    /**
     * le point de montage du stockage
     * @minLength 1
     * @pattern \S+
     */
    mount_name: string;
};

/** Informations sur le stockage */
export interface StorageListResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /** @uniqueItems true */
    labels?: string[];
    /** Le nom du stockage. ce nom est unique pour la plateforme */
    name: string;
    /** Le type de stockage */
    type: StorageType;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

/**
 * OPENSEARCH
 * Les informations spécifiques liées au stockage OPENSEARCH
 */
export type StorageOpenSearchDetailsDto = StorageDetailsDto & {
    /**
     * le hosts pour la connexion au stockage OPENSEARCH
     * @minItems 1
     * @uniqueItems true
     */
    hosts: StorageSocket[];
};

/**
 * POSTGRESQL
 * Les informations spécifiques liées au stockage POSTGRESQL
 */
export type StoragePostgresqlDetailsDto = StorageDetailsDto & {
    /**
     * le nom de la base de données sur le serveur Postgresql
     * @minLength 1
     * @pattern \S+
     */
    database_name: string;
    /**
     * le host pour la connexion au stockage Postgresql
     * @minLength 1
     */
    host: string;
    /**
     * le port pour la connexion au stockage Postgresql à destination des traitements, et des services en lecture/écriture
     * @format int32
     * @min 1
     * @max 65535
     */
    port: number;
    /**
     * le port pour la connexion au stockage Postgresql à destination des services en lecture uniquement
     * @format int32
     * @min 1
     * @max 65535
     */
    port_read_only?: number;
    /** indique si le stockage PostgreSQL est accessible en écriture */
    writable?: boolean;
};

/**
 * S3
 * Les informations spécifiques liées au stockage S3
 */
export type StorageS3DetailsDto = StorageDetailsDto & {
    /**
     * le nom du bucket S3
     * @minLength 1
     * @pattern \S+
     * @example "potName"
     */
    pot_name: string;
};

/** le hosts pour la connexion au stockage OPENSEARCH */
export interface StorageSocket {
    /**
     * le host pour la connexion au stockage
     * @minLength 1
     */
    host: string;
    /**
     * le port pour la connexion au stockage
     * @format int32
     * @min 1
     * @max 65535
     */
    port: number;
}

/** Paramètres du stockage  à modifier */
export interface StorageUpdateDto {
    /** @uniqueItems true */
    labels?: string[];
    /** Le nom du stockage. ce nom doit être unique pour la plateforme */
    name?: string;
    /** indique si le stockage PostgreSQL est accessible en écriture (applicable uniquement pour le type POSTGRESQL) */
    writable?: boolean;
}

/**
 * ARCHIVE
 * Informations spécifiques d'une donnée stockée archive
 */
export interface StoredDataArchiveDetailsDto {
    /**
     * Nombre de fichiers contenus dans la donnée stockée
     * @format int32
     */
    files_number: number;
}

/** new_stored_data */
export interface StoredDataCreationDto {
    /** Nom de la donnée stockée */
    name: string;
    storage_tags?: string[];
    /** Type de stockage */
    storage_type?: StoredDataCreationDtoStorageTypeEnum;
}

export interface StoredDataDependenciesResponseDto {
    use: StoredDataDependencyResponseDto[];
    used_by: StoredDataDependencyResponseDto[];
}

export interface StoredDataDependencyResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    name?: string;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

/** Détails sur une donnée stockée */
export type StoredDataDetailsDto =
    | StoredDataRok4PyramidRasterDetailsDto
    | StoredDataRok4PyramidVectorDetailsDto
    | StoredDataVectorDbDetailsDto
    | StoredDataArchiveDetailsDto
    | StoredDataGraphDbDetailsDto
    | StoredDataGraphDetailsDto
    | StoredDataIndexDetailsDto;

export interface StoredDataDetailsFunctionDto {
    language?: string;
    name: string;
    output_type?: string;
    parameters?: string;
}

/** Liste des relations en BDD */
export interface StoredDataDetailsRelationDto {
    attributes: Record<string, string>;
    indexes?: StoredDataDetailsRelationIndexDto[];
    name: string;
    primary_key?: string[];
    triggers?: StoredDataDetailsRelationTriggerDto[];
    type: StoredDataDetailsRelationDtoTypeEnum;
}

export interface StoredDataDetailsRelationIndexDto {
    name: string;
    using?: string;
}

export interface StoredDataDetailsRelationTriggerDto {
    action?: string;
    manipulation?: string;
    name: string;
    orientation?: string;
    timing?: string;
}

export interface StoredDataDetailsSequenceDto {
    name: string;
}

/** Période d'édition de la donnée stockée */
export interface StoredDataEdition {
    /** @format date */
    from?: string;
    /** @format date */
    to?: string;
}

/** Informations sur la donnée stockée(les champs description, edition, contact, status, size, last_event, creation, tags et bbox ne sont pas retournés par défaut) */
export interface StoredDataExtendedListResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /** Bounding box (en degrés) */
    bbox: BoundingBox;
    /**
     * Identifiant de la communauté rattachée
     * @format uuid
     */
    community: string;
    /** Nom du contact de la communauté */
    contact: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /**
     * Identifiant du datastore rattaché
     * @format uuid
     */
    datastore: string;
    /** Description de la donnée stockée */
    description: string;
    /** Période d'édition de la donnée stockée */
    edition: StoredDataEdition;
    /** Événement */
    last_event?: EventDto;
    /** Nom de la donnée stockée */
    name: string;
    /** Donnée stockée ouverte ? (visible par tous les entrepôts et utilisateurs) */
    open: boolean;
    /**
     * Identifiant de l'organisme rattaché
     * @format uuid
     */
    organization?: string;
    /** L'activité de la donnée stockée est-elle publique ? */
    public_activity: boolean;
    /**
     * Taille de la donnée stockée (en octets)
     * @format int64
     */
    size?: number;
    /** Système de coordonnées de référence de la donnée stockée */
    srs?: string;
    /** Statut de la donnée stockée */
    status: StoredDataExtendedListResponseDtoStatusEnum;
    /** Liste des étiquettes de la donnée stockée (format clé/valeur) */
    tags: Record<string, string>;
    /** Type de donnée stockée */
    type: StoredDataExtendedListResponseDtoTypeEnum;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

/**
 * GRAPH-DB
 * Informations spécifiques d'une donnée stockée graphe d'itinéraire DB
 */
export interface StoredDataGraphDbDetailsDto {
    /**
     * Liste des attributs utilisables du graphe
     * @minItems 1
     * @uniqueItems true
     */
    attributes: string[];
    /**
     * Liste des modes utilisables du graphe
     * @minItems 1
     * @uniqueItems true
     */
    modes: StoredDataGraphDetailsOptimizationProfileDto[];
    /**
     * Liste des relations en BDD
     * @minItems 1
     * @uniqueItems true
     */
    relations: StoredDataDetailsRelationDto[];
}

/**
 * GRAPH-OSRM / GRAPH-VALHALLA
 * Informations spécifiques d'une donnée stockée graphe d'itinéraire OSRM ou VALHALLA
 */
export interface StoredDataGraphDetailsDto {
    /**
     * Liste des attributs utilisables du graphe
     * @minItems 1
     * @uniqueItems true
     */
    attributes: string[];
    /**
     * Liste des modes utilisables du graphe
     * @minItems 1
     * @uniqueItems true
     */
    modes: StoredDataGraphDetailsOptimizationProfileDto[];
}

/** Liste des modes utilisables du graphe */
export interface StoredDataGraphDetailsOptimizationProfileDto {
    /** @minLength 1 */
    md5: string;
    /** @minLength 1 */
    optimization: string;
    /** @minLength 1 */
    profile: string;
}

/**
 * INDEX
 * Informations spécifiques d'une donnée stockée index
 */
export interface StoredDataIndexDetailsDto {
    /**
     * Nombre de documents contenus dans l'index
     * @format int32
     */
    count: number;
    /** Champs présents dans les documents et leur type */
    fields: Record<string, string>;
    /** Indique si l'index se comportera comme l'index standard */
    is_search_layer: boolean;
    search_layer?: boolean;
}

export type StoredDataOutputDto = IdFieldDto | StoredDataCreationDto;

/**
 * Private_details
 * Informations détaillées sur la donnée stockée
 */
export interface StoredDataPrivateDetailResponseDto {
    /**
     * Identifiant de la donnée stockée
     * @format uuid
     */
    _id: string;
    /** Nom du contact de la communauté */
    contact: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /** Description de la donnée stockée */
    description?: string;
    /** Période d'édition de la donnée stockée */
    edition?: StoredDataEdition;
    extent?: JsonNode;
    /** Événement */
    last_event?: EventDto;
    /** Nom de la donnée stockée */
    name: string;
    /** Donnée stockée ouverte ? (visible par tous les entrepôts et utilisateurs) */
    open: boolean;
    public_activity?: boolean;
    /**
     * Taille de la donnée stockée (en octets)
     * @format int64
     */
    size?: number;
    /** Système de coordonnées de référence de la donnée stockée */
    srs?: string;
    /** Statut de la donnée stockée */
    status: StoredDataPrivateDetailResponseDtoStatusEnum;
    /** Stockage contenant la donnée stockée */
    storage: StoredDataStorageDto;
    /** Liste des étiquettes de la donnée stockée (format clé/valeur) */
    tags?: Record<string, string>;
    /** Type de donnée stockée */
    type: StoredDataPrivateDetailResponseDtoTypeEnum;
    /** Détails sur une donnée stockée */
    type_infos?: StoredDataDetailsDto;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
    extra?: Record<string, any>;
}

/**
 * ROK4-PYRAMID-RASTER
 * Informations spécifiques d'une donnée stockée pyramide Rok4 Raster
 */
export interface StoredDataRok4PyramidRasterDetailsDto {
    channels_format: StoredDataRok4PyramidRasterDetailsDtoChannelsFormatEnum;
    /**
     * @format int32
     * @min 1
     */
    channels_number: number;
    compression: StoredDataRok4PyramidRasterDetailsDtoCompressionEnum;
    /**
     * @minItems 1
     * @uniqueItems true
     */
    levels: string[];
    nodata_value: string;
    tms: string;
}

/**
 * ROK4-PYRAMID-VECTOR
 * Informations spécifiques d'une donnée stockée pyramide Rok4 Vecteur
 */
export interface StoredDataRok4PyramidVectorDetailsDto {
    /**
     * @minItems 1
     * @uniqueItems true
     */
    levels: string[];
    tms: string;
}

/**
 * Shared_details
 * Informations détaillées sur la donnée stockée partagée
 */
export interface StoredDataSharedDetailResponseDto {
    /**
     * Identifiant de la donnée stockée
     * @format uuid
     */
    _id: string;
    /** Nom du contact de la communauté */
    contact: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /** Description de la donnée stockée */
    description?: string;
    /** Période d'édition de la donnée stockée */
    edition?: StoredDataEdition;
    extent?: JsonNode;
    /** Nom de la donnée stockée */
    name: string;
    /** Donnée stockée ouverte ? (visible par tous les entrepôts et utilisateurs) */
    open: boolean;
    /**
     * Taille de la donnée stockée (en octets)
     * @format int64
     */
    size?: number;
    /** Système de coordonnées de référence de la donnée stockée */
    srs?: string;
    /** Statut de la donnée stockée */
    status: StoredDataSharedDetailResponseDtoStatusEnum;
    /** Type de donnée stockée */
    type: StoredDataSharedDetailResponseDtoTypeEnum;
    /** Détails sur une donnée stockée */
    type_infos?: StoredDataDetailsDto;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
    extra?: Record<string, any>;
}

/** Informations sur la donnée stockée(les champs description, edition, contact, status, size, last_event, creation, tags et bbox ne sont pas retournés par défaut) */
export interface StoredDataStandardListResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /** Bounding box (en degrés) */
    bbox: BoundingBox;
    /** Nom du contact de la communauté */
    contact: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /** Description de la donnée stockée */
    description: string;
    /** Période d'édition de la donnée stockée */
    edition: StoredDataEdition;
    /** Événement */
    last_event?: EventDto;
    /** Nom de la donnée stockée */
    name: string;
    /** Donnée stockée ouverte ? (visible par tous les entrepôts et utilisateurs) */
    open: boolean;
    /** L'activité de la donnée stockée est-elle publique ? */
    public_activity: boolean;
    /**
     * Taille de la donnée stockée (en octets)
     * @format int64
     */
    size?: number;
    /** Système de coordonnées de référence de la donnée stockée */
    srs?: string;
    /** Statut de la donnée stockée */
    status: StoredDataStandardListResponseDtoStatusEnum;
    /** Liste des étiquettes de la donnée stockée (format clé/valeur) */
    tags: Record<string, string>;
    /** Type de donnée stockée */
    type: StoredDataStandardListResponseDtoTypeEnum;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

/** Stockage contenant la donnée stockée */
export interface StoredDataStorageDto {
    /** @uniqueItems true */
    labels?: string[];
    type: StoredDataStorageDtoTypeEnum;
}

export interface StoredDataUpdateDto {
    /** Description de la donnée stockée */
    description?: string;
    /** Période d'édition de la donnée stockée */
    edition?: StoredDataEdition;
    extent?: JsonNode;
    /** Nom de la donnée stockée */
    name?: string;
    /** Donnée stockée ouverte ? (visible par tous les entrepôts et utilisateurs) */
    open?: boolean;
    /** L'activité de la donnée stockée est-elle publique ? */
    public_activity?: boolean;
    extra?: Record<string, any>;
}

/**
 * VECTOR-DB
 * Informations spécifiques d'une donnée stockée base vectorielle
 */
export interface StoredDataVectorDbDetailsDto {
    /** @uniqueItems true */
    functions?: StoredDataDetailsFunctionDto[];
    /**
     * @minItems 1
     * @uniqueItems true
     */
    relations: StoredDataDetailsRelationDto[];
    /** @uniqueItems true */
    sequences?: StoredDataDetailsSequenceDto[];
}

/** Informations détaillés sur le TMS */
export interface TileMatrixSetDetailResponseDto {
    _id: string;
    /** @uniqueItems true */
    levels: TileMatrixSetLevelDto[];
    srs: string;
}

export interface TileMatrixSetLevelDto {
    id: string;
    /** @format double */
    resolution: number;
}

/** Informations sur le TMS */
export interface TileMatrixSetListDto {
    _id: string;
    srs: string;
}

/** Informations à fournir pour la déclaration d'une nouvelle livraison, la livraison est privée par défaut */
export interface UploadCreateDto {
    /**
     * Description de la livraison
     * @minLength 1
     */
    description: string;
    /**
     * Nom de la livraison
     * @minLength 1
     */
    name: string;
    /**
     * Système de coordonnées de référence de la livraison
     * @minLength 1
     */
    srs: string;
    /** Type de livraison */
    type: UploadCreateDtoTypeEnum;
    /** Informations spécifiques au type de livraison */
    type_infos?: UploadDetailsDto;
}

/** Informations spécifiques au type de livraison */
export type UploadDetailsDto = UploadRok4PyramidDetailsDto | UploadIndexDetailsDto | UploadHistoricImageryDetailsDto | UploadPyramid3DDetailsDto;

/** Informations sur la livraison (les champs contact, size, last_event, tags, creation et bbox ne sont pas retournés par défaut) */
export interface UploadExtendedListResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /** Bounding box (en degrés) */
    bbox: BoundingBox;
    /**
     * Identifiant de la communauté rattachée
     * @format uuid
     */
    community: string;
    /** Nom du contact de la communauté */
    contact: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /**
     * Identifiant du datastore rattaché
     * @format uuid
     */
    datastore: string;
    /** Description de la livraison */
    description: string;
    /** Événement */
    last_event?: EventDto;
    /** Nom de la livraison */
    name: string;
    /** Livraison ouverte ? (visible par tous les entrepôts et utilisateurs) */
    open: boolean;
    /**
     * Identifiant de l'organisme rattaché
     * @format uuid
     */
    organization?: string;
    /**
     * Taille de la livraison (en octets)
     * @format int64
     */
    size?: number;
    /** Système de coordonnées de référence de la livraison */
    srs: string;
    /** Statut de la livraison */
    status: UploadExtendedListResponseDtoStatusEnum;
    /** Liste des étiquettes de la livraison (format clé/valeur) */
    tags: Record<string, string>;
    /** Type de livraison */
    type: UploadExtendedListResponseDtoTypeEnum;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

/**
 * HISTORIC-IMAGERY
 * Informations spécifiques d'une livraison d'images historiques
 */
export interface UploadHistoricImageryDetailsDto {
    /**
     * Identifiant de jeu de données
     * @minLength 1
     */
    dataset_identifier: string;
}

/**
 * INDEX
 * Informations spécifiques d'une livraison de type Index
 */
export interface UploadIndexDetailsDto {
    /**
     * Indique si l'index se comportera comme l'index standard
     * @default false
     */
    is_search_layer?: boolean;
    search_layer?: boolean;
}

export type UploadOutputDto = NamedFieldDto | IdFieldDto;

/**
 * Private_details
 * Informations détaillées sur la livraison
 */
export interface UploadPrivateDetailResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /** Nom du contact de la communauté */
    contact: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /** Description de la livraison */
    description: string;
    extent?: JsonNode;
    /** Événement */
    last_event?: EventDto;
    /** Nom de la livraison */
    name: string;
    /** Livraison ouverte ? (visible par tous les entrepôts et utilisateurs) */
    open: boolean;
    /**
     * Taille de la livraison (en octets)
     * @format int64
     */
    size?: number;
    /** Système de coordonnées de référence de la livraison */
    srs: string;
    /** Statut de la livraison */
    status: UploadPrivateDetailResponseDtoStatusEnum;
    /** Liste des étiquettes de la livraison (format clé/valeur) */
    tags: Record<string, string>;
    /** Type de livraison */
    type: UploadPrivateDetailResponseDtoTypeEnum;
    /** Informations spécifiques au type de livraison */
    type_infos?: UploadDetailsDto;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
    extra?: Record<string, any>;
}

/**
 * PYRAMID-3D
 * Informations spécifiques d'une livraison de pyramide 3D
 */
export interface UploadPyramid3DDetailsDto {
    /** Type de données (pour le type EPT) */
    data_type?: UploadPyramid3DDetailsDtoDataTypeEnum;
    /** Coordonnées d'origine du dallage (pour le type COPC) */
    origin?: Coordinate;
    /** Type de pyramide 3D */
    pyramid_type: UploadPyramid3DDetailsDtoPyramidTypeEnum;
    /**
     * Span (pour le type EPT)
     * @format int32
     * @min 1
     */
    span?: number;
    /** Template de nommage des dalles (pour le type COPC) */
    template?: string;
    /**
     * Largeur des dalles (pour le type COPC)
     * @format double
     * @min 0
     */
    tile_size?: number;
}

/**
 * ROK4-PYRAMID
 * Informations spécifiques d'une livraison de pyramide Rok4
 */
export interface UploadRok4PyramidDetailsDto {
    /**
     * Nombre de canaux des images, uniquement pour une pyramide raster
     * @format int32
     * @min 1
     */
    channels_number?: number;
    /** Format des données */
    format: string;
    /** TileMatrixSet de la pyramide */
    tms: string;
}

/** Informations sur la livraison (les champs contact, size, last_event, tags, creation et bbox ne sont pas retournés par défaut) */
export interface UploadStandardListResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /** Bounding box (en degrés) */
    bbox: BoundingBox;
    /** Nom du contact de la communauté */
    contact: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /** Description de la livraison */
    description: string;
    /** Événement */
    last_event?: EventDto;
    /** Nom de la livraison */
    name: string;
    /** Livraison ouverte ? (visible par tous les entrepôts et utilisateurs) */
    open: boolean;
    /**
     * Taille de la livraison (en octets)
     * @format int64
     */
    size?: number;
    /** Système de coordonnées de référence de la livraison */
    srs: string;
    /** Statut de la livraison */
    status: UploadStandardListResponseDtoStatusEnum;
    /** Liste des étiquettes de la livraison (format clé/valeur) */
    tags: Record<string, string>;
    /** Type de livraison */
    type: UploadStandardListResponseDtoTypeEnum;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

/** Arborescence des fichiers liés à la livraison */
export interface UploadTreeElementResponseDto {
    children?: UploadTreeElementResponseDto[];
    name?: string;
    /** @format int64 */
    size?: number;
    type?: string;
}

export interface UploadUpdateDto {
    /** Description de la livraison */
    description?: string;
    extent?: JsonNode;
    /** Nom de la livraison */
    name?: string;
    /** Livraison ouverte ? (visible par tous les entrepôts et utilisateurs) */
    open?: boolean;
    /** Système de coordonnées de référence de la livraison */
    srs?: string;
    extra?: Record<string, any>;
}

export type UserBasicKeyCreateDto = UtilRequiredKeys<UserKeyCreateDtoUserKeyInfoDto, "name" | "type_infos"> & {
    type_infos: BasicInfoDto;
};

export interface UserDetailsResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    administrator?: boolean;
    communities_member?: CommunityMemberDto[];
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /**
     * Taille maximum (en octet) disponible pour les documents de l'utilisateur
     * @format int64
     */
    documents_quota?: number;
    /**
     * Espace déjà utilisé (en octet) par les documents
     * @format int64
     */
    documents_use?: number;
    email: string;
    first_name: string;
    /**
     * Nombre maximum de clé que l'utilisateur peut posséder
     * @format int64
     */
    keys_quota?: number;
    /**
     * Nombre de clé que l'utilisateur possède
     * @format int64
     */
    keys_use?: number;
    /** @format date-time */
    last_login?: string;
    last_name: string;
    technical?: boolean;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

export interface UserDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    email: string;
    first_name: string;
    last_name: string;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

export type UserHashKeyCreateDto = UtilRequiredKeys<UserKeyCreateDtoUserKeyInfoDto, "name" | "type_infos"> & {
    type_infos: HashInfoDto;
};

export interface UserKeyDetailsResponseDtoUserKeyInfoDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    blacklist?: string[];
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /** @minLength 1 */
    name: string;
    referer?: string;
    type?: UserKeyDetailsResponseDtoUserKeyInfoDtoTypeEnum;
    type_infos: UserKeyInfoDto;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
    user_agent?: string;
    whitelist?: string[];
}

export type UserKeyInfoDto = object;

export interface UserKeyResponseDto {
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Date de création
     * @format date-time
     */
    creation: string;
    /** @minLength 1 */
    name: string;
    type?: UserKeyResponseDtoTypeEnum;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
}

export interface UserKeyUpdateDto {
    blacklist?: string[];
    name?: string;
    referer?: string;
    user_agent?: string;
    whitelist?: string[];
}

export type UserOauth2KeyCreateDto = UtilRequiredKeys<UserKeyCreateDtoUserKeyInfoDto, "name" | "type_infos"> & {
    type_infos: OAuth2InfoDto;
};

/** Quota de l'utilisateur à modifier */
export interface UserUpdateDto {
    /**
     * Taille maximum (en octet) disponible pour les documents de l'utilisateur
     * @format int64
     * @min 0
     */
    documents_quota?: number;
    /**
     * Nombre maximum de clé que l'utilisateur peut posséder
     * @format int64
     * @min 0
     */
    keys_quota?: number;
}

export enum UserKeyCreateDtoUserKeyInfoDtoTypeEnum {
    HASH = "HASH",
    BASIC = "BASIC",
    OAUTH2 = "OAUTH2",
}

export enum PermissionCreateDtoTypeEnum {
    ACCOUNT = "ACCOUNT",
    COMMUNITY = "COMMUNITY",
}

/** Type de callback */
export enum CallbackTypeEnum {
    Email = "email",
}

/** Types de livraisons ayant cette vérification par défaut */
export enum CheckingCreateDtoDefaultUploadsCheckEnum {
    VECTOR = "VECTOR",
    RASTER = "RASTER",
    ARCHIVE = "ARCHIVE",
    ROK4PYRAMID = "ROK4-PYRAMID",
    INDEX = "INDEX",
    HISTORICIMAGERY = "HISTORIC-IMAGERY",
    POINTCLOUD = "POINT-CLOUD",
    PYRAMID3D = "PYRAMID-3D",
}

/**
 * Priorité de la vérification
 * @default "STANDARD"
 */
export enum CheckingCreateDtoPriorityEnum {
    STANDARD = "STANDARD",
    PREMIUM = "PREMIUM",
    SANDBOX = "SANDBOX",
    STRONG = "STRONG",
    EXTRACTION = "EXTRACTION",
    LIDAR = "LIDAR",
}

export enum CheckingExecutionExtendedDetailResponseDtoStatusEnum {
    WAITING = "WAITING",
    PROGRESS = "PROGRESS",
    SUCCESS = "SUCCESS",
    FAILURE = "FAILURE",
}

export enum CheckingExecutionListResponseDtoStatusEnum {
    WAITING = "WAITING",
    PROGRESS = "PROGRESS",
    SUCCESS = "SUCCESS",
    FAILURE = "FAILURE",
}

export enum CheckingExecutionStandardDetailResponseDtoStatusEnum {
    WAITING = "WAITING",
    PROGRESS = "PROGRESS",
    SUCCESS = "SUCCESS",
    FAILURE = "FAILURE",
}

export enum CheckingExecutionUploadResponseDtoTypeEnum {
    VECTOR = "VECTOR",
    RASTER = "RASTER",
    ARCHIVE = "ARCHIVE",
    ROK4PYRAMID = "ROK4-PYRAMID",
    INDEX = "INDEX",
    HISTORICIMAGERY = "HISTORIC-IMAGERY",
    POINTCLOUD = "POINT-CLOUD",
    PYRAMID3D = "PYRAMID-3D",
}

/** Types de livraisons ayant cette vérification par défaut */
export enum CheckingExtendedDetailResponseDtoDefaultUploadsCheckEnum {
    VECTOR = "VECTOR",
    RASTER = "RASTER",
    ARCHIVE = "ARCHIVE",
    ROK4PYRAMID = "ROK4-PYRAMID",
    INDEX = "INDEX",
    HISTORICIMAGERY = "HISTORIC-IMAGERY",
    POINTCLOUD = "POINT-CLOUD",
    PYRAMID3D = "PYRAMID-3D",
}

/** Priorité de la vérification */
export enum CheckingExtendedDetailResponseDtoPriorityEnum {
    STANDARD = "STANDARD",
    PREMIUM = "PREMIUM",
    SANDBOX = "SANDBOX",
    STRONG = "STRONG",
    EXTRACTION = "EXTRACTION",
    LIDAR = "LIDAR",
}

/** Types de livraisons ayant cette vérification par défaut */
export enum CheckingStandardDetailResponseDtoDefaultUploadsCheckEnum {
    VECTOR = "VECTOR",
    RASTER = "RASTER",
    ARCHIVE = "ARCHIVE",
    ROK4PYRAMID = "ROK4-PYRAMID",
    INDEX = "INDEX",
    HISTORICIMAGERY = "HISTORIC-IMAGERY",
    POINTCLOUD = "POINT-CLOUD",
    PYRAMID3D = "PYRAMID-3D",
}

/** Priorité de la vérification */
export enum CheckingStandardDetailResponseDtoPriorityEnum {
    STANDARD = "STANDARD",
    PREMIUM = "PREMIUM",
    SANDBOX = "SANDBOX",
    STRONG = "STRONG",
    EXTRACTION = "EXTRACTION",
    LIDAR = "LIDAR",
}

/** Types de livraisons ayant cette vérification par défaut */
export enum CheckingUpdateDtoDefaultUploadsCheckEnum {
    VECTOR = "VECTOR",
    RASTER = "RASTER",
    ARCHIVE = "ARCHIVE",
    ROK4PYRAMID = "ROK4-PYRAMID",
    INDEX = "INDEX",
    HISTORICIMAGERY = "HISTORIC-IMAGERY",
    POINTCLOUD = "POINT-CLOUD",
    PYRAMID3D = "PYRAMID-3D",
}

/** Priorité de la vérification */
export enum CheckingUpdateDtoPriorityEnum {
    STANDARD = "STANDARD",
    PREMIUM = "PREMIUM",
    SANDBOX = "SANDBOX",
    STRONG = "STRONG",
    EXTRACTION = "EXTRACTION",
    LIDAR = "LIDAR",
}

export enum CommunityAddUserDtoRightsEnum {
    COMMUNITY = "COMMUNITY",
    PROCESSING = "PROCESSING",
    ANNEX = "ANNEX",
    BROADCAST = "BROADCAST",
    UPLOAD = "UPLOAD",
}

export enum CommunityMemberDtoRightsEnum {
    COMMUNITY = "COMMUNITY",
    PROCESSING = "PROCESSING",
    ANNEX = "ANNEX",
    BROADCAST = "BROADCAST",
    UPLOAD = "UPLOAD",
}

export enum CommunityUserResponseDtoRightsEnum {
    COMMUNITY = "COMMUNITY",
    PROCESSING = "PROCESSING",
    ANNEX = "ANNEX",
    BROADCAST = "BROADCAST",
    UPLOAD = "UPLOAD",
}

/** Le type de métadonnées */
export enum ConfigurationMetadataTypeEnum {
    ISO191152003 = "ISO19115:2003",
    FGDC = "FGDC",
    TC211 = "TC211",
    Value19139 = "19139",
    StyleSheet = "StyleSheet",
    Other = "Other",
}

/** Type de coût */
export enum ConfigurationUsedDataItineraryIsocurveDetailsContentCostTypeEnum {
    Time = "time",
    Distance = "distance",
}

/** Méthode de calcul de coût (pour stored data de type GRAPHE-VALHALLA) */
export enum ConfigurationUsedDataItineraryIsocurveDetailsContentCostingEnum {
    Auto = "auto",
    AutoShorter = "auto_shorter",
    Pedestrian = "pedestrian",
}

/**
 * Interpolation utilisée pour les conversions de résolution
 * @default "BICUBIC"
 */
export enum ConfigurationWmsRasterDetailsContentInterpolationEnum {
    NEARESTNEIGHBOUR = "NEAREST-NEIGHBOUR",
    LINEAR = "LINEAR",
    BICUBIC = "BICUBIC",
    LANCZOS2 = "LANCZOS2",
    LANCZOS3 = "LANCZOS3",
    LANCZOS4 = "LANCZOS4",
}

/** Type du point d'accès */
export enum EndpointCreateDtoTypeEnum {
    WMSVECTOR = "WMS-VECTOR",
    WFS = "WFS",
    WMTSTMS = "WMTS-TMS",
    WMSRASTER = "WMS-RASTER",
    DOWNLOAD = "DOWNLOAD",
    METADATA = "METADATA",
    ITINERARYISOCURVE = "ITINERARY-ISOCURVE",
    ALTIMETRY = "ALTIMETRY",
    SEARCH = "SEARCH",
    VECTORTMS = "VECTOR-TMS",
    APIFEATURES = "API-FEATURES",
}

/** Type du point d'accès */
export enum EndpointDetailResponseDtoTypeEnum {
    WMSVECTOR = "WMS-VECTOR",
    WFS = "WFS",
    WMTSTMS = "WMTS-TMS",
    WMSRASTER = "WMS-RASTER",
    DOWNLOAD = "DOWNLOAD",
    METADATA = "METADATA",
    ITINERARYISOCURVE = "ITINERARY-ISOCURVE",
    ALTIMETRY = "ALTIMETRY",
    SEARCH = "SEARCH",
    VECTORTMS = "VECTOR-TMS",
    APIFEATURES = "API-FEATURES",
}

/** Type de l'URL du point d'accès */
export enum EndpointUrlTypeEnum {
    WMTS = "WMTS",
    TMS = "TMS",
    WMS = "WMS",
    WFS = "WFS",
    DOWNLOAD = "DOWNLOAD",
    ITINERARY = "ITINERARY",
    ISOCURVE = "ISOCURVE",
    ALTIMETRY = "ALTIMETRY",
    METADATA = "METADATA",
    SEARCH = "SEARCH",
    OAPIF = "OAPIF",
}

export enum MetadataExtendedResponseDtoLevelEnum {
    DATASET = "DATASET",
    SERIES = "SERIES",
}

export enum MetadataExtendedResponseDtoTypeEnum {
    INSPIRE = "INSPIRE",
    ISOAP = "ISOAP",
}

export enum MetadataStandardResponseDtoLevelEnum {
    DATASET = "DATASET",
    SERIES = "SERIES",
}

export enum MetadataStandardResponseDtoTypeEnum {
    INSPIRE = "INSPIRE",
    ISOAP = "ISOAP",
}

export enum MetadataUpdateDtoTypeEnum {
    INSPIRE = "INSPIRE",
    ISOAP = "ISOAP",
}

/** Type de famille à laquelle appartient la nomenclature */
export enum NomenclatureAdminResponseDtoTypeEnum {
    CRS = "CRS",
    ZONE = "ZONE",
    FORMAT = "FORMAT",
    RESOLUTION = "RESOLUTION",
    ECONOMICAL_MODEL = "ECONOMICAL_MODEL",
}

/** Type de famille à laquelle appartient la nomenclature */
export enum NomenclatureCreateDtoTypeEnum {
    CRS = "CRS",
    ZONE = "ZONE",
    FORMAT = "FORMAT",
    RESOLUTION = "RESOLUTION",
    ECONOMICAL_MODEL = "ECONOMICAL_MODEL",
}

/** Type de famille à laquelle appartient la nomenclature */
export enum NomenclatureResponseDtoTypeEnum {
    CRS = "CRS",
    ZONE = "ZONE",
    FORMAT = "FORMAT",
    RESOLUTION = "RESOLUTION",
    ECONOMICAL_MODEL = "ECONOMICAL_MODEL",
}

export enum ProcessingExecutionExtendedDetailResponseDtoStatusEnum {
    CREATED = "CREATED",
    WAITING = "WAITING",
    PROGRESS = "PROGRESS",
    SUCCESS = "SUCCESS",
    FAILURE = "FAILURE",
    ABORTED = "ABORTED",
}

/** Statut des exécutions à récupérer */
export enum ProcessingExecutionExtendedListResponseDtoStatusEnum {
    CREATED = "CREATED",
    WAITING = "WAITING",
    PROGRESS = "PROGRESS",
    SUCCESS = "SUCCESS",
    FAILURE = "FAILURE",
    ABORTED = "ABORTED",
}

export enum ProcessingExecutionStandardDetailResponseDtoStatusEnum {
    CREATED = "CREATED",
    WAITING = "WAITING",
    PROGRESS = "PROGRESS",
    SUCCESS = "SUCCESS",
    FAILURE = "FAILURE",
    ABORTED = "ABORTED",
}

/** Statut des exécutions à récupérer */
export enum ProcessingExecutionStandardListResponseDtoStatusEnum {
    CREATED = "CREATED",
    WAITING = "WAITING",
    PROGRESS = "PROGRESS",
    SUCCESS = "SUCCESS",
    FAILURE = "FAILURE",
    ABORTED = "ABORTED",
}

export enum ProcessingExecutionStoredDataDtoStatusEnum {
    CREATED = "CREATED",
    GENERATING = "GENERATING",
    MODIFYING = "MODIFYING",
    GENERATED = "GENERATED",
    DELETED = "DELETED",
    UNSTABLE = "UNSTABLE",
}

export enum ProcessingExecutionStoredDataDtoTypeEnum {
    ROK4PYRAMIDRASTER = "ROK4-PYRAMID-RASTER",
    ROK4PYRAMIDVECTOR = "ROK4-PYRAMID-VECTOR",
    VECTORDB = "VECTOR-DB",
    ARCHIVE = "ARCHIVE",
    GRAPHDB = "GRAPH-DB",
    GRAPHOSRM = "GRAPH-OSRM",
    GRAPHVALHALLA = "GRAPH-VALHALLA",
    INDEX = "INDEX",
    PYRAMID3DCOPC = "PYRAMID-3D-COPC",
    PYRAMID3DEPT = "PYRAMID-3D-EPT",
}

export enum ProcessingExecutionUploadDtoStatusEnum {
    CREATED = "CREATED",
    OPEN = "OPEN",
    CLOSED = "CLOSED",
    CHECKING = "CHECKING",
    GENERATING = "GENERATING",
    MODIFYING = "MODIFYING",
    UNSTABLE = "UNSTABLE",
    DELETED = "DELETED",
}

export enum ProcessingExecutionUploadDtoTypeEnum {
    VECTOR = "VECTOR",
    RASTER = "RASTER",
    ARCHIVE = "ARCHIVE",
    ROK4PYRAMID = "ROK4-PYRAMID",
    INDEX = "INDEX",
    HISTORICIMAGERY = "HISTORIC-IMAGERY",
    POINTCLOUD = "POINT-CLOUD",
    PYRAMID3D = "PYRAMID-3D",
}

export enum ProcessingInputTypesDtoStoredDataEnum {
    ROK4PYRAMIDRASTER = "ROK4-PYRAMID-RASTER",
    ROK4PYRAMIDVECTOR = "ROK4-PYRAMID-VECTOR",
    VECTORDB = "VECTOR-DB",
    ARCHIVE = "ARCHIVE",
    GRAPHDB = "GRAPH-DB",
    GRAPHOSRM = "GRAPH-OSRM",
    GRAPHVALHALLA = "GRAPH-VALHALLA",
    INDEX = "INDEX",
    PYRAMID3DCOPC = "PYRAMID-3D-COPC",
    PYRAMID3DEPT = "PYRAMID-3D-EPT",
}

export enum ProcessingInputTypesDtoUploadEnum {
    VECTOR = "VECTOR",
    RASTER = "RASTER",
    ARCHIVE = "ARCHIVE",
    ROK4PYRAMID = "ROK4-PYRAMID",
    INDEX = "INDEX",
    HISTORICIMAGERY = "HISTORIC-IMAGERY",
    POINTCLOUD = "POINT-CLOUD",
    PYRAMID3D = "PYRAMID-3D",
}

/** Priorité de traitement */
export enum ProcessingListResponseDtoPriorityEnum {
    STANDARD = "STANDARD",
    PREMIUM = "PREMIUM",
    SANDBOX = "SANDBOX",
    STRONG = "STRONG",
    EXTRACTION = "EXTRACTION",
    LIDAR = "LIDAR",
}

export enum ProcessingOutputTypeStoredDataDtoStorageEnum {
    POSTGRESQL = "POSTGRESQL",
    S3 = "S3",
    FILESYSTEM = "FILESYSTEM",
    OPENSEARCH = "OPENSEARCH",
    POSTGRESQLROUTING = "POSTGRESQL-ROUTING",
}

/** Type de donnée stockée */
export enum ProcessingOutputTypeStoredDataDtoStoredDataEnum {
    ROK4PYRAMIDRASTER = "ROK4-PYRAMID-RASTER",
    ROK4PYRAMIDVECTOR = "ROK4-PYRAMID-VECTOR",
    VECTORDB = "VECTOR-DB",
    ARCHIVE = "ARCHIVE",
    GRAPHDB = "GRAPH-DB",
    GRAPHOSRM = "GRAPH-OSRM",
    GRAPHVALHALLA = "GRAPH-VALHALLA",
    INDEX = "INDEX",
    PYRAMID3DCOPC = "PYRAMID-3D-COPC",
    PYRAMID3DEPT = "PYRAMID-3D-EPT",
}

/** Type de livraison */
export enum ProcessingOutputTypeUploadDtoUploadEnum {
    VECTOR = "VECTOR",
    RASTER = "RASTER",
    ARCHIVE = "ARCHIVE",
    ROK4PYRAMID = "ROK4-PYRAMID",
    INDEX = "INDEX",
    HISTORICIMAGERY = "HISTORIC-IMAGERY",
    POINTCLOUD = "POINT-CLOUD",
    PYRAMID3D = "PYRAMID-3D",
}

/** Priorité de traitement */
export enum ProcessingStandardDetailResponseDtoPriorityEnum {
    STANDARD = "STANDARD",
    PREMIUM = "PREMIUM",
    SANDBOX = "SANDBOX",
    STRONG = "STRONG",
    EXTRACTION = "EXTRACTION",
    LIDAR = "LIDAR",
}

/** Priorité de traitement */
export enum ProcessingUpdateDtoPriorityEnum {
    STANDARD = "STANDARD",
    PREMIUM = "PREMIUM",
    SANDBOX = "SANDBOX",
    STRONG = "STRONG",
    EXTRACTION = "EXTRACTION",
    LIDAR = "LIDAR",
}

/** Type du fichier statique */
export enum StaticFileCreateDtoTypeEnum {
    GEOSERVERFTL = "GEOSERVER-FTL",
    GEOSERVERSTYLE = "GEOSERVER-STYLE",
    ROK4STYLE = "ROK4-STYLE",
    DERIVATIONSQL = "DERIVATION-SQL",
}

/** Type du fichier statique */
export enum StaticFileExtendedDetailResponseDtoTypeEnum {
    GEOSERVERFTL = "GEOSERVER-FTL",
    GEOSERVERSTYLE = "GEOSERVER-STYLE",
    ROK4STYLE = "ROK4-STYLE",
    DERIVATIONSQL = "DERIVATION-SQL",
}

/** Type du fichier statique */
export enum StaticFileExtendedListResponseDtoTypeEnum {
    GEOSERVERFTL = "GEOSERVER-FTL",
    GEOSERVERSTYLE = "GEOSERVER-STYLE",
    ROK4STYLE = "ROK4-STYLE",
    DERIVATIONSQL = "DERIVATION-SQL",
}

/** Type du fichier statique */
export enum StaticFileStandardDetailResponseDtoTypeEnum {
    GEOSERVERFTL = "GEOSERVER-FTL",
    GEOSERVERSTYLE = "GEOSERVER-STYLE",
    ROK4STYLE = "ROK4-STYLE",
    DERIVATIONSQL = "DERIVATION-SQL",
}

/** Type du fichier statique */
export enum StaticFileStandardListResponseDtoTypeEnum {
    GEOSERVERFTL = "GEOSERVER-FTL",
    GEOSERVERSTYLE = "GEOSERVER-STYLE",
    ROK4STYLE = "ROK4-STYLE",
    DERIVATIONSQL = "DERIVATION-SQL",
}

/** Le type de stockage */
export enum StorageCreateDtoTypeEnum {
    POSTGRESQL = "POSTGRESQL",
    S3 = "S3",
    FILESYSTEM = "FILESYSTEM",
    OPENSEARCH = "OPENSEARCH",
    POSTGRESQLROUTING = "POSTGRESQL-ROUTING",
}

/** Type de stockage */
export enum StoredDataCreationDtoStorageTypeEnum {
    POSTGRESQL = "POSTGRESQL",
    S3 = "S3",
    FILESYSTEM = "FILESYSTEM",
    OPENSEARCH = "OPENSEARCH",
    POSTGRESQLROUTING = "POSTGRESQL-ROUTING",
}

export enum StoredDataDetailsRelationDtoTypeEnum {
    TABLE = "TABLE",
    VIEW = "VIEW",
}

/** Statut de la donnée stockée */
export enum StoredDataExtendedListResponseDtoStatusEnum {
    CREATED = "CREATED",
    GENERATING = "GENERATING",
    MODIFYING = "MODIFYING",
    GENERATED = "GENERATED",
    DELETED = "DELETED",
    UNSTABLE = "UNSTABLE",
}

/** Type de donnée stockée */
export enum StoredDataExtendedListResponseDtoTypeEnum {
    ROK4PYRAMIDRASTER = "ROK4-PYRAMID-RASTER",
    ROK4PYRAMIDVECTOR = "ROK4-PYRAMID-VECTOR",
    VECTORDB = "VECTOR-DB",
    ARCHIVE = "ARCHIVE",
    GRAPHDB = "GRAPH-DB",
    GRAPHOSRM = "GRAPH-OSRM",
    GRAPHVALHALLA = "GRAPH-VALHALLA",
    INDEX = "INDEX",
    PYRAMID3DCOPC = "PYRAMID-3D-COPC",
    PYRAMID3DEPT = "PYRAMID-3D-EPT",
}

/** Statut de la donnée stockée */
export enum StoredDataPrivateDetailResponseDtoStatusEnum {
    CREATED = "CREATED",
    GENERATING = "GENERATING",
    MODIFYING = "MODIFYING",
    GENERATED = "GENERATED",
    DELETED = "DELETED",
    UNSTABLE = "UNSTABLE",
}

/** Type de donnée stockée */
export enum StoredDataPrivateDetailResponseDtoTypeEnum {
    ROK4PYRAMIDRASTER = "ROK4-PYRAMID-RASTER",
    ROK4PYRAMIDVECTOR = "ROK4-PYRAMID-VECTOR",
    VECTORDB = "VECTOR-DB",
    ARCHIVE = "ARCHIVE",
    GRAPHDB = "GRAPH-DB",
    GRAPHOSRM = "GRAPH-OSRM",
    GRAPHVALHALLA = "GRAPH-VALHALLA",
    INDEX = "INDEX",
    PYRAMID3DCOPC = "PYRAMID-3D-COPC",
    PYRAMID3DEPT = "PYRAMID-3D-EPT",
}

export enum StoredDataRok4PyramidRasterDetailsDtoChannelsFormatEnum {
    UINT8 = "UINT8",
    UINT16 = "UINT16",
    FLOAT32 = "FLOAT32",
}

export enum StoredDataRok4PyramidRasterDetailsDtoCompressionEnum {
    RAW = "RAW",
    JPG = "JPG",
    PNG = "PNG",
    LZW = "LZW",
    ZIP = "ZIP",
    PKB = "PKB",
    JPG90 = "JPG90",
}

/** Statut de la donnée stockée */
export enum StoredDataSharedDetailResponseDtoStatusEnum {
    CREATED = "CREATED",
    GENERATING = "GENERATING",
    MODIFYING = "MODIFYING",
    GENERATED = "GENERATED",
    DELETED = "DELETED",
    UNSTABLE = "UNSTABLE",
}

/** Type de donnée stockée */
export enum StoredDataSharedDetailResponseDtoTypeEnum {
    ROK4PYRAMIDRASTER = "ROK4-PYRAMID-RASTER",
    ROK4PYRAMIDVECTOR = "ROK4-PYRAMID-VECTOR",
    VECTORDB = "VECTOR-DB",
    ARCHIVE = "ARCHIVE",
    GRAPHDB = "GRAPH-DB",
    GRAPHOSRM = "GRAPH-OSRM",
    GRAPHVALHALLA = "GRAPH-VALHALLA",
    INDEX = "INDEX",
    PYRAMID3DCOPC = "PYRAMID-3D-COPC",
    PYRAMID3DEPT = "PYRAMID-3D-EPT",
}

/** Statut de la donnée stockée */
export enum StoredDataStandardListResponseDtoStatusEnum {
    CREATED = "CREATED",
    GENERATING = "GENERATING",
    MODIFYING = "MODIFYING",
    GENERATED = "GENERATED",
    DELETED = "DELETED",
    UNSTABLE = "UNSTABLE",
}

/** Type de donnée stockée */
export enum StoredDataStandardListResponseDtoTypeEnum {
    ROK4PYRAMIDRASTER = "ROK4-PYRAMID-RASTER",
    ROK4PYRAMIDVECTOR = "ROK4-PYRAMID-VECTOR",
    VECTORDB = "VECTOR-DB",
    ARCHIVE = "ARCHIVE",
    GRAPHDB = "GRAPH-DB",
    GRAPHOSRM = "GRAPH-OSRM",
    GRAPHVALHALLA = "GRAPH-VALHALLA",
    INDEX = "INDEX",
    PYRAMID3DCOPC = "PYRAMID-3D-COPC",
    PYRAMID3DEPT = "PYRAMID-3D-EPT",
}

export enum StoredDataStorageDtoTypeEnum {
    POSTGRESQL = "POSTGRESQL",
    S3 = "S3",
    FILESYSTEM = "FILESYSTEM",
    OPENSEARCH = "OPENSEARCH",
    POSTGRESQLROUTING = "POSTGRESQL-ROUTING",
}

/** Type de livraison */
export enum UploadCreateDtoTypeEnum {
    VECTOR = "VECTOR",
    RASTER = "RASTER",
    ARCHIVE = "ARCHIVE",
    ROK4PYRAMID = "ROK4-PYRAMID",
    INDEX = "INDEX",
    HISTORICIMAGERY = "HISTORIC-IMAGERY",
    POINTCLOUD = "POINT-CLOUD",
    PYRAMID3D = "PYRAMID-3D",
}

/** Statut de la livraison */
export enum UploadExtendedListResponseDtoStatusEnum {
    CREATED = "CREATED",
    OPEN = "OPEN",
    CLOSED = "CLOSED",
    CHECKING = "CHECKING",
    GENERATING = "GENERATING",
    MODIFYING = "MODIFYING",
    UNSTABLE = "UNSTABLE",
    DELETED = "DELETED",
}

/** Type de livraison */
export enum UploadExtendedListResponseDtoTypeEnum {
    VECTOR = "VECTOR",
    RASTER = "RASTER",
    ARCHIVE = "ARCHIVE",
    ROK4PYRAMID = "ROK4-PYRAMID",
    INDEX = "INDEX",
    HISTORICIMAGERY = "HISTORIC-IMAGERY",
    POINTCLOUD = "POINT-CLOUD",
    PYRAMID3D = "PYRAMID-3D",
}

/** Statut de la livraison */
export enum UploadPrivateDetailResponseDtoStatusEnum {
    CREATED = "CREATED",
    OPEN = "OPEN",
    CLOSED = "CLOSED",
    CHECKING = "CHECKING",
    GENERATING = "GENERATING",
    MODIFYING = "MODIFYING",
    UNSTABLE = "UNSTABLE",
    DELETED = "DELETED",
}

/** Type de livraison */
export enum UploadPrivateDetailResponseDtoTypeEnum {
    VECTOR = "VECTOR",
    RASTER = "RASTER",
    ARCHIVE = "ARCHIVE",
    ROK4PYRAMID = "ROK4-PYRAMID",
    INDEX = "INDEX",
    HISTORICIMAGERY = "HISTORIC-IMAGERY",
    POINTCLOUD = "POINT-CLOUD",
    PYRAMID3D = "PYRAMID-3D",
}

/** Type de données (pour le type EPT) */
export enum UploadPyramid3DDetailsDtoDataTypeEnum {
    Laszip = "laszip",
    Zstandard = "zstandard",
    Binary = "binary",
}

/** Type de pyramide 3D */
export enum UploadPyramid3DDetailsDtoPyramidTypeEnum {
    COPC = "COPC",
    EPT = "EPT",
}

/** Statut de la livraison */
export enum UploadStandardListResponseDtoStatusEnum {
    CREATED = "CREATED",
    OPEN = "OPEN",
    CLOSED = "CLOSED",
    CHECKING = "CHECKING",
    GENERATING = "GENERATING",
    MODIFYING = "MODIFYING",
    UNSTABLE = "UNSTABLE",
    DELETED = "DELETED",
}

/** Type de livraison */
export enum UploadStandardListResponseDtoTypeEnum {
    VECTOR = "VECTOR",
    RASTER = "RASTER",
    ARCHIVE = "ARCHIVE",
    ROK4PYRAMID = "ROK4-PYRAMID",
    INDEX = "INDEX",
    HISTORICIMAGERY = "HISTORIC-IMAGERY",
    POINTCLOUD = "POINT-CLOUD",
    PYRAMID3D = "PYRAMID-3D",
}

export enum UserKeyDetailsResponseDtoUserKeyInfoDtoTypeEnum {
    HASH = "HASH",
    BASIC = "BASIC",
    OAUTH2 = "OAUTH2",
}

export enum UserKeyResponseDtoTypeEnum {
    HASH = "HASH",
    BASIC = "BASIC",
    OAUTH2 = "OAUTH2",
}

/** Types de livraisons ayant cette vérification par défaut */
export enum GetAll14ParamsDefaultUploadTypeEnum {
    VECTOR = "VECTOR",
    RASTER = "RASTER",
    ARCHIVE = "ARCHIVE",
    ROK4PYRAMID = "ROK4-PYRAMID",
    INDEX = "INDEX",
    HISTORICIMAGERY = "HISTORIC-IMAGERY",
    POINTCLOUD = "POINT-CLOUD",
    PYRAMID3D = "PYRAMID-3D",
}

export enum GetAll28ParamsFieldsEnum {
    Name = "name",
    LayerName = "layer_name",
    Type = "type",
    Status = "status",
    Attributions = "attributions",
    Metadatas = "metadatas",
    Tags = "tags",
    Creation = "creation",
    LastEvent = "last_event",
    Update = "update",
}

/** Type de configuration */
export enum GetAll28ParamsTypeEnum {
    WMSVECTOR = "WMS-VECTOR",
    WFS = "WFS",
    WMTSTMS = "WMTS-TMS",
    WMSRASTER = "WMS-RASTER",
    DOWNLOAD = "DOWNLOAD",
    ITINERARYISOCURVE = "ITINERARY-ISOCURVE",
    ALTIMETRY = "ALTIMETRY",
    SEARCH = "SEARCH",
    VECTORTMS = "VECTOR-TMS",
    APIFEATURES = "API-FEATURES",
}

/** Statut des configurations */
export enum GetAll28ParamsStatusEnum {
    UNPUBLISHED = "UNPUBLISHED",
    PUBLISHED = "PUBLISHED",
    SYNCHRONIZING = "SYNCHRONIZING",
}

/** Type de point d'accès voulu */
export enum GetAll11ParamsTypeEnum {
    WMSVECTOR = "WMS-VECTOR",
    WFS = "WFS",
    WMTSTMS = "WMTS-TMS",
    WMSRASTER = "WMS-RASTER",
    DOWNLOAD = "DOWNLOAD",
    METADATA = "METADATA",
    ITINERARYISOCURVE = "ITINERARY-ISOCURVE",
    ALTIMETRY = "ALTIMETRY",
    SEARCH = "SEARCH",
    VECTORTMS = "VECTOR-TMS",
    APIFEATURES = "API-FEATURES",
}

/** Type de famille à laquelle appartient la nomenclature */
export enum FindAllParamsTypeEnum {
    CRS = "CRS",
    ZONE = "ZONE",
    FORMAT = "FORMAT",
    RESOLUTION = "RESOLUTION",
    ECONOMICAL_MODEL = "ECONOMICAL_MODEL",
}

export enum GetAll27ParamsFieldsEnum {
    Open = "open",
    Available = "available",
    LayerName = "layer_name",
    Type = "type",
    Status = "status",
    Endpoint = "endpoint",
    Configuration = "configuration",
    Urls = "urls",
    Creation = "creation",
    Extra = "extra",
    Update = "update",
    PublicActivity = "public_activity",
}

/** Type de diffusion des offres */
export enum GetAll27ParamsTypeEnum {
    WMSVECTOR = "WMS-VECTOR",
    WFS = "WFS",
    WMTSTMS = "WMTS-TMS",
    WMSRASTER = "WMS-RASTER",
    DOWNLOAD = "DOWNLOAD",
    ITINERARYISOCURVE = "ITINERARY-ISOCURVE",
    ALTIMETRY = "ALTIMETRY",
    SEARCH = "SEARCH",
    VECTORTMS = "VECTOR-TMS",
    APIFEATURES = "API-FEATURES",
}

/** Statut des offres */
export enum GetAll27ParamsStatusEnum {
    PUBLISHING = "PUBLISHING",
    MODIFYING = "MODIFYING",
    PUBLISHED = "PUBLISHED",
    UNPUBLISHING = "UNPUBLISHING",
    UNSTABLE = "UNSTABLE",
    UNPUBLISHED = "UNPUBLISHED",
}

export enum GetAll10ParamsFieldsEnum {
    Name = "name",
    Creation = "creation",
    Siren = "siren",
    Siret = "siret",
    TvaIntracom = "tva_intracom",
    EconomicalModel = "economical_model",
    UploadsQuota = "uploads_quota",
}

export enum GetAll9ParamsFieldsEnum {
    Creation = "creation",
    Name = "name",
    Description = "description",
    Priority = "priority",
    InputTypes = "input_types",
    OutputTypes = "output_types",
}

/** Type de livraison en entrée */
export enum GetAll9ParamsInputUploadTypeEnum {
    VECTOR = "VECTOR",
    RASTER = "RASTER",
    ARCHIVE = "ARCHIVE",
    ROK4PYRAMID = "ROK4-PYRAMID",
    INDEX = "INDEX",
    HISTORICIMAGERY = "HISTORIC-IMAGERY",
    POINTCLOUD = "POINT-CLOUD",
    PYRAMID3D = "PYRAMID-3D",
}

/** Type de donnée stockée en entrée */
export enum GetAll9ParamsInputStoredDataTypeEnum {
    ROK4PYRAMIDRASTER = "ROK4-PYRAMID-RASTER",
    ROK4PYRAMIDVECTOR = "ROK4-PYRAMID-VECTOR",
    VECTORDB = "VECTOR-DB",
    ARCHIVE = "ARCHIVE",
    GRAPHDB = "GRAPH-DB",
    GRAPHOSRM = "GRAPH-OSRM",
    GRAPHVALHALLA = "GRAPH-VALHALLA",
    INDEX = "INDEX",
    PYRAMID3DCOPC = "PYRAMID-3D-COPC",
    PYRAMID3DEPT = "PYRAMID-3D-EPT",
}

/** Type de livraison en sortie */
export enum GetAll9ParamsOutputUploadTypeEnum {
    VECTOR = "VECTOR",
    RASTER = "RASTER",
    ARCHIVE = "ARCHIVE",
    ROK4PYRAMID = "ROK4-PYRAMID",
    INDEX = "INDEX",
    HISTORICIMAGERY = "HISTORIC-IMAGERY",
    POINTCLOUD = "POINT-CLOUD",
    PYRAMID3D = "PYRAMID-3D",
}

/** Type de donnée stockée en sortie */
export enum GetAll9ParamsOutputStoredDataTypeEnum {
    ROK4PYRAMIDRASTER = "ROK4-PYRAMID-RASTER",
    ROK4PYRAMIDVECTOR = "ROK4-PYRAMID-VECTOR",
    VECTORDB = "VECTOR-DB",
    ARCHIVE = "ARCHIVE",
    GRAPHDB = "GRAPH-DB",
    GRAPHOSRM = "GRAPH-OSRM",
    GRAPHVALHALLA = "GRAPH-VALHALLA",
    INDEX = "INDEX",
    PYRAMID3DCOPC = "PYRAMID-3D-COPC",
    PYRAMID3DEPT = "PYRAMID-3D-EPT",
}

/** Statut des exécutions à récupérer */
export enum GetAll25ParamsStatusEnum {
    CREATED = "CREATED",
    WAITING = "WAITING",
    PROGRESS = "PROGRESS",
    SUCCESS = "SUCCESS",
    FAILURE = "FAILURE",
    ABORTED = "ABORTED",
}

/** Type du fichier statique */
export enum GetAll24ParamsTypeEnum {
    GEOSERVERFTL = "GEOSERVER-FTL",
    GEOSERVERSTYLE = "GEOSERVER-STYLE",
    ROK4STYLE = "ROK4-STYLE",
    DERIVATIONSQL = "DERIVATION-SQL",
}

/** Type de stockage */
export enum GetAll8ParamsTypeEnum {
    POSTGRESQL = "POSTGRESQL",
    S3 = "S3",
    FILESYSTEM = "FILESYSTEM",
    OPENSEARCH = "OPENSEARCH",
    POSTGRESQLROUTING = "POSTGRESQL-ROUTING",
}

export enum GetAll23ParamsFieldsEnum {
    Name = "name",
    Description = "description",
    Type = "type",
    Open = "open",
    Status = "status",
    Srs = "srs",
    Contact = "contact",
    Edition = "edition",
    Size = "size",
    LastEvent = "last_event",
    Tags = "tags",
    Creation = "creation",
    Bbox = "bbox",
    PublicActivity = "public_activity",
}

/** Type de donnée stockée */
export enum GetAll23ParamsTypeEnum {
    ROK4PYRAMIDRASTER = "ROK4-PYRAMID-RASTER",
    ROK4PYRAMIDVECTOR = "ROK4-PYRAMID-VECTOR",
    VECTORDB = "VECTOR-DB",
    ARCHIVE = "ARCHIVE",
    GRAPHDB = "GRAPH-DB",
    GRAPHOSRM = "GRAPH-OSRM",
    GRAPHVALHALLA = "GRAPH-VALHALLA",
    INDEX = "INDEX",
    PYRAMID3DCOPC = "PYRAMID-3D-COPC",
    PYRAMID3DEPT = "PYRAMID-3D-EPT",
}

/** Statut des données stockées */
export enum GetAll23ParamsStatusEnum {
    CREATED = "CREATED",
    GENERATING = "GENERATING",
    MODIFYING = "MODIFYING",
    GENERATED = "GENERATED",
    DELETED = "DELETED",
    UNSTABLE = "UNSTABLE",
}

export enum GetAll22ParamsFieldsEnum {
    Name = "name",
    Description = "description",
    Type = "type",
    Open = "open",
    Status = "status",
    Srs = "srs",
    Contact = "contact",
    Size = "size",
    LastEvent = "last_event",
    Tags = "tags",
    Creation = "creation",
    Bbox = "bbox",
}

/** Type de livraisons */
export enum GetAll22ParamsTypeEnum {
    VECTOR = "VECTOR",
    RASTER = "RASTER",
    ARCHIVE = "ARCHIVE",
    ROK4PYRAMID = "ROK4-PYRAMID",
    INDEX = "INDEX",
    HISTORICIMAGERY = "HISTORIC-IMAGERY",
    POINTCLOUD = "POINT-CLOUD",
    PYRAMID3D = "PYRAMID-3D",
}

/** Statut des livraisons */
export enum GetAll22ParamsStatusEnum {
    CREATED = "CREATED",
    OPEN = "OPEN",
    CLOSED = "CLOSED",
    CHECKING = "CHECKING",
    GENERATING = "GENERATING",
    MODIFYING = "MODIFYING",
    UNSTABLE = "UNSTABLE",
    DELETED = "DELETED",
}

/** Type d'offre */
export enum GetPublicOfferingsParamsTypeEnum {
    VECTOR = "VECTOR",
    RASTER = "RASTER",
    ARCHIVE = "ARCHIVE",
    ROK4PYRAMID = "ROK4-PYRAMID",
    INDEX = "INDEX",
    HISTORICIMAGERY = "HISTORIC-IMAGERY",
    POINTCLOUD = "POINT-CLOUD",
    PYRAMID3D = "PYRAMID-3D",
}

/** Filtre sur le type des offres permises */
export enum GetCommunityPermissionsParamsTypeEnum {
    WMSVECTOR = "WMS-VECTOR",
    WFS = "WFS",
    WMTSTMS = "WMTS-TMS",
    WMSRASTER = "WMS-RASTER",
    DOWNLOAD = "DOWNLOAD",
    ITINERARYISOCURVE = "ITINERARY-ISOCURVE",
    ALTIMETRY = "ALTIMETRY",
    SEARCH = "SEARCH",
    VECTORTMS = "VECTOR-TMS",
    APIFEATURES = "API-FEATURES",
}

/** Filtre sur les droits de l'utlisateur */
export enum GetUsers1ParamsRightsEnum {
    COMMUNITY = "COMMUNITY",
    PROCESSING = "PROCESSING",
    ANNEX = "ANNEX",
    BROADCAST = "BROADCAST",
    UPLOAD = "UPLOAD",
}

/** Types de livraisons ayant cette vérification par défaut */
export enum GetAll19ParamsDefaultUploadTypeEnum {
    VECTOR = "VECTOR",
    RASTER = "RASTER",
    ARCHIVE = "ARCHIVE",
    ROK4PYRAMID = "ROK4-PYRAMID",
    INDEX = "INDEX",
    HISTORICIMAGERY = "HISTORIC-IMAGERY",
    POINTCLOUD = "POINT-CLOUD",
    PYRAMID3D = "PYRAMID-3D",
}

/** Statut des exécutions à récupérer */
export enum GetAll20ParamsStatusEnum {
    WAITING = "WAITING",
    PROGRESS = "PROGRESS",
    SUCCESS = "SUCCESS",
    FAILURE = "FAILURE",
}

export enum GetAll6ParamsFieldsEnum {
    Name = "name",
    LayerName = "layer_name",
    Type = "type",
    Status = "status",
    Attributions = "attributions",
    Metadatas = "metadatas",
    Tags = "tags",
    Creation = "creation",
    LastEvent = "last_event",
    Update = "update",
}

/** Type de configuration */
export enum GetAll6ParamsTypeEnum {
    WMSVECTOR = "WMS-VECTOR",
    WFS = "WFS",
    WMTSTMS = "WMTS-TMS",
    WMSRASTER = "WMS-RASTER",
    DOWNLOAD = "DOWNLOAD",
    ITINERARYISOCURVE = "ITINERARY-ISOCURVE",
    ALTIMETRY = "ALTIMETRY",
    SEARCH = "SEARCH",
    VECTORTMS = "VECTOR-TMS",
    APIFEATURES = "API-FEATURES",
}

/** Statut des configurations */
export enum GetAll6ParamsStatusEnum {
    UNPUBLISHED = "UNPUBLISHED",
    PUBLISHED = "PUBLISHED",
    SYNCHRONIZING = "SYNCHRONIZING",
}

export enum GetOfferingsParamsFieldsEnum {
    Open = "open",
    Available = "available",
    LayerName = "layer_name",
    Type = "type",
    Status = "status",
    Endpoint = "endpoint",
    Configuration = "configuration",
    Urls = "urls",
    Creation = "creation",
    Extra = "extra",
    Update = "update",
    PublicActivity = "public_activity",
}

/** Type du point d'accès */
export enum GetEndpoints1ParamsTypeEnum {
    WMSVECTOR = "WMS-VECTOR",
    WFS = "WFS",
    WMTSTMS = "WMTS-TMS",
    WMSRASTER = "WMS-RASTER",
    DOWNLOAD = "DOWNLOAD",
    METADATA = "METADATA",
    ITINERARYISOCURVE = "ITINERARY-ISOCURVE",
    ALTIMETRY = "ALTIMETRY",
    SEARCH = "SEARCH",
    VECTORTMS = "VECTOR-TMS",
    APIFEATURES = "API-FEATURES",
}

/** Quel type de métadonnées (INSPIRE, ISOAP...) veut-on voir */
export enum GetAll5ParamsTypeEnum {
    INSPIRE = "INSPIRE",
    ISOAP = "ISOAP",
}

/** Quel niveau de métadonnées (lot, produit...) veut-on voir */
export enum GetAll5ParamsLevelEnum {
    DATASET = "DATASET",
    SERIES = "SERIES",
}

/** Type de métadonnée */
export enum Create4ParamsTypeEnum {
    INSPIRE = "INSPIRE",
    ISOAP = "ISOAP",
}

export enum GetAll18ParamsFieldsEnum {
    Open = "open",
    Available = "available",
    LayerName = "layer_name",
    Type = "type",
    Status = "status",
    Endpoint = "endpoint",
    Configuration = "configuration",
    Urls = "urls",
    Creation = "creation",
    Extra = "extra",
    Update = "update",
    PublicActivity = "public_activity",
}

/** Type de diffusion des offres */
export enum GetAll18ParamsTypeEnum {
    WMSVECTOR = "WMS-VECTOR",
    WFS = "WFS",
    WMTSTMS = "WMTS-TMS",
    WMSRASTER = "WMS-RASTER",
    DOWNLOAD = "DOWNLOAD",
    ITINERARYISOCURVE = "ITINERARY-ISOCURVE",
    ALTIMETRY = "ALTIMETRY",
    SEARCH = "SEARCH",
    VECTORTMS = "VECTOR-TMS",
    APIFEATURES = "API-FEATURES",
}

/** Statut des offres */
export enum GetAll18ParamsStatusEnum {
    PUBLISHING = "PUBLISHING",
    MODIFYING = "MODIFYING",
    PUBLISHED = "PUBLISHED",
    UNPUBLISHING = "UNPUBLISHING",
    UNSTABLE = "UNSTABLE",
    UNPUBLISHED = "UNPUBLISHED",
}

export enum GetAll17ParamsFieldsEnum {
    Creation = "creation",
    Name = "name",
    Description = "description",
    Priority = "priority",
    InputTypes = "input_types",
    OutputTypes = "output_types",
}

/** Statut des exécutions à récupérer */
export enum GetAll3ParamsStatusEnum {
    CREATED = "CREATED",
    WAITING = "WAITING",
    PROGRESS = "PROGRESS",
    SUCCESS = "SUCCESS",
    FAILURE = "FAILURE",
    ABORTED = "ABORTED",
}

/** Type du fichier statique */
export enum GetAll2ParamsTypeEnum {
    GEOSERVERFTL = "GEOSERVER-FTL",
    GEOSERVERSTYLE = "GEOSERVER-STYLE",
    ROK4STYLE = "ROK4-STYLE",
    DERIVATIONSQL = "DERIVATION-SQL",
}

/** Type de stockage */
export enum GetStoragesParamsTypeEnum {
    POSTGRESQL = "POSTGRESQL",
    S3 = "S3",
    FILESYSTEM = "FILESYSTEM",
    OPENSEARCH = "OPENSEARCH",
    POSTGRESQLROUTING = "POSTGRESQL-ROUTING",
}

export enum GetAll16ParamsFieldsEnum {
    Name = "name",
    Description = "description",
    Type = "type",
    Open = "open",
    Status = "status",
    Srs = "srs",
    Contact = "contact",
    Edition = "edition",
    Size = "size",
    LastEvent = "last_event",
    Tags = "tags",
    Creation = "creation",
    Bbox = "bbox",
    PublicActivity = "public_activity",
}

/** Type de donnée stockée */
export enum GetAll16ParamsTypeEnum {
    ROK4PYRAMIDRASTER = "ROK4-PYRAMID-RASTER",
    ROK4PYRAMIDVECTOR = "ROK4-PYRAMID-VECTOR",
    VECTORDB = "VECTOR-DB",
    ARCHIVE = "ARCHIVE",
    GRAPHDB = "GRAPH-DB",
    GRAPHOSRM = "GRAPH-OSRM",
    GRAPHVALHALLA = "GRAPH-VALHALLA",
    INDEX = "INDEX",
    PYRAMID3DCOPC = "PYRAMID-3D-COPC",
    PYRAMID3DEPT = "PYRAMID-3D-EPT",
}

/** Statut des données stockées */
export enum GetAll16ParamsStatusEnum {
    CREATED = "CREATED",
    GENERATING = "GENERATING",
    MODIFYING = "MODIFYING",
    GENERATED = "GENERATED",
    DELETED = "DELETED",
    UNSTABLE = "UNSTABLE",
}

export enum GetAll1ParamsFieldsEnum {
    Name = "name",
    Description = "description",
    Type = "type",
    Open = "open",
    Status = "status",
    Srs = "srs",
    Contact = "contact",
    Size = "size",
    LastEvent = "last_event",
    Tags = "tags",
    Creation = "creation",
    Bbox = "bbox",
}

/** Type de livraisons */
export enum GetAll1ParamsTypeEnum {
    VECTOR = "VECTOR",
    RASTER = "RASTER",
    ARCHIVE = "ARCHIVE",
    ROK4PYRAMID = "ROK4-PYRAMID",
    INDEX = "INDEX",
    HISTORICIMAGERY = "HISTORIC-IMAGERY",
    POINTCLOUD = "POINT-CLOUD",
    PYRAMID3D = "PYRAMID-3D",
}

/** Statut des livraisons */
export enum GetAll1ParamsStatusEnum {
    CREATED = "CREATED",
    OPEN = "OPEN",
    CLOSED = "CLOSED",
    CHECKING = "CHECKING",
    GENERATING = "GENERATING",
    MODIFYING = "MODIFYING",
    UNSTABLE = "UNSTABLE",
    DELETED = "DELETED",
}

export enum GetConfigurationsParamsFieldsEnum {
    Name = "name",
    LayerName = "layer_name",
    Type = "type",
    Status = "status",
    Attributions = "attributions",
    Metadatas = "metadatas",
    Tags = "tags",
    Creation = "creation",
    LastEvent = "last_event",
    Update = "update",
}

/** Type de configuration */
export enum GetConfigurationsParamsTypeEnum {
    WMSVECTOR = "WMS-VECTOR",
    WFS = "WFS",
    WMTSTMS = "WMTS-TMS",
    WMSRASTER = "WMS-RASTER",
    DOWNLOAD = "DOWNLOAD",
    ITINERARYISOCURVE = "ITINERARY-ISOCURVE",
    ALTIMETRY = "ALTIMETRY",
    SEARCH = "SEARCH",
    VECTORTMS = "VECTOR-TMS",
    APIFEATURES = "API-FEATURES",
}

/** Statut des configurations */
export enum GetConfigurationsParamsStatusEnum {
    UNPUBLISHED = "UNPUBLISHED",
    PUBLISHED = "PUBLISHED",
    SYNCHRONIZING = "SYNCHRONIZING",
}

/** Type du point d'accès */
export enum GetEndpointsParamsTypeEnum {
    WMSVECTOR = "WMS-VECTOR",
    WFS = "WFS",
    WMTSTMS = "WMTS-TMS",
    WMSRASTER = "WMS-RASTER",
    DOWNLOAD = "DOWNLOAD",
    METADATA = "METADATA",
    ITINERARYISOCURVE = "ITINERARY-ISOCURVE",
    ALTIMETRY = "ALTIMETRY",
    SEARCH = "SEARCH",
    VECTORTMS = "VECTOR-TMS",
    APIFEATURES = "API-FEATURES",
}

export enum GetOfferings1ParamsFieldsEnum {
    Open = "open",
    Available = "available",
    LayerName = "layer_name",
    Type = "type",
    Status = "status",
    Endpoint = "endpoint",
    Configuration = "configuration",
    Urls = "urls",
    Creation = "creation",
    Extra = "extra",
    Update = "update",
    PublicActivity = "public_activity",
}

/** Type de diffusion des offres */
export enum GetOfferings1ParamsTypeEnum {
    WMSVECTOR = "WMS-VECTOR",
    WFS = "WFS",
    WMTSTMS = "WMTS-TMS",
    WMSRASTER = "WMS-RASTER",
    DOWNLOAD = "DOWNLOAD",
    ITINERARYISOCURVE = "ITINERARY-ISOCURVE",
    ALTIMETRY = "ALTIMETRY",
    SEARCH = "SEARCH",
    VECTORTMS = "VECTOR-TMS",
    APIFEATURES = "API-FEATURES",
}

/** Statut des offres */
export enum GetOfferings1ParamsStatusEnum {
    PUBLISHING = "PUBLISHING",
    MODIFYING = "MODIFYING",
    PUBLISHED = "PUBLISHED",
    UNPUBLISHING = "UNPUBLISHING",
    UNSTABLE = "UNSTABLE",
    UNPUBLISHED = "UNPUBLISHED",
}

/** Statut des exécutions à récupérer */
export enum GetProcessingExecutionsParamsStatusEnum {
    CREATED = "CREATED",
    WAITING = "WAITING",
    PROGRESS = "PROGRESS",
    SUCCESS = "SUCCESS",
    FAILURE = "FAILURE",
    ABORTED = "ABORTED",
}

/** Type du fichier statique */
export enum GetStaticFilesParamsTypeEnum {
    GEOSERVERFTL = "GEOSERVER-FTL",
    GEOSERVERSTYLE = "GEOSERVER-STYLE",
    ROK4STYLE = "ROK4-STYLE",
    DERIVATIONSQL = "DERIVATION-SQL",
}

export enum GetActiveStoredDataParamsFieldsEnum {
    Name = "name",
    Description = "description",
    Type = "type",
    Open = "open",
    Status = "status",
    Srs = "srs",
    Contact = "contact",
    Edition = "edition",
    Size = "size",
    LastEvent = "last_event",
    Tags = "tags",
    Creation = "creation",
    Bbox = "bbox",
    PublicActivity = "public_activity",
}

/** Type de donnée stockée */
export enum GetActiveStoredDataParamsTypeEnum {
    ROK4PYRAMIDRASTER = "ROK4-PYRAMID-RASTER",
    ROK4PYRAMIDVECTOR = "ROK4-PYRAMID-VECTOR",
    VECTORDB = "VECTOR-DB",
    ARCHIVE = "ARCHIVE",
    GRAPHDB = "GRAPH-DB",
    GRAPHOSRM = "GRAPH-OSRM",
    GRAPHVALHALLA = "GRAPH-VALHALLA",
    INDEX = "INDEX",
    PYRAMID3DCOPC = "PYRAMID-3D-COPC",
    PYRAMID3DEPT = "PYRAMID-3D-EPT",
}

/** Statut des données stockées */
export enum GetActiveStoredDataParamsStatusEnum {
    CREATED = "CREATED",
    GENERATING = "GENERATING",
    MODIFYING = "MODIFYING",
    GENERATED = "GENERATED",
    DELETED = "DELETED",
    UNSTABLE = "UNSTABLE",
}

export enum GetActiveUploadsParamsFieldsEnum {
    Name = "name",
    Description = "description",
    Type = "type",
    Open = "open",
    Status = "status",
    Srs = "srs",
    Contact = "contact",
    Size = "size",
    LastEvent = "last_event",
    Tags = "tags",
    Creation = "creation",
    Bbox = "bbox",
}

/** Type de livraisons */
export enum GetActiveUploadsParamsTypeEnum {
    VECTOR = "VECTOR",
    RASTER = "RASTER",
    ARCHIVE = "ARCHIVE",
    ROK4PYRAMID = "ROK4-PYRAMID",
    INDEX = "INDEX",
    HISTORICIMAGERY = "HISTORIC-IMAGERY",
    POINTCLOUD = "POINT-CLOUD",
    PYRAMID3D = "PYRAMID-3D",
}

/** Statut des livraisons */
export enum GetActiveUploadsParamsStatusEnum {
    CREATED = "CREATED",
    OPEN = "OPEN",
    CLOSED = "CLOSED",
    CHECKING = "CHECKING",
    GENERATING = "GENERATING",
    MODIFYING = "MODIFYING",
    UNSTABLE = "UNSTABLE",
    DELETED = "DELETED",
}

/** Type de famille à laquelle appartient la nomenclature */
export enum FindAll1ParamsTypeEnum {
    CRS = "CRS",
    ZONE = "ZONE",
    FORMAT = "FORMAT",
    RESOLUTION = "RESOLUTION",
    ECONOMICAL_MODEL = "ECONOMICAL_MODEL",
}

export enum GetAllParamsFieldsEnum {
    Name = "name",
    Size = "size",
    Description = "description",
    Extra = "extra",
    Labels = "labels",
    PublicUrl = "public_url",
    MimeType = "mime_type",
}

/** Type de la clé */
export enum GetUserKeysParamsTypeEnum {
    HASH = "HASH",
    BASIC = "BASIC",
    OAUTH2 = "OAUTH2",
}

/** Type de diffusion des offres permises */
export enum GetUserPermissionsParamsTypeEnum {
    WMSVECTOR = "WMS-VECTOR",
    WFS = "WFS",
    WMTSTMS = "WMTS-TMS",
    WMSRASTER = "WMS-RASTER",
    DOWNLOAD = "DOWNLOAD",
    ITINERARYISOCURVE = "ITINERARY-ISOCURVE",
    ALTIMETRY = "ALTIMETRY",
    SEARCH = "SEARCH",
    VECTORTMS = "VECTOR-TMS",
    APIFEATURES = "API-FEATURES",
}

export enum GetStoredDatasParamsFieldsEnum {
    Name = "name",
    Description = "description",
    Type = "type",
    Open = "open",
    Status = "status",
    Srs = "srs",
    Contact = "contact",
    Edition = "edition",
    Size = "size",
    LastEvent = "last_event",
    Tags = "tags",
    Creation = "creation",
    Bbox = "bbox",
    PublicActivity = "public_activity",
}

/** Type de donnée stockée */
export enum GetStoredDatasParamsTypeEnum {
    ROK4PYRAMIDRASTER = "ROK4-PYRAMID-RASTER",
    ROK4PYRAMIDVECTOR = "ROK4-PYRAMID-VECTOR",
    VECTORDB = "VECTOR-DB",
    ARCHIVE = "ARCHIVE",
    GRAPHDB = "GRAPH-DB",
    GRAPHOSRM = "GRAPH-OSRM",
    GRAPHVALHALLA = "GRAPH-VALHALLA",
    INDEX = "INDEX",
    PYRAMID3DCOPC = "PYRAMID-3D-COPC",
    PYRAMID3DEPT = "PYRAMID-3D-EPT",
}

/** Statut des données stockées */
export enum GetStoredDatasParamsStatusEnum {
    CREATED = "CREATED",
    GENERATING = "GENERATING",
    MODIFYING = "MODIFYING",
    GENERATED = "GENERATED",
    DELETED = "DELETED",
    UNSTABLE = "UNSTABLE",
}
