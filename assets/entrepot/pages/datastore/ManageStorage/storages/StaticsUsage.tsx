import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import Pagination from "@codegouvfr/react-dsfr/Pagination";
import { useMutation, usePrefetchQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, useState } from "react";
import { createPortal } from "react-dom";

import { CartesApiException } from "@/modules/jsonFetch";
import { routes, useRoutePaginationParams } from "@/router/router";
import type { Datastore, StaticFile } from "../../../../../@types/app";
import LoadingIcon from "../../../../../components/Utils/LoadingIcon";
import LoadingText from "../../../../../components/Utils/LoadingText";
import Wait from "../../../../../components/Utils/Wait";
import { useTranslation } from "../../../../../i18n/i18n";
import RQKeys from "../../../../../modules/entrepot/RQKeys";
import { decodeContentRange, delta, PaginatedListResponse } from "../../../../../utils";
import api from "../../../../api";
import DataCard from "../DataCard";
import { DatastoreManageStorageTab } from "../types";

const confirmDialogModal = createModal({
    id: "confirm-delete-statics-modal",
    isOpenedByDefault: false,
});

type StaticsUsageProps = {
    datastore: Datastore;
};

async function fetchStaticsList(datastoreId: string, queryParams: object = {}, signal?: AbortSignal) {
    const res = await api.statics.getList(datastoreId, queryParams, { signal });

    return {
        items: res.data,
        contentRange: decodeContentRange(res.headers.get("content-range") ?? "", queryParams?.["limit"] ?? 10),
    };
}

const StaticsUsage: FC<StaticsUsageProps> = ({ datastore }) => {
    const { t } = useTranslation("DatastoreManageStorage");
    const { t: tCommon } = useTranslation("Common");

    const { page, limit } = useRoutePaginationParams();

    const queryParams = { page, limit };
    const staticsListQuery = useQuery<PaginatedListResponse<StaticFile>, CartesApiException>({
        queryKey: RQKeys.datastore_statics_list(datastore._id, queryParams),
        queryFn: ({ signal }) => fetchStaticsList(datastore._id, queryParams, signal),
        staleTime: delta.minutes(1),
    });

    const { data: { items: staticsList, contentRange } = { items: [], contentRange: undefined } } = staticsListQuery;

    usePrefetchQuery({
        queryKey: RQKeys.datastore_statics_list(datastore._id, { ...queryParams, page: page + 1 }),
        queryFn: ({ signal }) => fetchStaticsList(datastore._id, { ...queryParams, page: page + 1 }, signal),
        staleTime: delta.minutes(1),
    });

    const queryClient = useQueryClient();
    const [currentStaticId, setCurrentStaticId] = useState<string | undefined>();

    const deleteStaticMutation = useMutation({
        mutationFn: (staticId: string) => api.statics.remove(datastore._id, staticId),
        onSuccess() {
            queryClient.setQueryData(RQKeys.datastore_statics_list(datastore._id, queryParams), (prevData: PaginatedListResponse<StaticFile> | undefined) => {
                return prevData
                    ? {
                          ...prevData,
                          items: prevData.items.filter((staticFile) => staticFile._id !== currentStaticId),
                      }
                    : undefined;
            });
            queryClient.invalidateQueries({
                queryKey: RQKeys.datastore_statics_list(datastore._id),
                exact: false,
            });

            setCurrentStaticId(undefined);
        },
        onError() {
            setCurrentStaticId(undefined);
        },
    });

    return (
        <>
            <p className={fr.cx("fr-text--xs")}>{t("storage.statics.explanation")}</p>

            {staticsListQuery.isFetching && <LoadingText message={t("storage.statics.loading")} as="p" withSpinnerIcon className={fr.cx("fr-mt-4v")} />}

            {staticsListQuery.error && <Alert severity="error" title={staticsListQuery.error.message} as="h2" closable onClose={staticsListQuery.refetch} />}

            {deleteStaticMutation.error && (
                <Alert severity="error" title={deleteStaticMutation.error.message} as="h2" closable onClose={staticsListQuery.refetch} />
            )}

            {staticsList.length > 0 &&
                staticsList.map((staticFile) => (
                    <DataCard
                        key={staticFile._id}
                        name={staticFile.name}
                        type={staticFile.type}
                        buttons={[
                            {
                                iconId: "fr-icon-delete-line",
                                priority: "tertiary no outline",
                                onClick: () => {
                                    setCurrentStaticId(staticFile._id);
                                    confirmDialogModal.open();
                                },
                                children: tCommon("delete"),
                            },
                        ]}
                    />
                ))}

            {contentRange && contentRange?.totalPages > 1 && (
                <Pagination
                    defaultPage={page}
                    count={contentRange?.totalPages}
                    getPageLinkProps={(pageNumber: number) =>
                        routes.datastore_manage_storage({ datastoreId: datastore._id, limit, page: pageNumber, tab: DatastoreManageStorageTab.STATICS }).link
                    }
                />
            )}

            {createPortal(
                <confirmDialogModal.Component
                    title={t("storage.statics.deletion.confirmation", { staticId: currentStaticId })}
                    buttons={[
                        {
                            children: tCommon("no"),
                            priority: "secondary",
                        },
                        {
                            children: tCommon("yes"),
                            onClick: () => {
                                if (currentStaticId !== undefined) {
                                    deleteStaticMutation.mutate(currentStaticId);
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

            {deleteStaticMutation.isPending && (
                <Wait>
                    <div className={fr.cx("fr-container")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <LoadingIcon className={fr.cx("fr-mr-2v")} />
                            <h6 className={fr.cx("fr-m-0")}>{t("storage.statics.deletion.in_progress")}</h6>
                        </div>
                    </div>
                </Wait>
            )}
        </>
    );
};

export default StaticsUsage;
