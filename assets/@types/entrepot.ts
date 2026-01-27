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

/** Le type de stockage */
export enum StorageType {
    POSTGRESQL = "POSTGRESQL",
    S3 = "S3",
    FILESYSTEM = "FILESYSTEM",
    OPENSEARCH = "OPENSEARCH",
    POSTGRESQLROUTING = "POSTGRESQL-ROUTING",
}

export interface PermissionCreateDto {
    /** @format date-time */
    end_date?: string;
    licence: string;
    /** @uniqueItems true */
    offerings: string[];
    type?: PermissionCreateDtoTypeEnum;
    only_oauth?: boolean;
}

export interface UserKeyCreateDtoUserKeyInfoDto {
    name: string;
    type?: UserKeyCreateDtoUserKeyInfoDtoTypeEnum;
    whitelist?: string[];
    blacklist?: string[];
    user_agent?: string;
    referer?: string;
    type_infos: UserKeyInfoDto;
}

/** Informations détaillées sur le document */
export interface DocumentDetailsResponseDto {
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
    /** Nom du document */
    name: string;
    /** Description du document */
    description?: string;
    /**
     * La taille du document
     * @format int64
     */
    size: number;
    /** Le type mime du document */
    mime_type: string;
    /**
     * Liste des étiquettes
     * @uniqueItems true
     */
    labels?: string[];
    /** URL publique du document */
    public_url?: string;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    extra?: object;
}

/** Texte du commentaire à ajouter */
export interface CommentSaveDto {
    text: string;
}

