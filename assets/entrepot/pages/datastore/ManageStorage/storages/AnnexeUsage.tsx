import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import Pagination from "@codegouvfr/react-dsfr/Pagination";
import { useMutation, usePrefetchQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { CartesApiException } from "@/modules/jsonFetch";
import { Annexe, Datastore } from "../../../../../@types/app";
import LoadingIcon from "../../../../../components/Utils/LoadingIcon";
import LoadingText from "../../../../../components/Utils/LoadingText";
import Progress from "../../../../../components/Utils/Progress";
import Wait from "../../../../../components/Utils/Wait";
import { useTranslation } from "../../../../../i18n/i18n";
import RQKeys from "../../../../../modules/entrepot/RQKeys";
import { routes, useRoutePaginationParams } from "../../../../../router/router";
import { decodeContentRange, delta, niceBytes, PaginatedListResponse } from "../../../../../utils";
import api from "../../../../api";
import DataCard from "../DataCard";
import { DatastoreManageStorageTab } from "../types";

const TAGS_PREFIX = {
    DATASHEET_NAME: "datasheet_name=",
    TYPE: "type=",
};

const confirmDialogModal = createModal({
    id: "confirm-delete-annexe-modal",
    isOpenedByDefault: false,
});

async function fetchAnnexeList(datastoreId: string, queryParams: object = {}, signal?: AbortSignal) {
    const res = await api.annexe.getList(datastoreId, queryParams, { signal });

    return {
        items: res.data,
        contentRange: decodeContentRange(res.headers.get("content-range") ?? "", queryParams?.["limit"] ?? 10),
    };
}

type AnnexeUsageProps = {
    datastore: Datastore;
};
const AnnexeUsage: FC<AnnexeUsageProps> = ({ datastore }) => {
    const { t } = useTranslation("DatastoreManageStorage");
    const { t: tCommon } = useTranslation("Common");

    const { page, limit } = useRoutePaginationParams();

    const annexeUsage = useMemo(() => {
        return datastore?.storages.annexes;
    }, [datastore]);

    const queryParams = { page, limit };
    const annexeListQuery = useQuery<PaginatedListResponse<Annexe>, CartesApiException>({
        queryKey: RQKeys.datastore_annexe_list(datastore._id, queryParams),
        queryFn: ({ signal }) => fetchAnnexeList(datastore._id, queryParams, signal),
        staleTime: delta.minutes(1),
    });
    const { data: { items: annexesList, contentRange } = { items: [], contentRange: undefined } } = annexeListQuery;

    usePrefetchQuery({
        queryKey: RQKeys.datastore_annexe_list(datastore._id, { ...queryParams, page: page + 1 }),
        queryFn: ({ signal }) => fetchAnnexeList(datastore._id, { ...queryParams, page: page + 1 }, signal),
        staleTime: delta.minutes(1),
    });

    const queryClient = useQueryClient();

    const [currentAnnexeId, setCurrentAnnexeId] = useState<string | undefined>();

    const deleteAnnexeMutation = useMutation({
        mutationFn: (annexeId: string) => api.annexe.remove(datastore._id, annexeId),
        onSuccess() {
            queryClient.setQueryData(RQKeys.datastore_annexe_list(datastore._id, queryParams), (prevData: PaginatedListResponse<Annexe> | undefined) => {
                return prevData
                    ? {
                          ...prevData,
                          items: prevData.items.filter((annexe) => annexe._id !== currentAnnexeId),
                      }
                    : undefined;
            });
            queryClient.invalidateQueries({
                queryKey: RQKeys.datastore_annexe_list(datastore._id),
                exact: false,
            });

            setCurrentAnnexeId(undefined);
        },
        onError() {
            setCurrentAnnexeId(undefined);
        },
    });

    return (
        <>
            <p className={fr.cx("fr-text--xs")}>{t("storage.annexe.explanation")}</p>

            {annexeUsage ? (
                <div className={fr.cx("fr-grid-row")}>
                    <div className={fr.cx("fr-col-12", "fr-col-md-6", "fr-col-lg-4")}>
                        <Progress
                            label={
                                <>
                                    {niceBytes(annexeUsage.use.toString())} / <strong>{niceBytes(annexeUsage.quota.toString())}</strong>
                                </>
                            }
                            value={annexeUsage.use}
                            max={annexeUsage.quota}
                        />
                    </div>
                </div>
            ) : (
                <p>{t("storage.not_found")}</p>
            )}

            {annexeListQuery.isFetching && <LoadingText message={t("storage.annexe.loading")} as="p" withSpinnerIcon className={fr.cx("fr-mt-4v")} />}

            {annexeListQuery.error && <Alert severity="error" title={annexeListQuery.error.message} as="h2" closable onClose={annexeListQuery.refetch} />}

            {deleteAnnexeMutation.error && (
                <Alert severity="error" title={deleteAnnexeMutation.error.message} as="h2" closable onClose={annexeListQuery.refetch} />
            )}

            {annexesList.length > 0 &&
                annexesList.map((annexe) => {
                    const labels = annexe.labels?.sort() ?? [];
                    const datasheetName = labels.find((label) => label.startsWith(TAGS_PREFIX.DATASHEET_NAME))?.replace(TAGS_PREFIX.DATASHEET_NAME, "");

                    return (
                        <DataCard
                            key={annexe._id}
                            name={annexe.paths?.[0] ?? "-"}
                            type={annexe.mime_type}
                            size={annexe.size ? niceBytes(annexe.size?.toString()) : t("data.size.unknown")}
                            buttons={[
                                {
                                    iconId: "fr-icon-delete-line",
                                    priority: "tertiary no outline",
                                    onClick: () => {
                                        setCurrentAnnexeId(annexe._id);
                                        confirmDialogModal.open();
                                    },
                                    children: tCommon("delete"),
                                },
                                datasheetName !== undefined && {
                                    iconId: "fr-icon-arrow-right-s-line",
                                    priority: "tertiary no outline",
                                    linkProps: routes.datastore_datasheet_view({
                                        datastoreId: datastore._id,
                                        datasheetName: datasheetName,
                                    }).link,
                                    children: tCommon("see_2"),
                                },
                            ]}
                        />
                    );
                })}

            {contentRange && contentRange?.totalPages > 1 && (
                <Pagination
                    defaultPage={page}
                    count={contentRange?.totalPages}
                    getPageLinkProps={(pageNumber: number) =>
                        routes.datastore_manage_storage({ datastoreId: datastore._id, limit, page: pageNumber, tab: DatastoreManageStorageTab.ANNEXE }).link
                    }
                />
            )}

            {createPortal(
                <confirmDialogModal.Component
                    title={t("storage.annexe.deletion.confirmation", { annexeId: currentAnnexeId })}
                    buttons={[
                        {
                            children: tCommon("no"),
                            priority: "secondary",
                        },
                        {
                            children: tCommon("yes"),
                            onClick: () => {
                                if (currentAnnexeId !== undefined) {
                                    deleteAnnexeMutation.mutate(currentAnnexeId);
                                }
                            },
                            priority: "primary",
                        },
                    ]}
                >
                    <div />
                </confirmDialogModal.Component>,
                document.body
            )}

            {deleteAnnexeMutation.isPending && (
                <Wait>
                    <div className={fr.cx("fr-container")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <LoadingIcon className={fr.cx("fr-mr-2v")} />
                            <h6 className={fr.cx("fr-m-0")}>{t("storage.annexe.deletion.in_progress")}</h6>
                        </div>
                    </div>
                </Wait>
            )}
        </>
    );
};

export default AnnexeUsage;
