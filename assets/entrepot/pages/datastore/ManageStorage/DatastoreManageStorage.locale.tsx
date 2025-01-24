import { declareComponentKeys } from "i18nifty";
import { StoredDataTypeEnum, UploadTypeEnum } from "../../../../@types/app";
import { Translations } from "../../../../i18n/types";

const { i18n } = declareComponentKeys<
    // commun
    | { K: "title"; P: { datastoreName?: string }; R: string }
    | "explanation"
    | "storage.not_found"
    | "data.size.unknown"
    | { K: "stored_data.type.title"; P: { type: StoredDataTypeEnum }; R: string }

    // FILESYSTEM
    | { K: "storage.filesystem.label"; R: JSX.Element }
    | "storage.filesystem.stored_data_list.loading"
    | { K: "storage.filesystem.deletion.confirmation"; P: { storedDataName?: string; storedDataId?: string }; R: string }
    | "storage.filesystem.deletion.in_progress"
    | "storage.filesystem.explanation"

    // POSTGRES
    | { K: "storage.postgresql.label"; R: JSX.Element }
    | "storage.postgresql.vectordb.loading"
    | { K: "storage.postgresql.deletion.confirmation"; P: { storedDataName?: string; storedDataId?: string }; R: string }
    | "storage.postgresql.deletion.in_progress"
    | "storage.postgresql.explanation"

    // S3
    | { K: "storage.s3.label"; R: JSX.Element }
    | "storage.s3.stored_data_list.loading"
    | { K: "storage.s3.deletion.confirmation"; P: { storedDataName?: string; storedDataId?: string }; R: string }
    | "storage.s3.deletion.in_progress"
    | "storage.s3.explanation"

    // upload
    | { K: "storage.upload.label"; R: JSX.Element }
    | "storage.upload.loading"
    | { K: "storage.upload.deletion.confirmation"; P: { uploadName?: string; uploadId?: string }; R: string }
    | "storage.upload.deletion.in_progress"
    | "storage.upload.explanation"
    | { K: "storage.upload.type.title"; P: { type: UploadTypeEnum }; R: string }

    // annexe
    | { K: "storage.annexe.label"; R: JSX.Element }
    | "storage.annexe.loading"
    | { K: "storage.annexe.deletion.confirmation"; P: { annexeId?: string }; R: string }
    | "storage.annexe.deletion.in_progress"
    | "storage.annexe.explanation"
    | { K: "storage.annexe.labels.type"; P: { type: string }; R: string }

    // endpoint
    | { K: "storage.endpoints.label"; R: JSX.Element }
    | "storage.endpoints.loading"
    | { K: "storage.endpoints.deletion.confirmation"; P: { offeringName?: string; offeringId?: string }; R: string }
    | "storage.endpoints.deletion.in_progress"
    | "storage.endpoints.explanation"

    // endpoint metadata
    | { K: "storage.endpoints.metadata.deletion.confirmation"; P: { metadataIdentifier?: string; metadataId?: string }; R: string }
    | "storage.endpoints.metadata.deletion.in_progress"

    // statics
    | { K: "storage.statics.label"; R: JSX.Element }
    | "storage.statics.loading"
    | { K: "storage.statics.deletion.confirmation"; P: { staticId?: string }; R: string }
    | "storage.statics.deletion.in_progress"
    | "storage.statics.explanation"
>()("DatastoreManageStorage");
export type I18n = typeof i18n;

