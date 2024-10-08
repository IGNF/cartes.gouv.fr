/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

type UtilRequiredKeys<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/** Informations détaillées sur le document */
export interface DocumentDetailsResponseDto {
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
}

/** Texte du commentaire à ajouter */
export interface CommentSaveDto {
    text: string;
}

/** Information sur l'auteur */
export interface AuthorResponseDto {
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
    /** @format date-time */
    creation: string;
    /** @format date-time */
    last_modification?: string;
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

/** Informations détaillées sur le fichier statique */
export interface StaticFileDetailResponseDto {
    /** Nom du fichier statique */
    name: string;
    /** Description du fichier statique */
    description?: string;
    /** Type du fichier statique */
    type: StaticFileDetailResponseDtoTypeEnum;
    /**
     * Identifiant technique
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
    status: ConfigurationDetailResponseDtoStatusEnum;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations sur le point d'accès */
export interface EndpointListResponseDto {
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
export interface OfferingDetailResponseDto {
    /** Indique si l'offre est ouverte sans clé d'accès */
    open: boolean;
    /** Indique si l'offre est disponible */
    available: boolean;
    /** Nom technique de la ressource. Ce nom doit être unique sur la plateforme pour un type de configuration donné. Uniquement des caractères alphanumériques, tiret, tiret bas, point */
    layer_name: string;
    /** Type de configuration */
    type: OfferingDetailResponseDtoTypeEnum;
    /** Statut de l'offre */
    status: OfferingStatusEnum;
    /** Informations sur la configuration de l'offre */
    configuration: ConfigurationResponseDto;
    /** Informations sur le point d'accès */
    endpoint: EndpointListResponseDto;
    /** @uniqueItems true */
    urls: EndpointUrl[];
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

export enum OfferingStatusEnum {
    PUBLISHING = "PUBLISHING",
    MODIFYING = "MODIFYING",
    PUBLISHED = "PUBLISHED",
    UNPUBLISHING = "UNPUBLISHING",
    UNSTABLE = "UNSTABLE",
}

/** Informations détaillées sur la métadonnée */
export interface MetadataResponseDto {
    type: MetadataResponseDtoTypeEnum;
    open_data: boolean;
    level: MetadataResponseDtoLevelEnum;
    file_identifier: string;
    tags?: Record<string, string>;
    endpoints?: EndpointListResponseDto[];
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Bounding box */
export interface BoundingBox {
    west: number;
    south: number;
    east: number;
    north: number;
}

export type ConfigurationAltimetryDetailsContent = ConfigurationDetailsContent & {
    /** Bounding box */
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

export type ConfigurationGetFeatureInfoIsStoredDataWmtsTmsDetailsContent = {
    /** Indique si on va utiliser directement la donnée stockée */
    stored_data: boolean;
};

export type ConfigurationGetFeatureInfoServerUrlWmtsTmsDetailsContent = {
    server_url: string;
};

/** Ressource cible du GetFeatureInfo */
export type ConfigurationGetFeatureInfoWmtsTmsDetailsContent =
    | ConfigurationGetFeatureInfoIsStoredDataWmtsTmsDetailsContent
    | ConfigurationGetFeatureInfoServerUrlWmtsTmsDetailsContent;

export type ConfigurationItineraryIsocurveDetailsContent = ConfigurationDetailsContent & {
    /** Bounding box */
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
    /**
     * Projection(s)
     * @uniqueItems true
     */
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

/** Informations à fournir pour modifier la configuration */
export interface ConfigurationUpdateDto {
    /** Type de configuration */
    type: ConfigurationDetailResponseDtoTypeEnum;
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

export interface ConfigurationUsedDataAltimetryDetailsContent {
    /** Titre */
    title: string;
    /** Bounding box */
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

export type ConfigurationUsedDataSourceAccuracyManualAltimetryDetailsContent = {
    /** Valeur unique pour la source des données */
    value: string;
};

export type ConfigurationUsedDataSourceAccuracyPyramidAltimetryDetailsContent = {
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
    /** Bounding box */
    bbox?: BoundingBox;
    used_data: ConfigurationUsedDataWfsDetailsContent[];
};

export type ConfigurationWmsRasterDetailsContent = ConfigurationDetailsContent & {
    /** Bounding box */
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
    /** Bounding box */
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
    /** Bounding box */
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

/** Informations détaillées sur la configuration */
export interface ConfigurationDetailResponseDto {
    /** Nom de la configuration */
    name: string;
    /** Nom technique de la ressource. Ce nom doit être unique sur la plateforme pour un type de configuration donné. Uniquement des caractères alphanumériques, tiret, tiret bas, point */
    layer_name: string;
    /** Type de configuration */
    type: ConfigurationDetailResponseDtoTypeEnum;
    status: ConfigurationDetailResponseDtoStatusEnum;
    tags: Record<string, string>;
    /** Métadonnées liées au propriétaire de la configuration */
    attribution?: ConfigurationAttribution;
    /** Informations sur l'évènement */
    last_event?: EventDto;
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
     * Identifiant technique
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
     * Identifiant technique
     * @format uuid
     */
    _id: string;
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

/** Informations sur le traitement */
export interface ProcessingAdminDetailResponseDto {
    /** Nom du traitement. ce nom doit être unique pour la plateforme */
    name: string;
    /** Description du traitement */
    description: string;
    /** Priorité de traitement */
    priority?: ProcessingAdminDetailResponseDtoPriorityEnum;
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

export interface UserKeyCreateDtoUserKeyInfoDto {
    name: string;
    type?: UserKeyCreateDtoUserKeyInfoDtoTypeEnum;
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

/** Informations à fournir pour la déclaration d'une nouvelle livraison, la livraison est privée par défaut */
export interface UploadCreateDto {
    description: string;
    name: string;
    type: UploadCreateDtoTypeEnum;
    srs: string;
    /** Détails sur une livraison */
    type_infos?: UploadDetailsDto;
}

/** Détails sur une livraison */
export type UploadDetailsDto = UploadRok4PyramidDetailsDto | UploadIndexDetailsDto | UploadHistoricImageryDetailsDto;

/** Informations spécifiques d'une livraison d'images historiques */
export type UploadHistoricImageryDetailsDto = {
    /** Identifiant de jeu de données */
    dataset_identifier: string;
};

/** Informations spécifiques d'une livraison de type Index */
export type UploadIndexDetailsDto = {
    /**
     * Indique si l'index se comportera comme l'index standard
     * @default false
     */
    is_search_layer?: boolean;
};

/** Informations spécifiques d'une livraison de pyramide Rok4 */
export type UploadRok4PyramidDetailsDto = {
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

export interface Coordinate {
    /** @format double */
    x?: number;
    /** @format double */
    y?: number;
    /** @format double */
    z?: number;
    coordinate?: Coordinate;
    /** @format double */
    m?: number;
    valid?: boolean;
}

export interface CoordinateSequence {
    /** @format int32 */
    dimension?: number;
    /** @format int32 */
    measures?: number;
}

export type CoordinateSequenceFactory = object;

export interface Envelope {
    /** @format double */
    diameter?: number;
    /** @format double */
    area?: number;
    /** @format double */
    height?: number;
    /** @format double */
    min_x?: number;
    /** @format double */
    max_x?: number;
    /** @format double */
    min_y?: number;
    /** @format double */
    max_y?: number;
    /** @format double */
    width?: number;
    null?: boolean;
}

export interface Geometry {
    envelope?: Geometry;
    factory?: GeometryFactory;
    user_data?: object;
    /** @format int32 */
    srid?: number;
    /** @format int32 */
    dimension?: number;
    /** @format int32 */
    num_points?: number;
    rectangle?: boolean;
    /** @format double */
    area?: number;
    centroid?: Point;
    boundary?: Geometry;
    geometry_type?: string;
    /** @format int32 */
    num_geometries?: number;
    interior_point?: Point;
    /** @format int32 */
    boundary_dimension?: number;
    envelope_internal?: Envelope;
    precision_model?: PrecisionModel;
    coordinate?: Coordinate;
    coordinates?: Coordinate[];
    simple?: boolean;
    /** @format double */
    length?: number;
    empty?: boolean;
    valid?: boolean;
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
    /** @format int32 */
    dimension?: number;
    /** @format double */
    y?: number;
    /** @format double */
    x?: number;
    /** @format int32 */
    num_points?: number;
    boundary?: Geometry;
    geometry_type?: string;
    /** @format int32 */
    boundary_dimension?: number;
    coordinate?: Coordinate;
    coordinate_sequence?: CoordinateSequence;
    simple?: boolean;
    empty?: boolean;
    /** @format int32 */
    srid?: number;
    rectangle?: boolean;
    /** @format double */
    area?: number;
    centroid?: Point;
    /** @format int32 */
    num_geometries?: number;
    interior_point?: Point;
    envelope_internal?: Envelope;
    precision_model?: PrecisionModel;
    /** @format double */
    length?: number;
    valid?: boolean;
}

export interface PrecisionModel {
    /** @format double */
    scale?: number;
    /** @format int32 */
    maximum_significant_digits?: number;
    /** @format double */
    offset_x?: number;
    /** @format double */
    offset_y?: number;
    type?: Type;
    floating?: boolean;
}

export type Type = object;

/** Informations détaillées sur la livraison */
export interface UploadPrivateDetailResponseDto {
    name: string;
    description: string;
    type: UploadPrivateDetailResponseDtoTypeEnum;
    visibility: UploadPrivateDetailResponseDtoVisibilityEnum;
    status: UploadPrivateDetailResponseDtoStatusEnum;
    srs: string;
    contact: string;
    extent?: Geometry;
    /** @format int64 */
    size?: number;
    /** Informations sur l'évènement */
    last_event?: EventDto;
    tags?: Record<string, string>;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /** Détails sur une livraison */
    type_infos?: UploadDetailsDto;
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
export type StoredDataDetailsDto = StoredDataRok4PyramidRasterDetailsDto &
    StoredDataRok4PyramidVectorDetailsDto &
    StoredDataVectorDbDetailsDto &
    StoredDataArchiveDetailsDto &
    StoredDataGraphDbDetailsDto &
    StoredDataGraphDetailsDto &
    StoredDataIndexDetailsDto;

/** Liste des relations en BDD */
export interface StoredDataDetailsRelationDto {
    name: string;
    type: StoredDataDetailsRelationDtoTypeEnum;
    attributes: Record<string, string>;
    primary_key?: string[];
}

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
    /** Indique si l'index se comportera comme l'index standard */
    is_search_layer: boolean;
};

/** Informations détaillées sur la donnée stockée. */
export interface StoredDataPrivateDetailResponseDto {
    name: string;
    type: StoredDataPrivateDetailResponseDtoTypeEnum;
    visibility: StoredDataPrivateDetailResponseDtoVisibilityEnum;
    srs?: string;
    description?: string;
    edition?: StoredDataEdition;
    contact: string;
    extent?: Geometry;
    /** Informations sur l'évènement */
    last_event?: EventDto;
    tags?: Record<string, string>;
    storage: StoredDataStorageDto;
    /** @format int64 */
    size?: number;
    status: StoredDataPrivateDetailResponseDtoStatusEnum;
    /** @format uuid */
    _id: string;
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
    /** le nom du fichier statique */
    name: string;
    /** la description du fichier statique */
    description?: string;
    /** le type du fichier statique */
    type: StaticFileCreateDtoTypeEnum;
}

export type IdFieldDto = {
    /**
     * Identifiant de la livraison
     * @format uuid
     */
    id: string;
};

export type NamedFieldDto = {
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

export type StoredDataCreationDto = {
    /** Nom de la donnée stockée */
    name: string;
    /** Type de stockage */
    storage_type?: StoredDataCreationDtoStorageTypeEnum;
    storage_tags?: string[];
};

export type StoredDataOutputDto = IdFieldDto | StoredDataCreationDto;

export type UploadOutputDto = NamedFieldDto | IdFieldDto;

/** Informations détaillées sur l'exécution de traitement */
export interface ProcessingExecutionDetailResponseDto {
    /** Informations sur le traitement */
    processing: ProcessingExecutionProcessingDto;
    status: ProcessingExecutionDetailResponseDtoStatusEnum;
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
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

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

/** Informations sur le traitement */
export interface ProcessingExecutionProcessingDto {
    name: string;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations simplifiée sur une donnée stockée */
export interface ProcessingExecutionStoredDataDto {
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

export interface PermissionCreateDto {
    /** @format date-time */
    end_date?: string;
    licence: string;
    /** @uniqueItems true */
    offerings: string[];
    type?: PermissionCreateDtoTypeEnum;
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
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

export interface PermissionAccountBeneficiaryResponseDto {
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
    | UtilRequiredKeys<PermissionAccountBeneficiaryResponseDto, "_id">
    | UtilRequiredKeys<PermissionCommunityBeneficiaryResponseDto, "_id">
) & {
    /**
     * Identifiant technique
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
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

export interface PermissionDatastoreAuthorDto {
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
    /** Type de configuration */
    type: OfferingDetailResponseDtoTypeEnum;
    /** Statut de l'offre */
    status: OfferingStatusEnum;
    /** Nom technique de la ressource. Ce nom doit être unique sur la plateforme pour un type de configuration donné. Uniquement des caractères alphanumériques, tiret, tiret bas, point */
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

export interface MetadataPublicationDto {
    /** @uniqueItems true */
    file_identifiers: string[];
    /** @format uuid */
    endpoint: string;
}

/** Informations à fournir pour la déclaration d'une nouvelle configuration */
export interface ConfigurationCreateDto {
    /** Type de configuration */
    type: ConfigurationDetailResponseDtoTypeEnum;
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

/** Le type de stockage */
export enum StorageType {
    POSTGRESQL = "POSTGRESQL",
    S3 = "S3",
    FILESYSTEM = "FILESYSTEM",
    OPENSEARCH = "OPENSEARCH",
    POSTGRESQLROUTING = "POSTGRESQL-ROUTING",
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
export interface NomenclatureDetailsResponseDto {
    /** Type de famille à laquelle appartient la nomenclature */
    type: NomenclatureDetailsResponseDtoTypeEnum;
    /** Label de la nomenclature */
    label: string;
    /** Code de la nomenclature */
    term: string;
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
    contact: string;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    public: boolean;
}

/** Informations sur l'entrepôt */
export interface DatastoreDetailResponseDto {
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
    endpoints?: DatastoreEndpointResponseDto[];
    /** Stockages que l'entrepôt utilise et quotas à ne pas dépasser */
    storages: DatastoreStoragesResponseDto;
    /** Préfixe obligatoire pour le file_identifier des métadonnées déposées sur ce datastore */
    metadata_file_identifier_prefix?: string;
    /** Préfixe obligatoire pour le layer_name des configurations créées sur ce datastore */
    configuration_layer_name_prefix?: string;
    /** Datastore ouvert aux partages ou non */
    sharings?: boolean;
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
    /** Datastore actif ou non */
    active: boolean;
}

/** Informations sur le point d'accès */
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
    active?: boolean;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations détaillées sur la communauté */
export interface CommunityDetailResponseDto {
    /** Nom de la communauté */
    name: string;
    /** Description de la communauté */
    description?: string;
    /** Nom technique de la communauté */
    technical_name: string;
    /** Nom du contact de la communauté */
    contact: string;
    /** Informations sur l'entrepôt lié */
    datastore?: CommunityDatastoreResponseDto;
    /** Informations sur le superviseur de la communauté */
    supervisor: CommunitySupervisorResponseDto;
    /**
     * Identifiant technique
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
export interface CheckingAdminDetailResponseDto {
    /** Nom de la vérification. ce nom doit être unique pour la plateforme */
    name: string;
    /** Description de la vérification */
    description: string;
    /** Priorité de la vérification */
    priority?: CheckingAdminDetailResponseDtoPriorityEnum;
    /** Nom technique de la vérification tel que connu par l'orchestrateur */
    orchestrator_job_name?: string;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /** @uniqueItems true */
    default_uploads_check?: CheckingAdminDetailResponseDtoDefaultUploadsCheckEnum[];
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
}

/** Informations à fournir pour la modification d'une livraison existante */
export interface UploadUpdateDto {
    description?: string;
    name?: string;
    visibility?: UploadUpdateDtoVisibilityEnum;
    extent?: Geometry;
}

/** Informations à fournir pour la modification d'une donnée existante */
export interface StoredDataUpdateDto {
    name?: string;
    visibility?: StoredDataUpdateDtoVisibilityEnum;
    description?: string;
    edition?: StoredDataEdition;
    extent?: Geometry;
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
    open?: boolean;
    available?: boolean;
}

export interface MetadataUpdateDto {
    type?: MetadataUpdateDtoTypeEnum;
    open_data?: boolean;
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
    email: string;
    /** @format date-time */
    creation: string;
    /** @format date-time */
    last_call?: string;
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
    technical?: boolean;
    administrator?: boolean;
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

/** Information sur la permission */
export interface PermissionWithOfferingsResponseDto {
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
    /** Type de configuration */
    type: OfferingDetailResponseDtoTypeEnum;
    /** Statut de l'offre */
    status: OfferingStatusEnum;
    /** Nom technique de la ressource. Ce nom doit être unique sur la plateforme pour un type de configuration donné. Uniquement des caractères alphanumériques, tiret, tiret bas, point */
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
    name: string;
    type?: UserKeyResponseDtoTypeEnum;
    /**
     * Identifiant technique
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
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations sur l'offre */
export interface OfferingListResponseDto {
    /** Indique si l'offre est ouverte sans clé d'accès */
    open: boolean;
    /** Indique si l'offre est disponible */
    available: boolean;
    /** Nom technique de la ressource. Ce nom doit être unique sur la plateforme pour un type de configuration donné. Uniquement des caractères alphanumériques, tiret, tiret bas, point */
    layer_name: string;
    /** Type de configuration */
    type: OfferingDetailResponseDtoTypeEnum;
    /** Statut de l'offre */
    status: string;
    /**
     * Identifiant technique
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
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations sur le document */
export interface DocumentListResponseDto {
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

/** Partage avec un entrepôt */
export interface SharingResponseDto {
    name: string;
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
    /** Type de famille à laquelle appartient la nomenclature */
    type: NomenclatureResponseDtoTypeEnum;
    /** Label de la nomenclature */
    label: string;
    /** Code de la nomenclature */
    term: string;
}

/** Informations sur la livraison */
export interface UploadListResponseDto {
    type: UploadListResponseDtoTypeEnum;
    name: string;
    visibility: UploadListResponseDtoVisibilityEnum;
    srs?: string;
    description: string;
    status: UploadListResponseDtoStatusEnum;
    /**
     * Identifiant technique
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
    type: UploadSharedDetailResponseDtoTypeEnum;
    visibility: UploadSharedDetailResponseDtoVisibilityEnum;
    status: UploadSharedDetailResponseDtoStatusEnum;
    srs: string;
    contact: string;
    extent?: Geometry;
    /** @format int64 */
    size?: number;
    /**
     * Identifiant technique
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
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations sur l'exécution de vérification liée à la livraison */
export interface CheckingExecutionListDto {
    /** Informations sur la vérification */
    check: CheckingExecutionCheckResponseDto;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations sur la donnée stockée */
export interface StoredDataListResponseDto {
    name: string;
    type: StoredDataListResponseDtoTypeEnum;
    visibility: StoredDataListResponseDtoVisibilityEnum;
    srs?: string;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations sur une donnée stockée partagée ou personnelle */
export type StoredDataDetailResponseDto = StoredDataPrivateDetailResponseDto | StoredDataSharedDetailResponseDto;

export interface StoredDataSharedDetailResponseDto {
    name: string;
    type: StoredDataSharedDetailResponseDtoTypeEnum;
    visibility: StoredDataSharedDetailResponseDtoVisibilityEnum;
    srs?: string;
    description?: string;
    edition?: StoredDataEdition;
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
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations sur le fichier statique */
export interface StaticFileListResponseDto {
    /** Nom du fichier statique */
    name: string;
    /** Type du fichier statique */
    type: StaticFileListResponseDtoTypeEnum;
    /**
     * Identifiant technique
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
     * Identifiant technique
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
    priority?: ProcessingStandardDetailResponseDtoPriorityEnum;
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

/** Informations sur le traitement */
export interface ProcessingExecutionListResponseDto {
    /** Informations sur le traitement */
    processing: ProcessingExecutionProcessingDto;
    status: ProcessingExecutionListResponseDtoStatusEnum;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations sur l'entrepôt partagé */
export interface DatastoreSharingResponseDto {
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

/** Informations sur la configuration */
export interface ConfigurationListResponseDto {
    /** Nom de la configuration */
    name: string;
    /** Nom technique de la ressource. Ce nom doit être unique sur la plateforme pour un type de configuration donné. Uniquement des caractères alphanumériques, tiret, tiret bas, point */
    layer_name: string;
    /** Type de configuration */
    type: ConfigurationDetailResponseDtoTypeEnum;
    /** Statut de la configuration */
    status: ConfigurationListResponseDtoStatusEnum;
    /**
     * Identifiant technique
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
    /** Informations sur la vérification */
    check: CheckingExecutionCheckResponseDto;
    status: CheckingExecutionListResponseDtoStatusEnum;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations détaillées sur l'exécution de vérification */
export interface CheckingExecutionDetailResponseDto {
    /** Informations sur la vérification */
    check: CheckingExecutionCheckResponseDto;
    status: CheckingExecutionDetailResponseDtoStatusEnum;
    /** @format date-time */
    creation: string;
    /** @format date-time */
    start?: string;
    /** @format date-time */
    finish?: string;
    /** Informations sur la livraison */
    upload: CheckingExecutionUploadResponseDto;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations sur la livraison */
export interface CheckingExecutionUploadResponseDto {
    type: CheckingExecutionUploadResponseDtoTypeEnum;
    name: string;
    /**
     * Identifiant technique
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
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

export interface CommunityUserResponseDto {
    rights?: CommunityUserResponseDtoRightsEnum[];
    user: UserDto;
}

export interface UserDto {
    email: string;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    last_name: string;
    first_name: string;
}

/** Informations sur la livraison */
export interface UploadCatalogResponseDto {
    type: UploadCatalogResponseDtoTypeEnum;
    name: string;
    visibility: UploadCatalogResponseDtoVisibilityEnum;
    srs?: string;
    description: string;
    /** Nom du contact de la communauté */
    contact: string;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations partagées sur l'offre' */
export interface OfferingSharedDetailResponseDto {
    /** Indique si l'offre est ouverte sans clé d'accès */
    open: boolean;
    /** Indique si l'offre est disponible */
    available: boolean;
    /** Nom technique de la ressource. Ce nom doit être unique sur la plateforme pour un type de configuration donné. Uniquement des caractères alphanumériques, tiret, tiret bas, point */
    layer_name: string;
    /** Type de configuration */
    type: OfferingDetailResponseDtoTypeEnum;
    contact: string;
    /** @uniqueItems true */
    urls: EndpointUrl[];
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations sur la communauté */
export interface CommunityListResponseDto {
    /** Nom de la communauté */
    name: string;
    /** Description de la communauté */
    description?: string;
    /** Nom technique de la communauté */
    technical_name: string;
    /** Nom du contact de la communauté */
    contact: string;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /** Valeur définissant si la communauté est publique ou non */
    public: boolean;
}

/** Informations sur la livraison */
export interface UploadAdminListResponseDto {
    type: UploadAdminListResponseDtoTypeEnum;
    name: string;
    visibility: UploadAdminListResponseDtoVisibilityEnum;
    srs?: string;
    description: string;
    status: UploadAdminListResponseDtoStatusEnum;
    /**
     * Identifiant du datastore rattaché
     * @format uuid
     */
    datastore_id: string;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations détaillées sur la livraison */
export interface UploadAdminDetailResponseDto {
    name: string;
    description: string;
    type: UploadAdminDetailResponseDtoTypeEnum;
    visibility: UploadAdminDetailResponseDtoVisibilityEnum;
    status: UploadAdminDetailResponseDtoStatusEnum;
    srs: string;
    contact: string;
    extent?: Geometry;
    /** @format int64 */
    size?: number;
    /** Informations sur l'évènement */
    last_event?: EventDto;
    tags?: Record<string, string>;
    /**
     * Identifiant du datastore rattaché
     * @format uuid
     */
    datastore_id: string;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /** Détails sur une livraison */
    type_infos?: UploadDetailsDto;
}

/** Informations sur la donnée stockée */
export interface StoredDataAdminListResponseDto {
    name: string;
    type: StoredDataAdminListResponseDtoTypeEnum;
    visibility: StoredDataAdminListResponseDtoVisibilityEnum;
    srs?: string;
    /**
     * Identifiant du datastore rattaché
     * @format uuid
     */
    datastore_id: string;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations sur l'entrepôt */
export interface DatastoreListWithStorageUsageResponseDto {
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
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /** Datastore actif ou non */
    active: boolean;
}

/** Informations sur le fichier statique */
export interface StaticFileAdminListResponseDto {
    /** Nom du fichier statique */
    name: string;
    /** Type du fichier statique */
    type: StaticFileAdminListResponseDtoTypeEnum;
    /**
     * Identifiant du datastore rattaché
     * @format uuid
     */
    datastore_id: string;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations détaillées sur le fichier statique */
export interface StaticFileAdminDetailResponseDto {
    /** Nom du fichier statique */
    name: string;
    /** Description du fichier statique */
    description?: string;
    /** Type du fichier statique */
    type: StaticFileAdminDetailResponseDtoTypeEnum;
    /**
     * Identifiant du datastore rattaché
     * @format uuid
     */
    datastore_id: string;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    type_infos: StaticFileDerivationSqlDetailsDto | StaticFileGeoserverFtlDetailsDto | StaticFileGeoserverStyleDetailsDto | StaticFileRok4StyleDetailsDto;
}

/** Informations sur l'entrepôt */
export interface DatastoreListResponseDto {
    /** Nom de la communauté */
    name: string;
    /** Nom technique de la communauté */
    technical_name: string;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /** Datastore actif ou non */
    active: boolean;
}

/** Informations détaillées sur l'exécution de traitement */
export interface ProcessingExecutionAdminDetailResponseDto {
    /** Informations sur le traitement */
    processing: ProcessingExecutionProcessingDto;
    status: ProcessingExecutionAdminDetailResponseDtoStatusEnum;
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
     * Identifiant du datastore rattaché
     * @format uuid
     */
    datastore_id: string;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations sur l'offre */
export interface OfferingAdminListResponseDto {
    /** Indique si l'offre est ouverte sans clé d'accès */
    open: boolean;
    /** Indique si l'offre est disponible */
    available: boolean;
    /** Nom technique de la ressource. Ce nom doit être unique sur la plateforme pour un type de configuration donné. Uniquement des caractères alphanumériques, tiret, tiret bas, point */
    layer_name: string;
    /** Type de configuration */
    type: OfferingDetailResponseDtoTypeEnum;
    /** Statut de l'offre */
    status: string;
    /**
     * Identifiant du datastore rattaché
     * @format uuid
     */
    datastore_id: string;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations détaillées sur l'offre */
export interface OfferingAdminDetailResponseDto {
    /** Indique si l'offre est ouverte sans clé d'accès */
    open: boolean;
    /** Indique si l'offre est disponible */
    available: boolean;
    /** Nom technique de la ressource. Ce nom doit être unique sur la plateforme pour un type de configuration donné. Uniquement des caractères alphanumériques, tiret, tiret bas, point */
    layer_name: string;
    /** Type de configuration */
    type: OfferingDetailResponseDtoTypeEnum;
    /** Statut de l'offre */
    status: string;
    /** Informations sur la configuration de l'offre */
    configuration: ConfigurationResponseDto;
    /** Informations sur le point d'accès */
    endpoint: EndpointListResponseDto;
    /** @uniqueItems true */
    urls: EndpointUrl[];
    /**
     * Identifiant du datastore rattaché
     * @format uuid
     */
    datastore_id: string;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations détaillées sur la métadonnée */
export interface MetadataAdminDetailResponseDto {
    type: MetadataAdminDetailResponseDtoTypeEnum;
    open_data: boolean;
    level: MetadataAdminDetailResponseDtoLevelEnum;
    file_identifier: string;
    tags?: Record<string, string>;
    endpoints?: EndpointListResponseDto[];
    /** Informations sur l'entrepôt */
    datastore?: DatastoreListResponseDto;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations détaillées sur la métadonnée */
export interface MetadataAdminResponseDto {
    type: MetadataAdminResponseDtoTypeEnum;
    open_data: boolean;
    level: MetadataAdminResponseDtoLevelEnum;
    file_identifier: string;
    tags?: Record<string, string>;
    endpoints?: EndpointListResponseDto[];
    /**
     * Identifiant du datastore rattaché
     * @format uuid
     */
    datastore_id: string;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations sur l'entrepôt */
export interface DatastoreListWithEndpointUsageResponseDto {
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
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
    /** Datastore actif ou non */
    active: boolean;
}

/** Informations sur la configuration */
export interface ConfigurationAdminListResponseDto {
    /** Nom de la configuration */
    name: string;
    /** Nom technique de la ressource. Ce nom doit être unique sur la plateforme pour un type de configuration donné. Uniquement des caractères alphanumériques, tiret, tiret bas, point */
    layer_name: string;
    /** Type de configuration */
    type: ConfigurationDetailResponseDtoTypeEnum;
    /** Statut de la configuration */
    status: ConfigurationAdminListResponseDtoStatusEnum;
    /**
     * Identifiant du datastore rattaché
     * @format uuid
     */
    datastore_id: string;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations détaillées sur la configuration */
export interface ConfigurationAdminDetailResponseDto {
    /** Nom de la configuration */
    name: string;
    /** Nom technique de la ressource. Ce nom doit être unique sur la plateforme pour un type de configuration donné. Uniquement des caractères alphanumériques, tiret, tiret bas, point */
    layer_name: string;
    /** Type de configuration */
    type: ConfigurationDetailResponseDtoTypeEnum;
    status: ConfigurationAdminDetailResponseDtoStatusEnum;
    tags: Record<string, string>;
    /** Métadonnées liées au propriétaire de la configuration */
    attribution?: ConfigurationAttribution;
    /** Informations sur l'évènement */
    last_event?: EventDto;
    /**
     * Identifiant du datastore rattaché
     * @format uuid
     */
    datastore_id: string;
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

/** Informations détaillées sur l'exécution de vérification */
export interface CheckingExecutionAdminDetailResponseDto {
    /** Informations sur la vérification */
    check: CheckingExecutionCheckResponseDto;
    status: CheckingExecutionAdminDetailResponseDtoStatusEnum;
    /** @format date-time */
    creation: string;
    /** @format date-time */
    start?: string;
    /** @format date-time */
    finish?: string;
    /** Informations sur la livraison */
    upload: CheckingExecutionUploadResponseDto;
    /**
     * Identifiant du datastore rattaché
     * @format uuid
     */
    datastore_id: string;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations sur l'annexe */
export interface AnnexAdminListResponseDto {
    /** @uniqueItems true */
    paths: string[];
    /** @format int64 */
    size: number;
    mime_type: string;
    published: boolean;
    /** @uniqueItems true */
    labels?: string[];
    /**
     * Identifiant du datastore rattaché
     * @format uuid
     */
    datastore_id: string;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Informations détaillées sur l'annexe */
export interface AnnexAdminDetailResponseDto {
    /** @uniqueItems true */
    paths: string[];
    /** @format int64 */
    size: number;
    mime_type: string;
    published: boolean;
    /** @uniqueItems true */
    labels?: string[];
    /**
     * Identifiant du datastore rattaché
     * @format uuid
     */
    datastore_id: string;
    /**
     * Identifiant technique
     * @format uuid
     */
    _id: string;
}

/** Type du fichier statique */
export enum StaticFileDetailResponseDtoTypeEnum {
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
export enum OfferingDetailResponseDtoTypeEnum {
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

export enum MetadataResponseDtoTypeEnum {
    INSPIRE = "INSPIRE",
    ISOAP = "ISOAP",
}

export enum MetadataResponseDtoLevelEnum {
    DATASET = "DATASET",
    SERIES = "SERIES",
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
export enum ConfigurationDetailResponseDtoTypeEnum {
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

export enum ConfigurationDetailResponseDtoStatusEnum {
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
}

export enum ProcessingInputTypesDtoUploadEnum {
    VECTOR = "VECTOR",
    RASTER = "RASTER",
    ARCHIVE = "ARCHIVE",
    ROK4PYRAMID = "ROK4-PYRAMID",
    INDEX = "INDEX",
    HISTORICIMAGERY = "HISTORIC-IMAGERY",
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
}

/** Type de fichier(s) statique(s) attendu(s) pour ce paramètre */
export enum ProcessingParameterStaticFileDtoStaticTypeEnum {
    GEOSERVERFTL = "GEOSERVER-FTL",
    GEOSERVERSTYLE = "GEOSERVER-STYLE",
    ROK4STYLE = "ROK4-STYLE",
    DERIVATIONSQL = "DERIVATION-SQL",
}

/** Priorité de traitement */
export enum ProcessingAdminDetailResponseDtoPriorityEnum {
    STANDARD = "STANDARD",
    PREMIUM = "PREMIUM",
    SANDBOX = "SANDBOX",
}

export enum UserKeyCreateDtoUserKeyInfoDtoTypeEnum {
    HASH = "HASH",
    HEADER = "HEADER",
    BASIC = "BASIC",
    OAUTH2 = "OAUTH2",
}

export enum UserKeyDetailsResponseDtoUserKeyInfoDtoTypeEnum {
    HASH = "HASH",
    HEADER = "HEADER",
    BASIC = "BASIC",
    OAUTH2 = "OAUTH2",
}

export enum UploadCreateDtoTypeEnum {
    VECTOR = "VECTOR",
    RASTER = "RASTER",
    ARCHIVE = "ARCHIVE",
    ROK4PYRAMID = "ROK4-PYRAMID",
    INDEX = "INDEX",
    HISTORICIMAGERY = "HISTORIC-IMAGERY",
}

export enum UploadPrivateDetailResponseDtoTypeEnum {
    VECTOR = "VECTOR",
    RASTER = "RASTER",
    ARCHIVE = "ARCHIVE",
    ROK4PYRAMID = "ROK4-PYRAMID",
    INDEX = "INDEX",
    HISTORICIMAGERY = "HISTORIC-IMAGERY",
}

export enum UploadPrivateDetailResponseDtoVisibilityEnum {
    PRIVATE = "PRIVATE",
    REFERENCED = "REFERENCED",
    PUBLIC = "PUBLIC",
}

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

export enum StoredDataDetailsRelationDtoTypeEnum {
    TABLE = "TABLE",
    VIEW = "VIEW",
}

export enum StoredDataPrivateDetailResponseDtoTypeEnum {
    ROK4PYRAMIDRASTER = "ROK4-PYRAMID-RASTER",
    ROK4PYRAMIDVECTOR = "ROK4-PYRAMID-VECTOR",
    VECTORDB = "VECTOR-DB",
    ARCHIVE = "ARCHIVE",
    GRAPHDB = "GRAPH-DB",
    GRAPHOSRM = "GRAPH-OSRM",
    GRAPHVALHALLA = "GRAPH-VALHALLA",
    INDEX = "INDEX",
}

export enum StoredDataPrivateDetailResponseDtoVisibilityEnum {
    PRIVATE = "PRIVATE",
    REFERENCED = "REFERENCED",
    PUBLIC = "PUBLIC",
}

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

/** le type du fichier statique */
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

export enum ProcessingExecutionDetailResponseDtoStatusEnum {
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

export enum PermissionCreateDtoTypeEnum {
    ACCOUNT = "ACCOUNT",
    COMMUNITY = "COMMUNITY",
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
}

/** Type de famille à laquelle appartient la nomenclature */
export enum NomenclatureDetailsResponseDtoTypeEnum {
    CRS = "CRS",
    ZONE = "ZONE",
    FORMAT = "FORMAT",
    RESOLUTION = "RESOLUTION",
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
}

/** Types de livraisons ayant cette vérification par défaut */
export enum CheckingCreateDtoDefaultUploadsCheckEnum {
    VECTOR = "VECTOR",
    RASTER = "RASTER",
    ARCHIVE = "ARCHIVE",
    ROK4PYRAMID = "ROK4-PYRAMID",
    INDEX = "INDEX",
    HISTORICIMAGERY = "HISTORIC-IMAGERY",
}

/** Priorité de la vérification */
export enum CheckingAdminDetailResponseDtoPriorityEnum {
    STANDARD = "STANDARD",
    PREMIUM = "PREMIUM",
    SANDBOX = "SANDBOX",
}

/** Types de livraisons ayant cette vérification par défaut */
export enum CheckingAdminDetailResponseDtoDefaultUploadsCheckEnum {
    VECTOR = "VECTOR",
    RASTER = "RASTER",
    ARCHIVE = "ARCHIVE",
    ROK4PYRAMID = "ROK4-PYRAMID",
    INDEX = "INDEX",
    HISTORICIMAGERY = "HISTORIC-IMAGERY",
}

export enum UploadUpdateDtoVisibilityEnum {
    PRIVATE = "PRIVATE",
    REFERENCED = "REFERENCED",
    PUBLIC = "PUBLIC",
}

export enum StoredDataUpdateDtoVisibilityEnum {
    PRIVATE = "PRIVATE",
    REFERENCED = "REFERENCED",
    PUBLIC = "PUBLIC",
}

export enum MetadataUpdateDtoTypeEnum {
    INSPIRE = "INSPIRE",
    ISOAP = "ISOAP",
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
}

/** Priorité de la vérification */
export enum CheckingUpdateDtoPriorityEnum {
    STANDARD = "STANDARD",
    PREMIUM = "PREMIUM",
    SANDBOX = "SANDBOX",
}

/** Types de livraisons ayant cette vérification par défaut */
export enum CheckingUpdateDtoDefaultUploadsCheckEnum {
    VECTOR = "VECTOR",
    RASTER = "RASTER",
    ARCHIVE = "ARCHIVE",
    ROK4PYRAMID = "ROK4-PYRAMID",
    INDEX = "INDEX",
    HISTORICIMAGERY = "HISTORIC-IMAGERY",
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

/** Type de famille à laquelle appartient la nomenclature */
export enum NomenclatureResponseDtoTypeEnum {
    CRS = "CRS",
    ZONE = "ZONE",
    FORMAT = "FORMAT",
    RESOLUTION = "RESOLUTION",
}

export enum UploadListResponseDtoTypeEnum {
    VECTOR = "VECTOR",
    RASTER = "RASTER",
    ARCHIVE = "ARCHIVE",
    ROK4PYRAMID = "ROK4-PYRAMID",
    INDEX = "INDEX",
    HISTORICIMAGERY = "HISTORIC-IMAGERY",
}

export enum UploadListResponseDtoVisibilityEnum {
    PRIVATE = "PRIVATE",
    REFERENCED = "REFERENCED",
    PUBLIC = "PUBLIC",
}

export enum UploadListResponseDtoStatusEnum {
    CREATED = "CREATED",
    OPEN = "OPEN",
    CLOSED = "CLOSED",
    CHECKING = "CHECKING",
    GENERATING = "GENERATING",
    MODIFYING = "MODIFYING",
    UNSTABLE = "UNSTABLE",
    DELETED = "DELETED",
}

export enum UploadSharedDetailResponseDtoTypeEnum {
    VECTOR = "VECTOR",
    RASTER = "RASTER",
    ARCHIVE = "ARCHIVE",
    ROK4PYRAMID = "ROK4-PYRAMID",
    INDEX = "INDEX",
    HISTORICIMAGERY = "HISTORIC-IMAGERY",
}

export enum UploadSharedDetailResponseDtoVisibilityEnum {
    PRIVATE = "PRIVATE",
    REFERENCED = "REFERENCED",
    PUBLIC = "PUBLIC",
}

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

export enum StoredDataListResponseDtoTypeEnum {
    ROK4PYRAMIDRASTER = "ROK4-PYRAMID-RASTER",
    ROK4PYRAMIDVECTOR = "ROK4-PYRAMID-VECTOR",
    VECTORDB = "VECTOR-DB",
    ARCHIVE = "ARCHIVE",
    GRAPHDB = "GRAPH-DB",
    GRAPHOSRM = "GRAPH-OSRM",
    GRAPHVALHALLA = "GRAPH-VALHALLA",
    INDEX = "INDEX",
}

export enum StoredDataListResponseDtoVisibilityEnum {
    PRIVATE = "PRIVATE",
    REFERENCED = "REFERENCED",
    PUBLIC = "PUBLIC",
}

export enum StoredDataSharedDetailResponseDtoTypeEnum {
    ROK4PYRAMIDRASTER = "ROK4-PYRAMID-RASTER",
    ROK4PYRAMIDVECTOR = "ROK4-PYRAMID-VECTOR",
    VECTORDB = "VECTOR-DB",
    ARCHIVE = "ARCHIVE",
    GRAPHDB = "GRAPH-DB",
    GRAPHOSRM = "GRAPH-OSRM",
    GRAPHVALHALLA = "GRAPH-VALHALLA",
    INDEX = "INDEX",
}

export enum StoredDataSharedDetailResponseDtoVisibilityEnum {
    PRIVATE = "PRIVATE",
    REFERENCED = "REFERENCED",
    PUBLIC = "PUBLIC",
}

/** Type du fichier statique */
export enum StaticFileListResponseDtoTypeEnum {
    GEOSERVERFTL = "GEOSERVER-FTL",
    GEOSERVERSTYLE = "GEOSERVER-STYLE",
    ROK4STYLE = "ROK4-STYLE",
    DERIVATIONSQL = "DERIVATION-SQL",
}

/** Priorité de traitement */
export enum ProcessingStandardDetailResponseDtoPriorityEnum {
    STANDARD = "STANDARD",
    PREMIUM = "PREMIUM",
    SANDBOX = "SANDBOX",
}

export enum ProcessingExecutionListResponseDtoStatusEnum {
    CREATED = "CREATED",
    WAITING = "WAITING",
    PROGRESS = "PROGRESS",
    SUCCESS = "SUCCESS",
    FAILURE = "FAILURE",
    ABORTED = "ABORTED",
}

/** Statut de la configuration */
export enum ConfigurationListResponseDtoStatusEnum {
    UNPUBLISHED = "UNPUBLISHED",
    PUBLISHED = "PUBLISHED",
    SYNCHRONIZING = "SYNCHRONIZING",
}

/** Priorité de la vérification */
export enum CheckingStandardDetailResponseDtoPriorityEnum {
    STANDARD = "STANDARD",
    PREMIUM = "PREMIUM",
    SANDBOX = "SANDBOX",
}

/** Types de livraisons ayant cette vérification par défaut */
export enum CheckingStandardDetailResponseDtoDefaultUploadsCheckEnum {
    VECTOR = "VECTOR",
    RASTER = "RASTER",
    ARCHIVE = "ARCHIVE",
    ROK4PYRAMID = "ROK4-PYRAMID",
    INDEX = "INDEX",
    HISTORICIMAGERY = "HISTORIC-IMAGERY",
}

export enum CheckingExecutionListResponseDtoStatusEnum {
    WAITING = "WAITING",
    PROGRESS = "PROGRESS",
    SUCCESS = "SUCCESS",
    FAILURE = "FAILURE",
}

export enum CheckingExecutionDetailResponseDtoStatusEnum {
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
}

export enum CommunityUserResponseDtoRightsEnum {
    COMMUNITY = "COMMUNITY",
    PROCESSING = "PROCESSING",
    ANNEX = "ANNEX",
    BROADCAST = "BROADCAST",
    UPLOAD = "UPLOAD",
}

export enum UploadCatalogResponseDtoTypeEnum {
    VECTOR = "VECTOR",
    RASTER = "RASTER",
    ARCHIVE = "ARCHIVE",
    ROK4PYRAMID = "ROK4-PYRAMID",
    INDEX = "INDEX",
    HISTORICIMAGERY = "HISTORIC-IMAGERY",
}

export enum UploadCatalogResponseDtoVisibilityEnum {
    PRIVATE = "PRIVATE",
    REFERENCED = "REFERENCED",
    PUBLIC = "PUBLIC",
}

export enum UploadAdminListResponseDtoTypeEnum {
    VECTOR = "VECTOR",
    RASTER = "RASTER",
    ARCHIVE = "ARCHIVE",
    ROK4PYRAMID = "ROK4-PYRAMID",
    INDEX = "INDEX",
    HISTORICIMAGERY = "HISTORIC-IMAGERY",
}

export enum UploadAdminListResponseDtoVisibilityEnum {
    PRIVATE = "PRIVATE",
    REFERENCED = "REFERENCED",
    PUBLIC = "PUBLIC",
}

export enum UploadAdminListResponseDtoStatusEnum {
    CREATED = "CREATED",
    OPEN = "OPEN",
    CLOSED = "CLOSED",
    CHECKING = "CHECKING",
    GENERATING = "GENERATING",
    MODIFYING = "MODIFYING",
    UNSTABLE = "UNSTABLE",
    DELETED = "DELETED",
}

export enum UploadAdminDetailResponseDtoTypeEnum {
    VECTOR = "VECTOR",
    RASTER = "RASTER",
    ARCHIVE = "ARCHIVE",
    ROK4PYRAMID = "ROK4-PYRAMID",
    INDEX = "INDEX",
    HISTORICIMAGERY = "HISTORIC-IMAGERY",
}

export enum UploadAdminDetailResponseDtoVisibilityEnum {
    PRIVATE = "PRIVATE",
    REFERENCED = "REFERENCED",
    PUBLIC = "PUBLIC",
}

export enum UploadAdminDetailResponseDtoStatusEnum {
    CREATED = "CREATED",
    OPEN = "OPEN",
    CLOSED = "CLOSED",
    CHECKING = "CHECKING",
    GENERATING = "GENERATING",
    MODIFYING = "MODIFYING",
    UNSTABLE = "UNSTABLE",
    DELETED = "DELETED",
}

export enum StoredDataAdminListResponseDtoTypeEnum {
    ROK4PYRAMIDRASTER = "ROK4-PYRAMID-RASTER",
    ROK4PYRAMIDVECTOR = "ROK4-PYRAMID-VECTOR",
    VECTORDB = "VECTOR-DB",
    ARCHIVE = "ARCHIVE",
    GRAPHDB = "GRAPH-DB",
    GRAPHOSRM = "GRAPH-OSRM",
    GRAPHVALHALLA = "GRAPH-VALHALLA",
    INDEX = "INDEX",
}

export enum StoredDataAdminListResponseDtoVisibilityEnum {
    PRIVATE = "PRIVATE",
    REFERENCED = "REFERENCED",
    PUBLIC = "PUBLIC",
}

/** Type du fichier statique */
export enum StaticFileAdminListResponseDtoTypeEnum {
    GEOSERVERFTL = "GEOSERVER-FTL",
    GEOSERVERSTYLE = "GEOSERVER-STYLE",
    ROK4STYLE = "ROK4-STYLE",
    DERIVATIONSQL = "DERIVATION-SQL",
}

/** Type du fichier statique */
export enum StaticFileAdminDetailResponseDtoTypeEnum {
    GEOSERVERFTL = "GEOSERVER-FTL",
    GEOSERVERSTYLE = "GEOSERVER-STYLE",
    ROK4STYLE = "ROK4-STYLE",
    DERIVATIONSQL = "DERIVATION-SQL",
}

export enum ProcessingExecutionAdminDetailResponseDtoStatusEnum {
    CREATED = "CREATED",
    WAITING = "WAITING",
    PROGRESS = "PROGRESS",
    SUCCESS = "SUCCESS",
    FAILURE = "FAILURE",
    ABORTED = "ABORTED",
}

export enum MetadataAdminDetailResponseDtoTypeEnum {
    INSPIRE = "INSPIRE",
    ISOAP = "ISOAP",
}

export enum MetadataAdminDetailResponseDtoLevelEnum {
    DATASET = "DATASET",
    SERIES = "SERIES",
}

export enum MetadataAdminResponseDtoTypeEnum {
    INSPIRE = "INSPIRE",
    ISOAP = "ISOAP",
}

export enum MetadataAdminResponseDtoLevelEnum {
    DATASET = "DATASET",
    SERIES = "SERIES",
}

/** Statut de la configuration */
export enum ConfigurationAdminListResponseDtoStatusEnum {
    UNPUBLISHED = "UNPUBLISHED",
    PUBLISHED = "PUBLISHED",
    SYNCHRONIZING = "SYNCHRONIZING",
}

export enum ConfigurationAdminDetailResponseDtoStatusEnum {
    UNPUBLISHED = "UNPUBLISHED",
    PUBLISHED = "PUBLISHED",
    SYNCHRONIZING = "SYNCHRONIZING",
}

export enum CheckingExecutionAdminDetailResponseDtoStatusEnum {
    WAITING = "WAITING",
    PROGRESS = "PROGRESS",
    SUCCESS = "SUCCESS",
    FAILURE = "FAILURE",
}

/** Type de stockages à filter, à laisser vide pour tous les types */
export enum GetByTypeParamsTypeEnum {
    POSTGRESQL = "POSTGRESQL",
    S3 = "S3",
    FILESYSTEM = "FILESYSTEM",
    OPENSEARCH = "OPENSEARCH",
    POSTGRESQLROUTING = "POSTGRESQL-ROUTING",
}

/** Type de famille à laquelle appartient la nomenclature */
export enum FindAllParamsTypeEnum {
    CRS = "CRS",
    ZONE = "ZONE",
    FORMAT = "FORMAT",
    RESOLUTION = "RESOLUTION",
}

/** Statut des exécutions à récupérer */
export enum GetAll11ParamsStatusEnum {
    WAITING = "WAITING",
    PROGRESS = "PROGRESS",
    SUCCESS = "SUCCESS",
    FAILURE = "FAILURE",
}

/** Filtre sur les droits de l'utlisateur */
export enum GetUsersParamsRightsEnum {
    COMMUNITY = "COMMUNITY",
    PROCESSING = "PROCESSING",
    ANNEX = "ANNEX",
    BROADCAST = "BROADCAST",
    UPLOAD = "UPLOAD",
}

/** Type de livraisons */
export enum GetUploadsParamsTypeEnum {
    VECTOR = "VECTOR",
    RASTER = "RASTER",
    ARCHIVE = "ARCHIVE",
    ROK4PYRAMID = "ROK4-PYRAMID",
    INDEX = "INDEX",
    HISTORICIMAGERY = "HISTORIC-IMAGERY",
}

/** Type de diffusion de l'offre */
export enum GetPublicOfferingsParamsTypeEnum {
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
