/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

type UtilRequiredKeys<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/** Texte du commentaire à ajouter */
export interface CommentSaveDto {
    text: string;
}

/** Information sur l'auteur */
export interface AuthorResponseDto {
    first_name: string;
    last_name: string;
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Commentaire */
export interface CommentResponseDto {
    /** @format date-time */
    creation: string;
    /** @format date-time */
    last_modification?: string;
    text: string;
    /** Information sur l'auteur */
    author: AuthorResponseDto;
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations spécifiques d'un fichier de dérivation SQL */
export type StaticFileDerivationSqlDetailsDto = StaticFileDetailsDto & {
    /** @uniqueItems true */
    used_variables: string[];
};

/** Informations détaillées sur le fichier statique */
export interface StaticFileDetailResponseDto {
    /** Nom du fichier statique */
    name: string;
    /** Description du fichier statique */
    description?: string;
    /** Type du fichier statique */
    type: "GEOSERVER-FTL" | "GEOSERVER-STYLE" | "ROK4-STYLE" | "DERIVATION-SQL";
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
    type_infos: StaticFileDerivationSqlDetailsDto | StaticFileGeoserverFtlDetailsDto | StaticFileGeoserverStyleDetailsDto | StaticFileRok4StyleDetailsDto;
}

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

/** Informations sur la configuration de l'offre */
export interface ConfigurationResponseDto {
    /** Nom de la configuration */
    name: string;
    status: "UNPUBLISHED" | "PUBLISHED" | "SYNCHRONIZING";
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations sur le point d'accès */
export interface EndpointListResponseDto {
    /** le nom du point d'accès */
    name: string;
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Liste des urls du point d'accès */
export interface EndpointUrl {
    /** Type de l'URL du point d'accès */
    type: string;
    /** URL du point d'accès */
    url: string;
}

/** Informations détaillées sur l'offre' */
export interface OfferingDetailResponseDto {
    /** Visibilité de l'offre */
    visibility: string;
    /** Indique si l'offre est ouverte sans clé d'accès */
    open: boolean;
    /** Indique si l'offre est disponible */
    available: boolean;
    /** Nom technique de la ressource. Ce nom doit être unique sur la plateforme pour un type de configuration donné. Uniquement des caractères alphanumériques, tiret, tiret bas, point */
    layer_name: string;
    /** Type de configuration */
    type: "WMS-VECTOR" | "WFS" | "WFS-INSPIRE" | "WMTS-TMS" | "WMS-RASTER" | "DOWNLOAD" | "ITINERARY-ISOCURVE" | "ALTIMETRY";
    /** Statut de l'offre */
    status: string;
    /** Informations sur la configuration de l'offre */
    configuration: ConfigurationResponseDto;
    /** Informations sur le point d'accès */
    endpoint: EndpointListResponseDto;
    /** @uniqueItems true */
    urls: EndpointUrl[];
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
}

export interface MetadataResponseDto {
    type: "INSPIRE" | "ISOAP";
    level: "DATASET" | "SERIES";
    file_identifier: string;
    endpoints?: EndpointListResponseDto[];
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Bounding box de la configuration */
export interface BoundingBox {
    west: number;
    south: number;
    east: number;
    north: number;
}

export type ConfigurationAltimetryDetailsContent = ConfigurationDetailsContent & {
    /** Bounding box de la configuration */
    bbox?: BoundingBox;
    /** Titre de la configuration */
    title: string;
    /**
     * Mots clés de la configuration
     * @uniqueItems true
     */
    keywords?: string[];
    /**
     * Données utilisées par la configuration
     * @uniqueItems true
     */
    used_data: ConfigurationUsedDataAltimetryDetailsContent[];
    /** Description de la configuration */
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
    title: string;
    /** @uniqueItems true */
    used_data: ConfigurationUsedDataDownloadDetailsContent[];
    abstract: string;
};

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
    /** Bounding box de la configuration */
    bbox?: BoundingBox;
    /** Titre de la configuration */
    title: string;
    /**
     * Mots clés de la configuration
     * @uniqueItems true
     */
    keywords?: string[];
    /** Limites pour les calculs d'itinéraire (nombre d'étapes et de contraintes) et d'isochrone (durée et distance) */
    limits?: ConfigurationLimitsItineraryIsocurveDetailsContent;
    /** Définition des contraintes pour la configuration */
    constraints?: object;
    /**
     * Projection(s) de la configuration
     * @uniqueItems true
     */
    srss?: string[];
    /**
     * Données utilisées par la configuration
     * @uniqueItems true
     */
    used_data: ConfigurationUsedDataItineraryIsocurveDetailsContent[];
    /** Description de la configuration */
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
    type: "ISO19115:2003" | "FGDC" | "TC211" | "19139" | "Other";
}

/** Informations à fournir pour modifier la configuration */
export interface ConfigurationUpdateDto {
    /** Type de configuration */
    type: "WMS-VECTOR" | "WFS" | "WFS-INSPIRE" | "WMTS-TMS" | "WMS-RASTER" | "DOWNLOAD" | "ITINERARY-ISOCURVE" | "ALTIMETRY";
    /** Nom de la configuration */
    name: string;
    /** Métadonnées liées au propriétaire de la configuration */
    attribution?: ConfigurationAttribution;
    type_infos:
        | ConfigurationAltimetryDetailsContent
        | ConfigurationDownloadDetailsContent
        | ConfigurationItineraryIsocurveDetailsContent
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

/** Informations sur la précision des données */
export type ConfigurationUsedDataAccuracyAltimetryDetailsContent =
    | ConfigurationUsedDataAccuracyManualAltimetryDetailsContent
    | ConfigurationUsedDataAccuracyPyramidAltimetryDetailsContent;

export type ConfigurationUsedDataAccuracyManualAltimetryDetailsContent = ConfigurationUsedDataAccuracyAltimetryDetailsContent & {
    /**
     * Valeur unique pour la précision des données
     * @format int32
     * @min 0
     */
    value: number;
};

export type ConfigurationUsedDataAccuracyPyramidAltimetryDetailsContent = ConfigurationUsedDataAccuracyAltimetryDetailsContent & {
    /** Mapping entre les valeurs de la pyramide et les valeurs effectivement renvoyées */
    mapping: Record<string, number>;
    /**
     * Identifiant de la donnée stockée
     * @format uuid
     */
    stored_data: string;
};

export interface ConfigurationUsedDataAltimetryDetailsContent {
    /** Titre de la configuration */
    title: string;
    /** Bounding box de la configuration */
    bbox?: BoundingBox;
    /** Informations sur la source des données */
    source: ConfigurationUsedDataSourceAltimetryDetailsContent;
    /** Informations sur la précision des données */
    accuracy: ConfigurationUsedDataAccuracyAltimetryDetailsContent;
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

export interface ConfigurationUsedDataDownloadDetailsContent {
    sub_name: string;
    title?: string;
    format?: string;
    zone?: string;
    /**
     * Identifiant de la donnée stockée
     * @format uuid
     */
    stored_data: string;
    abstract?: string;
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
    cost_type?: "time" | "distance";
    /** Méthode de calcul de coût (pour stored data de type GRAPHE-VALHALLA) */
    costing?: "auto" | "auto_shorter" | "pedestrian";
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

export interface ConfigurationUsedDataRelationWfsDetailsContent {
    /** Nom de la table */
    native_name: string;
    public_name?: string;
    title: string;
    /** @uniqueItems true */
    keywords?: string[];
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

/** Informations sur la source des données */
export type ConfigurationUsedDataSourceAltimetryDetailsContent =
    | ConfigurationUsedDataSourceManualAltimetryDetailsContent
    | ConfigurationUsedDataSourcePyramidAltimetryDetailsContent;

export type ConfigurationUsedDataSourceManualAltimetryDetailsContent = ConfigurationUsedDataSourceAltimetryDetailsContent & {
    /** Valeur unique pour la source des données */
    value: string;
};

export type ConfigurationUsedDataSourcePyramidAltimetryDetailsContent = ConfigurationUsedDataSourceAltimetryDetailsContent & {
    /** Mapping entre les valeurs de la pyramide et les valeurs effectivement renvoyées */
    mapping: Record<string, string>;
    /**
     * Identifiant de la donnée stockée
     * @format uuid
     */
    stored_data: string;
};

export interface ConfigurationUsedDataWfsDetailsContent {
    /** @uniqueItems true */
    relations: ConfigurationUsedDataRelationWfsDetailsContent[];
    /**
     * Identifiant de la donnée stockée
     * @format uuid
     */
    stored_data: string;
}

export interface ConfigurationUsedDataWmsVectorDetailsContent {
    /** @uniqueItems true */
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

export type ConfigurationWfsDetailsContent = ConfigurationDetailsContent & {
    /** Bounding box de la configuration */
    bbox?: BoundingBox;
    /** @uniqueItems true */
    used_data: ConfigurationUsedDataWfsDetailsContent[];
};

export type ConfigurationWmsRasterDetailsContent = ConfigurationDetailsContent & {
    /** Bounding box de la configuration */
    bbox?: BoundingBox;
    title: string;
    /** @uniqueItems true */
    keywords?: string[];
    /**
     * Identifiants des fichiers statiques de style Rok4
     * @uniqueItems true
     */
    styles?: string[];
    /** @uniqueItems true */
    used_data: ConfigurationUsedDataWmtsTmsDetailsContent[];
    /**
     * Interpolation utilisée pour les conversions de résolution
     * @default "BICUBIC"
     */
    interpolation?: "NEAREST-NEIGHBOUR" | "LINEAR" | "BICUBIC" | "LANCZOS2" | "LANCZOS3" | "LANCZOS4";
    /** Résolution minimale de la couche */
    bottom_resolution?: number;
    /** Résolution maximale de la couche */
    top_resolution?: number;
    abstract: string;
    /** Ressource cible du GetFeatureInfo */
    getfeatureinfo?: ConfigurationGetFeatureInfoWmtsTmsDetailsContent;
};

export type ConfigurationWmsVectorDetailsContent = ConfigurationDetailsContent & {
    /** Bounding box de la configuration */
    bbox?: BoundingBox;
    title: string;
    /** @uniqueItems true */
    keywords?: string[];
    /** @uniqueItems true */
    used_data: ConfigurationUsedDataWmsVectorDetailsContent[];
    abstract: string;
};

export type ConfigurationWmtsTmsDetailsContent = ConfigurationDetailsContent & {
    /** Bounding box de la configuration */
    bbox?: BoundingBox;
    title: string;
    /** @uniqueItems true */
    keywords?: string[];
    /**
     * Identifiants des fichiers statiques de style Rok4
     * @uniqueItems true
     */
    styles?: string[];
    /** @uniqueItems true */
    used_data: ConfigurationUsedDataWmtsTmsDetailsContent[];
    abstract: string;
    /** Ressource cible du GetFeatureInfo */
    getfeatureinfo?: ConfigurationGetFeatureInfoWmtsTmsDetailsContent;
};

/** Informations détaillées sur la configuration */
export interface ConfigurationDetailResponseDto {
    /** Nom de la configuration */
    name: string;
    /** Nom technique de la ressource. Ce nom doit être unique sur la plateforme pour un type de configuration donné. Uniquement des caractères alphanumériques, tiret, tiret bas, point */
    layer_name: string;
    /** Type de configuration */
    type: "WMS-VECTOR" | "WFS" | "WFS-INSPIRE" | "WMTS-TMS" | "WMS-RASTER" | "DOWNLOAD" | "ITINERARY-ISOCURVE" | "ALTIMETRY";
    status: "UNPUBLISHED" | "PUBLISHED" | "SYNCHRONIZING";
    tags: Record<string, string>;
    /** Métadonnées liées au propriétaire de la configuration */
    attribution?: ConfigurationAttribution;
    /** Informations sur l'évènement */
    last_event?: EventDto;
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Métadonnées liées à la configuration
     * @uniqueItems true
     */
    metadata?: ConfigurationMetadata[];
    type_infos:
        | ConfigurationAltimetryDetailsContent
        | ConfigurationDownloadDetailsContent
        | ConfigurationItineraryIsocurveDetailsContent
        | ConfigurationWfsDetailsContent
        | ConfigurationWmsRasterDetailsContent
        | ConfigurationWmsVectorDetailsContent
        | ConfigurationWmtsTmsDetailsContent;
}

/** Informations sur l'évènement */
export interface EventDto {
    title: string;
    text?: string;
    /** @format date-time */
    date: string;
    /** Informations sur l'initiateur de l'évènement */
    initiator?: EventInitiatorDto;
}

/** Informations sur l'initiateur de l'évènement */
export interface EventInitiatorDto {
    last_name: string;
    first_name: string;
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations détaillées sur l'annexe */
export interface AnnexDetailResponseDto {
    /** @uniqueItems true */
    paths: string[];
    /** @format int64 */
    size: number;
    mime_type: string;
    published: boolean;
    /** @uniqueItems true */
    labels?: string[];
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
}

export interface CommunityAddUserDto {
    /** @uniqueItems true */
    rights?: ("COMMUNITY" | "PROCESSING" | "ANNEX" | "BROADCAST" | "UPLOAD")[];
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
    priority?: "STANDARD" | "PREMIUM";
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
    upload?: ("VECTOR" | "RASTER" | "ARCHIVE" | "ROK4-PYRAMID")[];
    /**
     * Types de données stockées en entrée acceptés
     * @uniqueItems true
     */
    stored_data?: ("ROK4-PYRAMID-RASTER" | "ROK4-PYRAMID-VECTOR" | "VECTOR-DB" | "ARCHIVE" | "GRAPH-DB" | "GRAPH-OSRM" | "GRAPH-VALHALLA")[];
}

export type ProcessingOutputTypeDto = object;

/** Type de donnée stockée en sortie du traitement */
export type ProcessingOutputTypeStoredDataDto = ProcessingOutputTypeDto & {
    /** Type de donnée stockée */
    stored_data: "ROK4-PYRAMID-RASTER" | "ROK4-PYRAMID-VECTOR" | "VECTOR-DB" | "ARCHIVE" | "GRAPH-DB" | "GRAPH-OSRM" | "GRAPH-VALHALLA";
    /**
     * Types de stockage cible du traitement
     * @minItems 1
     * @uniqueItems true
     */
    storage: ("POSTGRESQL" | "S3" | "FILESYSTEM" | "POSTGRESQL-ROUTING")[];
};

/** Type de livraison en sortie du traitement */
export type ProcessingOutputTypeUploadDto = ProcessingOutputTypeDto & {
    /** Type de livraison */
    upload: "VECTOR" | "RASTER" | "ARCHIVE" | "ROK4-PYRAMID";
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
    static_type: "GEOSERVER-FTL" | "GEOSERVER-STYLE" | "ROK4-STYLE" | "DERIVATION-SQL";
};

/** Informations sur la vérification */
export interface CheckingListResponseDto {
    /** Nom de la vérification. ce nom doit être unique pour la plateforme */
    name: string;
    /** Description de la vérification */
    description: string;
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations sur le traitement */
export interface ProcessingAdminDetailResponseDto {
    /** Nom du traitement. ce nom doit être unique pour la plateforme */
    name: string;
    /** Description du traitement */
    description: string;
    /** Priorité de traitement */
    priority?: "STANDARD" | "PREMIUM";
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
     * identifiant technique
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

export interface UserKeyCreateDtoUserKeyInfoDto {
    name: string;
    type?: "HASH" | "HEADER" | "BASIC" | "OAUTH2";
    whitelist?: string[];
    blacklist?: string[];
    user_agent?: string;
    referer?: string;
    type_infos: UserKeyInfoDto;
}

export type UserKeyInfoDto = object;

export type UserOauth2KeyCreateDto = UtilRequiredKeys<UserKeyCreateDtoUserKeyInfoDto, "name" | "type_infos"> & {
    type_infos: OAuth2InfoDto;
};

export interface UserKeyDetailsResponseDtoUserKeyInfoDto {
    name: string;
    type?: "HASH" | "HEADER" | "BASIC" | "OAUTH2";
    whitelist?: string[];
    blacklist?: string[];
    user_agent?: string;
    referer?: string;
    type_infos: UserKeyInfoDto;
    /**
     * identifiant technique
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

export interface Coordinate {
    /** @format double */
    x?: number;
    /** @format double */
    y?: number;
    /** @format double */
    z?: number;
    valid?: boolean;
    /** @format double */
    m?: number;
    coordinate?: Coordinate;
}

export interface CoordinateSequence {
    /** @format int32 */
    dimension?: number;
    /** @format int32 */
    measures?: number;
}

export type CoordinateSequenceFactory = object;

export interface Envelope {
    null?: boolean;
    /** @format double */
    diameter?: number;
    /** @format double */
    min_x?: number;
    /** @format double */
    min_y?: number;
    /** @format double */
    max_x?: number;
    /** @format double */
    max_y?: number;
    /** @format double */
    height?: number;
    /** @format double */
    area?: number;
    /** @format double */
    width?: number;
}

export interface Geometry {
    envelope?: Geometry;
    factory?: GeometryFactory;
    user_data?: object;
    /** @format double */
    length?: number;
    empty?: boolean;
    valid?: boolean;
    /** @format int32 */
    num_geometries?: number;
    coordinate?: Coordinate;
    precision_model?: PrecisionModel;
    /** @format int32 */
    srid?: number;
    /** @format int32 */
    dimension?: number;
    geometry_type?: string;
    coordinates?: Coordinate[];
    /** @format int32 */
    num_points?: number;
    rectangle?: boolean;
    /** @format double */
    area?: number;
    centroid?: Point;
    interior_point?: Point;
    boundary?: Geometry;
    envelope_internal?: Envelope;
    /** @format int32 */
    boundary_dimension?: number;
    simple?: boolean;
}

export interface GeometryFactory {
    precision_model?: PrecisionModel;
    coordinate_sequence_factory?: CoordinateSequenceFactory;
    /** @format int32 */
    srid?: number;
}

export interface Point {
    envelope?: Geometry;
    factory?: GeometryFactory;
    user_data?: object;
    coordinates?: Coordinate[];
    empty?: boolean;
    /** @format double */
    y?: number;
    coordinate?: Coordinate;
    /** @format int32 */
    dimension?: number;
    geometry_type?: string;
    /** @format int32 */
    num_points?: number;
    boundary?: Geometry;
    /** @format double */
    x?: number;
    coordinate_sequence?: CoordinateSequence;
    /** @format int32 */
    boundary_dimension?: number;
    simple?: boolean;
    /** @format double */
    length?: number;
    valid?: boolean;
    /** @format int32 */
    num_geometries?: number;
    precision_model?: PrecisionModel;
    /** @format int32 */
    srid?: number;
    rectangle?: boolean;
    /** @format double */
    area?: number;
    centroid?: Point;
    interior_point?: Point;
    envelope_internal?: Envelope;
}

export interface PrecisionModel {
    /** @format double */
    scale?: number;
    type?: Type;
    floating?: boolean;
    /** @format double */
    offset_x?: number;
    /** @format double */
    offset_y?: number;
    /** @format int32 */
    maximum_significant_digits?: number;
}

/** Informations spécifiques d'une donnée stockée archive */
export type StoredDataArchiveDetailsDto = StoredDataDetailsDto & {
    /**
     * Nombre de fichiers contenus dans la donnée stockée
     * @format int32
     */
    files_number: number;
};

/** Paramètres de la donnée stockée à créer */
export interface StoredDataCreateDto {
    name: string;
    type: "ROK4-PYRAMID-RASTER" | "ROK4-PYRAMID-VECTOR" | "VECTOR-DB" | "ARCHIVE" | "GRAPH-DB" | "GRAPH-OSRM" | "GRAPH-VALHALLA";
    /** @default "private" */
    visibility?: "PRIVATE" | "REFERENCED" | "PUBLIC";
    srs?: string;
    extent?: Geometry;
    /** @format int64 */
    size?: number;
    /** @default "GENERATED" */
    status?: "CREATED" | "GENERATING" | "MODIFYING" | "GENERATED" | "DELETED" | "UNSTABLE";
    /** @format uuid */
    _id?: string;
    /** @format uuid */
    datastore: string;
    /** @format uuid */
    storage: string;
    type_infos?:
        | StoredDataArchiveDetailsDto
        | StoredDataGraphDbDetailsDto
        | StoredDataGraphDetailsDto
        | StoredDataRok4PyramidRasterDetailsDto
        | StoredDataRok4PyramidVectorDetailsDto
        | StoredDataVectorDbDetailsDto;
}

/** Détails sur une donnée stockée */
export type StoredDataDetailsDto =
    | StoredDataRok4PyramidRasterDetailsDto
    | StoredDataRok4PyramidVectorDetailsDto
    | StoredDataVectorDbDetailsDto
    | StoredDataArchiveDetailsDto
    | StoredDataGraphDbDetailsDto
    | StoredDataGraphDetailsDto;

/** Liste des relations en BDD */
export interface StoredDataDetailsRelationDto {
    name: string;
    type: "TABLE" | "VIEW";
    attributes: string[];
    primary_key?: string[];
}

/** Informations spécifiques d'une donnée stockée graphe d'itinéraire DB */
export type StoredDataGraphDbDetailsDto = StoredDataDetailsDto & {
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
export type StoredDataGraphDetailsDto = StoredDataDetailsDto & {
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
}

/** Informations spécifiques d'une donnée stockée pyramide Rok4 Raster */
export type StoredDataRok4PyramidRasterDetailsDto = StoredDataDetailsDto & {
    tms: string;
    /** @uniqueItems true */
    levels: string[];
    channels_format: "UINT8" | "UINT16" | "FLOAT32";
    /**
     * @format int32
     * @min 1
     */
    channels_number: number;
    compression: "RAW" | "JPG" | "PNG" | "LZW" | "ZIP" | "PKB" | "JPG90";
    nodata_value: string;
};

/** Informations spécifiques d'une donnée stockée pyramide Rok4 Vecteur */
export type StoredDataRok4PyramidVectorDetailsDto = StoredDataDetailsDto & {
    tms: string;
    /** @uniqueItems true */
    levels: string[];
};

/** Informations spécifiques d'une donnée stockée base vectorielle */
export type StoredDataVectorDbDetailsDto = StoredDataDetailsDto & {
    /** @uniqueItems true */
    relations: StoredDataDetailsRelationDto[];
};

export type Type = object;

export interface StoredDataPrivateDetailResponseDto {
    name: string;
    type: "ROK4-PYRAMID-RASTER" | "ROK4-PYRAMID-VECTOR" | "VECTOR-DB" | "ARCHIVE" | "GRAPH-DB" | "GRAPH-OSRM" | "GRAPH-VALHALLA";
    visibility: "PRIVATE" | "REFERENCED" | "PUBLIC";
    srs?: string;
    contact: string;
    extent?: Geometry;
    /** Informations sur l'évènement */
    last_event?: EventDto;
    tags?: Record<string, string>;
    storage: StoredDataStorageDto;
    /** @format int64 */
    size?: number;
    status: "CREATED" | "GENERATING" | "MODIFYING" | "GENERATED" | "DELETED" | "UNSTABLE";
    /** @format uuid */
    _id: string;
    /** Détails sur une donnée stockée */
    type_infos?: StoredDataDetailsDto;
}

export interface StoredDataStorageDto {
    type: "POSTGRESQL" | "S3" | "FILESYSTEM" | "POSTGRESQL-ROUTING";
    /** @uniqueItems true */
    labels?: string[];
}

/** Certains type de livraison ne nécessitent pas d'informations spécifiques */
export type EmptyDetails = UploadDetailsDto;

/** Informations à fournir pour la déclaration d'une nouvelle livraison, la livraison est privée par défaut */
export interface UploadCreateDto {
    description: string;
    name: string;
    type: "VECTOR" | "RASTER" | "ARCHIVE" | "ROK4-PYRAMID";
    srs: string;
    /** Détails sur une livraison */
    type_infos?: UploadDetailsDto;
}

/** Détails sur une livraison */
export type UploadDetailsDto = EmptyDetails | UploadRok4PyramidDetailsDto;

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

/** Informations détaillées sur la livraison */
export interface UploadPrivateDetailResponseDto {
    name: string;
    description: string;
    type: "VECTOR" | "RASTER" | "ARCHIVE" | "ROK4-PYRAMID";
    visibility: "PRIVATE" | "REFERENCED" | "PUBLIC";
    status: "CREATED" | "OPEN" | "CLOSED" | "CHECKING" | "GENERATING" | "MODIFYING" | "UNSTABLE" | "DELETED";
    srs: string;
    contact: string;
    extent?: Geometry;
    /** @format int64 */
    size?: number;
    /** Informations sur l'évènement */
    last_event?: EventDto;
    tags?: Record<string, string>;
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
    /** Détails sur une livraison */
    type_infos?: UploadDetailsDto;
}

/** Paramètres de la livraison à téléverser */
export interface UploadDataCreateDto {
    /** @format binary */
    file: File;
    /** Sous arborescence dans la livraison */
    path: string;
}

/** Paramètres du statique à ajouter */
export interface StaticFileCreateDto {
    /** @format binary */
    file: File;
    /** le nom du fichier statique */
    name: string;
    /** la description du fichier statique */
    description?: string;
    /** le type du fichier statique */
    type: "GEOSERVER-FTL" | "GEOSERVER-STYLE" | "ROK4-STYLE" | "DERIVATION-SQL";
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
    storage_type?: "POSTGRESQL" | "S3" | "FILESYSTEM" | "POSTGRESQL-ROUTING";
    storage_tags?: string[];
};

export type StoredDataOutputDto = IdFieldDto | StoredDataCreationDto;

export type UploadOutputDto = NamedFieldDto | IdFieldDto;

/** Informations détaillées sur l'exécution de traitement */
export interface ProcessingExecutionDetailResponseDto {
    /** Informations sur le traitement */
    processing: ProcessingExecutionProcessingDto;
    status: "CREATED" | "WAITING" | "PROGRESS" | "SUCCESS" | "FAILURE" | "ABORTED";
    /** @format date-time */
    creation: string;
    /** @format date-time */
    launch?: string;
    /** @format date-time */
    start?: string;
    /** @format date-time */
    finish?: string;
    inputs: ProcessingExecutionInputDto;
    output: ProcessingExecutionOutputStoredDataDto | ProcessingExecutionOutputUploadDto;
    parameters: Record<string, object>;
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
}

export interface ProcessingExecutionInputDto {
    /** @uniqueItems true */
    upload: ProcessingExecutionUploadDto[];
    /** @uniqueItems true */
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

/** Informations sur le traitement */
export interface ProcessingExecutionProcessingDto {
    name: string;
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations simplifiée sur une donnée stockée */
export interface ProcessingExecutionStoredDataDto {
    name: string;
    type: "ROK4-PYRAMID-RASTER" | "ROK4-PYRAMID-VECTOR" | "VECTOR-DB" | "ARCHIVE" | "GRAPH-DB" | "GRAPH-OSRM" | "GRAPH-VALHALLA";
    status: "CREATED" | "GENERATING" | "MODIFYING" | "GENERATED" | "DELETED" | "UNSTABLE";
    srs: string;
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations simplifiée sur une livraison */
export interface ProcessingExecutionUploadDto {
    type: "VECTOR" | "RASTER" | "ARCHIVE" | "ROK4-PYRAMID";
    name: string;
    status: "CREATED" | "OPEN" | "CLOSED" | "CHECKING" | "GENERATING" | "MODIFYING" | "UNSTABLE" | "DELETED";
    srs?: string;
    /**
     * identifiant technique
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

export interface PermissionCreateDto {
    /** @format date-time */
    end_date?: string;
    licence: string;
    /** @uniqueItems true */
    offerings: string[];
    type?: "ACCOUNT" | "COMMUNITY";
    only_oauth?: boolean;
}

export interface DatastorePermissionResponseDto {
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
     * identifiant technique
     * @format uuid
     */
    _id: string;
}

export interface PermissionAccountBeneficiaryResponseDto {
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
    last_name: string;
    first_name: string;
}

/** Information sur le bénéficiaire de la permission de l'entrepôt */
export type PermissionBeneficiaryDto = (
    | UtilRequiredKeys<PermissionAccountBeneficiaryResponseDto, "_id">
    | UtilRequiredKeys<PermissionCommunityBeneficiaryResponseDto, "_id">
) & {
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
};

export interface PermissionCommunityBeneficiaryResponseDto {
    name: string;
    /** @pattern ^[A-Za-z0-9_\-.]+$ */
    technical_name: string;
    contact?: string;
    public?: boolean;
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
}

export interface PermissionDatastoreAuthorDto {
    name?: string;
    technical_name?: string;
    active?: boolean;
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Information sur l'offre */
export interface PermissionOfferingResponseDto {
    /** Type de configuration */
    type: "WMS-VECTOR" | "WFS" | "WFS-INSPIRE" | "WMTS-TMS" | "WMS-RASTER" | "DOWNLOAD" | "ITINERARY-ISOCURVE" | "ALTIMETRY";
    /** Visibilité de l'offre */
    visibility: "PRIVATE" | "REFERENCED" | "PUBLIC";
    /** Statut de l'offre */
    status: "PUBLISHING" | "MODIFYING" | "PUBLISHED" | "UNPUBLISHING" | "UNSTABLE";
    /** Nom technique de la ressource. Ce nom doit être unique sur la plateforme pour un type de configuration donné. Uniquement des caractères alphanumériques, tiret, tiret bas, point */
    layer_name: string;
    /** Indique si l'offre est ouverte sans clé d'accès */
    open: boolean;
    /** Indique si l'offre est disponible */
    available: boolean;
    /**
     * identifiant technique
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
    type: "WMS-VECTOR" | "WFS" | "WFS-INSPIRE" | "WMTS-TMS" | "WMS-RASTER" | "DOWNLOAD" | "ITINERARY-ISOCURVE" | "ALTIMETRY";
    /** Nom de la configuration */
    name: string;
    /** Métadonnées liées au propriétaire de la configuration */
    attribution?: ConfigurationAttribution;
    /**
     * Nom technique de la ressource. Ce nom doit être unique sur la plateforme pour un type de configuration donné. Uniquement des caractères alphanumériques, tiret, tiret bas, point
     * @pattern ^[A-Za-z0-9_\-.]+$
     */
    layer_name: string;
    type_infos:
        | ConfigurationAltimetryDetailsContent
        | ConfigurationDownloadDetailsContent
        | ConfigurationItineraryIsocurveDetailsContent
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
    /** @default "PRIVATE" */
    visibility?: "PRIVATE" | "REFERENCED" | "PUBLIC";
    /** @format uuid */
    endpoint: string;
    open?: boolean;
    permissions?: string[];
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
    type: "POSTGRESQL" | "S3" | "FILESYSTEM" | "POSTGRESQL-ROUTING";
    /** @uniqueItems true */
    labels?: string[];
    type_infos: StorageFileSystemDetailsDto | StoragePostgresqlDetailsDto | StorageS3DetailsDto;
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

/** Informations sur le stockage */
export interface StorageDetailResponseDto {
    /** Le nom du stockage. ce nom est unique pour la plateforme */
    name: string;
    /** Le type de stockage */
    type: StorageType;
    /** @uniqueItems true */
    labels: string[];
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
    type_infos?: StorageFileSystemDetailsDto | StoragePostgresqlDetailsDto | StorageS3DetailsDto;
}

/** Le type de stockage */
export enum StorageType {
    POSTGRESQL = "POSTGRESQL",
    S3 = "S3",
    FILESYSTEM = "FILESYSTEM",
    POSTGRESQLROUTING = "POSTGRESQL-ROUTING",
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
    type: "WMS-VECTOR" | "WFS" | "WFS-INSPIRE" | "WMTS-TMS" | "WMS-RASTER" | "DOWNLOAD" | "METADATA" | "ITINERARY-ISOCURVE" | "ALTIMETRY";
    /** @uniqueItems true */
    urls: EndpointUrl[];
    /** Point d'accès ouvert ? (sans contrôle des accès) */
    open: boolean;
    metadata_fi: string;
}

/** Informations détaillées sur le point d'accès */
export interface EndpointDetailResponseDto {
    /** Nom du point d'accès. ce nom doit être unique. le nom est insensible à la casse */
    name: string;
    /** Nom technique du point d'accès. ce nom technique doit être unique */
    technical_name: string;
    /** Type du point d'accès */
    type: "WMS-VECTOR" | "WFS" | "WFS-INSPIRE" | "WMTS-TMS" | "WMS-RASTER" | "DOWNLOAD" | "METADATA" | "ITINERARY-ISOCURVE" | "ALTIMETRY";
    /** @uniqueItems true */
    urls: EndpointUrl[];
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
    /** Point d'accès ouvert ? (sans contrôle des accès) */
    open: boolean;
    metadata_fi?: string;
}

/** Paramètres de l'entrepôt à créer */
export interface DatastoreCreateDto {
    /** @uniqueItems true */
    processings?: string[];
    /** Stockages que l'entrepôt utilisera et quotas à ne pas dépasser */
    storages: DatastoreStoragesCreateDto;
    /** @uniqueItems true */
    endpoints: DatastoreEndpointDto[];
    /**
     * Communauté à laquelle l'entrepôt est rattaché
     * @format uuid
     */
    community: string;
    /** @uniqueItems true */
    check?: string[];
}

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

/** Stockages que l'entrepôt utilisera et quotas à ne pas dépasser */
export interface DatastoreStoragesCreateDto {
    /** @uniqueItems true */
    data: DatastoreStorageDto[];
    /** Informations sur le stockage */
    uploads: DatastoreStorageDto;
    /** Informations sur le stockage */
    annexes: DatastoreStorageDto;
}

/** Communauté à laquelle l'entrepôt est rattaché */
export interface DatastoreCommunityResponseDto {
    contact: string;
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
    public: boolean;
}

/** Informations sur l'entrepôt */
export interface DatastoreDetailResponseDto {
    /** Communauté à laquelle l'entrepôt est rattaché */
    community: DatastoreCommunityResponseDto;
    /** @uniqueItems true */
    processings: string[];
    name: string;
    technical_name: string;
    /**
     * Points d'accès rattachés à l'entrepôt
     * @uniqueItems true
     */
    endpoints: DatastoreEndpointResponseDto[];
    /** Stockages rattachés à l'entrepôt */
    storages: DatastoreStoragesResponseDto;
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
    /** @uniqueItems true */
    checks: string[];
    /** Datastore actif ou non */
    active: boolean;
}

/** Points d'accès rattachés à l'entrepôt */
export interface DatastoreEndpointResponseDto {
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

/** Stockages rattachés à l'entrepôt */
export interface DatastoreStoragesResponseDto {
    /** @uniqueItems true */
    data: DatastoreStorageResponseDto[];
    /** Informations sur le stockage */
    upload: DatastoreStorageResponseDto;
    /** Informations sur le stockage */
    annexe: DatastoreStorageResponseDto;
}

/** Informations sur le stockage */
export interface StorageListResponseDto {
    /** Le nom du stockage. ce nom est unique pour la plateforme */
    name: string;
    /** Le type de stockage */
    type: StorageType;
    /** @uniqueItems true */
    labels: string[];
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Paramètres de la communauté à créer */
export interface CommunityCreateDto {
    /** Nom de la communauté */
    name: string;
    /**
     * Nom technique de la communauté
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
    active?: boolean;
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations détaillées sur la communauté */
export interface CommunityDetailResponseDto {
    /** Nom de la communauté */
    name: string;
    /** Nom technique de la communauté */
    technical_name: string;
    /** Nom du contact de la communauté */
    contact: string;
    /** Informations sur l'entrepôt lié */
    datastore?: CommunityDatastoreResponseDto;
    /** Informations sur le superviseur de la communauté */
    supervisor: CommunitySupervisorResponseDto;
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
    /** Valeur définissant si la communauté est publique ou non */
    public: boolean;
}

/** Informations sur le superviseur de la communauté */
export interface CommunitySupervisorResponseDto {
    /** Courriel du superviseur */
    email?: string;
    /**
     * identifiant technique
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
    /** @uniqueItems true */
    default_uploads_check?: ("VECTOR" | "RASTER" | "ARCHIVE" | "ROK4-PYRAMID")[];
}

/** Informations sur la vérification */
export interface CheckingAdminDetailResponseDto {
    /** Nom de la vérification. ce nom doit être unique pour la plateforme */
    name: string;
    /** Description de la vérification */
    description: string;
    /** Nom technique de la vérification tel que connu par l'orchestrateur */
    orchestrator_job_name?: string;
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
    /** @uniqueItems true */
    default_uploads_check?: ("VECTOR" | "RASTER" | "ARCHIVE" | "ROK4-PYRAMID")[];
}

export interface UserKeyUpdateDto {
    name?: string;
    whitelist?: string[];
    blacklist?: string[];
    user_agent?: string;
    referer?: string;
}

/** Paramètres de la donnée stockée à créer */
export interface StoredDataUpdateTechnicalDto {
    name?: string;
    type: "ROK4-PYRAMID-RASTER" | "ROK4-PYRAMID-VECTOR" | "VECTOR-DB" | "ARCHIVE" | "GRAPH-DB" | "GRAPH-OSRM" | "GRAPH-VALHALLA";
    visibility?: "PRIVATE" | "REFERENCED" | "PUBLIC";
    srs?: string;
    extent?: Geometry;
    /** @format int64 */
    size?: number;
    status?: "CREATED" | "GENERATING" | "MODIFYING" | "GENERATED" | "DELETED" | "UNSTABLE";
    type_infos?:
        | StoredDataArchiveDetailsDto
        | StoredDataGraphDbDetailsDto
        | StoredDataGraphDetailsDto
        | StoredDataRok4PyramidRasterDetailsDto
        | StoredDataRok4PyramidVectorDetailsDto
        | StoredDataVectorDbDetailsDto;
}

/** Informations à fournir pour la modification d'une livraison existante */
export interface UploadUpdateDto {
    description?: string;
    name?: string;
    visibility?: "PRIVATE" | "REFERENCED" | "PUBLIC";
}

/** Informations à fournir pour la modification d'une donnée existante */
export interface StoredDataUpdateDto {
    name?: string;
    visibility?: "PRIVATE" | "REFERENCED" | "PUBLIC";
}

/** Paramètres du statique à modifier */
export interface StaticFilePatchDto {
    /** le nom du statique */
    name?: string;
    /** la description du statique */
    description?: string;
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
    visibility?: "PRIVATE" | "REFERENCED" | "PUBLIC";
    open?: boolean;
    available?: boolean;
}

export interface MetadataUpdateDto {
    type: "INSPIRE" | "ISOAP";
}

/** Paramètres modifiables de l'annexe */
export interface AnnexUpdateDto {
    /** @uniqueItems true */
    labels?: string[];
    published?: boolean;
    /** @uniqueItems true */
    paths?: string[];
}

/** Nouveaux paramètres de la communauté à modifier (ceux non fournis sont laissés en l'état) */
export interface CommunityUpdateDto {
    /** Nom de la communauté */
    name?: string;
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
    priority?: "STANDARD" | "PREMIUM";
}

/** Paramètres du point d'accès à modifier */
export interface EndpointUpdateDto {
    /** Nom du point d'accès. ce nom doit être unique. le nom est insensible à la casse */
    name?: string;
    /** @uniqueItems true */
    urls?: EndpointUrl[];
    metadata_fi?: string;
}

/** Stockages que l'entrepôt utilisera et quotas à ne pas dépasser */
export interface DatastoreStoragesUpdateDto {
    /** @uniqueItems true */
    data?: DatastoreStorageDto[];
    /** Informations sur le stockage */
    uploads?: DatastoreStorageDto;
    /** Informations sur le stockage */
    annexes?: DatastoreStorageDto;
}

/** Nouvelle configuration de l'entrepôt */
export interface DatastoreUpdateDto {
    active?: boolean;
    /** @uniqueItems true */
    processings?: string[];
    /** Stockages que l'entrepôt utilisera et quotas à ne pas dépasser */
    storages?: DatastoreStoragesUpdateDto;
    /** @uniqueItems true */
    endpoints?: DatastoreEndpointDto[];
    /** @uniqueItems true */
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
    /** @uniqueItems true */
    default_uploads_check?: ("VECTOR" | "RASTER" | "ARCHIVE" | "ROK4-PYRAMID")[];
}

export interface CommunityMemberDto {
    rights?: ("COMMUNITY" | "PROCESSING" | "ANNEX" | "BROADCAST" | "UPLOAD")[];
    community?: CommunityUserDto;
}

export interface CommunityUserDto {
    /** Nom de la communauté */
    name: string;
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
     * identifiant technique
     * @format uuid
     */
    _id: string;
}

export interface UserDetailsResponseDto {
    email: string;
    /** @format date-time */
    creation: string;
    /** @format date-time */
    last_call?: string;
    communities_member?: CommunityMemberDto[];
    administrator?: boolean;
    technical?: boolean;
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
    last_name: string;
    first_name: string;
}

/** Information sur la permission */
export interface PermissionWithOfferingsDetailsResponseDto {
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
     * identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Information sur la permission */
export interface PermissionDetailsResponseDto {
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
    only_oauth?: boolean;
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
}

export interface UserKeyResponseDto {
    name: string;
    type?: "HASH" | "HEADER" | "BASIC" | "OAUTH2";
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Information sur l'accès */
export interface AccessDetailsResponseDto {
    /** Information sur la permission */
    permission: PermissionResponseDto;
    /** Informations sur l'offre */
    offering: OfferingListResponseDto;
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations sur l'offre */
export interface OfferingListResponseDto {
    /** Visibilité de l'offre */
    visibility: string;
    /** Indique si l'offre est ouverte sans clé d'accès */
    open: boolean;
    /** Indique si l'offre est disponible */
    available: boolean;
    /** Nom technique de la ressource. Ce nom doit être unique sur la plateforme pour un type de configuration donné. Uniquement des caractères alphanumériques, tiret, tiret bas, point */
    layer_name: string;
    /** Type de configuration */
    type: "WMS-VECTOR" | "WFS" | "WFS-INSPIRE" | "WMTS-TMS" | "WMS-RASTER" | "DOWNLOAD" | "ITINERARY-ISOCURVE" | "ALTIMETRY";
    /** Statut de l'offre */
    status: string;
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Information sur la permission */
export interface PermissionResponseDto {
    /** Licence de la permission */
    licence: string;
    /**
     * Date de fin de la permission
     * @format date-time
     */
    end_date: string;
    only_oauth?: boolean;
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
}

export interface OfferingEndpointListResponseDto {
    /** Type de configuration */
    type: "WMS-VECTOR" | "WFS" | "WFS-INSPIRE" | "WMTS-TMS" | "WMS-RASTER" | "DOWNLOAD" | "ITINERARY-ISOCURVE" | "ALTIMETRY";
    /** Statut de l'offre */
    status: "PUBLISHING" | "MODIFYING" | "PUBLISHED" | "UNPUBLISHING" | "UNSTABLE";
    /** Nom technique de la ressource. Ce nom doit être unique sur la plateforme pour un type de configuration donné. Uniquement des caractères alphanumériques, tiret, tiret bas, point */
    layer_name: string;
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
}

export type ConfigurationAltimetryDetailsMessage = ConfigurationDetailsMessage & {
    title?: string;
    /** @uniqueItems true */
    keywords?: string[];
    /** Bounding box de la configuration */
    bbox?: BoundingBox;
    /** @uniqueItems true */
    used_data?: ConfigurationUsedDataAltimetryDetailsMessage[];
    abstract?: string;
};

export type ConfigurationDetailsMessage = object;

export type ConfigurationDownloadDetailsMessage = ConfigurationDetailsMessage & {
    title: string;
    /** @uniqueItems true */
    used_data?: ConfigurationUsedDataDownloadDetailsMessage[];
    abstract: string;
};

export type ConfigurationItineraryIsocurveDetailsMessage = ConfigurationDetailsMessage & {
    title?: string;
    /** @uniqueItems true */
    keywords?: string[];
    /** Limites pour les calculs d'itinéraire (nombre d'étapes et de contraintes) et d'isochrone (durée et distance) */
    limits?: ConfigurationLimitsItineraryIsocurveDetailsContent;
    /** Bounding box de la configuration */
    bbox?: BoundingBox;
    constraints?: JsonNode;
    /** @uniqueItems true */
    srss?: string[];
    /** @uniqueItems true */
    used_data?: ConfigurationUsedDataItineraryIsocurveDetailsMessage[];
    abstract?: string;
};

export type ConfigurationUsedDataAccuracyAltimetryDetailsMessage = object;

export interface ConfigurationUsedDataAltimetryDetailsMessage {
    title?: string;
    /** Bounding box de la configuration */
    bbox?: BoundingBox;
    source?: ConfigurationUsedDataSourceAltimetryDetailsMessage;
    accuracy?: ConfigurationUsedDataAccuracyAltimetryDetailsMessage;
    stored_data?: StoredDataMessage;
}

export interface ConfigurationUsedDataDownloadDetailsMessage {
    sub_name: string;
    title?: string;
    format?: string;
    zone?: string;
    stored_data?: StoredDataMessage;
    abstract?: string;
}

export interface ConfigurationUsedDataItineraryIsocurveDetailsMessage {
    profile?: string;
    optimization?: string;
    cost_column?: string;
    reverse_cost_column?: string;
    cost_type?: "time" | "distance";
    costing?: "auto" | "auto_shorter" | "pedestrian";
    /** @uniqueItems true */
    attributes?: ConfigurationUsedDataAttributeItineraryIsocurveDetailsContent[];
    stored_data?: StoredDataMessage;
}

export interface ConfigurationUsedDataRelationWfsDetailsMessage {
    /** Nom de la table */
    native_name: string;
    public_name?: string;
    title: string;
    /** @uniqueItems true */
    keywords?: string[];
    abstract: string;
}

export interface ConfigurationUsedDataRelationWmsVectorDetailsMessage {
    /** Nom de la table */
    name: string;
    style?: StaticFileMessage;
    ftl?: StaticFileMessage;
}

export type ConfigurationUsedDataSourceAltimetryDetailsMessage = object;

export interface ConfigurationUsedDataWfsDetailsMessage {
    /** @uniqueItems true */
    relations: ConfigurationUsedDataRelationWfsDetailsMessage[];
    stored_data?: StoredDataMessage;
}

export interface ConfigurationUsedDataWmsVectorDetailsMessage {
    /** @uniqueItems true */
    relations: ConfigurationUsedDataRelationWmsVectorDetailsMessage[];
    stored_data?: StoredDataMessage;
}

export interface ConfigurationUsedDataWmtsTmsDetailsMessage {
    bottom_level: string;
    top_level: string;
    stored_data?: StoredDataMessage;
}

export type ConfigurationWfsDetailsMessage = ConfigurationDetailsMessage & {
    /** Bounding box de la configuration */
    bbox?: BoundingBox;
    /** @uniqueItems true */
    used_data?: ConfigurationUsedDataWfsDetailsMessage[];
};

export type ConfigurationWmsRasterDetailsMessage = ConfigurationDetailsMessage & {
    /** Bounding box de la configuration */
    bbox?: BoundingBox;
    title: string;
    /** @uniqueItems true */
    keywords?: string[];
    /** @uniqueItems true */
    styles?: StaticFileMessage[];
    /** @uniqueItems true */
    used_data?: ConfigurationUsedDataWmtsTmsDetailsMessage[];
    interpolation?: "NEAREST-NEIGHBOUR" | "LINEAR" | "BICUBIC" | "LANCZOS2" | "LANCZOS3" | "LANCZOS4";
    bottom_resolution?: number;
    top_resolution?: number;
    abstract: string;
    /** Ressource cible du GetFeatureInfo */
    getfeatureinfo?: ConfigurationGetFeatureInfoWmtsTmsDetailsContent;
};

export type ConfigurationWmsVectorDetailsMessage = ConfigurationDetailsMessage & {
    /** Bounding box de la configuration */
    bbox?: BoundingBox;
    title: string;
    /** @uniqueItems true */
    keywords?: string[];
    /** @uniqueItems true */
    used_data?: ConfigurationUsedDataWmsVectorDetailsMessage[];
    abstract: string;
};

export type ConfigurationWmtsTmsDetailsMessage = ConfigurationDetailsMessage & {
    /** Bounding box de la configuration */
    bbox?: BoundingBox;
    title: string;
    /** @uniqueItems true */
    keywords?: string[];
    /** @uniqueItems true */
    styles?: StaticFileMessage[];
    /** @uniqueItems true */
    used_data?: ConfigurationUsedDataWmtsTmsDetailsMessage[];
    abstract: string;
    /** Ressource cible du GetFeatureInfo */
    getfeatureinfo?: ConfigurationGetFeatureInfoWmtsTmsDetailsContent;
};

export type JsonNode = object;

export interface PublicationMessage {
    type?: string;
    status?: string;
    endpoint_name?: string;
    layer_name?: string;
    /** Métadonnées liées au propriétaire de la configuration */
    attribution?: ConfigurationAttribution;
    /** @format uuid */
    _id?: string;
    type_infos?:
        | ConfigurationAltimetryDetailsMessage
        | ConfigurationDownloadDetailsMessage
        | ConfigurationItineraryIsocurveDetailsMessage
        | ConfigurationWfsDetailsMessage
        | ConfigurationWmsRasterDetailsMessage
        | ConfigurationWmsVectorDetailsMessage
        | ConfigurationWmtsTmsDetailsMessage;
    /** @uniqueItems true */
    metadata?: ConfigurationMetadata[];
}

export interface StaticFileMessage {
    name?: string;
    description?: string;
    type?: "GEOSERVER-FTL" | "GEOSERVER-STYLE" | "ROK4-STYLE" | "DERIVATION-SQL";
    file_name?: string;
    storage?: StorageMessage;
    /** @format uuid */
    _id?: string;
    /** les informations spécifiques liées au type de statique */
    type_infos?: StaticFileDetailsDto;
}

export interface StorageMessage {
    name?: string;
    type?: "POSTGRESQL" | "S3" | "FILESYSTEM" | "POSTGRESQL-ROUTING";
    /** @format uuid */
    _id?: string;
    /** Les informations spécifiques liées au type de stockage */
    type_infos?: StorageDetailsDto;
}

export interface StoredDataMessage {
    type?: "ROK4-PYRAMID-RASTER" | "ROK4-PYRAMID-VECTOR" | "VECTOR-DB" | "ARCHIVE" | "GRAPH-DB" | "GRAPH-OSRM" | "GRAPH-VALHALLA";
    name?: string;
    status?: "CREATED" | "GENERATING" | "MODIFYING" | "GENERATED" | "DELETED" | "UNSTABLE";
    srs?: string;
    extent?: Geometry;
    /** @format int64 */
    size?: number;
    storage?: StorageMessage;
    /** @uniqueItems true */
    ancestors?: string[];
    /** @format uuid */
    _id?: string;
    /** Détails sur une donnée stockée */
    type_infos?: StoredDataDetailsDto;
}

export interface TechnicalJndiPostgresqlResourceResponseDto {
    host?: string;
    /** @format int32 */
    port?: number;
    database_name?: string;
    /**
     * identifiant technique
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

/** Informations sur la livraison */
export interface UploadListResponseDto {
    type: "VECTOR" | "RASTER" | "ARCHIVE" | "ROK4-PYRAMID";
    name: string;
    visibility: "PRIVATE" | "REFERENCED" | "PUBLIC";
    srs?: string;
    description: string;
    status: "CREATED" | "OPEN" | "CLOSED" | "CHECKING" | "GENERATING" | "MODIFYING" | "UNSTABLE" | "DELETED";
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations sur une livraison partagée ou personnelle */
export type UploadDetailResponseDto = UploadPrivateDetailResponseDto | UploadSharedDetailResponseDto;

/** Informations partagées sur la livraison */
export interface UploadSharedDetailResponseDto {
    name: string;
    description: string;
    type: "VECTOR" | "RASTER" | "ARCHIVE" | "ROK4-PYRAMID";
    visibility: "PRIVATE" | "REFERENCED" | "PUBLIC";
    status: "CREATED" | "OPEN" | "CLOSED" | "CHECKING" | "GENERATING" | "MODIFYING" | "UNSTABLE" | "DELETED";
    srs: string;
    contact: string;
    extent?: Geometry;
    /** @format int64 */
    size?: number;
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
    /** Détails sur une livraison */
    type_infos?: UploadDetailsDto;
}

/** Arborescence des fichiers liés à la livraison */
export interface UploadTreeElementResponseDto {
    type?: string;
    name?: string;
    /** @format int64 */
    size?: number;
    children?: UploadTreeElementResponseDto[];
}

/** Partage avec un entrepôt */
export interface SharingResponseDto {
    name: string;
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
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

/** Informations sur la vérification */
export interface CheckingExecutionCheckResponseDto {
    name: string;
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations sur l'exécution de vérification liée à la livraison */
export interface CheckingExecutionListDto {
    /** Informations sur la vérification */
    check: CheckingExecutionCheckResponseDto;
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
}

export interface StoredDataListResponseDto {
    name: string;
    type: "ROK4-PYRAMID-RASTER" | "ROK4-PYRAMID-VECTOR" | "VECTOR-DB" | "ARCHIVE" | "GRAPH-DB" | "GRAPH-OSRM" | "GRAPH-VALHALLA";
    visibility: "PRIVATE" | "REFERENCED" | "PUBLIC";
    srs?: string;
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations sur une donnée stockée partagée ou personnelle */
export type StoredDataDetailResponseDto = StoredDataPrivateDetailResponseDto | StoredDataSharedDetailResponseDto;

export interface StoredDataSharedDetailResponseDto {
    name: string;
    type: "ROK4-PYRAMID-RASTER" | "ROK4-PYRAMID-VECTOR" | "VECTOR-DB" | "ARCHIVE" | "GRAPH-DB" | "GRAPH-OSRM" | "GRAPH-VALHALLA";
    visibility: "PRIVATE" | "REFERENCED" | "PUBLIC";
    srs?: string;
    contact: string;
    extent?: Geometry;
    /** @format uuid */
    _id: string;
    /** Détails sur une donnée stockée */
    type_infos?: StoredDataDetailsDto;
}

export interface StoredDataDependenciesResponseDto {
    used_by: StoredDataDependencyResponseDto[];
    use: StoredDataDependencyResponseDto[];
}

export interface StoredDataDependencyResponseDto {
    name?: string;
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations sur le fichier statique */
export interface StaticFileListResponseDto {
    /** Nom du fichier statique */
    name: string;
    /** Type du fichier statique */
    type: "GEOSERVER-FTL" | "GEOSERVER-STYLE" | "ROK4-STYLE" | "DERIVATION-SQL";
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations sur le traitement */
export interface ProcessingListResponseDto {
    /** Nom du traitement. ce nom doit être unique pour la plateforme */
    name: string;
    /** Description du traitement */
    description: string;
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations sur le traitement */
export interface ProcessingStandardDetailResponseDto {
    /** Nom du traitement. ce nom doit être unique pour la plateforme */
    name: string;
    /** Description du traitement */
    description: string;
    /** Priorité de traitement */
    priority?: "STANDARD" | "PREMIUM";
    /** Types de données acceptés en entrée du traitement */
    input_types: ProcessingInputTypesDto;
    output_type: ProcessingOutputTypeStoredDataDto | ProcessingOutputTypeUploadDto;
    /**
     * Paramètres en entrée du traitement
     * @uniqueItems true
     */
    parameters: (ProcessingParameterFreeDto | ProcessingParameterStaticFileDto)[];
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
    /**
     * Vérifications nécessaires au lancement du traitement
     * @uniqueItems true
     */
    required_checks: CheckingListResponseDto[];
}

/** Informations sur le traitement */
export interface ProcessingExecutionListResponseDto {
    /** Informations sur le traitement */
    processing: ProcessingExecutionProcessingDto;
    status: "CREATED" | "WAITING" | "PROGRESS" | "SUCCESS" | "FAILURE" | "ABORTED";
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations sur l'entrepôt partagé */
export interface DatastoreSharingResponseDto {
    name: string;
    technical_name: string;
    active: boolean;
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations sur la configuration */
export interface ConfigurationListResponseDto {
    /** Nom de la configuration */
    name: string;
    /** Nom technique de la ressource. Ce nom doit être unique sur la plateforme pour un type de configuration donné. Uniquement des caractères alphanumériques, tiret, tiret bas, point */
    layer_name: string;
    /** Type de configuration */
    type: "WMS-VECTOR" | "WFS" | "WFS-INSPIRE" | "WMTS-TMS" | "WMS-RASTER" | "DOWNLOAD" | "ITINERARY-ISOCURVE" | "ALTIMETRY";
    /** Statut de la configuration */
    status: "UNPUBLISHED" | "PUBLISHED" | "SYNCHRONIZING";
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations détaillées sur la vérification */
export interface CheckingStandardDetailResponseDto {
    /** Nom de la vérification. ce nom doit être unique pour la plateforme */
    name: string;
    /** Description de la vérification */
    description: string;
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
    /** @uniqueItems true */
    default_uploads_check?: ("VECTOR" | "RASTER" | "ARCHIVE" | "ROK4-PYRAMID")[];
}

/** Informations sur l'exécution de vérification */
export interface CheckingExecutionListResponseDto {
    /** Informations sur la vérification */
    check: CheckingExecutionCheckResponseDto;
    status: "WAITING" | "PROGRESS" | "SUCCESS" | "FAILURE";
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations détaillées sur l'exécution de vérification */
export interface CheckingExecutionDetailResponseDto {
    /** Informations sur la vérification */
    check: CheckingExecutionCheckResponseDto;
    status: "WAITING" | "PROGRESS" | "SUCCESS" | "FAILURE";
    /** @format date-time */
    creation: string;
    /** @format date-time */
    start?: string;
    /** @format date-time */
    finish?: string;
    /** Informations sur la livraison */
    upload: CheckingExecutionUploadResponseDto;
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations sur la livraison */
export interface CheckingExecutionUploadResponseDto {
    type: "VECTOR" | "RASTER" | "ARCHIVE" | "ROK4-PYRAMID";
    name: string;
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations sur l'annexe */
export interface AnnexListResponseDto {
    /** @uniqueItems true */
    paths: string[];
    /** @format int64 */
    size: number;
    mime_type: string;
    published: boolean;
    /** @uniqueItems true */
    labels?: string[];
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
}

export interface CommunityUserResponseDto {
    rights?: ("COMMUNITY" | "PROCESSING" | "ANNEX" | "BROADCAST" | "UPLOAD")[];
    user: UserDto;
}

export interface UserDto {
    email: string;
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
    last_name: string;
    first_name: string;
}

/** Informations sur la livraison */
export interface UploadCatalogResponseDto {
    type: "VECTOR" | "RASTER" | "ARCHIVE" | "ROK4-PYRAMID";
    name: string;
    visibility: "PRIVATE" | "REFERENCED" | "PUBLIC";
    srs?: string;
    description: string;
    /** Nom du contact de la communauté */
    contact: string;
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations partagées sur l'offre' */
export interface OfferingSharedDetailResponseDto {
    /** Visibilité de l'offre */
    visibility: string;
    /** Indique si l'offre est ouverte sans clé d'accès */
    open: boolean;
    /** Indique si l'offre est disponible */
    available: boolean;
    /** Nom technique de la ressource. Ce nom doit être unique sur la plateforme pour un type de configuration donné. Uniquement des caractères alphanumériques, tiret, tiret bas, point */
    layer_name: string;
    /** Type de configuration */
    type: "WMS-VECTOR" | "WFS" | "WFS-INSPIRE" | "WMTS-TMS" | "WMS-RASTER" | "DOWNLOAD" | "ITINERARY-ISOCURVE" | "ALTIMETRY";
    contact: string;
    /** @uniqueItems true */
    urls: EndpointUrl[];
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations sur la communauté */
export interface CommunityListResponseDto {
    /** Nom de la communauté */
    name: string;
    /** Nom technique de la communauté */
    technical_name: string;
    /** Nom du contact de la communauté */
    contact: string;
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
    /** Valeur définissant si la communauté est publique ou non */
    public: boolean;
}

/** Informations sur l'entrepôt */
export interface DatastoreListResponseDto {
    /** Nom de la communauté */
    name: string;
    /** Nom technique de la communauté */
    technical_name: string;
    /**
     * identifiant technique
     * @format uuid
     */
    _id: string;
    /** Datastore actif ou non */
    active: boolean;
}
