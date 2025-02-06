import { fr } from "@codegouvfr/react-dsfr";
import Tabs, { TabsProps } from "@codegouvfr/react-dsfr/Tabs";
import { FC, useMemo } from "react";

import LoadingIcon from "../../../../components/Utils/LoadingIcon";
import { useTranslation } from "../../../../i18n/i18n";
import AnnexeUsage from "./storages/AnnexeUsage";
import EndpointsUsage from "./storages/EndpointsUsage";
import FilesystemUsage from "./storages/FilesystemUsage";
import PostgresqlUsage from "./storages/PostgresqlUsage";
import S3Usage from "./storages/S3Usage";
import StaticsUsage from "./storages/StaticsUsage";
import UploadUsage from "./storages/UploadUsage";
import { useDatastore } from "../../../../contexts/datastore";
import Main from "../../../../components/Layout/Main";

const DatastoreManageStorage: FC = () => {
    const { t } = useTranslation("DatastoreManageStorage");
    const { datastore, isFetching } = useDatastore();

    const tabs: TabsProps["tabs"] = useMemo(() => {
        if (datastore === undefined) {
            return [];
        }

        // NOTE : d'après les utilisations de l'API vues jusque là, seul le stockage FILESYSTEM est optionnel, les autres sont forcément là
        const hasFilesystemStorage = datastore?.storages.data?.find((data) => data.storage.type === "FILESYSTEM") !== undefined;

        const tabs: TabsProps["tabs"] = [
            {
                label: t("storage.postgresql.label"),
                content: <PostgresqlUsage datastore={datastore} />,
            },
            {
                label: t("storage.s3.label"),
                content: <S3Usage datastore={datastore} />,
            },
            {
                label: t("storage.upload.label"),
                content: <UploadUsage datastore={datastore} />,
            },
            {
                label: t("storage.annexe.label"),
                content: <AnnexeUsage datastore={datastore} />,
            },
            {
                label: t("storage.endpoints.label"),
                content: <EndpointsUsage datastore={datastore} />,
            },
            {
                label: t("storage.statics.label"),
                content: <StaticsUsage datastore={datastore} />,
            },
        ];

        if (hasFilesystemStorage) {
            tabs.unshift({
                label: t("storage.filesystem.label"),
                content: <FilesystemUsage datastore={datastore} />,
            });
        }

        return tabs;
    }, [datastore, t]);

    return (
        <Main title={t("title", { datastoreName: datastore?.name })}>
            <div className={fr.cx("fr-grid-row")}>
                <h1>
                    {t("title", { datastoreName: datastore?.name })}
                    {isFetching && <LoadingIcon className={fr.cx("fr-ml-2w")} largeIcon />}
                </h1>
                <p>{t("explanation")}</p>
            </div>

            {datastore && (
                <div className={fr.cx("fr-grid-row")}>
                    <div className={fr.cx("fr-col-12")}>
                        <Tabs tabs={tabs} />
                    </div>
                </div>
            )}
        </Main>
    );
};

export default DatastoreManageStorage;
