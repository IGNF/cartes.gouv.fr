import { fr } from "@codegouvfr/react-dsfr";
import Tabs from "@codegouvfr/react-dsfr/Tabs";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { FC } from "react";

import DatastoreMain from "@/entrepot/components/DatastoreMain";
import DatastoreTertiaryNavigation from "@/entrepot/components/DatastoreTertiaryNavigation";
import PageTitle from "@/components/Layout/PageTitle";
import { datastoreSuspenseQueryOptions } from "@/entrepot/hooks/queries/datastoreQueryOptions";
import LoadingIcon from "../../../../components/Utils/LoadingIcon";
import { useTranslation } from "../../../../i18n/i18n";
import AnnexeUsage from "./storages/AnnexeUsage";
import EndpointsUsage from "./storages/EndpointsUsage";
import FilesystemUsage from "./storages/FilesystemUsage";
import PostgresqlUsage from "./storages/PostgresqlUsage";
import S3Usage from "./storages/S3Usage";
import StaticsUsage from "./storages/StaticsUsage";
import UploadUsage from "./storages/UploadUsage";
import { DatastoreManageStorageTab } from "./types";
import useStoredDataListQuery from "@/entrepot/hooks/queries/useStoredDataListQuery";

const route = getRouteApi("/_private/tableau-de-bord/entrepots/$datastoreId/consommation");

const DatastoreManageStorage: FC = () => {
    const { t } = useTranslation("DatastoreManageStorage");
    const { t: tCommon } = useTranslation("Common");
    const { datastoreId } = route.useParams();
    const { data: datastore, isFetching } = useSuspenseQuery(datastoreSuspenseQueryOptions(datastoreId));

    const navigate = useNavigate();
    const { tab: currentTab } = route.useSearch();

    const hasFilesystemStorage = datastore?.storages.data?.find((data) => data.storage.type === "FILESYSTEM") !== undefined;

    // NOTE : pour garder le même query actif tant qu'on est sur les onglets qui affichent des données stockées
    // TODO : supprimer quand on pourra filtrer par le stockage et on pourra donc paginer côté serveur
    const queryParams = { detailed: true };
    useStoredDataListQuery(datastore._id, queryParams, {
        enabled: [DatastoreManageStorageTab.POSTGRESQL, DatastoreManageStorageTab.S3, DatastoreManageStorageTab.FILESYSTEM].includes(currentTab),
    });

    return (
        <DatastoreMain title={t("title", { datastoreName: datastore?.is_sandbox === true ? tCommon("sandbox") : datastore?.name })} datastoreId={datastore._id}>
            <PageTitle
                title={
                    <>
                        {t("title", { datastoreName: datastore?.is_sandbox === true ? tCommon("sandbox") : datastore?.name })}
                        {isFetching && <LoadingIcon className={fr.cx("fr-ml-2w")} largeIcon />}
                    </>
                }
            ></PageTitle>

            <DatastoreTertiaryNavigation datastoreId={datastore._id} communityId={datastore.community._id} />

            {datastore && (
                <div className={fr.cx("fr-grid-row", "fr-mt-6v", "fr-mb-16v")}>
                    <div className={fr.cx("fr-col-12")}>
                        <Tabs
                            selectedTabId={currentTab}
                            onTabChange={(tabId: string) =>
                                navigate({
                                    to: "/tableau-de-bord/entrepots/$datastoreId/consommation",
                                    params: { datastoreId: datastore._id },
                                    search: { tab: tabId },
                                    replace: true,
                                })
                            }
                            tabs={[
                                {
                                    tabId: DatastoreManageStorageTab.POSTGRESQL,
                                    label: t("storage.postgresql.label"),
                                },
                                {
                                    tabId: DatastoreManageStorageTab.S3,
                                    label: t("storage.s3.label"),
                                },
                                hasFilesystemStorage
                                    ? {
                                          tabId: DatastoreManageStorageTab.FILESYSTEM,
                                          label: t("storage.filesystem.label"),
                                      }
                                    : null,
                                {
                                    tabId: DatastoreManageStorageTab.UPLOAD,
                                    label: t("storage.upload.label"),
                                },
                                {
                                    tabId: DatastoreManageStorageTab.ANNEXE,
                                    label: t("storage.annexe.label"),
                                },
                                {
                                    tabId: DatastoreManageStorageTab.ENDPOINTS,
                                    label: t("storage.endpoints.label"),
                                },
                                {
                                    tabId: DatastoreManageStorageTab.STATICS,
                                    label: t("storage.statics.label"),
                                },
                            ].filter((t) => t !== null)}
                        >
                            {currentTab === DatastoreManageStorageTab.POSTGRESQL ? (
                                <PostgresqlUsage datastore={datastore} />
                            ) : currentTab === DatastoreManageStorageTab.S3 ? (
                                <S3Usage datastore={datastore} />
                            ) : currentTab === DatastoreManageStorageTab.FILESYSTEM ? (
                                <FilesystemUsage datastore={datastore} />
                            ) : currentTab === DatastoreManageStorageTab.UPLOAD ? (
                                <UploadUsage datastore={datastore} />
                            ) : currentTab === DatastoreManageStorageTab.ANNEXE ? (
                                <AnnexeUsage datastore={datastore} />
                            ) : currentTab === DatastoreManageStorageTab.ENDPOINTS ? (
                                <EndpointsUsage datastore={datastore} />
                            ) : currentTab === DatastoreManageStorageTab.STATICS ? (
                                <StaticsUsage datastore={datastore} />
                            ) : null}
                        </Tabs>
                    </div>
                </div>
            )}
        </DatastoreMain>
    );
};

export default DatastoreManageStorage;
