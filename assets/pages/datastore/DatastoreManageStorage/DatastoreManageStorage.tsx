import { fr } from "@codegouvfr/react-dsfr";
import Tabs, { TabsProps } from "@codegouvfr/react-dsfr/Tabs";
import { useQuery } from "@tanstack/react-query";
import { declareComponentKeys } from "i18nifty";
import { FC, JSX, useMemo } from "react";

import api from "../../../api";
import DatastoreLayout from "../../../components/Layout/DatastoreLayout";
import LoadingIcon from "../../../components/Utils/LoadingIcon";
import { useTranslation, type Translations } from "../../../i18n/i18n";
import RQKeys from "../../../modules/RQKeys";
import AnnexeUsage from "./storages/AnnexeUsage";
import EndpointsUsage from "./storages/EndpointsUsage";
import FilesystemUsage from "./storages/FilesystemUsage";
import PostgresqlUsage from "./storages/PostgresqlUsage";
import S3Usage from "./storages/S3Usage";
import UploadUsage from "./storages/UploadUsage";

type DatastoreManageStorageProps = {
    datastoreId: string;
};
const DatastoreManageStorage: FC<DatastoreManageStorageProps> = ({ datastoreId }) => {
    const { t } = useTranslation("DatastoreManageStorage");

    const datastoreQuery = useQuery({
        queryKey: RQKeys.datastore(datastoreId),
        queryFn: ({ signal }) => api.datastore.get(datastoreId, { signal }),
        staleTime: 3600000,
    });

    const tabs: TabsProps["tabs"] = useMemo(() => {
        if (datastoreQuery.data === undefined) {
            return [];
        }

        // NOTE : d'après les utilisations de l'API vues jusque là, seul le stockage FILESYSTEM est optionnel, les autres sont forcément là
        const hasFilesystemStorage = datastoreQuery.data?.storages.data.find((data) => data.storage.type === "FILESYSTEM") !== undefined;

        const tabs: TabsProps["tabs"] = [
            {
                label: t("storage.postgresql.label"),
                content: <PostgresqlUsage datastore={datastoreQuery.data} />,
            },
            {
                label: t("storage.s3.label"),
                content: <S3Usage datastore={datastoreQuery.data} />,
            },
            {
                label: t("storage.upload.label"),
                content: <UploadUsage datastore={datastoreQuery.data} />,
            },
            {
                label: t("storage.annexe.label"),
                content: <AnnexeUsage datastore={datastoreQuery.data} />,
            },
            {
                label: t("storage.endpoints.label"),
                content: <EndpointsUsage datastore={datastoreQuery.data} />,
            },
        ];

        if (hasFilesystemStorage) {
            tabs.unshift({
                label: t("storage.filesystem.label"),
                content: <FilesystemUsage datastore={datastoreQuery.data} />,
            });
        }

        return tabs;
    }, [datastoreQuery.data, t]);

    return (
        <DatastoreLayout datastoreId={datastoreId} documentTitle={t("title", { datastoreName: datastoreQuery?.data?.name })}>
            <div className={fr.cx("fr-grid-row")}>
                <h1>
                    {t("title", { datastoreName: datastoreQuery?.data?.name })}
                    {datastoreQuery?.isFetching && <LoadingIcon className={fr.cx("fr-ml-2w")} largeIcon />}
                </h1>
                <p>{t("explanation")}</p>
            </div>

            {datastoreQuery.data && (
                <div className={fr.cx("fr-grid-row")}>
                    <div className={fr.cx("fr-col-12")}>
                        <Tabs tabs={tabs} />
                    </div>
                </div>
            )}
        </DatastoreLayout>
    );
};

export default DatastoreManageStorage;