export const DatastoreManageStorageFrTranslations: Translations<"fr">["DatastoreManageStorage"] = {
    title: ({ datastoreName }) => `Suivi des consommations de l’espace de travail${datastoreName ? " " + datastoreName : ""}`,
    explanation:
        "Cette page vous permet de voir en un seul coup d'œil le volume de vos données et votre situation par rapport aux différents quotas qui vous sont alloués.",
    "storage.not_found": "Aucun stockage de ce type n'est attribué à votre espace de travail.",
    "data.size.unknown": "Taille inconnue",
    "stored_data.type.title": ({ type }) => {
        switch (type) {
            case StoredDataTypeEnum.VECTORDB:
                return "Données vectorielles en BD PostgreSQL";
            case StoredDataTypeEnum.ROK4PYRAMIDVECTOR:
                return "Pyramide de tuiles vectorielles";
            case StoredDataTypeEnum.ROK4PYRAMIDRASTER:
                return "Pyramide de tuiles raster";
            default:
                return type;
        }
    },
    "storage.upload.type.title": ({ type }) => {
        switch (type) {
            case UploadTypeEnum.VECTOR:
                return "Vecteur";
            case UploadTypeEnum.RASTER:
                return "Raster";
            default:
                return type;
        }
    },
    "storage.filesystem.label": (
        <span>
            Données intégrées sous <br /> forme de fichiers
        </span>
    ),
    "storage.filesystem.stored_data_list.loading": "Chargement des données stockées sous forme de fichiers.",
    "storage.filesystem.deletion.confirmation": ({ storedDataName, storedDataId }) =>
        `Êtes-vous sûr de vouloir supprimer la donnée stockée ${storedDataName} (${storedDataId}) ?`,
    "storage.filesystem.deletion.in_progress": "Suppression de la donnée stockée en cours",
    "storage.filesystem.explanation": "Cet espace est utilisé pour le stockage des pyramides de tuiles vectorielles.",
    "storage.postgresql.label": (
        <span>
            Données intégrées <br /> en base
        </span>
    ),
    "storage.postgresql.vectordb.loading": "Chargement des données vectorielles en BD PostgreSQL en cours",
    "storage.postgresql.deletion.confirmation": ({ storedDataName, storedDataId }) =>
        `Êtes-vous sûr de vouloir supprimer la donnée stockée ${storedDataName} (${storedDataId}) ?`,
    "storage.postgresql.deletion.in_progress": "Suppression de la donnée stockée en cours",
    "storage.postgresql.explanation":
        "Il s'agit de l’espace occupé par des données sur les serveurs PostgreSQL de votre espace de travail. Il s'agit de données intermédiaires qui ne sont pas directement visibles de vos utilisateurs.",
    "storage.s3.label": (
        <span>
            Stockage <br /> de masse
        </span>
    ),
    "storage.s3.stored_data_list.loading": "Chargement des données stockées dans le stockage de masse en cours",
    "storage.s3.deletion.confirmation": ({ storedDataName, storedDataId }) =>
        `Êtes-vous sûr de vouloir supprimer la donnée stockée ${storedDataName} (${storedDataId}) ?`,
    "storage.s3.deletion.in_progress": "Suppression de la donnée stockée en cours",
    "storage.s3.explanation":
        "Cet espace est utilisé pour le stockage des pyramides de tuiles vectorielles utilisables par les services TMS ou images utilisables par les services WMS-raster et WMTS. Il est plus performant que le stockage sous forme de fichiers.",
    "storage.upload.label": (
        <span>
            Données <br /> déposées
        </span>
    ),
    "storage.upload.loading": "Chargement des données déposées en cours",
    "storage.upload.deletion.confirmation": ({ uploadName, uploadId }) => `Êtes-vous sûr de vouloir supprimer la donnée déposée ${uploadName} (${uploadId}) ?`,
    "storage.upload.deletion.in_progress": "Suppression de la donnée déposée en cours",
    "storage.upload.explanation":
        "Il s'agit de l’espace occupé par les fichiers de données bruts que vous avez téléversés (fichiers zip, geopackage...). Ces fichiers sont normalement supprimés dès l’intégration en base réussie de vos données. Il est possible qu'il reste des traces de fichiers dans cet espace lorsque les intégrations en base ont échoué.",

    "storage.annexe.label": (
        <span>
            Fichiers <br /> annexes
        </span>
    ),
    "storage.annexe.loading": "Chargement des annexes",
    "storage.annexe.deletion.confirmation": ({ annexeId }) => `Êtes-vous sûr de vouloir supprimer l’annexe ${annexeId} ?`,
    "storage.annexe.deletion.in_progress": "Suppression de l’annexe en cours",
    "storage.annexe.explanation":
        "Cet espace est occupé par les fichiers mis à disposition de vos utilisateurs via des adresses publiques. Il s'agit généralement des fichiers de style au format JSON qui servent à symboliser vos pyramides de tuiles vectorielles.",
    "storage.annexe.labels.type": ({ type }) => {
        switch (type) {
            case "style":
                return "style";
            case "thumbnail":
                return "vignette";
            default:
                return type;
        }
    },
    "storage.endpoints.label": (
        <span>
            Points de <br /> publication
        </span>
    ),
    "storage.endpoints.loading": "Chargement des flux publiés et des métadonnées en cours",
    "storage.endpoints.deletion.confirmation": ({ offeringName, offeringId }) => `Êtes-vous sûr de vouloir dépublier le flux ${offeringName} (${offeringId}) ?`,
    "storage.endpoints.deletion.in_progress": "Suppression du flux en cours",
    "storage.endpoints.explanation":
        "Il s'agit du nombre de couches ou services publiés par point de publication dans votre espace de travail. Le nombre de points de publication listés dépend de la configuration de votre espace de travail. Cette configuration peut éventuellement limiter le type de service que vous pouvez publier ainsi que leur caractère public ou privé. Le point de publication CSW concerne les métadonnées.",

    "storage.endpoints.metadata.deletion.confirmation": ({ metadataIdentifier, metadataId }) =>
        `Êtes-vous sûr de vouloir supprimer la métadonnée ${metadataIdentifier} (${metadataId}) ?`,
    "storage.endpoints.metadata.deletion.in_progress": "Suppression de la métadonnée en cours",

    "storage.statics.label": (
        <span>
            Fichiers <br /> statiques
        </span>
    ),
    "storage.statics.loading": "Chargement des fichiers statiques",
    "storage.statics.deletion.confirmation": ({ staticId }) => `Êtes-vous sûr de vouloir supprimer le fichier statique ${staticId} ?`,
    "storage.statics.deletion.in_progress": "Suppression du fichier statique en cours",
    "storage.statics.explanation":
        "Cet espace est occupé par des fichiers statiques. Il s'agit généralement des fichiers de styles au format SLD ou FTL déposés lors de la publication d'un service WMS-VECTOR.",
};
export const DatastoreManageStorageEnTranslations: Translations<"en">["DatastoreManageStorage"] = {
    title: undefined,
    explanation: undefined,
    "storage.not_found": undefined,
    "data.size.unknown": undefined,
    "stored_data.type.title": undefined,
    "storage.upload.type.title": undefined,

    "storage.filesystem.label": undefined,
    "storage.filesystem.stored_data_list.loading": undefined,
    "storage.filesystem.deletion.confirmation": undefined,
    "storage.filesystem.deletion.in_progress": undefined,
    "storage.filesystem.explanation": undefined,

    "storage.postgresql.label": undefined,
    "storage.postgresql.vectordb.loading": undefined,
    "storage.postgresql.deletion.confirmation": undefined,
    "storage.postgresql.deletion.in_progress": undefined,
    "storage.postgresql.explanation": undefined,

    "storage.s3.label": undefined,
    "storage.s3.stored_data_list.loading": undefined,
    "storage.s3.deletion.confirmation": undefined,
    "storage.s3.deletion.in_progress": undefined,
    "storage.s3.explanation": undefined,

    "storage.upload.label": undefined,
    "storage.upload.loading": undefined,
    "storage.upload.deletion.confirmation": undefined,
    "storage.upload.deletion.in_progress": undefined,
    "storage.upload.explanation": undefined,

    "storage.annexe.label": undefined,
    "storage.annexe.loading": undefined,
    "storage.annexe.deletion.confirmation": undefined,
    "storage.annexe.deletion.in_progress": undefined,
    "storage.annexe.explanation": undefined,
    "storage.annexe.labels.type": undefined,

    "storage.endpoints.label": undefined,
    "storage.endpoints.loading": undefined,
    "storage.endpoints.deletion.confirmation": undefined,
    "storage.endpoints.deletion.in_progress": undefined,
    "storage.endpoints.explanation": undefined,

    "storage.endpoints.metadata.deletion.confirmation": undefined,
    "storage.endpoints.metadata.deletion.in_progress": undefined,

    "storage.statics.label": undefined,
    "storage.statics.loading": undefined,
    "storage.statics.deletion.confirmation": undefined,
    "storage.statics.deletion.in_progress": undefined,
    "storage.statics.explanation": undefined,
};
