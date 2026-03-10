import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import Tag from "@codegouvfr/react-dsfr/Tag";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import MenuList from "@/components/Utils/MenuList";
import { usePagination } from "@/hooks/usePagination";
import Pagination from "@codegouvfr/react-dsfr/Pagination";
import { Annexe, Datastore } from "../../../../../@types/app";
import LoadingIcon from "../../../../../components/Utils/LoadingIcon";
import LoadingText from "../../../../../components/Utils/LoadingText";
import Progress from "../../../../../components/Utils/Progress";
import Wait from "../../../../../components/Utils/Wait";
import { useTranslation } from "../../../../../i18n/i18n";
import RQKeys from "../../../../../modules/entrepot/RQKeys";
import { CartesApiException } from "../../../../../modules/jsonFetch";
import { routes, useRoute } from "../../../../../router/router";
import { niceBytes } from "../../../../../utils";
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

type AnnexeUsageProps = {
    datastore: Datastore;
};
const AnnexeUsage: FC<AnnexeUsageProps> = ({ datastore }) => {
    const { t } = useTranslation("DatastoreManageStorage");
    const { t: tCommon } = useTranslation("Common");

    const route = useRoute();
    const page = route.params?.["page"] ?? 1;
    const limit = route.params?.["limit"] ?? 10;

    const annexeUsage = useMemo(() => {
        return datastore?.storages.annexes;
    }, [datastore]);

    const annexeListQuery = useQuery<Annexe[], CartesApiException>({
        queryKey: RQKeys.datastore_annexe_list(datastore._id),
        queryFn: ({ signal }) => api.annexe.getList(datastore._id, { signal }),
        staleTime: 60000,
    });

    const { paginatedItems: annexesList, totalPages } = usePagination(annexeListQuery.data ?? [], page, limit);

    const queryClient = useQueryClient();

    const [currentAnnexeId, setCurrentAnnexeId] = useState<string | undefined>();

    const deleteAnnexeMutation = useMutation({
        mutationFn: (annexeId: string) => api.annexe.remove(datastore._id, annexeId),
        onSuccess() {
            queryClient.setQueryData(RQKeys.datastore_annexe_list(datastore._id), (annexesList: Annexe[]) => {
                return annexesList.filter((annexe) => annexe._id !== currentAnnexeId);
            });

            setCurrentAnnexeId(undefined);
        },
        onError() {
            setCurrentAnnexeId(undefined);
        },
    });

    return (
        <>
            <p>{t("storage.annexe.explanation")}</p>

            {annexeUsage ? (
                <Progress
                    label={`${niceBytes(annexeUsage.use.toString())} / ${niceBytes(annexeUsage.quota.toString())}`}
                    value={annexeUsage.use}
                    max={annexeUsage.quota}
                />
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
                            name={annexe.paths[0] ?? "-"}
                            type={annexe.mime_type}
                            size={annexe.size ? niceBytes(annexe.size?.toString()) : t("data.size.unknown")}
                            tags={
                                <>
                                    <Tag small>{annexe.published ? tCommon("published") : tCommon("not_published")}</Tag>
                                    {labels.length > 0 &&
                                        labels.map((label) => (
                                            <Tag key={`annexe-${annexe._id}-label-${label}`} small>
                                                {label}
                                            </Tag>
                                        ))}
                                </>
                            }
                            buttons={
                                <>
                                    {datasheetName && (
                                        <Button
                                            size="small"
                                            iconId="fr-icon-arrow-right-s-line"
                                            iconPosition="right"
                                            priority="tertiary no outline"
                                            linkProps={routes.datastore_datasheet_view({ datastoreId: datastore._id, datasheetName: datasheetName }).link}
                                        >
                                            {tCommon("see_2")}
                                        </Button>
                                    )}
                                    <MenuList
                                        menuOpenButtonProps={{
                                            size: "small",
                                            iconId: "ri-more-2-line",
                                            iconPosition: "right",
                                            priority: "tertiary no outline",
                                        }}
                                        items={[
                                            {
                                                text: tCommon("delete"),
                                                iconId: "fr-icon-delete-line",
                                                onClick: () => {
                                                    setCurrentAnnexeId(annexe._id);
                                                    confirmDialogModal.open();
                                                },
                                            },
                                        ]}
                                    />
                                </>
                            }
                        />
                    );
                })}

            {totalPages > 1 && (
                <Pagination
                    defaultPage={page}
                    count={totalPages}
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