export const { i18n } = declareComponentKeys<
    | { K: "title"; P: { datastoreName: string | undefined }; R: string }
    | "explanation"
    | "stored_data.size.unknown"
    | "storage.not_found"
    | { K: "storage.filesystem.label"; R: JSX.Element }
    | "storage.filesystem.explanation"
    | { K: "storage.postgresql.label"; R: JSX.Element }
    | "storage.postgresql.vectordb.loading"
    | "storage.postgresql.explanation"
    | { K: "storage.s3.label"; R: JSX.Element }
    | "storage.s3.explanation"
    | { K: "storage.upload.label"; R: JSX.Element }
    | "storage.upload.explanation"
    | { K: "storage.annexe.label"; R: JSX.Element }
    | "storage.annexe.explanation"
    | { K: "storage.endpoints.label"; R: JSX.Element }
    | "storage.endpoints.explanation"
>()({
    DatastoreManageStorage,
});

export const DatastoreManageStorageFrTranslations: Translations<"fr">["DatastoreManageStorage"] = {
    title: ({ datastoreName }) => `Gérer l'espace de travail${datastoreName ? " " + datastoreName : ""}`,
    explanation:
        "Cette page vous permet de voir en un seul coup d'œil le volume de vos données et votre situation par rapport aux différents quotas qui vous sont alloués.",
    "stored_data.size.unknown": "Taille inconnue",
    "storage.not_found": "Aucun stockage de ce type n'est attribué à votre espace de travail.",
    "storage.filesystem.label": (
        <span>
            Données intégrées sous <br /> forme de fichiers
        </span>
    ),
    "storage.filesystem.explanation": "Cet espace est utilisé par le Géotuileur pour le stockage des pyramides de tuiles vectorielles.",
    "storage.postgresql.label": (
        <span>
            Données intégrées <br /> en base
        </span>
    ),
    "storage.postgresql.vectordb.loading": "Chargement des données vectorielles en BD PostgreSQL en cours",
    "storage.postgresql.explanation":
        "Il s'agit de l'espace occupé par des données sur les serveurs PostgreSQL de votre espace de travail. Il s'agit de données intermédiaires qui ne sont pas directement visibles de vos utilisateurs.",
    "storage.s3.label": (
        <span>
            Stockage <br /> de masse
        </span>
    ),
    "storage.s3.explanation":
        "Cet espace est utilisé par le Géotuileur pour le stockage des pyramides de \
    tuiles vectorielles. Il est plus performant que le stockage sous forme de fichiers.",
    "storage.upload.label": (
        <span>
            Données <br /> déposées
        </span>
    ),
    "storage.upload.explanation":
        "Il s'agit de l'espace occupé par les fichiers de données bruts que vous avez téléversés (fichiers csv, geopackage...). Ces fichiers sont normalement supprimés dès l'intégration en base réussie de vos données. Il est possible qu'il reste des traces de fichiers dans cet espace lorsque les intégrations en base ont échoué.",
    "storage.annexe.label": (
        <span>
            Fichiers <br /> annexes
        </span>
    ),
    "storage.annexe.explanation":
        "Cet espace est occupé par les fichiers mis à disposition de vos utilisateurs via des adresses publiques. Il s'agit généralement des fichiers de style au format JSON qui servent à symboliser vos pyramides de tuiles vectorielles.",
    "storage.endpoints.label": (
        <span>
            Points de <br /> publication
        </span>
    ),
    "storage.endpoints.explanation": "Il s'agit du nombre de couches publiées par point de publication dans votre espace de travail.",
};
export const DatastoreManageStorageEnTranslations: Translations<"en">["DatastoreManageStorage"] = {
    title: undefined,
    explanation: undefined,
    "stored_data.size.unknown": undefined,
    "storage.not_found": undefined,
    "storage.filesystem.label": undefined,
    "storage.filesystem.explanation": undefined,
    "storage.postgresql.label": undefined,
    "storage.postgresql.vectordb.loading": undefined,
    "storage.postgresql.explanation": undefined,
    "storage.s3.label": undefined,
    "storage.s3.explanation": undefined,
    "storage.upload.label": undefined,
    "storage.upload.explanation": undefined,
    "storage.annexe.label": undefined,
    "storage.annexe.explanation": undefined,
    "storage.endpoints.label": undefined,
    "storage.endpoints.explanation": undefined,
};
