import { fr } from "@codegouvfr/react-dsfr";
import Tabs, { TabsProps } from "@codegouvfr/react-dsfr/Tabs";
import { useQuery } from "@tanstack/react-query";
import { FC, useMemo } from "react";

import DatastoreLayout from "../../../../components/Layout/DatastoreLayout";
import LoadingIcon from "../../../../components/Utils/LoadingIcon";
import { useTranslation } from "../../../../i18n/i18n";
import RQKeys from "../../../../modules/entrepot/RQKeys";
import api from "../../../api";
import AnnexeUsage from "./storages/AnnexeUsage";
import EndpointsUsage from "./storages/EndpointsUsage";
import FilesystemUsage from "./storages/FilesystemUsage";
import PostgresqlUsage from "./storages/PostgresqlUsage";
import S3Usage from "./storages/S3Usage";
import StaticsUsage from "./storages/StaticsUsage";
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
        const hasFilesystemStorage = datastoreQuery.data?.storages.data?.find((data) => data.storage.type === "FILESYSTEM") !== undefined;

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
            {
                label: t("storage.statics.label"),
                content: <StaticsUsage datastore={datastoreQuery.data} />,
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