/** Information sur l'auteur */
export interface AuthorResponseDto {
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
    first_name: string;
    last_name: string;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Commentaire */
export interface CommentResponseDto {
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
    text: string;
    /** Information sur l'auteur */
    author: AuthorResponseDto;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations spécifiques d'un fichier de dérivation SQL */
export type StaticFileDerivationSqlDetailsDto = StaticFileDetailsDto & {
    /** @uniqueItems true */
    used_variables: string[];
};

/** les informations spécifiques liées au type de statique */
export type StaticFileDetailsDto = object;

/** Informations spécifiques d'un fichier FTL Geoserver */
export type StaticFileGeoserverFtlDetailsDto = StaticFileDetailsDto & {
    /** @uniqueItems true */
    used_attributes: string[];
};

/** Informations spécifiques d'un fichier de style SLD Geoserver */
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
    used_attributes: string[];
};

/** Informations spécifiques d'un fichier de style Rok4 */
export type StaticFileRok4StyleDetailsDto = StaticFileDetailsDto & {
    /** Identificateur du style ROK4 */
    identifier?: string;
    /** Url de la légende du style ROK4 */
    legend_url?: string;
};

/** Informations détaillées sur le fichier statique */
export interface StaticFileStandardDetailResponseDto {
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
    /** Nom du fichier statique */
    name: string;
    /** Description du fichier statique */
    description?: string;
    /** Type du fichier statique */
    type: StaticFileStandardDetailResponseDtoTypeEnum;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    extra?: object;
    type_infos: StaticFileDerivationSqlDetailsDto | StaticFileGeoserverFtlDetailsDto | StaticFileGeoserverStyleDetailsDto | StaticFileRok4StyleDetailsDto;
}

/** Informations sur la configuration de l'offre */
export interface ConfigurationBaseResponseDto {
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
    /** Nom de la configuration */
    name: string;
    status: ConfigurationStandardDetailResponseDtoStatusEnum;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations sur le point d'accès */
export interface EndpointListResponseDto {
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
    /** le nom du point d'accès */
    name: string;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Liste des urls du point d'accès */
export interface EndpointUrl {
    /** Type de l'URL du point d'accès */
    type: EndpointUrlTypeEnum;
    /** URL du point d'accès */
    url: string;
}

/** Informations détaillées sur l'offre */
export interface OfferingStandardDetailResponseDto {
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
    /** Indique si l'offre est ouverte sans clé d'accès */
    open: boolean;
    /** Indique si l'offre est disponible */
    available: boolean;
    /** Nom technique de la ressource. Ce nom doit être unique sur la plateforme pour un type de configuration donné. Ne peut commencer que par un caractère alphabétique ou un tiret bas, puis uniquement des caractères alphanumériques, tiret, tiret bas, point */
    layer_name: string;
    /** Type de configuration */
    type: OfferingStandardDetailResponseDtoTypeEnum;
    /** Statut de l'offre */
    status: OfferingStandardDetailResponseDtoStatusEnum;
    /** Informations sur la configuration de l'offre */
    configuration: ConfigurationBaseResponseDto;
    /** Informations sur le point d'accès */
    endpoint: EndpointListResponseDto;
    /** @uniqueItems true */
    urls: EndpointUrl[];
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    extra?: object;
    /** L'activité de la donnée stockée est-elle publique ? */
    public_activity: boolean;
}

/** Informations détaillées sur la métadonnée */
export interface MetadataStandardResponseDto {
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
    type: MetadataStandardResponseDtoTypeEnum;
    open_data: boolean;
    level: MetadataStandardResponseDtoLevelEnum;
    file_identifier: string;
    tags?: Record<string, string>;
    endpoints?: EndpointListResponseDto[];
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    extra?: object;
}

/** Bounding box (en degrés) */
export interface BoundingBox {
    west: number;
    south: number;
    east: number;
    north: number;
}

export type ConfigurationAltimetryDetailsContent = ConfigurationDetailsContent & {
    /** Bounding box (en degrés) */
    bbox?: BoundingBox;
    /** Titre */
    title: string;
    /**
     * Mots clés
     * @uniqueItems true
     */
    keywords?: string[];
    /** Données utilisées */
    used_data: ConfigurationUsedDataAltimetryDetailsContent[];
    /** Description */
    abstract: string;
};

/** Métadonnées liées au propriétaire de la configuration */
export interface ConfigurationAttribution {
    /** Nom du propriétaire */
    title: string;
    /** URL vers le site du propriétaire */
    url: string;
    /** Logo du propriétaire */
    logo?: ConfigurationAttributionLogo;
}

/** Logo du propriétaire */
export interface ConfigurationAttributionLogo {
    /**
     * le format (mime-type) du logo
     * @pattern \w+/[-+.\w]+
     * @example "image/jpeg"
     */
    format: string;
    /** l'URL d'accès au logo */
    url: string;
    /**
     * la largeur du logo
     * @format int64
     * @min 1
     */
    width: number;
    /**
     * la hauteur du logo
     * @format int64
     * @min 1
     */
    height: number;
}

export type ConfigurationDetailsContent = object;

export type ConfigurationDownloadDetailsContent = ConfigurationDetailsContent & {
    /** Titre dans les différentes langues disponibles */
    title: Record<string, string>;
    /**
     * Mots clés
     * @uniqueItems true
     */
    keywords?: string[];
    /** Identifiant produit de la ressource */
    product_identifier?: string;
    /** Namespace de la ressource */
    namespace?: string;
    /** Droits applicables */
    rights?: string;
    /** Données utilisées */
    used_data: ConfigurationUsedDataDownloadDetailsContent[];
    /** Description dans les différentes langues disponibles */
    abstract: Record<string, string>;
};

/** Informations à fournir pour modifier la configuration */
export interface ConfigurationFullUpdateDto {
    /** Type de configuration */
    type: ConfigurationFullUpdateDtoTypeEnum;
    /** Nom de la configuration */
    name: string;
    /** Métadonnées liées au propriétaire de la configuration */
    attribution?: ConfigurationAttribution;
    type_infos:
        | ConfigurationAltimetryDetailsContent
        | ConfigurationDownloadDetailsContent
        | ConfigurationItineraryIsocurveDetailsContent
        | ConfigurationSearchDetailsContent
        | ConfigurationVectorTmsDetailsContent
        | ConfigurationWfsDetailsContent
        | ConfigurationWmsRasterDetailsContent
        | ConfigurationWmsVectorDetailsContent
        | ConfigurationWmtsTmsDetailsContent;
    /**
     * Métadonnées liées à la configuration
     * @uniqueItems true
     */
    metadata?: ConfigurationMetadata[];
}

export type ConfigurationGetFeatureInfoIsStoredDataWmtsTmsDetailsContent = ConfigurationGetFeatureInfoWmtsTmsDetailsContent & {
    /** Indique si on va utiliser directement la donnée stockée */
    stored_data: boolean;
};

export type ConfigurationGetFeatureInfoServerUrlWmtsTmsDetailsContent = ConfigurationGetFeatureInfoWmtsTmsDetailsContent & {
    server_url: string;
};

/** Ressource cible du GetFeatureInfo */
export type ConfigurationGetFeatureInfoWmtsTmsDetailsContent =
    | ConfigurationGetFeatureInfoIsStoredDataWmtsTmsDetailsContent
    | ConfigurationGetFeatureInfoServerUrlWmtsTmsDetailsContent;

export type ConfigurationItineraryIsocurveDetailsContent = ConfigurationDetailsContent & {
    /** Bounding box (en degrés) */
    bbox?: BoundingBox;
    /** Titre */
    title: string;
    /**
     * Mots clés
     * @uniqueItems true
     */
    keywords?: string[];
    /** Limites pour les calculs d'itinéraire (nombre d'étapes et de contraintes) et d'isochrone (durée et distance) */
    limits?: ConfigurationLimitsItineraryIsocurveDetailsContent;
    /** Définition des contraintes pour la configuration */
    constraints?: object;
    /** Projection(s) */
    srss?: string[];
    /** Données utilisées */
    used_data: ConfigurationUsedDataItineraryIsocurveDetailsContent[];
    /** Description */
    abstract: string;
};

/** Limites pour les calculs d'itinéraire (nombre d'étapes et de contraintes) et d'isochrone (durée et distance) */
export interface ConfigurationLimitsItineraryIsocurveDetailsContent {
    /**
     * Nombre d'étapes maximal pour le service d'itinéraire
     * @format int32
     * @min 0
     * @max 25
     * @default 16
     */
    steps?: number;
    /**
     * Nombre de contraintes maximal pour le service d'itinéraire
     * @format int32
     * @min 0
     * @max 6
     * @default 3
     */
    constraints?: number;
    /**
     * Durée maximale pour le calcul d'isochrone
     * @format int32
     * @min 0
     * @max 86400
     * @default 43200
     */
    duration?: number;
    /**
     * Distance maximale pour le calcul d'isochrone
     * @format int32
     * @min 0
     * @max 2000000
     * @default 1000000
     */
    distance?: number;
}

/** Informations sur la métadonnée liée à la configuration */
export interface ConfigurationMetadata {
    /**
     * Le format (mime-type) de la métadonnée
     * @pattern \w+/[-+.\w]+
     * @example "application/xml"
     */
    format: string;
    /** L'URL d'accès à la métadonnée' */
    url: string;
    /** Le type de métadonnées */
    type: ConfigurationMetadataTypeEnum;
}

export type ConfigurationSearchDetailsContent = ConfigurationDetailsContent & {
    /** Titre */
    title: string;
    /**
     * Mots clés
     * @uniqueItems true
     */
    keywords?: string[];
    /** Données utilisées */
    used_data: ConfigurationUsedDataSearchDetailsContent[];
    /** Description */
    abstract: string;
};

export interface ConfigurationUsedDataAltimetryDetailsContent {
    /** Titre */
    title: string;
    /** Bounding box (en degrés) */
    bbox?: BoundingBox;
    /** Informations sur la source des données */
    source: ConfigurationUsedDataSourceAccuracyAltimetryDetailsContent;
    /** Informations sur la source des données */
    accuracy: ConfigurationUsedDataSourceAccuracyAltimetryDetailsContent;
    /**
     * Identifiant de la donnée stockée
     * @format uuid
     */
    stored_data: string;
}

export interface ConfigurationUsedDataAttributeItineraryIsocurveDetailsContent {
    /** Nom de la table */
    table_name?: string;
    /** Nom de l'attribut dans la table */
    native_name: string;
    /**
     * Nom de l'attribut vu du service
     * @pattern ^[A-Za-z0-9_-]+$
     */
    public_name: string;
    default?: boolean;
}

/** Données utilisées */
export interface ConfigurationUsedDataDownloadDetailsContent {
    /**
     * Nom technique de la sous-ressource. Ce nom doit être unique au sein de la configuration. Uniquement des caractères alphanumériques, tiret, tiret bas, point
     * @pattern ^[A-Za-z0-9_\-.]+$
     */
    sub_name: string;
    /** Titre dans les différentes langues disponibles */
    title?: Record<string, string>;
    /**
     * Mots clés
     * @uniqueItems true
     */
    keywords?: string[];
    /** Format des fichiers */
    format?: string;
    /** Zone géographique concernée */
    zone?: string;
    /** Droits applicables */
    rights?: string;
    /** Thématique des données */
    thematic?: string;
    /** Résolution des données */
    resolution?: string;
    /**
     * Identifiant de la donnée stockée
     * @format uuid
     */
    stored_data: string;
    /** Description dans les différentes langues disponibles */
    abstract?: Record<string, string>;
}

export interface ConfigurationUsedDataItineraryIsocurveDetailsContent {
    /** Profil de graphe à utiliser (e.g. voiture ou piéton) */
    profile: string;
    /** Optimisation de graphe à utiliser (e.g. plus court ou plus rapide) */
    optimization: string;
    /** Colonne de coût (pour stored data de type GRAPHE-DB) */
    cost_column?: string;
    /** Colonne de coût inverse (pour stored data de type GRAPHE-DB) */
    reverse_cost_column?: string;
    /** Type de coût */
    cost_type?: ConfigurationUsedDataItineraryIsocurveDetailsContentCostTypeEnum;
    /** Méthode de calcul de coût (pour stored data de type GRAPHE-VALHALLA) */
    costing?: ConfigurationUsedDataItineraryIsocurveDetailsContentCostingEnum;
    /**
     * Attributs retournés par l'API
     * @uniqueItems true
     */
    attributes?: ConfigurationUsedDataAttributeItineraryIsocurveDetailsContent[];
    /**
     * Identifiant de la donnée stockée
     * @format uuid
     */
    stored_data: string;
}

export interface ConfigurationUsedDataRelationVectorTmsDetailsContent {
    /** Nom de la table */
    native_name: string;
    /** Nom public de la table */
    public_name?: string;
    /** Description */
    abstract: string;
}

export interface ConfigurationUsedDataRelationWfsDetailsContent {
    /** Nom de la table */
    native_name: string;
    /** Nom public de la table */
    public_name?: string;
    /** Titre */
    title: string;
    /**
     * Mots clés
     * @uniqueItems true
     */
    keywords?: string[];
    /** Description */
    abstract: string;
}

export interface ConfigurationUsedDataRelationWmsVectorDetailsContent {
    /** Nom de la table */
    name: string;
    /**
     * Lien vers une entité Static
     * @format uuid
     */
    style: string;
    /** @format uuid */
    ftl?: string;
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
    | ConfigurationUsedDataSourceAccuracyManualAltimetryDetailsContent
    | ConfigurationUsedDataSourceAccuracyPyramidAltimetryDetailsContent;

export type ConfigurationUsedDataSourceAccuracyManualAltimetryDetailsContent = ConfigurationUsedDataSourceAccuracyAltimetryDetailsContent & {
    /** Valeur unique pour la source des données */
    value: string;
};

export type ConfigurationUsedDataSourceAccuracyPyramidAltimetryDetailsContent = ConfigurationUsedDataSourceAccuracyAltimetryDetailsContent & {
    /** Mapping entre les valeurs de la pyramide et les valeurs effectivement renvoyées */
    mapping: Record<string, string>;
    /**
     * Identifiant de la donnée stockée
     * @format uuid
     */
    stored_data: string;
};

export interface ConfigurationUsedDataVectorTmsDetailsContent {
    relations: ConfigurationUsedDataRelationVectorTmsDetailsContent[];
    /**
     * Identifiant de la donnée stockée
     * @format uuid
     */
    stored_data: string;
}

export interface ConfigurationUsedDataWfsDetailsContent {
    relations: ConfigurationUsedDataRelationWfsDetailsContent[];
    expose_primary_key?: boolean;
    /**
     * Identifiant de la donnée stockée
     * @format uuid
     */
    stored_data: string;
}

export interface ConfigurationUsedDataWmsVectorDetailsContent {
    relations: ConfigurationUsedDataRelationWmsVectorDetailsContent[];
    /**
     * Identifiant de la donnée stockée
     * @format uuid
     */
    stored_data: string;
}

export interface ConfigurationUsedDataWmtsTmsDetailsContent {
    bottom_level: string;
    top_level: string;
    /**
     * Identifiant de la donnée stockée
     * @format uuid
     */
    stored_data: string;
}

export type ConfigurationVectorTmsDetailsContent = ConfigurationDetailsContent & {
    used_data: ConfigurationUsedDataVectorTmsDetailsContent[];
};

export type ConfigurationWfsDetailsContent = ConfigurationDetailsContent & {
    /** Bounding box (en degrés) */
    bbox?: BoundingBox;
    used_data: ConfigurationUsedDataWfsDetailsContent[];
};

export type ConfigurationWmsRasterDetailsContent = ConfigurationDetailsContent & {
    /** Bounding box (en degrés) */
    bbox?: BoundingBox;
    title: string;
    /**
     * Mots clés
     * @uniqueItems true
     */
    keywords?: string[];
    /** Identifiants des fichiers statiques de style Rok4 */
    styles?: string[];
    used_data: ConfigurationUsedDataWmtsTmsDetailsContent[];
    /**
     * Interpolation utilisée pour les conversions de résolution
     * @default "BICUBIC"
     */
    interpolation?: ConfigurationWmsRasterDetailsContentInterpolationEnum;
    /** Résolution minimale de la couche */
    bottom_resolution?: number;
    /** Résolution maximale de la couche */
    top_resolution?: number;
    abstract: string;
    /** Ressource cible du GetFeatureInfo */
    getfeatureinfo?: ConfigurationGetFeatureInfoWmtsTmsDetailsContent;
};

export type ConfigurationWmsVectorDetailsContent = ConfigurationDetailsContent & {
    /** Bounding box (en degrés) */
    bbox?: BoundingBox;
    title: string;
    /**
     * Mots clés
     * @uniqueItems true
     */
    keywords?: string[];
    used_data: ConfigurationUsedDataWmsVectorDetailsContent[];
    abstract: string;
};

export type ConfigurationWmtsTmsDetailsContent = ConfigurationDetailsContent & {
    /** Bounding box (en degrés) */
    bbox?: BoundingBox;
    title: string;
    /**
     * Mots clés
     * @uniqueItems true
     */
    keywords?: string[];
    /** Identifiants des fichiers statiques de style Rok4 */
    styles?: string[];
    used_data: ConfigurationUsedDataWmtsTmsDetailsContent[];
    abstract: string;
    /** Ressource cible du GetFeatureInfo */
    getfeatureinfo?: ConfigurationGetFeatureInfoWmtsTmsDetailsContent;
};

/** Événement */
export interface ConfigurationEventDto {
    title: string;
    text?: string;
    /** @format date-time */
    date: string;
    /** Informations sur l'initiateur de l'évènement */
    initiator?: EventInitiatorDto;
    /** @uniqueItems true */
    urls?: EndpointUrl[];
}

/** Informations détaillées sur la configuration */
export interface ConfigurationStandardDetailResponseDto {
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
    /** Nom de la configuration */
    name: string;
    /** Nom technique de la ressource. Ce nom doit être unique sur la plateforme pour un type de configuration donné. Ne peut commencer que par un caractère alphabétique ou un tiret bas, puis uniquement des caractères alphanumériques, tiret, tiret bas, point */
    layer_name: string;
    /** Type de configuration */
    type: ConfigurationStandardDetailResponseDtoTypeEnum;
    status: ConfigurationStandardDetailResponseDtoStatusEnum;
    tags: Record<string, string>;
    /** Métadonnées liées au propriétaire de la configuration */
    attribution?: ConfigurationAttribution;
    /** Événement */
    last_event?: ConfigurationEventDto;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    extra?: object;
    /**
     * Métadonnées liées à la configuration
     * @uniqueItems true
     */
    metadata?: ConfigurationMetadata[];
    type_infos:
        | ConfigurationAltimetryDetailsContent
        | ConfigurationDownloadDetailsContent
        | ConfigurationItineraryIsocurveDetailsContent
        | ConfigurationSearchDetailsContent
        | ConfigurationVectorTmsDetailsContent
        | ConfigurationWfsDetailsContent
        | ConfigurationWmsRasterDetailsContent
        | ConfigurationWmsVectorDetailsContent
        | ConfigurationWmtsTmsDetailsContent;
}

/** Informations sur l'initiateur de l'évènement */
export interface EventInitiatorDto {
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
    last_name: string;
    first_name: string;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations détaillées sur l'annexe */
export interface AnnexStandardDetailResponseDto {
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
    /** @uniqueItems true */
    paths: string[];
    /** @format int64 */
    size: number;
    mime_type: string;
    published: boolean;
    /** @uniqueItems true */
    labels?: string[];
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    extra?: object;
}

export interface CommunityAddUserDto {
    /** @uniqueItems true */
    rights?: CommunityAddUserDtoRightsEnum[];
}

/** Paramètres du traitement à créer */
export interface ProcessingCreateDto {
    /** Nom du traitement. ce nom doit être unique pour la plateforme */
    name: string;
    /** Description du traitement */
    description: string;
    /** Nom technique du traitement tel que connu par l'orchestrateur */
    orchestrator_job_name: string;
    /**
     * Priorité de traitement
     * @default "STANDARD"
     */
    priority?: ProcessingCreateDtoPriorityEnum;
    /** Types de données acceptés en entrée du traitement */
    input_types?: ProcessingInputTypesDto;
    output_type: ProcessingOutputTypeStoredDataDto | ProcessingOutputTypeUploadDto;
    /**
     * Paramètres en entrée du traitement
     * @uniqueItems true
     */
    parameters?: (ProcessingParameterFreeDto | ProcessingParameterStaticFileDto)[];
    /**
     * Vérifications nécessaires au lancement du traitement
     * @uniqueItems true
     */
    required_checks?: string[];
}

/** Types de données acceptés en entrée du traitement */
export interface ProcessingInputTypesDto {
    /**
     * Types de livraisons en entrée acceptés
     * @uniqueItems true
     */
    upload?: ProcessingInputTypesDtoUploadEnum[];
    /**
     * Types de données stockées en entrée acceptés
     * @uniqueItems true
     */
    stored_data?: ProcessingInputTypesDtoStoredDataEnum[];
}

export type ProcessingOutputTypeDto = object;

/** Type de donnée stockée en sortie du traitement */
export type ProcessingOutputTypeStoredDataDto = ProcessingOutputTypeDto & {
    /** Type de donnée stockée */
    stored_data: ProcessingOutputTypeStoredDataDtoStoredDataEnum;
    /**
     * Types de stockage cible du traitement
     * @minItems 1
     * @uniqueItems true
     */
    storage: ProcessingOutputTypeStoredDataDtoStorageEnum[];
};

/** Type de livraison en sortie du traitement */
export type ProcessingOutputTypeUploadDto = ProcessingOutputTypeDto & {
    /** Type de livraison */
    upload: ProcessingOutputTypeUploadDtoUploadEnum;
};

export interface ProcessingParameterDto {
    /** Nom du paramètre */
    name: string;
    /** Description du paramètre */
    description: string;
    /** Indique si le paramètre est obligatoire */
    mandatory: boolean;
    /** Valeur par défaut pour le paramètre" */
    default_value?: string | number | boolean | object;
    constraints?: object;
}

/** Informations spécifiques d'un paramètre libre */
export type ProcessingParameterFreeDto = UtilRequiredKeys<ProcessingParameterDto, "name" | "description" | "mandatory">;

/** Informations spécifiques d'un paramètre de type statique(s) */
export type ProcessingParameterStaticFileDto = UtilRequiredKeys<ProcessingParameterDto, "name" | "description" | "mandatory"> & {
    /** Type de fichier(s) statique(s) attendu(s) pour ce paramètre */
    static_type: ProcessingParameterStaticFileDtoStaticTypeEnum;
};

/** Informations sur la vérification */
export interface CheckingListResponseDto {
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
    /** Nom de la vérification. ce nom doit être unique pour la plateforme */
    name: string;
    /** Description de la vérification */
    description: string;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations détaillées sur le traitement */
export interface ProcessingExtendedDetailResponseDto {
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
    /** Nom du traitement. ce nom doit être unique pour la plateforme */
    name: string;
    /** Description du traitement */
    description: string;
    /** Priorité de traitement */
    priority: ProcessingExtendedDetailResponseDtoPriorityEnum;
    /** Types de données acceptés en entrée du traitement */
    input_types: ProcessingInputTypesDto;
    output_type: ProcessingOutputTypeStoredDataDto | ProcessingOutputTypeUploadDto;
    /**
     * Paramètres en entrée du traitement
     * @uniqueItems true
     */
    parameters: (ProcessingParameterFreeDto | ProcessingParameterStaticFileDto)[];
    /** Nom technique du traitement tel que connu par l'orchestrateur */
    orchestrator_job_name: string;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Vérifications nécessaires au lancement du traitement
     * @uniqueItems true
     */
    required_checks: CheckingListResponseDto[];
}

export interface BasicInfoDto {
    login?: string;
    password?: string;
}

export interface HashInfoDto {
    hash?: string;
}

export interface HeaderInfoDto {
    headers?: Record<string, string>;
}

export type OAuth2InfoDto = object;

export type UserBasicKeyCreateDto = UtilRequiredKeys<UserKeyCreateDtoUserKeyInfoDto, "name" | "type_infos"> & {
    type_infos: BasicInfoDto;
};

export type UserHashKeyCreateDto = UtilRequiredKeys<UserKeyCreateDtoUserKeyInfoDto, "name" | "type_infos"> & {
    type_infos: HashInfoDto;
};

export type UserHeaderKeyCreateDto = UtilRequiredKeys<UserKeyCreateDtoUserKeyInfoDto, "name" | "type_infos"> & {
    type_infos: HeaderInfoDto;
};

export type UserKeyInfoDto = object;

export type UserOauth2KeyCreateDto = UtilRequiredKeys<UserKeyCreateDtoUserKeyInfoDto, "name" | "type_infos"> & {
    type_infos: OAuth2InfoDto;
};

export interface UserKeyDetailsResponseDtoUserKeyInfoDto {
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
    name: string;
    type?: UserKeyDetailsResponseDtoUserKeyInfoDtoTypeEnum;
    whitelist?: string[];
    blacklist?: string[];
    user_agent?: string;
    referer?: string;
    type_infos: UserKeyInfoDto;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

export interface AccessCreateDto {
    /**
     * Identifiant de la permission
     * @format uuid
     */
    permission: string;
    /**
     * Identifiants des offres
     * @uniqueItems true
     */
    offerings: string[];
}

/** Paramètres du document à téléverser */
export interface DocumentCreateDto {
    /** @format binary */
    file: File;
    /** Description du document */
    description?: string;
    /** Nom du document */
    name: string;
    /**
     * Liste des étiquettes
     * @uniqueItems true
     */
    labels?: string[];
}

/** Coordonnées d'origine du dallage */
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

/** Informations à fournir pour la déclaration d'une nouvelle livraison, la livraison est privée par défaut */
export interface UploadCreateDto {
    /** Description de la livraison */
    description: string;
    /** Nom de la livraison */
    name: string;
    /** Type de livraison */
    type: UploadCreateDtoTypeEnum;
    /** Système de coordonnées de référence de la livraison */
    srs: string;
    /** Informations spécifiques au type de livraison */
    type_infos?: UploadDetailsDto;
}

/** Informations spécifiques au type de livraison */
export type UploadDetailsDto = UploadRok4PyramidDetailsDto | UploadIndexDetailsDto | UploadHistoricImageryDetailsDto | UploadPyramid3DDetailsDto;

/** Informations spécifiques d'une livraison d'images historiques */
export type UploadHistoricImageryDetailsDto = UploadDetailsDto & {
    /** Identifiant de jeu de données */
    dataset_identifier: string;
};

/** Informations spécifiques d'une livraison de type Index */
export type UploadIndexDetailsDto = UploadDetailsDto & {
    search_layer?: boolean;
    /**
     * Indique si l'index se comportera comme l'index standard
     * @default false
     */
    is_search_layer?: boolean;
};

/** Informations spécifiques d'une livraison de pyramide 3D */
export type UploadPyramid3DDetailsDto = UploadDetailsDto & {
    /** Type de pyramide 3D */
    pyramid_type: UploadPyramid3DDetailsDtoPyramidTypeEnum;
    /** Coordonnées d'origine du dallage */
    origin?: Coordinate;
    /**
     * Largeur des dalles (pour le type COPC)
     * @format double
     * @min 0
     * @exclusiveMin true
     */
    tile_size?: number;
    /** Template de nommage des dalles (pour le type COPC) */
    template?: string;
    /** Type de données (pour le type EPT) */
    data_type?: UploadPyramid3DDetailsDtoDataTypeEnum;
    /**
     * Span (pour le type EPT)
     * @format int32
     * @min 1
     */
    span?: number;
};

/** Informations spécifiques d'une livraison de pyramide Rok4 */
export type UploadRok4PyramidDetailsDto = UploadDetailsDto & {
    /** Format des données */
    format: string;
    /**
     * Nombre de canaux des images, uniquement pour une pyramide raster
     * @format int32
     * @min 1
     */
    channels_number?: number;
    /** TileMatrixSet de la pyramide */
    tms: string;
};

/** Événement */
export interface EventDto {
    title: string;
    text?: string;
    /** @format date-time */
    date: string;
    /** Informations sur l'initiateur de l'évènement */
    initiator?: EventInitiatorDto;
}

/** Etendue géographique au format GeoJson */
export type JsonNode = object;

/** Informations détaillées sur la livraison */
export interface UploadPrivateDetailResponseDto {
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
    /** Nom de la livraison */
    name: string;
    /** Description de la livraison */
    description: string;
    /** Type de livraison */
    type: UploadPrivateDetailResponseDtoTypeEnum;
    /** Livraison ouverte ? (visible par tous les entrepôts et utilisateurs) */
    open: boolean;
    /** Statut de la livraison */
    status: UploadPrivateDetailResponseDtoStatusEnum;
    /** Système de coordonnées de référence de la livraison */
    srs: string;
    /** Nom du contact de la communauté */
    contact: string;
    /** Etendue géographique au format GeoJson */
    extent?: JsonNode;
    /**
     * Taille de la livraison (en octets)
     * @format int64
     */
    size?: number;
    /** Événement */
    last_event?: EventDto;
    /** Liste des étiquettes de la livraison (format clé/valeur) */
    tags: Record<string, string>;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    extra?: object;
    /** Informations spécifiques au type de livraison */
    type_infos?: UploadDetailsDto;
}

/** Callback à exécuter à la fin de l'exécution */
export interface Callback {
    /** Type de callback */
    type: CallbackTypeEnum;
    /**
     * Liste des adresses emails de destination
     * @maxItems 20
     * @minItems 1
     * @example ["example@mail.fr"]
     */
    to_address: string[];
    /** URL associée au callback */
    entity_url?: string;
}

/** Paramètres d'une exécution de traitement à mettre à jour */
export interface ExecutionUpdateDto {
    /** Callback à exécuter à la fin de l'exécution */
    callback?: Callback;
}

/** Partage avec un entrepôt */
export interface SharingOrVisibilityResponseDto {
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
    /** Nom */
    name: string;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations spécifiques d'une donnée stockée archive */
export type StoredDataArchiveDetailsDto = {
    /**
     * Nombre de fichiers contenus dans la donnée stockée
     * @format int32
     */
    files_number: number;
};

/** Détails sur une donnée stockée */
export type StoredDataDetailsDto =
    | StoredDataRok4PyramidRasterDetailsDto
    | StoredDataRok4PyramidVectorDetailsDto
    | StoredDataVectorDbDetailsDto
    | StoredDataArchiveDetailsDto
    | StoredDataGraphDbDetailsDto
    | StoredDataGraphDetailsDto
    | StoredDataIndexDetailsDto;

/** Liste des relations en BDD */
export interface StoredDataDetailsRelationDto {
    name: string;
    type: StoredDataDetailsRelationDtoTypeEnum;
    attributes: Record<string, string>;
    primary_key?: string[];
}

/** Période d'édition de la donnée stockée */
export interface StoredDataEdition {
    /** @format date */
    from?: string;
    /** @format date */
    to?: string;
}

/** Informations spécifiques d'une donnée stockée graphe d'itinéraire DB */
export type StoredDataGraphDbDetailsDto = {
    /**
     * Liste des attributs utilisables du graphe
     * @uniqueItems true
     */
    attributes: string[];
    /**
     * Liste des modes utilisables du graphe
     * @uniqueItems true
     */
    modes: StoredDataGraphDetailsOptimizationProfileDto[];
    /**
     * Liste des relations en BDD
     * @uniqueItems true
     */
    relations: StoredDataDetailsRelationDto[];
};

/** Informations spécifiques d'une donnée stockée graphe d'itinéraire OSRM ou VALHALLA */
export type StoredDataGraphDetailsDto = {
    /**
     * Liste des attributs utilisables du graphe
     * @uniqueItems true
     */
    attributes: string[];
    /**
     * Liste des modes utilisables du graphe
     * @uniqueItems true
     */
    modes: StoredDataGraphDetailsOptimizationProfileDto[];
};

/** Liste des modes utilisables du graphe */
export interface StoredDataGraphDetailsOptimizationProfileDto {
    profile: string;
    optimization: string;
    md5: string;
}

/** Informations spécifiques d'une donnée stockée index */
export type StoredDataIndexDetailsDto = {
    /** Champs présents dans les documents et leur type */
    fields: Record<string, string>;
    /**
     * Nombre de documents contenus dans l'index
     * @format int32
     */
    count: number;
    search_layer?: boolean;
    /** Indique si l'index se comportera comme l'index standard */
    is_search_layer: boolean;
};

/** Informations détaillées sur la donnée stockée */
export interface StoredDataPrivateDetailResponseDto {
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
    /** Nom de la donnée stockée */
    name: string;
    /** Type de donnée stockée */
    type: StoredDataPrivateDetailResponseDtoTypeEnum;
    /** Donnée stockée ouverte ? (visible par tous les entrepôts et utilisateurs) */
    open: boolean;
    /** Système de coordonnées de référence de la donnée stockée */
    srs?: string;
    /** Description de la donnée stockée */
    description?: string;
    /** Période d'édition de la donnée stockée */
    edition?: StoredDataEdition;
    /** Nom du contact de la communauté */
    contact: string;
    /** Etendue géographique au format GeoJson */
    extent?: JsonNode;
    /**
     * Taille de la donnée stockée (en octets)
     * @format int64
     */
    size?: number;
    /** Statut de la donnée stockée */
    status: StoredDataPrivateDetailResponseDtoStatusEnum;
    /** Événement */
    last_event?: EventDto;
    /** Liste des étiquettes de la donnée stockée (format clé/valeur) */
    tags?: Record<string, string>;
    /** Stockage contenant la donnée stockée */
    storage: StoredDataStorageDto;
    public_activity?: boolean;
    /**
     * Identifiant de la donnée stockée
     * @format uuid
     */
    _id: string;
    extra?: object;
    /** Détails sur une donnée stockée */
    type_infos?: StoredDataDetailsDto;
}

/** Informations spécifiques d'une donnée stockée pyramide Rok4 Raster */
export type StoredDataRok4PyramidRasterDetailsDto = {
    tms: string;
    /** @uniqueItems true */
    levels: string[];
    channels_format: StoredDataRok4PyramidRasterDetailsDtoChannelsFormatEnum;
    /**
     * @format int32
     * @min 1
     */
    channels_number: number;
    compression: StoredDataRok4PyramidRasterDetailsDtoCompressionEnum;
    nodata_value: string;
};

/** Informations spécifiques d'une donnée stockée pyramide Rok4 Vecteur */
export type StoredDataRok4PyramidVectorDetailsDto = {
    tms: string;
    /** @uniqueItems true */
    levels: string[];
};

/** Stockage contenant la donnée stockée */
export interface StoredDataStorageDto {
    type: StoredDataStorageDtoTypeEnum;
    /** @uniqueItems true */
    labels?: string[];
}

/** Informations spécifiques d'une donnée stockée base vectorielle */
export type StoredDataVectorDbDetailsDto = {
    /** @uniqueItems true */
    relations: StoredDataDetailsRelationDto[];
};

/** Paramètres du statique à ajouter */
export interface StaticFileCreateDto {
    /** @format binary */
    file: File;
    /** Nom du fichier statique */
    name: string;
    /** Description du fichier statique */
    description?: string;
    /** Type du fichier statique */
    type: StaticFileCreateDtoTypeEnum;
}

export type IdFieldDto = UploadOutputDto & {
    /**
     * Identifiant de la livraison
     * @format uuid
     */
    id: string;
};

export type NamedFieldDto = UploadOutputDto & {
    /** Nom de la livraison */
    name: string;
};

/** Paramètres de l'exécution de traitement à créer */
export interface ProcessingExecutionCreateDto {
    /**
     * Identifiant du traitement
     * @format uuid
     */
    processing: string;
    /** Données en entrée du traitement */
    inputs?: ProcessingExecutionCreateInputDto;
    output: ProcessingExecutionCreateOutputStoredDataDto | ProcessingExecutionCreateOutputUploadDto;
    /** Paramètres en entrée du traitement */
    parameters?: Record<string, object>;
    /** Callback à exécuter à la fin de l'exécution */
    callback?: Callback;
}

/** Données en entrée du traitement */
export interface ProcessingExecutionCreateInputDto {
    /** Livraisons en entrée */
    upload?: string[];
    /** Données stockées en entrée */
    stored_data?: string[];
}

/** Donnée en sortie du traitement */
export type ProcessingExecutionCreateOutputDto = object;

export type ProcessingExecutionCreateOutputStoredDataDto = ProcessingExecutionCreateOutputDto & {
    stored_data?: StoredDataOutputDto;
};

export type ProcessingExecutionCreateOutputUploadDto = ProcessingExecutionCreateOutputDto & {
    upload?: UploadOutputDto;
};

export type StoredDataCreationDto = StoredDataOutputDto & {
    /** Nom de la donnée stockée */
    name: string;
    /** Type de stockage */
    storage_type?: StoredDataCreationDtoStorageTypeEnum;
    storage_tags?: string[];
};

export type StoredDataOutputDto = IdFieldDto | StoredDataCreationDto;

export type UploadOutputDto = NamedFieldDto | IdFieldDto;

export interface ProcessingExecutionInputDto {
    upload: ProcessingExecutionUploadDto[];
    stored_data: ProcessingExecutionStoredDataDto[];
}

export type ProcessingExecutionOutputDto = object;

export type ProcessingExecutionOutputStoredDataDto = ProcessingExecutionOutputDto & {
    /** Informations simplifiée sur une donnée stockée */
    stored_data: ProcessingExecutionStoredDataDto;
};

export type ProcessingExecutionOutputUploadDto = ProcessingExecutionOutputDto & {
    /** Informations simplifiée sur une livraison */
    upload: ProcessingExecutionUploadDto;
};

/** Traitement */
export interface ProcessingExecutionProcessingDto {
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
    name: string;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations détaillées sur l'exécution de traitement */
export interface ProcessingExecutionStandardDetailResponseDto {
    /** @format date-time */
    creation: string;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
    /** Traitement */
    processing: ProcessingExecutionProcessingDto;
    status: ProcessingExecutionStandardDetailResponseDtoStatusEnum;
    /** @format date-time */
    launch?: string;
    /** @format date-time */
    start?: string;
    /** @format date-time */
    finish?: string;
    inputs: ProcessingExecutionInputDto;
    output: ProcessingExecutionOutputStoredDataDto | ProcessingExecutionOutputUploadDto;
    parameters: Record<string, object>;
    /** Callback à exécuter à la fin de l'exécution */
    callback?: Callback;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations simplifiée sur une donnée stockée */
export interface ProcessingExecutionStoredDataDto {
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
    name: string;
    type: ProcessingExecutionStoredDataDtoTypeEnum;
    status: ProcessingExecutionStoredDataDtoStatusEnum;
    srs: string;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations simplifiée sur une livraison */
export interface ProcessingExecutionUploadDto {
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
    type: ProcessingExecutionUploadDtoTypeEnum;
    name: string;
    status: ProcessingExecutionUploadDtoStatusEnum;
    srs?: string;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

export type PermissionAccountCreateDto = UtilRequiredKeys<PermissionCreateDto, "licence" | "offerings"> & {
    /**
     * Compte utilisateurs auxquels la permission est rattachée
     * @uniqueItems true
     */
    users: string[];
};

export type PermissionCommunityCreateDto = UtilRequiredKeys<PermissionCreateDto, "licence" | "offerings"> & {
    /**
     * Communautés auxquelles la permission est rattachée
     * @uniqueItems true
     */
    communities: string[];
};

export interface PermissionAccountBeneficiaryResponseDto {
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
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    last_name: string;
    first_name: string;
}

/** Information sur le bénéficiaire de la permission de l'entrepôt */
export type PermissionBeneficiaryDto = (
    | UtilRequiredKeys<PermissionAccountBeneficiaryResponseDto, "creation" | "update" | "_id">
    | UtilRequiredKeys<PermissionCommunityBeneficiaryResponseDto, "creation" | "update" | "_id">
) & {
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
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
};

export interface PermissionCommunityBeneficiaryResponseDto {
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
    name: string;
    /** @pattern ^[A-Za-z0-9_\-.]+$ */
    technical_name: string;
    contact?: string;
    public?: boolean;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

export interface PermissionDatastoreAuthorDto {
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
    name?: string;
    technical_name?: string;
    active?: boolean;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Information sur l'offre */
export interface PermissionOfferingResponseDto {
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
    /** Type de configuration */
    type: PermissionOfferingResponseDtoTypeEnum;
    /** Statut de l'offre */
    status: PermissionOfferingResponseDtoStatusEnum;
    /** Nom technique de la ressource. Ce nom doit être unique sur la plateforme pour un type de configuration donné. Ne peut commencer que par un caractère alphabétique ou un tiret bas, puis uniquement des caractères alphanumériques, tiret, tiret bas, point */
    layer_name: string;
    /** Indique si l'offre est ouverte sans clé d'accès */
    open: boolean;
    /** Indique si l'offre est disponible */
    available: boolean;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations sur la permission */
export interface PermissionStandardListResponseDto {
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
    /** Licence de la permission */
    licence: string;
    /**
     * Date de fin de la permission
     * @format date-time
     */
    end_date: string;
    /** @uniqueItems true */
    offerings: PermissionOfferingResponseDto[];
    datastore_author?: PermissionDatastoreAuthorDto;
    /** Information sur le bénéficiaire de la permission de l'entrepôt */
    beneficiary?: PermissionBeneficiaryDto;
    only_oauth?: boolean;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

export interface MetadataPublicationDto {
    /** @uniqueItems true */
    file_identifiers: string[];
    /** @format uuid */
    endpoint: string;
}

/** Informations à fournir pour la déclaration d'une nouvelle configuration */
export interface ConfigurationCreateDto {
    /** Type de configuration */
    type: ConfigurationCreateDtoTypeEnum;
    /** Nom de la configuration */
    name: string;
    /** Métadonnées liées au propriétaire de la configuration */
    attribution?: ConfigurationAttribution;
    /**
     * Nom technique de la ressource. Ce nom doit être unique sur la plateforme pour un type de configuration donné. Ne peut commencer que par un caractère alphabétique ou un tiret bas, puis uniquement des caractères alphanumériques, tiret, tiret bas, point
     * @pattern ^[A-Za-z_][A-Za-z0-9_\-.]*$
     */
    layer_name: string;
    type_infos:
        | ConfigurationAltimetryDetailsContent
        | ConfigurationDownloadDetailsContent
        | ConfigurationItineraryIsocurveDetailsContent
        | ConfigurationSearchDetailsContent
        | ConfigurationVectorTmsDetailsContent
        | ConfigurationWfsDetailsContent
        | ConfigurationWmsRasterDetailsContent
        | ConfigurationWmsVectorDetailsContent
        | ConfigurationWmtsTmsDetailsContent;
    /**
     * Métadonnées liées à la configuration
     * @uniqueItems true
     */
    metadata?: ConfigurationMetadata[];
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

/** Paramètres de l'annexe à téléverser */
export interface AnnexCreateDto {
    /** @format binary */
    file: File;
    /**
     * Chemins dans l'URL publique
     * @uniqueItems true
     */
    paths: string[];
    /** État de publication */
    published?: boolean;
    /**
     * Liste des étiquettes
     * @uniqueItems true
     */
    labels?: string[];
}

/** Paramètres du stockage à créer */
export interface StorageCreateDto {
    /** Le nom du stockage. ce nom doit être unique pour la plateforme */
    name: string;
    /** Le type de stockage */
    type: StorageCreateDtoTypeEnum;
    /** @uniqueItems true */
    labels?: string[];
    type_infos: StorageFileSystemDetailsDto | StorageOpenSearchDetailsDto | StoragePostgresqlDetailsDto | StorageS3DetailsDto;
}

/** Les informations spécifiques liées au type de stockage */
export type StorageDetailsDto = object;

/** Les informations spécifiques liées au stockage FILESYSTEM */
export type StorageFileSystemDetailsDto = StorageDetailsDto & {
    /**
     * le point de montage du stockage
     * @pattern \S+
     */
    mount_name: string;
};

/** Les informations spécifiques liées au stockage OPENSEARCH */
export type StorageOpenSearchDetailsDto = StorageDetailsDto & {
    /**
     * le hosts pour la connexion au stockage OPENSEARCH
     * @uniqueItems true
     */
    hosts: StorageSocket[];
};

/** Les informations spécifiques liées au stockage POSTGRESQL */
export type StoragePostgresqlDetailsDto = StorageDetailsDto & {
    /** le host pour la connexion au stockage Postgresql */
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
    /**
     * le nom de la base de données sur le serveur Postgresql
     * @pattern \S+
     */
    database_name: string;
};

/** Les informations spécifiques liées au stockage S3 */
export type StorageS3DetailsDto = StorageDetailsDto & {
    /**
     * le nom du bucket S3
     * @pattern \S+
     * @example "potName"
     */
    pot_name: string;
};

/** le hosts pour la connexion au stockage OPENSEARCH */
export interface StorageSocket {
    /** le host pour la connexion au stockage */
    host: string;
    /**
     * le port pour la connexion au stockage
     * @format int32
     * @min 1
     * @max 65535
     */
    port: number;
}

/** Informations sur le stockage */
export interface StorageDetailResponseDto {
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
    /** Le nom du stockage. ce nom est unique pour la plateforme */
    name: string;
    /** Le type de stockage */
    type: StorageType;
    /** @uniqueItems true */
    labels: string[];
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    type_infos?: StorageFileSystemDetailsDto | StorageOpenSearchDetailsDto | StoragePostgresqlDetailsDto | StorageS3DetailsDto;
}

/** Paramètres de l'organisme à créer */
export interface OrganizationCreateDto {
    /** Nom de l'organisme */
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
     * Identifiant de la nomenclature du modèle économique de l'organisme
     * @format uuid
     */
    economical_model?: string;
    /**
     * Quota de livraisons pour l'organisme (en octets)
     * @format int64
     * @min 0
     */
    uploads_quota: number;
}

/** Informations sur la nomenclature */
export interface NomenclatureSimpleResponseDto {
    /** Label de la nomenclature */
    label: string;
    /** Code de la nomenclature */
    term: string;
}

/** Informations détaillées sur l'organisme */
export interface OrganizationDetailResponseDto {
    /** @format date-time */
    creation: string;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
    /** Nom de l'organisme */
    name: string;
    /** SIREN de l'organisme */
    siren?: string;
    /** SIRET de l'organisme */
    siret?: string;
    /** N° de TVA intracommunautaire de l'organisme */
    tva_intracom?: string;
    /** Informations sur la nomenclature */
    economical_model?: NomenclatureSimpleResponseDto;
    /**
     * Quota de livraisons pour l'organisme (en octets)
     * @format int64
     */
    uploads_quota: number;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    extra?: object;
}

/** Paramètres de la nomenclature à créer */
export interface NomenclatureCreateDto {
    /** Type de famille à laquelle appartient la nomenclature */
    type: NomenclatureCreateDtoTypeEnum;
    /** Label de la nomenclature */
    label: string;
    /** Code de la nomenclature */
    term: string;
}

/** Informations détaillées sur la nomenclature */
export interface NomenclatureAdminResponseDto {
    /** Label de la nomenclature */
    label: string;
    /** Code de la nomenclature */
    term: string;
    /** Type de famille à laquelle appartient la nomenclature */
    type: NomenclatureAdminResponseDtoTypeEnum;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Paramètres du point d'accès à ajouter */
export interface EndpointCreateDto {
    /** Nom du point d'accès. ce nom doit être unique. le nom est insensible à la casse */
    name: string;
    /**
     * Nom technique du point d'accès. ce nom technique doit être unique
     * @pattern (^[a-z0-9-]+$|^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$)
     */
    technical_name: string;
    /** Type du point d'accès */
    type: EndpointCreateDtoTypeEnum;
    /** @uniqueItems true */
    urls: EndpointUrl[];
    /** Métadonnée obligatoire */
    force_metadata?: boolean;
    /** Attribution obligatoire */
    force_attribution?: boolean;
    /** Synchronisation avec l'index de recherche */
    search_publish?: boolean;
    /** Point d'accès ouvert ? (sans contrôle des accès) */
    open: boolean;
    metadata_fi: string;
}

/** Informations détaillées sur le point d'accès */
export interface EndpointDetailResponseDto {
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
    /** Nom du point d'accès. ce nom doit être unique. le nom est insensible à la casse */
    name: string;
    /** Nom technique du point d'accès. ce nom technique doit être unique */
    technical_name: string;
    /** Type du point d'accès */
    type: EndpointDetailResponseDtoTypeEnum;
    /** @uniqueItems true */
    urls: EndpointUrl[];
    /** Métadonnée obligatoire */
    force_metadata?: boolean;
    /** Attribution obligatoire */
    force_attribution?: boolean;
    /** Synchronisation avec l'index de recherche */
    search_publish?: boolean;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /** Point d'accès ouvert ? (sans contrôle des accès) */
    open: boolean;
    metadata_fi?: string;
}

/** Paramètres de l'entrepôt à créer */
export interface DatastoreCreateDto {
    /**
     * Liste des traitements auxquels l'entrepôt a accès
     * @uniqueItems true
     */
    processings?: string[];
    /** Stockages que l'entrepôt utilise et quotas à ne pas dépasser */
    storages: DatastoreStoragesCreateDto;
    /**
     * Liste des points d'accès auxquels l'entrepôt a accès
     * @uniqueItems true
     */
    endpoints: DatastoreEndpointDto[];
    /** Préfixe obligatoire pour le file_identifier des métadonnées déposées sur ce datastore */
    metadata_file_identifier_prefix?: string;
    /** Préfixe obligatoire pour le layer_name des configurations créées sur ce datastore */
    configuration_layer_name_prefix?: string;
    /**
     * Datastore ouvert aux partages ou non
     * @default true
     */
    sharings?: boolean;
    /**
     * Communauté à laquelle l'entrepôt est rattaché
     * @format uuid
     */
    community: string;
    /**
     * Liste des vérifications auxquelles l'entrepôt a accès
     * @uniqueItems true
     */
    checks?: string[];
}

/** Informations sur le point d'accès */
export interface DatastoreEndpointDto {
    /**
     * Nombre d'offres maximum
     * @format int64
     */
    quota: number;
    /**
     * Identifiant du point d'accès
     * @format uuid
     */
    endpoint: string;
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

/** Stockages que l'entrepôt utilise et quotas à ne pas dépasser */
export interface DatastoreStoragesCreateDto {
    /**
     * Liste de stockages pour les données stockées
     * @uniqueItems true
     */
    data: DatastoreStorageDto[];
    /** Informations sur le stockage */
    uploads: DatastoreStorageDto;
    /** Informations sur le stockage */
    annexes: DatastoreStorageDto;
}

/** Communauté à laquelle l'entrepôt est rattaché */
export interface DatastoreCommunityResponseDto {
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
    contact: string;
    public: boolean;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations sur l'entrepôt */
export interface DatastoreDetailResponseDto {
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
    /** Communauté à laquelle l'entrepôt est rattaché */
    community: DatastoreCommunityResponseDto;
    /**
     * Liste des traitements auxquels l'entrepôt a accès
     * @uniqueItems true
     */
    processings?: string[];
    /** Nom de la communauté */
    name: string;
    /** Description de la communauté */
    description?: string;
    /** Nom technique de la communauté */
    technical_name: string;
    /**
     * Liste des points d'accès auxquels l'entrepôt a accès
     * @uniqueItems true
     */
    endpoints?: DatastoreEndpointStandardResponseDto[];
    /** Stockages que l'entrepôt utilise et quotas à ne pas dépasser */
    storages: DatastoreStoragesResponseDto;
    /** Préfixe obligatoire pour le file_identifier des métadonnées déposées sur ce datastore */
    metadata_file_identifier_prefix?: string;
    /** Préfixe obligatoire pour le layer_name des configurations créées sur ce datastore */
    configuration_layer_name_prefix?: string;
    /** Datastore ouvert aux partages ou non */
    sharings?: boolean;
    /** Datastore actif ou non */
    active: boolean;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Liste des vérifications auxquelles l'entrepôt a accès
     * @uniqueItems true
     */
    checks?: string[];
}

/** Informations sur le point d'accès */
export interface DatastoreEndpointStandardResponseDto {
    /**
     * Nombre d'offres présentes
     * @format int64
     */
    use: number;
    /**
     * Nombre d'offres maximum
     * @format int64
     */
    quota: number;
    /** Informations détaillées sur le point d'accès */
    endpoint: EndpointDetailResponseDto;
}

/** Informations sur le stockage */
export interface DatastoreStorageResponseDto {
    /**
     * Espace occupé en octets
     * @format int64
     */
    use: number;
    /**
     * Quota en octets
     * @format int64
     */
    quota: number;
    /** Informations sur le stockage */
    storage: StorageListResponseDto;
}

/** Stockages que l'entrepôt utilise et quotas à ne pas dépasser */
export interface DatastoreStoragesResponseDto {
    /**
     * Liste de stockages pour les données stockées
     * @uniqueItems true
     */
    data?: DatastoreStorageResponseDto[];
    /** Informations sur le stockage */
    uploads: DatastoreStorageResponseDto;
    /** Informations sur le stockage */
    annexes: DatastoreStorageResponseDto;
}

/** Informations sur le stockage */
export interface StorageListResponseDto {
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
    /** Le nom du stockage. ce nom est unique pour la plateforme */
    name: string;
    /** Le type de stockage */
    type: StorageType;
    /** @uniqueItems true */
    labels: string[];
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Paramètres de la communauté à créer */
export interface CommunityCreateDto {
    /** Nom de la communauté */
    name: string;
    /** Description de la communauté */
    description?: string;
    /**
     * Nom technique de la communauté
     * @minLength 0
     * @maxLength 30
     * @pattern ^[A-Za-z0-9_\-\.]+$
     */
    technical_name: string;
    /** Nom du contact de la communauté */
    contact?: string;
    public?: boolean;
    /**
     * ID du superviseur de la communauté
     * @format uuid
     */
    supervisor: string;
}

/** Informations sur l'entrepôt lié */
export interface CommunityDatastoreResponseDto {
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
    active?: boolean;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations détaillées sur la communauté */
export interface CommunityDetailResponseDto {
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
    /** Nom de la communauté */
    name: string;
    /** Description de la communauté */
    description?: string;
    /** Nom technique de la communauté */
    technical_name: string;
    /** Nom du contact de la communauté */
    contact: string;
    /** Informations sur l'organisme de la communauté */
    organization?: CommunityOrganizationResponseDto;
    /** Informations sur l'entrepôt lié */
    datastore?: CommunityDatastoreResponseDto;
    /** Informations sur le superviseur de la communauté */
    supervisor: CommunitySupervisorResponseDto;
    /** Valeur définissant si la communauté est publique ou non */
    public: boolean;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations sur l'organisme de la communauté */
export interface CommunityOrganizationResponseDto {
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
    /** Nom de l'organisme */
    name?: string;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations sur le superviseur de la communauté */
export interface CommunitySupervisorResponseDto {
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
    /** Adresse électronique du superviseur */
    email?: string;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /** Nom du superviseur */
    last_name?: string;
    /** Prénom du superviseur */
    first_name?: string;
}

/** Paramètres de la vérification à créer */
export interface CheckingCreateDto {
    /** Nom de la vérification. ce nom doit être unique pour la plateforme */
    name: string;
    /** Description de la vérification */
    description: string;
    /** Nom technique de la vérification tel que connu par l'orchestrateur */
    orchestrator_job_name: string;
    /**
     * Priorité de la vérification
     * @default "STANDARD"
     */
    priority?: CheckingCreateDtoPriorityEnum;
    /** @uniqueItems true */
    default_uploads_check?: CheckingCreateDtoDefaultUploadsCheckEnum[];
}

/** Informations sur la vérification */
export interface CheckingExtendedDetailResponseDto {
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
    /** Nom de la vérification. ce nom doit être unique pour la plateforme */
    name: string;
    /** Description de la vérification */
    description: string;
    /** Priorité de la vérification */
    priority?: CheckingExtendedDetailResponseDtoPriorityEnum;
    /** Nom technique de la vérification tel que connu par l'orchestrateur */
    orchestrator_job_name?: string;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /** @uniqueItems true */
    default_uploads_check?: CheckingExtendedDetailResponseDtoDefaultUploadsCheckEnum[];
}

export interface UserKeyUpdateDto {
    name?: string;
    whitelist?: string[];
    blacklist?: string[];
    user_agent?: string;
    referer?: string;
}

/** Paramètres du document à modifier */
export interface DocumentUpdateDto {
    /** Nom du document */
    name?: string;
    /** Description du document */
    description?: string;
    /**
     * Liste des étiquettes
     * @uniqueItems true
     */
    labels?: string[];
    /** URL publique du document */
    public_url?: boolean;
    extra?: object;
}

/** Informations à fournir pour la modification d'une livraison existante */
export interface UploadUpdateDto {
    /** Description de la livraison */
    description?: string;
    /** Nom de la livraison */
    name?: string;
    /** Livraison ouverte ? (visible par tous les entrepôts et utilisateurs) */
    open?: boolean;
    /** Système de coordonnées de référence de la livraison */
    srs?: string;
    /** Etendue géographique au format GeoJson */
    extent?: JsonNode;
    extra?: object;
}

/** Informations à fournir pour la modification d'une donnée existante */
export interface StoredDataUpdateDto {
    /** Nom de la donnée stockée */
    name?: string;
    /** Donnée stockée ouverte ? (visible par tous les entrepôts et utilisateurs) */
    open?: boolean;
    /** Description de la donnée stockée */
    description?: string;
    /** Période d'édition de la donnée stockée */
    edition?: StoredDataEdition;
    /** Etendue géographique au format GeoJson */
    extent?: JsonNode;
    extra?: object;
    /** L'activité de la donnée stockée est-elle publique ? */
    public_activity?: boolean;
}

/** Paramètres du statique à modifier */
export interface StaticFileUpdateDto {
    /** Nom du fichier statique */
    name?: string;
    /** Description du fichier statique */
    description?: string;
    extra?: object;
}

/** Paramètres des permissions à créer */
export interface PermissionUpdateDto {
    /** @format date-time */
    end_date?: string;
    licence?: string;
    /** @uniqueItems true */
    offerings?: string[];
}

/** Informations à fournir pour la modification d'une offre existante */
export interface OfferingUpdateDto {
    /** Indique si l'offre est ouverte sans clé d'accès */
    open?: boolean;
    /** Indique si l'offre est disponible */
    available?: boolean;
    extra?: object;
    /** L'activité de l'offre est-elle publique ? */
    public_activity?: boolean;
}

export interface MetadataUpdateDto {
    type?: MetadataUpdateDtoTypeEnum;
    open_data?: boolean;
    extra?: object;
}

/** Informations à fournir pour modifier la configuration */
export interface ConfigurationPartialUpdateDto {
    /** Nom de la configuration */
    name?: string;
    extra?: object;
}

/** Informations sur la vérification */
export interface CheckingExecutionCheckResponseDto {
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
    name: string;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations détaillées sur l'exécution de vérification */
export interface CheckingExecutionStandardDetailResponseDto {
    /** @format date-time */
    creation: string;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
    /** Informations sur la vérification */
    check: CheckingExecutionCheckResponseDto;
    status: CheckingExecutionStandardDetailResponseDtoStatusEnum;
    /** @format date-time */
    start?: string;
    /** @format date-time */
    finish?: string;
    /** Informations sur la livraison */
    upload: CheckingExecutionUploadResponseDto;
    /** Callback à exécuter à la fin de l'exécution */
    callback?: Callback;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations sur la livraison */
export interface CheckingExecutionUploadResponseDto {
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
    type: CheckingExecutionUploadResponseDtoTypeEnum;
    name: string;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Paramètres modifiables de l'annexe */
export interface AnnexUpdateDto {
    /** @uniqueItems true */
    labels?: string[];
    published?: boolean;
    /** @uniqueItems true */
    paths?: string[];
    extra?: object;
}

/** Nouveaux paramètres de la communauté à modifier (ceux non fournis sont laissés en l'état) */
export interface CommunityUpdateDto {
    /** Nom de la communauté */
    name?: string;
    /** Description de la communauté */
    description?: string;
    /** Nom du contact de la communauté */
    contact?: string;
    /**
     * ID du superviseur de la communauté
     * @format uuid
     */
    supervisor?: string;
    /** Valeur définissant si la communauté est publique ou non */
    public?: boolean;
}

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

export interface CommunityMemberDto {
    rights?: CommunityMemberDtoRightsEnum[];
    community?: CommunityUserDto;
}

export interface CommunityUserDto {
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
    /** Nom de la communauté */
    name: string;
    /** Description de la communauté */
    description?: string;
    /** Nom technique de la communauté */
    technical_name: string;
    /**
     * Datastore de la communauté
     * @format uuid
     */
    datastore: string;
    /**
     * Nom du superviseur de la communauté
     * @format uuid
     */
    supervisor: string;
    public?: boolean;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

export interface UserDetailsResponseDto {
    /** @format date-time */
    creation: string;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
    email: string;
    /** @format date-time */
    last_login?: string;
    communities_member?: CommunityMemberDto[];
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
    administrator?: boolean;
    technical?: boolean;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    last_name: string;
    first_name: string;
}

/** Paramètres du stockage  à modifier */
export interface StorageUpdateDto {
    /** Le nom du stockage. ce nom doit être unique pour la plateforme */
    name?: string;
    /** @uniqueItems true */
    labels?: string[];
}

/** Paramètres du traitement à modifier */
export interface ProcessingUpdateDto {
    /** Nom du traitement. ce nom doit être unique pour la plateforme */
    name?: string;
    /** Description du traitement */
    description?: string;
    /** Nom technique du traitement tel que connu par l'orchestrateur */
    orchestrator_job_name?: string;
    /** Priorité de traitement */
    priority?: ProcessingUpdateDtoPriorityEnum;
}

/** Paramètres de l'organisme à modifier */
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
    extra?: object;
}

/** Paramètres de la nomenclature à modifier */
export interface NomenclatureUpdateDto {
    /** Label de la nomenclature */
    label: string;
}

/** Paramètres du point d'accès à modifier */
export interface EndpointUpdateDto {
    /** Nom du point d'accès. ce nom doit être unique. le nom est insensible à la casse */
    name?: string;
    /** @uniqueItems true */
    urls?: EndpointUrl[];
    /** Métadonnée obligatoire */
    force_metadata?: boolean;
    /** Attribution obligatoire */
    force_attribution?: boolean;
    /** Synchronisation avec l'index de recherche */
    search_publish?: boolean;
    metadata_fi?: string;
}

/** Stockages que l'entrepôt utilise et quotas à ne pas dépasser */
export interface DatastoreStoragesUpdateDto {
    /**
     * Liste de stockages pour les données stockées
     * @uniqueItems true
     */
    data?: DatastoreStorageDto[];
    /** Informations sur le stockage */
    uploads?: DatastoreStorageDto;
    /** Informations sur le stockage */
    annexes?: DatastoreStorageDto;
}

/** Nouvelle configuration de l'entrepôt */
export interface DatastoreUpdateDto {
    /** Datastore actif ou non */
    active?: boolean;
    /**
     * Liste des traitements auxquels l'entrepôt a accès
     * @uniqueItems true
     */
    processings?: string[];
    /** Stockages que l'entrepôt utilise et quotas à ne pas dépasser */
    storages?: DatastoreStoragesUpdateDto;
    /**
     * Liste des points d'accès auxquels l'entrepôt a accès
     * @uniqueItems true
     */
    endpoints?: DatastoreEndpointDto[];
    /**
     * Préfixe obligatoire pour le file_identifier des métadonnées déposées sur ce datastore
     * Une chaîne vide permet de supprimer le préfixe
     */
    metadata_file_identifier_prefix?: string;
    /**
     * Préfixe obligatoire pour le layer_name des configurations créées sur ce datastore
     * Une chaîne vide permet de supprimer le préfixe
     */
    configuration_layer_name_prefix?: string;
    /** Datastore ouvert aux partages ou non */
    sharings?: boolean;
    /**
     * Liste des vérifications auxquelles l'entrepôt a accès
     * @uniqueItems true
     */
    checks?: string[];
}

/** Nouveaux paramètres de la vérification à modifier (ceux non fournis sont laissés en l'état) */
export interface CheckingUpdateDto {
    /** Nom de la vérification. ce nom doit être unique pour la plateforme */
    name?: string;
    /** Description de la vérification */
    description?: string;
    /** Nom technique de la vérification tel que connu par l'orchestrateur */
    orchestrator_job_name?: string;
    /** Priorité de la vérification */
    priority?: CheckingUpdateDtoPriorityEnum;
    /** @uniqueItems true */
    default_uploads_check?: CheckingUpdateDtoDefaultUploadsCheckEnum[];
}

/** Informations sur la donnée stockée(les champs description, edition, contact, status, size, last_event, creation, tags et bbox ne sont pas retournés par défaut) */
export interface StoredDataStandardListResponseDto {
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
    /** Nom de la donnée stockée */
    name: string;
    /** Type de donnée stockée */
    type: StoredDataStandardListResponseDtoTypeEnum;
    /** Donnée stockée ouverte ? (visible par tous les entrepôts et utilisateurs) */
    open: boolean;
    /** Système de coordonnées de référence de la donnée stockée */
    srs?: string;
    /** Description de la donnée stockée */
    description: string;
    /** Statut de la donnée stockée */
    status: StoredDataStandardListResponseDtoStatusEnum;
    /** Nom du contact de la communauté */
    contact: string;
    /** Bounding box (en degrés) */
    bbox: BoundingBox;
    /**
     * Taille de la donnée stockée (en octets)
     * @format int64
     */
    size?: number;
    /** Événement */
    last_event?: EventDto;
    /** Liste des étiquettes de la donnée stockée (format clé/valeur) */
    tags: Record<string, string>;
    /** Période d'édition de la donnée stockée */
    edition: StoredDataEdition;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /** L'activité de la donnée stockée est-elle publique ? */
    public_activity: boolean;
}

/** Informations détaillées sur la donnée stockée partagée */
export interface StoredDataSharedDetailResponseDto {
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
    /** Nom de la donnée stockée */
    name: string;
    /** Type de donnée stockée */
    type: StoredDataSharedDetailResponseDtoTypeEnum;
    /** Donnée stockée ouverte ? (visible par tous les entrepôts et utilisateurs) */
    open: boolean;
    /** Système de coordonnées de référence de la donnée stockée */
    srs?: string;
    /** Description de la donnée stockée */
    description?: string;
    /** Période d'édition de la donnée stockée */
    edition?: StoredDataEdition;
    /** Nom du contact de la communauté */
    contact: string;
    /** Etendue géographique au format GeoJson */
    extent?: JsonNode;
    /**
     * Taille de la donnée stockée (en octets)
     * @format int64
     */
    size?: number;
    /** Statut de la donnée stockée */
    status: StoredDataSharedDetailResponseDtoStatusEnum;
    /**
     * Identifiant de la donnée stockée
     * @format uuid
     */
    _id: string;
    extra?: object;
    /** Détails sur une donnée stockée */
    type_infos?: StoredDataDetailsDto;
}

/** Information sur la permission */
export interface PermissionWithOfferingsResponseDto {
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
    /** Licence de la permission */
    licence: string;
    /**
     * Date de fin de la permission
     * @format date-time
     */
    end_date: string;
    /** @uniqueItems true */
    offerings: PermissionOfferingResponseDto[];
    only_oauth?: boolean;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Information sur l'offre */
export interface PermissionOfferingDetailsResponseDto {
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
    /** Type de configuration */
    type: PermissionOfferingResponseDtoTypeEnum;
    /** Statut de l'offre */
    status: PermissionOfferingResponseDtoStatusEnum;
    /** Nom technique de la ressource. Ce nom doit être unique sur la plateforme pour un type de configuration donné. Ne peut commencer que par un caractère alphabétique ou un tiret bas, puis uniquement des caractères alphanumériques, tiret, tiret bas, point */
    layer_name: string;
    /** Indique si l'offre est ouverte sans clé d'accès */
    open: boolean;
    /** Indique si l'offre est disponible */
    available: boolean;
    /** @uniqueItems true */
    urls?: EndpointUrl[];
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Information sur la permission */
export interface PermissionWithOfferingsDetailsResponseDto {
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
    /** Licence de la permission */
    licence: string;
    /**
     * Date de fin de la permission
     * @format date-time
     */
    end_date: string;
    /** @uniqueItems true */
    offerings: PermissionOfferingDetailsResponseDto[];
    only_oauth?: boolean;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

export interface UserKeyResponseDto {
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
    name: string;
    type?: UserKeyResponseDtoTypeEnum;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Information sur l'accès */
export interface AccessDetailResponseDto {
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
    /** Information sur la permission */
    permission: PermissionResponseDto;
    /** Informations sur l'offre (les champs endpoint, configuration, urls, extra, creation et update ne sont pas retournés par défaut) */
    offering: OfferingStandardListResponseDto;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations sur l'offre (les champs endpoint, configuration, urls, extra, creation et update ne sont pas retournés par défaut) */
export interface OfferingStandardListResponseDto {
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
    /** Indique si l'offre est ouverte sans clé d'accès */
    open: boolean;
    /** Indique si l'offre est disponible */
    available: boolean;
    /** Nom technique de la ressource. Ce nom doit être unique sur la plateforme pour un type de configuration donné. Ne peut commencer que par un caractère alphabétique ou un tiret bas, puis uniquement des caractères alphanumériques, tiret, tiret bas, point */
    layer_name: string;
    /** Type de configuration */
    type: OfferingStandardListResponseDtoTypeEnum;
    /** Statut de l'offre */
    status: OfferingStandardListResponseDtoStatusEnum;
    /** Informations sur la configuration de l'offre */
    configuration: ConfigurationBaseResponseDto;
    /** Informations sur le point d'accès */
    endpoint: EndpointListResponseDto;
    /** @uniqueItems true */
    urls: EndpointUrl[];
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    extra?: object;
    /** L'activité de la donnée stockée est-elle publique ? */
    public_activity: boolean;
}

/** Information sur la permission */
export interface PermissionResponseDto {
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
    /** Licence de la permission */
    licence: string;
    /**
     * Date de fin de la permission
     * @format date-time
     */
    end_date: string;
    only_oauth?: boolean;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations sur le document */
export interface DocumentListResponseDto {
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
    /** Nom du document */
    name: string;
    /**
     * La taille du document
     * @format int64
     */
    size: number;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Information sur l'accès avec clé */
export interface AccessDetailWithKeyResponseDto {
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
    /** Information sur la permission */
    permission: PermissionResponseDto;
    /** Informations sur l'offre (les champs endpoint, configuration, urls, extra, creation et update ne sont pas retournés par défaut) */
    offering: OfferingStandardListResponseDto;
    key: UserKeyResponseDto;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations sur le TMS */
export interface TileMatrixSetListDto {
    srs: string;
    _id: string;
}

/** Informations détaillés sur le TMS */
export interface TileMatrixSetDetailResponseDto {
    srs: string;
    /** @uniqueItems true */
    levels: TileMatrixSetLevelDto[];
    _id: string;
}

export interface TileMatrixSetLevelDto {
    /** @format double */
    resolution: number;
    id: string;
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

export interface UserDto {
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
    email: string;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    last_name: string;
    first_name: string;
}

/** Informations sur la livraison (les champs contact, size, last_event, tags, creation et bbox ne sont pas retournés par défaut) */
export interface UploadExtendedListResponseDto {
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
    /** Type de livraison */
    type: UploadExtendedListResponseDtoTypeEnum;
    /** Nom de la livraison */
    name: string;
    /** Livraison ouverte ? (visible par tous les entrepôts et utilisateurs) */
    open: boolean;
    /** Système de coordonnées de référence de la livraison */
    srs: string;
    /** Description de la livraison */
    description: string;
    /** Statut de la livraison */
    status: UploadExtendedListResponseDtoStatusEnum;
    /** Nom du contact de la communauté */
    contact: string;
    /** Bounding box (en degrés) */
    bbox: BoundingBox;
    /**
     * Taille de la livraison (en octets)
     * @format int64
     */
    size?: number;
    /** Événement */
    last_event?: EventDto;
    /** Liste des étiquettes de la livraison (format clé/valeur) */
    tags: Record<string, string>;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Identifiant de l'organisme rattaché
     * @format uuid
     */
    organization?: string;
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
}

/** Informations sur la donnée stockée(les champs description, edition, contact, status, size, last_event, creation, tags et bbox ne sont pas retournés par défaut) */
export interface StoredDataExtendedListResponseDto {
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
    /** Nom de la donnée stockée */
    name: string;
    /** Type de donnée stockée */
    type: StoredDataExtendedListResponseDtoTypeEnum;
    /** Donnée stockée ouverte ? (visible par tous les entrepôts et utilisateurs) */
    open: boolean;
    /** Système de coordonnées de référence de la donnée stockée */
    srs?: string;
    /** Description de la donnée stockée */
    description: string;
    /** Statut de la donnée stockée */
    status: StoredDataExtendedListResponseDtoStatusEnum;
    /** Nom du contact de la communauté */
    contact: string;
    /** Bounding box (en degrés) */
    bbox: BoundingBox;
    /**
     * Taille de la donnée stockée (en octets)
     * @format int64
     */
    size?: number;
    /** Événement */
    last_event?: EventDto;
    /** Liste des étiquettes de la donnée stockée (format clé/valeur) */
    tags: Record<string, string>;
    /** Période d'édition de la donnée stockée */
    edition: StoredDataEdition;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /** L'activité de la donnée stockée est-elle publique ? */
    public_activity: boolean;
    /**
     * Identifiant de l'organisme rattaché
     * @format uuid
     */
    organization?: string;
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
}

/** Informations sur le fichier statique */
export interface StaticFileExtendedListResponseDto {
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
    /** Nom du fichier statique */
    name: string;
    /** Type du fichier statique */
    type: StaticFileExtendedListResponseDtoTypeEnum;
    /** Description du fichier statique */
    description?: string;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Identifiant de l'organisme rattaché
     * @format uuid
     */
    organization?: string;
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
}

/** Informations sur les traitements */
export interface ProcessingExecutionExtendedListResponseDto {
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
    /** Traitement */
    processing: ProcessingExecutionProcessingDto;
    /** Statut des exécutions à récupérer */
    status: ProcessingExecutionExtendedListResponseDtoStatusEnum;
    /**
     * Date de lancement du traitement
     * @format date-time
     */
    launch?: string;
    /**
     * Date du démarage du traitement
     * @format date-time
     */
    start?: string;
    /**
     * Date de fin du traitement
     * @format date-time
     */
    finish?: string;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Identifiant de l'organisme rattaché
     * @format uuid
     */
    organization?: string;
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
}

/** Informations sur la permission */
export interface PermissionExtendedListResponseDto {
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
    /** Licence de la permission */
    licence: string;
    /**
     * Date de fin de la permission
     * @format date-time
     */
    end_date: string;
    /** @uniqueItems true */
    offerings: PermissionOfferingResponseDto[];
    datastore_author?: PermissionDatastoreAuthorDto;
    /** Information sur le bénéficiaire de la permission de l'entrepôt */
    beneficiary?: PermissionBeneficiaryDto;
    only_oauth?: boolean;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Identifiant de l'organisme rattaché
     * @format uuid
     */
    organization?: string;
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
}

/** Informations sur l'offre (les champs endpoint, configuration, urls, extra, creation et update ne sont pas retournés par défaut) */
export interface OfferingExtendedListResponseDto {
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
    /** Indique si l'offre est ouverte sans clé d'accès */
    open: boolean;
    /** Indique si l'offre est disponible */
    available: boolean;
    /** Nom technique de la ressource. Ce nom doit être unique sur la plateforme pour un type de configuration donné. Ne peut commencer que par un caractère alphabétique ou un tiret bas, puis uniquement des caractères alphanumériques, tiret, tiret bas, point */
    layer_name: string;
    /** Type de configuration */
    type: OfferingExtendedListResponseDtoTypeEnum;
    /** Statut de l'offre */
    status: OfferingExtendedListResponseDtoStatusEnum;
    /** Informations sur la configuration de l'offre */
    configuration: ConfigurationBaseResponseDto;
    /** Informations sur le point d'accès */
    endpoint: EndpointListResponseDto;
    /** @uniqueItems true */
    urls: EndpointUrl[];
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    extra?: object;
    /** L'activité de la donnée stockée est-elle publique ? */
    public_activity: boolean;
    /**
     * Identifiant de l'organisme rattaché
     * @format uuid
     */
    organization?: string;
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
}

/** Informations sur le point d'accès */
export interface DatastoreEndpointExtendedResponseDto {
    /**
     * Nombre d'offres présentes
     * @format int64
     */
    use: number;
    /**
     * Nombre d'offres maximum
     * @format int64
     */
    quota: number;
    /** Informations détaillées sur le point d'accès */
    endpoint: EndpointDetailResponseDto;
    /**
     * Identifiant de l'organisme rattaché
     * @format uuid
     */
    organization?: string;
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
}

/** Informations sur la configuration (les champs metadatas, attribution, last_event, tags, creation et update ne sont pas retournés par défaut) */
export interface ConfigurationExtendedListResponseDto {
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
    /** Nom de la configuration */
    name?: string;
    /** Nom technique de la ressource. Ce nom doit être unique sur la plateforme pour un type de configuration donné. Ne peut commencer que par un caractère alphabétique ou un tiret bas, puis uniquement des caractères alphanumériques, tiret, tiret bas, point */
    layer_name?: string;
    /** Type de configuration */
    type?: ConfigurationExtendedListResponseDtoTypeEnum;
    /** Statut de la configuration */
    status?: ConfigurationExtendedListResponseDtoStatusEnum;
    /** Liste des étiquettes  de configuration (format clé/valeur) */
    tags?: Record<string, string>;
    /** Métadonnées liées au propriétaire de la configuration */
    attribution?: ConfigurationAttribution;
    /** Événement */
    last_event?: ConfigurationEventDto;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Métadonnées liées à la configuration
     * @uniqueItems true
     */
    metadata?: ConfigurationMetadata[];
    /**
     * Identifiant de l'organisme rattaché
     * @format uuid
     */
    organization?: string;
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
}

/** Informations sur la communauté */
export interface CommunityListResponseDto {
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
    /** Nom de la communauté */
    name: string;
    /** Description de la communauté */
    description?: string;
    /** Nom technique de la communauté */
    technical_name: string;
    /** Nom du contact de la communauté */
    contact: string;
    /** Informations sur l'organisme de la communauté */
    organization?: CommunityOrganizationResponseDto;
    /** Valeur définissant si la communauté est publique ou non */
    public: boolean;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations sur l'annexe */
export interface AnnexExtendedListResponseDto {
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
    /** @uniqueItems true */
    paths: string[];
    /** @format int64 */
    size: number;
    mime_type: string;
    published: boolean;
    /** @uniqueItems true */
    labels?: string[];
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Identifiant de l'organisme rattaché
     * @format uuid
     */
    organization?: string;
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
}

/** Informations sur la livraison (les champs contact, size, last_event, tags, creation et bbox ne sont pas retournés par défaut) */
export interface UploadStandardListResponseDto {
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
    /** Type de livraison */
    type: UploadStandardListResponseDtoTypeEnum;
    /** Nom de la livraison */
    name: string;
    /** Livraison ouverte ? (visible par tous les entrepôts et utilisateurs) */
    open: boolean;
    /** Système de coordonnées de référence de la livraison */
    srs: string;
    /** Description de la livraison */
    description: string;
    /** Statut de la livraison */
    status: UploadStandardListResponseDtoStatusEnum;
    /** Nom du contact de la communauté */
    contact: string;
    /** Bounding box (en degrés) */
    bbox: BoundingBox;
    /**
     * Taille de la livraison (en octets)
     * @format int64
     */
    size?: number;
    /** Événement */
    last_event?: EventDto;
    /** Liste des étiquettes de la livraison (format clé/valeur) */
    tags: Record<string, string>;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations détaillées sur la livraison partagée */
export interface UploadSharedDetailResponseDto {
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
    /** Nom de la livraison */
    name: string;
    /** Description de la livraison */
    description: string;
    /** Type de livraison */
    type: UploadSharedDetailResponseDtoTypeEnum;
    /** Livraison ouverte ? (visible par tous les entrepôts et utilisateurs) */
    open: boolean;
    /** Statut de la livraison */
    status: UploadSharedDetailResponseDtoStatusEnum;
    /** Système de coordonnées de référence de la livraison */
    srs: string;
    /** Nom du contact de la communauté */
    contact: string;
    /** Etendue géographique au format GeoJson */
    extent?: JsonNode;
    /**
     * Taille de la livraison (en octets)
     * @format int64
     */
    size?: number;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    extra?: object;
    /** Informations spécifiques au type de livraison */
    type_infos?: UploadDetailsDto;
}

/** Informations sur une livraison partagée ou personnelle */
export type UploadStandardDetailResponseDto = UploadPrivateDetailResponseDto | UploadSharedDetailResponseDto;

/** Arborescence des fichiers liés à la livraison */
export interface UploadTreeElementResponseDto {
    type?: string;
    name?: string;
    /** @format int64 */
    size?: number;
    children?: UploadTreeElementResponseDto[];
}

/** Evénement */
export interface EventResponseDto {
    /** @format date-time */
    date: string;
    title: string;
    text?: string;
    /** Information sur l'auteur */
    initiator: AuthorResponseDto;
}

/** Executions de vérification liées à la livraison */
export interface CheckResponseDto {
    asked?: CheckingExecutionListDto[];
    in_progress?: CheckingExecutionListDto[];
    passed?: CheckingExecutionListDto[];
    failed?: CheckingExecutionListDto[];
}

/** Informations sur l'exécution de vérification liée à la livraison */
export interface CheckingExecutionListDto {
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
    /** Informations sur la vérification */
    check: CheckingExecutionCheckResponseDto;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Producteur */
export interface AuthorDto {
    /** Nom */
    name: string;
    /** Email */
    email: string;
}

/** Catégories */
export interface CategoryDto {
    term: string;
    label: string;
}

/** Entrées */
export interface EntryDto {
    /** Identifiant */
    id: string;
    /** Nom */
    title: string;
    /** Description */
    subtitle?: string;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    updated?: string;
    /** Liens */
    links: LinkDto[];
    /** Description */
    content: string;
    /** Catégories */
    categories: CategoryDto[];
    /** Bounding box (en degrés) */
    polygon?: BoundingBox;
}

export interface FeedDto {
    /** Identifiant */
    id: string;
    /** Nom */
    title: string;
    /** Description */
    subtitle?: string;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    updated?: string;
    /** Liens */
    links: LinkDto[];
    xmlns?: string;
    /** Licence et conditions d'utilisation */
    rights: string;
    /** Producteur */
    author: AuthorDto;
    /** Entrées */
    entries: EntryDto[];
}

/** Liens */
export interface LinkDto {
    /** URL */
    href: string;
    /** Mime-type de la cible */
    type: string;
    /** Nom */
    title: string;
    /** Type de lien */
    rel: string;
}

/** Informations sur une donnée stockée partagée ou personnelle */
export type StoredDataStandardDetailResponseDto = StoredDataPrivateDetailResponseDto | StoredDataSharedDetailResponseDto;

export interface StoredDataDependenciesResponseDto {
    used_by: StoredDataDependencyResponseDto[];
    use: StoredDataDependencyResponseDto[];
}

export interface StoredDataDependencyResponseDto {
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
    name?: string;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations sur le fichier statique */
export interface StaticFileStandardListResponseDto {
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
    /** Nom du fichier statique */
    name: string;
    /** Type du fichier statique */
    type: StaticFileStandardListResponseDtoTypeEnum;
    /** Description du fichier statique */
    description?: string;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations sur le traitement(les champs priority, input_types et output_types ne sont pas retournés par défaut) */
export interface ProcessingListResponseDto {
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
    /** Nom du traitement. ce nom doit être unique pour la plateforme */
    name?: string;
    /** Description du traitement */
    description?: string;
    /** Priorité de traitement */
    priority?: ProcessingListResponseDtoPriorityEnum;
    /** Types de données acceptés en entrée du traitement */
    input_types?: ProcessingInputTypesDto;
    output_type?: ProcessingOutputTypeStoredDataDto | ProcessingOutputTypeUploadDto;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations sur le traitement(les champs priority, input_types et output_types ne sont pas retournés par défaut) */
export interface ProcessingStandardDetailResponseDto {
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
    /** Nom du traitement. ce nom doit être unique pour la plateforme */
    name: string;
    /** Description du traitement */
    description: string;
    /** Priorité de traitement */
    priority: ProcessingStandardDetailResponseDtoPriorityEnum;
    /** Types de données acceptés en entrée du traitement */
    input_types: ProcessingInputTypesDto;
    output_type: ProcessingOutputTypeStoredDataDto | ProcessingOutputTypeUploadDto;
    /**
     * Paramètres en entrée du traitement
     * @uniqueItems true
     */
    parameters: (ProcessingParameterFreeDto | ProcessingParameterStaticFileDto)[];
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Vérifications nécessaires au lancement du traitement
     * @uniqueItems true
     */
    required_checks: CheckingListResponseDto[];
}

/** Informations sur les traitements */
export interface ProcessingExecutionStandardListResponseDto {
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
    /** Traitement */
    processing: ProcessingExecutionProcessingDto;
    /** Statut des exécutions à récupérer */
    status: ProcessingExecutionStandardListResponseDtoStatusEnum;
    /**
     * Date de lancement du traitement
     * @format date-time
     */
    launch?: string;
    /**
     * Date du démarage du traitement
     * @format date-time
     */
    start?: string;
    /**
     * Date de fin du traitement
     * @format date-time
     */
    finish?: string;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations sur l'entrepôt partagé */
export interface DatastoreSharingResponseDto {
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
    name: string;
    description?: string;
    technical_name: string;
    active: boolean;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations sur la configuration (les champs metadatas, attribution, last_event, tags, creation et update ne sont pas retournés par défaut) */
export interface ConfigurationStandardListResponseDto {
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
    /** Nom de la configuration */
    name?: string;
    /** Nom technique de la ressource. Ce nom doit être unique sur la plateforme pour un type de configuration donné. Ne peut commencer que par un caractère alphabétique ou un tiret bas, puis uniquement des caractères alphanumériques, tiret, tiret bas, point */
    layer_name?: string;
    /** Type de configuration */
    type?: ConfigurationStandardListResponseDtoTypeEnum;
    /** Statut de la configuration */
    status?: ConfigurationStandardListResponseDtoStatusEnum;
    /** Liste des étiquettes  de configuration (format clé/valeur) */
    tags?: Record<string, string>;
    /** Métadonnées liées au propriétaire de la configuration */
    attribution?: ConfigurationAttribution;
    /** Événement */
    last_event?: ConfigurationEventDto;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Métadonnées liées à la configuration
     * @uniqueItems true
     */
    metadata?: ConfigurationMetadata[];
}

/** Informations détaillées sur la vérification */
export interface CheckingStandardDetailResponseDto {
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
    /** Nom de la vérification. ce nom doit être unique pour la plateforme */
    name: string;
    /** Description de la vérification */
    description: string;
    /** Priorité de la vérification */
    priority?: CheckingStandardDetailResponseDtoPriorityEnum;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /** @uniqueItems true */
    default_uploads_check?: CheckingStandardDetailResponseDtoDefaultUploadsCheckEnum[];
}

/** Informations sur l'exécution de vérification */
export interface CheckingExecutionListResponseDto {
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
    /** Informations sur la vérification */
    check: CheckingExecutionCheckResponseDto;
    status: CheckingExecutionListResponseDtoStatusEnum;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations sur l'annexe */
export interface AnnexStandardListResponseDto {
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
    /** @uniqueItems true */
    paths: string[];
    /** @format int64 */
    size: number;
    mime_type: string;
    published: boolean;
    /** @uniqueItems true */
    labels?: string[];
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

export interface CommunityUserResponseDto {
    rights?: CommunityUserResponseDtoRightsEnum[];
    user: UserDto;
    /**
     * Date d'ajout de l'utilisateur à la communauté
     * @format date-time
     */
    creation: string;
    /**
     * Date de dernière mise à jour de l'utilisateur dans la communauté
     * @format date-time
     */
    update: string;
}

/** Informations sur l'organisme */
export interface OrganizationCatalogResponseDto {
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
    /** Nom de l'organisme */
    name: string;
    /** SIREN de l'organisme */
    siren?: string;
    /** SIRET de l'organisme */
    siret?: string;
    /** N° de TVA intracommunautaire de l'organisme */
    tva_intracom?: string;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations détaillées sur l'offre */
export interface OfferingCatalogResponseDto {
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
    /** Indique si l'offre est ouverte sans clé d'accès */
    open: boolean;
    /** Indique si l'offre est disponible */
    available: boolean;
    /** Nom technique de la ressource. Ce nom doit être unique sur la plateforme pour un type de configuration donné. Ne peut commencer que par un caractère alphabétique ou un tiret bas, puis uniquement des caractères alphanumériques, tiret, tiret bas, point */
    layer_name: string;
    /** Type de configuration */
    type: OfferingCatalogResponseDtoTypeEnum;
    /** Statut de l'offre */
    status: OfferingCatalogResponseDtoStatusEnum;
    /** Informations sur la configuration de l'offre */
    configuration: ConfigurationBaseResponseDto;
    /** Informations sur le point d'accès */
    endpoint: EndpointListResponseDto;
    /** @uniqueItems true */
    urls: EndpointUrl[];
    contact: string;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    extra?: object;
    /** L'activité de la donnée stockée est-elle publique ? */
    public_activity: boolean;
}

/** Informations détaillées sur la livraison */
export interface UploadExtendedDetailResponseDto {
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
    /** Nom de la livraison */
    name: string;
    /** Description de la livraison */
    description: string;
    /** Type de livraison */
    type: UploadExtendedDetailResponseDtoTypeEnum;
    /** Livraison ouverte ? (visible par tous les entrepôts et utilisateurs) */
    open: boolean;
    /** Statut de la livraison */
    status: UploadExtendedDetailResponseDtoStatusEnum;
    /** Système de coordonnées de référence de la livraison */
    srs: string;
    /** Nom du contact de la communauté */
    contact: string;
    /** Etendue géographique au format GeoJson */
    extent?: JsonNode;
    /**
     * Taille de la livraison (en octets)
     * @format int64
     */
    size?: number;
    /** Événement */
    last_event?: EventDto;
    /** Liste des étiquettes de la livraison (format clé/valeur) */
    tags: Record<string, string>;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    extra?: object;
    /** Informations spécifiques au type de livraison */
    type_infos?: UploadDetailsDto;
    /**
     * Identifiant de l'organisme rattaché
     * @format uuid
     */
    organization?: string;
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
}

/** Informations sur l'entrepôt */
export interface DatastoreListWithStorageUsageResponseDto {
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
    /** Nom de la communauté */
    name: string;
    /** Nom technique de la communauté */
    technical_name: string;
    /**
     * Espace occupé en octets pour les annexes
     * @format int64
     */
    storage_annexes_use?: number;
    /**
     * Quota en octets pour les annexes
     * @format int64
     */
    storage_annexes_quota?: number;
    /**
     * Espace occupé en octets pour les livraisons
     * @format int64
     */
    storage_uploads_use?: number;
    /**
     * Quota en octets pour les livraisons
     * @format int64
     */
    storage_uploads_quota?: number;
    /**
     * Espace occupé en octets pour les données stockées
     * @format int64
     */
    storage_data_use?: number;
    /**
     * Quota en octets pour les données stockées
     * @format int64
     */
    storage_data_quota?: number;
    /** Datastore actif ou non */
    active: boolean;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations détaillées sur le fichier statique */
export interface StaticFileExtendedDetailResponseDto {
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
    /** Nom du fichier statique */
    name: string;
    /** Description du fichier statique */
    description?: string;
    /** Type du fichier statique */
    type: StaticFileExtendedDetailResponseDtoTypeEnum;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    extra?: object;
    type_infos: StaticFileDerivationSqlDetailsDto | StaticFileGeoserverFtlDetailsDto | StaticFileGeoserverStyleDetailsDto | StaticFileRok4StyleDetailsDto;
    /**
     * Identifiant de l'organisme rattaché
     * @format uuid
     */
    organization?: string;
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
}

/** Informations sur l'entrepôt */
export interface DatastoreListResponseDto {
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
    /** Nom de la communauté */
    name: string;
    /** Nom technique de la communauté */
    technical_name: string;
    /** Datastore actif ou non */
    active: boolean;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations détaillées sur l'exécution de traitement */
export interface ProcessingExecutionExtendedDetailResponseDto {
    /** @format date-time */
    creation: string;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
    /** Traitement */
    processing: ProcessingExecutionProcessingDto;
    status: ProcessingExecutionExtendedDetailResponseDtoStatusEnum;
    /** @format date-time */
    launch?: string;
    /** @format date-time */
    start?: string;
    /** @format date-time */
    finish?: string;
    inputs: ProcessingExecutionInputDto;
    output: ProcessingExecutionOutputStoredDataDto | ProcessingExecutionOutputUploadDto;
    parameters: Record<string, object>;
    /** Callback à exécuter à la fin de l'exécution */
    callback?: Callback;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Identifiant de l'organisme rattaché
     * @format uuid
     */
    organization?: string;
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
}

/** Informations sur l'organisme (les champs creation, siren, siret, tva_intracom, economical_model et uploads_quota ne sont pas retournés par défaut) */
export interface OrganizationListResponseDto {
    /** @format date-time */
    creation: string;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
    /** Nom de l'organisme */
    name: string;
    /** SIREN de l'organisme */
    siren?: string;
    /** SIRET de l'organisme */
    siret?: string;
    /** N° de TVA intracommunautaire de l'organisme */
    tva_intracom?: string;
    /** Informations sur la nomenclature */
    economical_model?: NomenclatureSimpleResponseDto;
    /**
     * Quota de livraisons pour l'organisme (en octets)
     * @format int64
     */
    uploads_quota: number;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations détaillées sur l'offre */
export interface OfferingExtendedDetailResponseDto {
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
    /** Indique si l'offre est ouverte sans clé d'accès */
    open: boolean;
    /** Indique si l'offre est disponible */
    available: boolean;
    /** Nom technique de la ressource. Ce nom doit être unique sur la plateforme pour un type de configuration donné. Ne peut commencer que par un caractère alphabétique ou un tiret bas, puis uniquement des caractères alphanumériques, tiret, tiret bas, point */
    layer_name: string;
    /** Type de configuration */
    type: OfferingExtendedDetailResponseDtoTypeEnum;
    /** Statut de l'offre */
    status: OfferingExtendedDetailResponseDtoStatusEnum;
    /** Informations sur la configuration de l'offre */
    configuration: ConfigurationBaseResponseDto;
    /** Informations sur le point d'accès */
    endpoint: EndpointListResponseDto;
    /** @uniqueItems true */
    urls: EndpointUrl[];
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    extra?: object;
    /** L'activité de la donnée stockée est-elle publique ? */
    public_activity: boolean;
    /**
     * Identifiant de l'organisme rattaché
     * @format uuid
     */
    organization?: string;
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
}

/** Informations détaillées sur la métadonnée */
export interface MetadataExtendedResponseDto {
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
    type: MetadataExtendedResponseDtoTypeEnum;
    open_data: boolean;
    level: MetadataExtendedResponseDtoLevelEnum;
    file_identifier: string;
    tags?: Record<string, string>;
    endpoints?: EndpointListResponseDto[];
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    extra?: object;
    /**
     * Identifiant de l'organisme rattaché
     * @format uuid
     */
    organization?: string;
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
}

/** Informations sur l'entrepôt */
export interface DatastoreListWithEndpointUsageResponseDto {
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
    /** Nom de la communauté */
    name: string;
    /** Nom technique de la communauté */
    technical_name: string;
    /**
     * Espace occupé en octets
     * @format int64
     */
    use: number;
    /**
     * Quota en octets
     * @format int64
     */
    quota: number;
    /** Datastore actif ou non */
    active: boolean;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations détaillées sur la configuration */
export interface ConfigurationExtendedDetailResponseDto {
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
    /** Nom de la configuration */
    name: string;
    /** Nom technique de la ressource. Ce nom doit être unique sur la plateforme pour un type de configuration donné. Ne peut commencer que par un caractère alphabétique ou un tiret bas, puis uniquement des caractères alphanumériques, tiret, tiret bas, point */
    layer_name: string;
    /** Type de configuration */
    type: ConfigurationExtendedDetailResponseDtoTypeEnum;
    status: ConfigurationExtendedDetailResponseDtoStatusEnum;
    tags: Record<string, string>;
    /** Métadonnées liées au propriétaire de la configuration */
    attribution?: ConfigurationAttribution;
    /** Événement */
    last_event?: ConfigurationEventDto;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    extra?: object;
    /**
     * Métadonnées liées à la configuration
     * @uniqueItems true
     */
    metadata?: ConfigurationMetadata[];
    type_infos:
        | ConfigurationAltimetryDetailsContent
        | ConfigurationDownloadDetailsContent
        | ConfigurationItineraryIsocurveDetailsContent
        | ConfigurationSearchDetailsContent
        | ConfigurationVectorTmsDetailsContent
        | ConfigurationWfsDetailsContent
        | ConfigurationWmsRasterDetailsContent
        | ConfigurationWmsVectorDetailsContent
        | ConfigurationWmtsTmsDetailsContent;
    /**
     * Identifiant de l'organisme rattaché
     * @format uuid
     */
    organization?: string;
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
}

/** Informations détaillées sur l'exécution de vérification */
export interface CheckingExecutionExtendedDetailResponseDto {
    /** @format date-time */
    creation: string;
    /**
     * Date de dernière mise à jour
     * @format date-time
     */
    update: string;
    /** Informations sur la vérification */
    check: CheckingExecutionCheckResponseDto;
    status: CheckingExecutionExtendedDetailResponseDtoStatusEnum;
    /** @format date-time */
    start?: string;
    /** @format date-time */
    finish?: string;
    /** Informations sur la livraison */
    upload: CheckingExecutionUploadResponseDto;
    /** Callback à exécuter à la fin de l'exécution */
    callback?: Callback;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Identifiant de l'organisme rattaché
     * @format uuid
     */
    organization?: string;
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
}

/** Informations détaillées sur l'annexe */
export interface AnnexExtendedDetailResponseDto {
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
    /** @uniqueItems true */
    paths: string[];
    /** @format int64 */
    size: number;
    mime_type: string;
    published: boolean;
    /** @uniqueItems true */
    labels?: string[];
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    extra?: object;
    /**
     * Identifiant de l'organisme rattaché
     * @format uuid
     */
    organization?: string;
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
}

export enum PermissionCreateDtoTypeEnum {
    ACCOUNT = "ACCOUNT",
    COMMUNITY = "COMMUNITY",
}

export enum UserKeyCreateDtoUserKeyInfoDtoTypeEnum {
    HASH = "HASH",
    HEADER = "HEADER",
    BASIC = "BASIC",
    OAUTH2 = "OAUTH2",
}

/** Type du fichier statique */
export enum StaticFileStandardDetailResponseDtoTypeEnum {
    GEOSERVERFTL = "GEOSERVER-FTL",
    GEOSERVERSTYLE = "GEOSERVER-STYLE",
    ROK4STYLE = "ROK4-STYLE",
    DERIVATIONSQL = "DERIVATION-SQL",
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
}

/** Type de configuration */
export enum OfferingStandardDetailResponseDtoTypeEnum {
    WMSVECTOR = "WMS-VECTOR",
    WFS = "WFS",
    WMTSTMS = "WMTS-TMS",
    WMSRASTER = "WMS-RASTER",
    DOWNLOAD = "DOWNLOAD",
    ITINERARYISOCURVE = "ITINERARY-ISOCURVE",
    ALTIMETRY = "ALTIMETRY",
    SEARCH = "SEARCH",
    VECTORTMS = "VECTOR-TMS",
}

/** Statut de l'offre */
export enum OfferingStandardDetailResponseDtoStatusEnum {
    PUBLISHING = "PUBLISHING",
    MODIFYING = "MODIFYING",
    PUBLISHED = "PUBLISHED",
    UNPUBLISHING = "UNPUBLISHING",
    UNSTABLE = "UNSTABLE",
}

export enum MetadataStandardResponseDtoTypeEnum {
    INSPIRE = "INSPIRE",
    ISOAP = "ISOAP",
}

export enum MetadataStandardResponseDtoLevelEnum {
    DATASET = "DATASET",
    SERIES = "SERIES",
}

/** Type de configuration */
export enum ConfigurationFullUpdateDtoTypeEnum {
    WMSVECTOR = "WMS-VECTOR",
    WFS = "WFS",
    WMTSTMS = "WMTS-TMS",
    WMSRASTER = "WMS-RASTER",
    DOWNLOAD = "DOWNLOAD",
    ITINERARYISOCURVE = "ITINERARY-ISOCURVE",
    ALTIMETRY = "ALTIMETRY",
    SEARCH = "SEARCH",
    VECTORTMS = "VECTOR-TMS",
}

/** Le type de métadonnées */
export enum ConfigurationMetadataTypeEnum {
    ISO191152003 = "ISO19115:2003",
    FGDC = "FGDC",
    TC211 = "TC211",
    Value19139 = "19139",
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

/** Type de configuration */
export enum ConfigurationStandardDetailResponseDtoTypeEnum {
    WMSVECTOR = "WMS-VECTOR",
    WFS = "WFS",
    WMTSTMS = "WMTS-TMS",
    WMSRASTER = "WMS-RASTER",
    DOWNLOAD = "DOWNLOAD",
    ITINERARYISOCURVE = "ITINERARY-ISOCURVE",
    ALTIMETRY = "ALTIMETRY",
    SEARCH = "SEARCH",
    VECTORTMS = "VECTOR-TMS",
}

export enum ConfigurationStandardDetailResponseDtoStatusEnum {
    UNPUBLISHED = "UNPUBLISHED",
    PUBLISHED = "PUBLISHED",
    SYNCHRONIZING = "SYNCHRONIZING",
}

export enum CommunityAddUserDtoRightsEnum {
    COMMUNITY = "COMMUNITY",
    PROCESSING = "PROCESSING",
    ANNEX = "ANNEX",
    BROADCAST = "BROADCAST",
    UPLOAD = "UPLOAD",
}

/**
 * Priorité de traitement
 * @default "STANDARD"
 */
export enum ProcessingCreateDtoPriorityEnum {
    STANDARD = "STANDARD",
    PREMIUM = "PREMIUM",
    SANDBOX = "SANDBOX",
    STRONG = "STRONG",
    EXTRACTION = "EXTRACTION",
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

export enum ProcessingOutputTypeStoredDataDtoStorageEnum {
    POSTGRESQL = "POSTGRESQL",
    S3 = "S3",
    FILESYSTEM = "FILESYSTEM",
    OPENSEARCH = "OPENSEARCH",
    POSTGRESQLROUTING = "POSTGRESQL-ROUTING",
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

/** Type de fichier(s) statique(s) attendu(s) pour ce paramètre */
export enum ProcessingParameterStaticFileDtoStaticTypeEnum {
    GEOSERVERFTL = "GEOSERVER-FTL",
    GEOSERVERSTYLE = "GEOSERVER-STYLE",
    ROK4STYLE = "ROK4-STYLE",
    DERIVATIONSQL = "DERIVATION-SQL",
}

/** Priorité de traitement */
export enum ProcessingExtendedDetailResponseDtoPriorityEnum {
    STANDARD = "STANDARD",
    PREMIUM = "PREMIUM",
    SANDBOX = "SANDBOX",
    STRONG = "STRONG",
    EXTRACTION = "EXTRACTION",
}

export enum UserKeyDetailsResponseDtoUserKeyInfoDtoTypeEnum {
    HASH = "HASH",
    HEADER = "HEADER",
    BASIC = "BASIC",
    OAUTH2 = "OAUTH2",
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

/** Type de pyramide 3D */
export enum UploadPyramid3DDetailsDtoPyramidTypeEnum {
    COPC = "COPC",
    EPT = "EPT",
}

/** Type de données (pour le type EPT) */
export enum UploadPyramid3DDetailsDtoDataTypeEnum {
    Laszip = "laszip",
    Zstandard = "zstandard",
    Binary = "binary",
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

/** Type de callback */
export enum CallbackTypeEnum {
    Email = "email",
}

export enum StoredDataDetailsRelationDtoTypeEnum {
    TABLE = "TABLE",
    VIEW = "VIEW",
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

/** Statut de la donnée stockée */
export enum StoredDataPrivateDetailResponseDtoStatusEnum {
    CREATED = "CREATED",
    GENERATING = "GENERATING",
    MODIFYING = "MODIFYING",
    GENERATED = "GENERATED",
    DELETED = "DELETED",
    UNSTABLE = "UNSTABLE",
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

export enum StoredDataStorageDtoTypeEnum {
    POSTGRESQL = "POSTGRESQL",
    S3 = "S3",
    FILESYSTEM = "FILESYSTEM",
    OPENSEARCH = "OPENSEARCH",
    POSTGRESQLROUTING = "POSTGRESQL-ROUTING",
}

/** Type du fichier statique */
export enum StaticFileCreateDtoTypeEnum {
    GEOSERVERFTL = "GEOSERVER-FTL",
    GEOSERVERSTYLE = "GEOSERVER-STYLE",
    ROK4STYLE = "ROK4-STYLE",
    DERIVATIONSQL = "DERIVATION-SQL",
}

/** Type de stockage */
export enum StoredDataCreationDtoStorageTypeEnum {
    POSTGRESQL = "POSTGRESQL",
    S3 = "S3",
    FILESYSTEM = "FILESYSTEM",
    OPENSEARCH = "OPENSEARCH",
    POSTGRESQLROUTING = "POSTGRESQL-ROUTING",
}

export enum ProcessingExecutionStandardDetailResponseDtoStatusEnum {
    CREATED = "CREATED",
    WAITING = "WAITING",
    PROGRESS = "PROGRESS",
    SUCCESS = "SUCCESS",
    FAILURE = "FAILURE",
    ABORTED = "ABORTED",
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

export enum ProcessingExecutionStoredDataDtoStatusEnum {
    CREATED = "CREATED",
    GENERATING = "GENERATING",
    MODIFYING = "MODIFYING",
    GENERATED = "GENERATED",
    DELETED = "DELETED",
    UNSTABLE = "UNSTABLE",
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

/** Statut de l'offre */
export enum PermissionOfferingResponseDtoStatusEnum {
    PUBLISHING = "PUBLISHING",
    MODIFYING = "MODIFYING",
    PUBLISHED = "PUBLISHED",
    UNPUBLISHING = "UNPUBLISHING",
    UNSTABLE = "UNSTABLE",
}

/** Type de configuration */
export enum ConfigurationCreateDtoTypeEnum {
    WMSVECTOR = "WMS-VECTOR",
    WFS = "WFS",
    WMTSTMS = "WMTS-TMS",
    WMSRASTER = "WMS-RASTER",
    DOWNLOAD = "DOWNLOAD",
    ITINERARYISOCURVE = "ITINERARY-ISOCURVE",
    ALTIMETRY = "ALTIMETRY",
    SEARCH = "SEARCH",
    VECTORTMS = "VECTOR-TMS",
}

/** Le type de stockage */
export enum StorageCreateDtoTypeEnum {
    POSTGRESQL = "POSTGRESQL",
    S3 = "S3",
    FILESYSTEM = "FILESYSTEM",
    OPENSEARCH = "OPENSEARCH",
    POSTGRESQLROUTING = "POSTGRESQL-ROUTING",
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
export enum NomenclatureAdminResponseDtoTypeEnum {
    CRS = "CRS",
    ZONE = "ZONE",
    FORMAT = "FORMAT",
    RESOLUTION = "RESOLUTION",
    ECONOMICAL_MODEL = "ECONOMICAL_MODEL",
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

/** Priorité de la vérification */
export enum CheckingExtendedDetailResponseDtoPriorityEnum {
    STANDARD = "STANDARD",
    PREMIUM = "PREMIUM",
    SANDBOX = "SANDBOX",
    STRONG = "STRONG",
    EXTRACTION = "EXTRACTION",
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

export enum MetadataUpdateDtoTypeEnum {
    INSPIRE = "INSPIRE",
    ISOAP = "ISOAP",
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

export enum CommunityMemberDtoRightsEnum {
    COMMUNITY = "COMMUNITY",
    PROCESSING = "PROCESSING",
    ANNEX = "ANNEX",
    BROADCAST = "BROADCAST",
    UPLOAD = "UPLOAD",
}

/** Priorité de traitement */
export enum ProcessingUpdateDtoPriorityEnum {
    STANDARD = "STANDARD",
    PREMIUM = "PREMIUM",
    SANDBOX = "SANDBOX",
    STRONG = "STRONG",
    EXTRACTION = "EXTRACTION",
}

/** Priorité de la vérification */
export enum CheckingUpdateDtoPriorityEnum {
    STANDARD = "STANDARD",
    PREMIUM = "PREMIUM",
    SANDBOX = "SANDBOX",
    STRONG = "STRONG",
    EXTRACTION = "EXTRACTION",
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
export enum StoredDataSharedDetailResponseDtoStatusEnum {
    CREATED = "CREATED",
    GENERATING = "GENERATING",
    MODIFYING = "MODIFYING",
    GENERATED = "GENERATED",
    DELETED = "DELETED",
    UNSTABLE = "UNSTABLE",
}

/** Type de configuration */
export enum PermissionOfferingDetailsResponseDtoTypeEnum {
    WMSVECTOR = "WMS-VECTOR",
    WFS = "WFS",
    WMTSTMS = "WMTS-TMS",
    WMSRASTER = "WMS-RASTER",
    DOWNLOAD = "DOWNLOAD",
    ITINERARYISOCURVE = "ITINERARY-ISOCURVE",
    ALTIMETRY = "ALTIMETRY",
    SEARCH = "SEARCH",
    VECTORTMS = "VECTOR-TMS",
}

export enum UserKeyResponseDtoTypeEnum {
    HASH = "HASH",
    HEADER = "HEADER",
    BASIC = "BASIC",
    OAUTH2 = "OAUTH2",
}

/** Type de configuration */
export enum OfferingStandardListResponseDtoTypeEnum {
    WMSVECTOR = "WMS-VECTOR",
    WFS = "WFS",
    WMTSTMS = "WMTS-TMS",
    WMSRASTER = "WMS-RASTER",
    DOWNLOAD = "DOWNLOAD",
    ITINERARYISOCURVE = "ITINERARY-ISOCURVE",
    ALTIMETRY = "ALTIMETRY",
    SEARCH = "SEARCH",
    VECTORTMS = "VECTOR-TMS",
}

/** Statut de l'offre */
export enum OfferingStandardListResponseDtoStatusEnum {
    PUBLISHING = "PUBLISHING",
    MODIFYING = "MODIFYING",
    PUBLISHED = "PUBLISHED",
    UNPUBLISHING = "UNPUBLISHING",
    UNSTABLE = "UNSTABLE",
}

/** Type de famille à laquelle appartient la nomenclature */
export enum NomenclatureResponseDtoTypeEnum {
    CRS = "CRS",
    ZONE = "ZONE",
    FORMAT = "FORMAT",
    RESOLUTION = "RESOLUTION",
    ECONOMICAL_MODEL = "ECONOMICAL_MODEL",
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
export enum StoredDataExtendedListResponseDtoStatusEnum {
    CREATED = "CREATED",
    GENERATING = "GENERATING",
    MODIFYING = "MODIFYING",
    GENERATED = "GENERATED",
    DELETED = "DELETED",
    UNSTABLE = "UNSTABLE",
}

/** Type du fichier statique */
export enum StaticFileExtendedListResponseDtoTypeEnum {
    GEOSERVERFTL = "GEOSERVER-FTL",
    GEOSERVERSTYLE = "GEOSERVER-STYLE",
    ROK4STYLE = "ROK4-STYLE",
    DERIVATIONSQL = "DERIVATION-SQL",
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

/** Type de configuration */
export enum OfferingExtendedListResponseDtoTypeEnum {
    WMSVECTOR = "WMS-VECTOR",
    WFS = "WFS",
    WMTSTMS = "WMTS-TMS",
    WMSRASTER = "WMS-RASTER",
    DOWNLOAD = "DOWNLOAD",
    ITINERARYISOCURVE = "ITINERARY-ISOCURVE",
    ALTIMETRY = "ALTIMETRY",
    SEARCH = "SEARCH",
    VECTORTMS = "VECTOR-TMS",
}

/** Statut de l'offre */
export enum OfferingExtendedListResponseDtoStatusEnum {
    PUBLISHING = "PUBLISHING",
    MODIFYING = "MODIFYING",
    PUBLISHED = "PUBLISHED",
    UNPUBLISHING = "UNPUBLISHING",
    UNSTABLE = "UNSTABLE",
}

/** Type de configuration */
export enum ConfigurationExtendedListResponseDtoTypeEnum {
    WMSVECTOR = "WMS-VECTOR",
    WFS = "WFS",
    WMTSTMS = "WMTS-TMS",
    WMSRASTER = "WMS-RASTER",
    DOWNLOAD = "DOWNLOAD",
    ITINERARYISOCURVE = "ITINERARY-ISOCURVE",
    ALTIMETRY = "ALTIMETRY",
    SEARCH = "SEARCH",
    VECTORTMS = "VECTOR-TMS",
}

/** Statut de la configuration */
export enum ConfigurationExtendedListResponseDtoStatusEnum {
    UNPUBLISHED = "UNPUBLISHED",
    PUBLISHED = "PUBLISHED",
    SYNCHRONIZING = "SYNCHRONIZING",
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
export enum UploadSharedDetailResponseDtoTypeEnum {
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
export enum UploadSharedDetailResponseDtoStatusEnum {
    CREATED = "CREATED",
    OPEN = "OPEN",
    CLOSED = "CLOSED",
    CHECKING = "CHECKING",
    GENERATING = "GENERATING",
    MODIFYING = "MODIFYING",
    UNSTABLE = "UNSTABLE",
    DELETED = "DELETED",
}

/** Type du fichier statique */
export enum StaticFileStandardListResponseDtoTypeEnum {
    GEOSERVERFTL = "GEOSERVER-FTL",
    GEOSERVERSTYLE = "GEOSERVER-STYLE",
    ROK4STYLE = "ROK4-STYLE",
    DERIVATIONSQL = "DERIVATION-SQL",
}

/** Priorité de traitement */
export enum ProcessingListResponseDtoPriorityEnum {
    STANDARD = "STANDARD",
    PREMIUM = "PREMIUM",
    SANDBOX = "SANDBOX",
    STRONG = "STRONG",
    EXTRACTION = "EXTRACTION",
}

/** Priorité de traitement */
export enum ProcessingStandardDetailResponseDtoPriorityEnum {
    STANDARD = "STANDARD",
    PREMIUM = "PREMIUM",
    SANDBOX = "SANDBOX",
    STRONG = "STRONG",
    EXTRACTION = "EXTRACTION",
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

/** Type de configuration */
export enum ConfigurationStandardListResponseDtoTypeEnum {
    WMSVECTOR = "WMS-VECTOR",
    WFS = "WFS",
    WMTSTMS = "WMTS-TMS",
    WMSRASTER = "WMS-RASTER",
    DOWNLOAD = "DOWNLOAD",
    ITINERARYISOCURVE = "ITINERARY-ISOCURVE",
    ALTIMETRY = "ALTIMETRY",
    SEARCH = "SEARCH",
    VECTORTMS = "VECTOR-TMS",
}

/** Statut de la configuration */
export enum ConfigurationStandardListResponseDtoStatusEnum {
    UNPUBLISHED = "UNPUBLISHED",
    PUBLISHED = "PUBLISHED",
    SYNCHRONIZING = "SYNCHRONIZING",
}

/** Priorité de la vérification */
export enum CheckingStandardDetailResponseDtoPriorityEnum {
    STANDARD = "STANDARD",
    PREMIUM = "PREMIUM",
    SANDBOX = "SANDBOX",
    STRONG = "STRONG",
    EXTRACTION = "EXTRACTION",
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

export enum CheckingExecutionListResponseDtoStatusEnum {
    WAITING = "WAITING",
    PROGRESS = "PROGRESS",
    SUCCESS = "SUCCESS",
    FAILURE = "FAILURE",
}

export enum CommunityUserResponseDtoRightsEnum {
    COMMUNITY = "COMMUNITY",
    PROCESSING = "PROCESSING",
    ANNEX = "ANNEX",
    BROADCAST = "BROADCAST",
    UPLOAD = "UPLOAD",
}

/** Type de configuration */
export enum OfferingCatalogResponseDtoTypeEnum {
    WMSVECTOR = "WMS-VECTOR",
    WFS = "WFS",
    WMTSTMS = "WMTS-TMS",
    WMSRASTER = "WMS-RASTER",
    DOWNLOAD = "DOWNLOAD",
    ITINERARYISOCURVE = "ITINERARY-ISOCURVE",
    ALTIMETRY = "ALTIMETRY",
    SEARCH = "SEARCH",
    VECTORTMS = "VECTOR-TMS",
}

/** Statut de l'offre */
export enum OfferingCatalogResponseDtoStatusEnum {
    PUBLISHING = "PUBLISHING",
    MODIFYING = "MODIFYING",
    PUBLISHED = "PUBLISHED",
    UNPUBLISHING = "UNPUBLISHING",
    UNSTABLE = "UNSTABLE",
}

/** Type de livraison */
export enum UploadExtendedDetailResponseDtoTypeEnum {
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
export enum UploadExtendedDetailResponseDtoStatusEnum {
    CREATED = "CREATED",
    OPEN = "OPEN",
    CLOSED = "CLOSED",
    CHECKING = "CHECKING",
    GENERATING = "GENERATING",
    MODIFYING = "MODIFYING",
    UNSTABLE = "UNSTABLE",
    DELETED = "DELETED",
}

/** Type du fichier statique */
export enum StaticFileExtendedDetailResponseDtoTypeEnum {
    GEOSERVERFTL = "GEOSERVER-FTL",
    GEOSERVERSTYLE = "GEOSERVER-STYLE",
    ROK4STYLE = "ROK4-STYLE",
    DERIVATIONSQL = "DERIVATION-SQL",
}

export enum ProcessingExecutionExtendedDetailResponseDtoStatusEnum {
    CREATED = "CREATED",
    WAITING = "WAITING",
    PROGRESS = "PROGRESS",
    SUCCESS = "SUCCESS",
    FAILURE = "FAILURE",
    ABORTED = "ABORTED",
}

/** Type de configuration */
export enum OfferingExtendedDetailResponseDtoTypeEnum {
    WMSVECTOR = "WMS-VECTOR",
    WFS = "WFS",
    WMTSTMS = "WMTS-TMS",
    WMSRASTER = "WMS-RASTER",
    DOWNLOAD = "DOWNLOAD",
    ITINERARYISOCURVE = "ITINERARY-ISOCURVE",
    ALTIMETRY = "ALTIMETRY",
    SEARCH = "SEARCH",
    VECTORTMS = "VECTOR-TMS",
}

/** Statut de l'offre */
export enum OfferingExtendedDetailResponseDtoStatusEnum {
    PUBLISHING = "PUBLISHING",
    MODIFYING = "MODIFYING",
    PUBLISHED = "PUBLISHED",
    UNPUBLISHING = "UNPUBLISHING",
    UNSTABLE = "UNSTABLE",
}

export enum MetadataExtendedResponseDtoTypeEnum {
    INSPIRE = "INSPIRE",
    ISOAP = "ISOAP",
}

export enum MetadataExtendedResponseDtoLevelEnum {
    DATASET = "DATASET",
    SERIES = "SERIES",
}

/** Type de configuration */
export enum ConfigurationExtendedDetailResponseDtoTypeEnum {
    WMSVECTOR = "WMS-VECTOR",
    WFS = "WFS",
    WMTSTMS = "WMTS-TMS",
    WMSRASTER = "WMS-RASTER",
    DOWNLOAD = "DOWNLOAD",
    ITINERARYISOCURVE = "ITINERARY-ISOCURVE",
    ALTIMETRY = "ALTIMETRY",
    SEARCH = "SEARCH",
    VECTORTMS = "VECTOR-TMS",
}

export enum ConfigurationExtendedDetailResponseDtoStatusEnum {
    UNPUBLISHED = "UNPUBLISHED",
    PUBLISHED = "PUBLISHED",
    SYNCHRONIZING = "SYNCHRONIZING",
}

export enum CheckingExecutionExtendedDetailResponseDtoStatusEnum {
    WAITING = "WAITING",
    PROGRESS = "PROGRESS",
    SUCCESS = "SUCCESS",
    FAILURE = "FAILURE",
}

/** Type de la clé */
export enum GetUserKeysParamsTypeEnum {
    HASH = "HASH",
    HEADER = "HEADER",
    BASIC = "BASIC",
    OAUTH2 = "OAUTH2",
}

export enum GetAll2ParamsFieldsEnum {
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
export enum GetAll2ParamsTypeEnum {
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
export enum GetAll2ParamsStatusEnum {
    CREATED = "CREATED",
    OPEN = "OPEN",
    CLOSED = "CLOSED",
    CHECKING = "CHECKING",
    GENERATING = "GENERATING",
    MODIFYING = "MODIFYING",
    UNSTABLE = "UNSTABLE",
    DELETED = "DELETED",
}

/** Type du fichier statique */
export enum GetAll4ParamsTypeEnum {
    GEOSERVERFTL = "GEOSERVER-FTL",
    GEOSERVERSTYLE = "GEOSERVER-STYLE",
    ROK4STYLE = "ROK4-STYLE",
    DERIVATIONSQL = "DERIVATION-SQL",
}

/** Statut des exécutions à récupérer */
export enum GetAll6ParamsStatusEnum {
    CREATED = "CREATED",
    WAITING = "WAITING",
    PROGRESS = "PROGRESS",
    SUCCESS = "SUCCESS",
    FAILURE = "FAILURE",
    ABORTED = "ABORTED",
}

/** Quel type de métadonnées (INSPIRE, ISOAP...) veut-on voir */
export enum GetAll9ParamsTypeEnum {
    INSPIRE = "INSPIRE",
    ISOAP = "ISOAP",
}

/** Quel niveau de métadonnées (lot, produit...) veut-on voir */
export enum GetAll9ParamsLevelEnum {
    DATASET = "DATASET",
    SERIES = "SERIES",
}

/** Type de métadonnée */
export enum Create4ParamsTypeEnum {
    INSPIRE = "INSPIRE",
    ISOAP = "ISOAP",
}

export enum GetAll10ParamsFieldsEnum {
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
export enum GetAll10ParamsTypeEnum {
    WMSVECTOR = "WMS-VECTOR",
    WFS = "WFS",
    WMTSTMS = "WMTS-TMS",
    WMSRASTER = "WMS-RASTER",
    DOWNLOAD = "DOWNLOAD",
    ITINERARYISOCURVE = "ITINERARY-ISOCURVE",
    ALTIMETRY = "ALTIMETRY",
    SEARCH = "SEARCH",
    VECTORTMS = "VECTOR-TMS",
}

/** Statut des configurations */
export enum GetAll10ParamsStatusEnum {
    UNPUBLISHED = "UNPUBLISHED",
    PUBLISHED = "PUBLISHED",
    SYNCHRONIZING = "SYNCHRONIZING",
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

/** Type de stockage */
export enum GetAll17ParamsTypeEnum {
    POSTGRESQL = "POSTGRESQL",
    S3 = "S3",
    FILESYSTEM = "FILESYSTEM",
    OPENSEARCH = "OPENSEARCH",
    POSTGRESQLROUTING = "POSTGRESQL-ROUTING",
}

export enum GetAll19ParamsFieldsEnum {
    Creation = "creation",
    Name = "name",
    Description = "description",
    Priority = "priority",
    InputTypes = "input_types",
    OutputTypes = "output_types",
}

/** Type de livraison en entrée */
export enum GetAll19ParamsInputUploadTypeEnum {
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
export enum GetAll19ParamsInputStoredDataTypeEnum {
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
export enum GetAll19ParamsOutputUploadTypeEnum {
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
export enum GetAll19ParamsOutputStoredDataTypeEnum {
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

export enum GetAll22ParamsFieldsEnum {
    Name = "name",
    Creation = "creation",
    Siren = "siren",
    Siret = "siret",
    TvaIntracom = "tva_intracom",
    EconomicalModel = "economical_model",
    UploadsQuota = "uploads_quota",
}

/** Type de famille à laquelle appartient la nomenclature */
export enum FindAll1ParamsTypeEnum {
    CRS = "CRS",
    ZONE = "ZONE",
    FORMAT = "FORMAT",
    RESOLUTION = "RESOLUTION",
    ECONOMICAL_MODEL = "ECONOMICAL_MODEL",
}

/** Type de point d'accès voulu */
export enum GetAll24ParamsTypeEnum {
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
}

/** Types de livraisons ayant cette vérification par défaut */
export enum GetAll28ParamsDefaultUploadTypeEnum {
    VECTOR = "VECTOR",
    RASTER = "RASTER",
    ARCHIVE = "ARCHIVE",
    ROK4PYRAMID = "ROK4-PYRAMID",
    INDEX = "INDEX",
    HISTORICIMAGERY = "HISTORIC-IMAGERY",
    POINTCLOUD = "POINT-CLOUD",
    PYRAMID3D = "PYRAMID-3D",
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
}

/** Type de famille à laquelle appartient la nomenclature */
export enum FindAllParamsTypeEnum {
    CRS = "CRS",
    ZONE = "ZONE",
    FORMAT = "FORMAT",
    RESOLUTION = "RESOLUTION",
    ECONOMICAL_MODEL = "ECONOMICAL_MODEL",
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

/** Type du fichier statique */
export enum GetStaticFilesParamsTypeEnum {
    GEOSERVERFTL = "GEOSERVER-FTL",
    GEOSERVERSTYLE = "GEOSERVER-STYLE",
    ROK4STYLE = "ROK4-STYLE",
    DERIVATIONSQL = "DERIVATION-SQL",
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

/** Type de diffusion des offres */
export enum GetOfferingsParamsTypeEnum {
    WMSVECTOR = "WMS-VECTOR",
    WFS = "WFS",
    WMTSTMS = "WMTS-TMS",
    WMSRASTER = "WMS-RASTER",
    DOWNLOAD = "DOWNLOAD",
    ITINERARYISOCURVE = "ITINERARY-ISOCURVE",
    ALTIMETRY = "ALTIMETRY",
    SEARCH = "SEARCH",
    VECTORTMS = "VECTOR-TMS",
}

/** Statut des offres */
export enum GetOfferingsParamsStatusEnum {
    PUBLISHING = "PUBLISHING",
    MODIFYING = "MODIFYING",
    PUBLISHED = "PUBLISHED",
    UNPUBLISHING = "UNPUBLISHING",
    UNSTABLE = "UNSTABLE",
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
}

/** Statut des configurations */
export enum GetConfigurationsParamsStatusEnum {
    UNPUBLISHED = "UNPUBLISHED",
    PUBLISHED = "PUBLISHED",
    SYNCHRONIZING = "SYNCHRONIZING",
}

export enum GetAll3ParamsFieldsEnum {
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
export enum GetAll3ParamsTypeEnum {
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
export enum GetAll3ParamsStatusEnum {
    CREATED = "CREATED",
    GENERATING = "GENERATING",
    MODIFYING = "MODIFYING",
    GENERATED = "GENERATED",
    DELETED = "DELETED",
    UNSTABLE = "UNSTABLE",
}

/** Type de stockage */
export enum GetStoragesParamsTypeEnum {
    POSTGRESQL = "POSTGRESQL",
    S3 = "S3",
    FILESYSTEM = "FILESYSTEM",
    OPENSEARCH = "OPENSEARCH",
    POSTGRESQLROUTING = "POSTGRESQL-ROUTING",
}

export enum GetAll5ParamsFieldsEnum {
    Creation = "creation",
    Name = "name",
    Description = "description",
    Priority = "priority",
    InputTypes = "input_types",
    OutputTypes = "output_types",
}

export enum GetAll8ParamsFieldsEnum {
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
export enum GetAll8ParamsTypeEnum {
    WMSVECTOR = "WMS-VECTOR",
    WFS = "WFS",
    WMTSTMS = "WMTS-TMS",
    WMSRASTER = "WMS-RASTER",
    DOWNLOAD = "DOWNLOAD",
    ITINERARYISOCURVE = "ITINERARY-ISOCURVE",
    ALTIMETRY = "ALTIMETRY",
    SEARCH = "SEARCH",
    VECTORTMS = "VECTOR-TMS",
}

/** Statut des offres */
export enum GetAll8ParamsStatusEnum {
    PUBLISHING = "PUBLISHING",
    MODIFYING = "MODIFYING",
    PUBLISHED = "PUBLISHED",
    UNPUBLISHING = "UNPUBLISHING",
    UNSTABLE = "UNSTABLE",
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
}

/** Types de livraisons ayant cette vérification par défaut */
export enum GetAll11ParamsDefaultUploadTypeEnum {
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
export enum GetAll12ParamsStatusEnum {
    WAITING = "WAITING",
    PROGRESS = "PROGRESS",
    SUCCESS = "SUCCESS",
    FAILURE = "FAILURE",
}

/** Filtre sur les droits de l'utlisateur */
export enum GetUsers1ParamsRightsEnum {
    COMMUNITY = "COMMUNITY",
    PROCESSING = "PROCESSING",
    ANNEX = "ANNEX",
    BROADCAST = "BROADCAST",
    UPLOAD = "UPLOAD",
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

export enum GetAll15ParamsFieldsEnum {
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
export enum GetAll15ParamsTypeEnum {
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
export enum GetAll15ParamsStatusEnum {
    CREATED = "CREATED",
    OPEN = "OPEN",
    CLOSED = "CLOSED",
    CHECKING = "CHECKING",
    GENERATING = "GENERATING",
    MODIFYING = "MODIFYING",
    UNSTABLE = "UNSTABLE",
    DELETED = "DELETED",
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

/** Type du fichier statique */
export enum GetAll18ParamsTypeEnum {
    GEOSERVERFTL = "GEOSERVER-FTL",
    GEOSERVERSTYLE = "GEOSERVER-STYLE",
    ROK4STYLE = "ROK4-STYLE",
    DERIVATIONSQL = "DERIVATION-SQL",
}

/** Statut des exécutions à récupérer */
export enum GetAll20ParamsStatusEnum {
    CREATED = "CREATED",
    WAITING = "WAITING",
    PROGRESS = "PROGRESS",
    SUCCESS = "SUCCESS",
    FAILURE = "FAILURE",
    ABORTED = "ABORTED",
}

export enum GetAll23ParamsFieldsEnum {
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
export enum GetAll23ParamsTypeEnum {
    WMSVECTOR = "WMS-VECTOR",
    WFS = "WFS",
    WMTSTMS = "WMTS-TMS",
    WMSRASTER = "WMS-RASTER",
    DOWNLOAD = "DOWNLOAD",
    ITINERARYISOCURVE = "ITINERARY-ISOCURVE",
    ALTIMETRY = "ALTIMETRY",
    SEARCH = "SEARCH",
    VECTORTMS = "VECTOR-TMS",
}

/** Statut des offres */
export enum GetAll23ParamsStatusEnum {
    PUBLISHING = "PUBLISHING",
    MODIFYING = "MODIFYING",
    PUBLISHED = "PUBLISHED",
    UNPUBLISHING = "UNPUBLISHING",
    UNSTABLE = "UNSTABLE",
}

export enum GetAll26ParamsFieldsEnum {
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
export enum GetAll26ParamsTypeEnum {
    WMSVECTOR = "WMS-VECTOR",
    WFS = "WFS",
    WMTSTMS = "WMTS-TMS",
    WMSRASTER = "WMS-RASTER",
    DOWNLOAD = "DOWNLOAD",
    ITINERARYISOCURVE = "ITINERARY-ISOCURVE",
    ALTIMETRY = "ALTIMETRY",
    SEARCH = "SEARCH",
    VECTORTMS = "VECTOR-TMS",
}

/** Statut des configurations */
export enum GetAll26ParamsStatusEnum {
    UNPUBLISHED = "UNPUBLISHED",
    PUBLISHED = "PUBLISHED",
    SYNCHRONIZING = "SYNCHRONIZING",
}
