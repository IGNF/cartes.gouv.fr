import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import Card from "@codegouvfr/react-dsfr/Card";
import Pagination from "@codegouvfr/react-dsfr/Pagination";
import Tag from "@codegouvfr/react-dsfr/Tag";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { compareAsc } from "date-fns";
import { FC, useState } from "react";
import { useStyles } from "tss-react/mui";

import { DatastorePermission } from "@/@types/app";
import DatastoreMain from "@/components/Layout/DatastoreMain";
import DatastoreTertiaryNavigation from "@/components/Layout/DatastoreTertiaryNavigation";
import { ListHeader } from "@/components/Layout/ListHeader";
import PageTitle from "@/components/Layout/PageTitle";
import Skeleton from "@/components/Utils/Skeleton";
import { usePagination } from "@/hooks/usePagination";
import { formatDateFromISO } from "@/utils";
import ConfirmDialog, { ConfirmDialogModal } from "../../../../components/Utils/ConfirmDialog";
import Wait from "../../../../components/Utils/Wait";
import { useDatastore } from "../../../../contexts/datastore";
import { useTranslation } from "../../../../i18n/i18n";
import RQKeys from "../../../../modules/entrepot/RQKeys";
import { CartesApiException } from "../../../../modules/jsonFetch";
import { routes, useRoute } from "../../../../router/router";
import api from "../../../api";

type DatastoreManagePermissionsProps = {
    datastoreId: string;
};

const DatastoreManagePermissions: FC<DatastoreManagePermissionsProps> = ({ datastoreId }) => {
    const { t } = useTranslation("DatastorePermissions");
    const { t: tCommon } = useTranslation("Common");

    const queryClient = useQueryClient();

    // Le datastore
    const { datastore, status: datastoreStatus } = useDatastore();

    // Les permissions
    const {
        data: permissions,
        status: permissionStatus,
        isFetching,
        refetch,
        dataUpdatedAt,
    } = useQuery<DatastorePermission[]>({
        queryKey: RQKeys.datastore_permissions(datastoreId),
        queryFn: ({ signal }) => api.datastore.getPermissions(datastoreId, {}, { signal }),
        staleTime: 30000,
        refetchInterval: 30000,
    });

    /* Suppression d'une permission */
    const {
        status: removeStatus,
        error: removeError,
        mutate: mutateRemove,
    } = useMutation<null, CartesApiException, string>({
        mutationFn: (permissionId) => api.datastore.removePermission(datastoreId, permissionId),
        onSuccess() {
            queryClient.setQueryData<DatastorePermission[]>(RQKeys.datastore_permissions(datastoreId), (permissions) => {
                return permissions?.filter((permission) => permission._id !== currentPermission);
            });
        },
    });

    const [currentPermission, setCurrentPermission] = useState<string | undefined>(undefined);

    const { params } = useRoute();
    const page = params["page"] ? parseInt(params["page"]) : 1;
    const limit = params["limit"] ? parseInt(params["limit"]) : 4;

    const { paginatedItems, totalPages } = usePagination(permissions ?? [], page, limit);

    const { css } = useStyles();

    return (
        <DatastoreMain title={t("title", { datastoreName: datastore?.is_sandbox === true ? "Espace Découverte" : datastore?.name })} datastoreId={datastoreId}>
            <PageTitle title={t("title", { datastoreName: datastore?.is_sandbox === true ? "Espace Découverte" : datastore?.name })} />

            <DatastoreTertiaryNavigation datastoreId={datastoreId} communityId={datastore.community._id} />

            {removeStatus === "error" && <Alert severity={"error"} closable title={tCommon("error")} description={removeError.message} />}
            {removeStatus === "pending" && (
                <Wait>
                    <div className={fr.cx("fr-container")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <i className={fr.cx("fr-icon-refresh-line", "fr-icon--lg", "fr-mr-2v") + " frx-icon-spin"} />
                            <h6 className={fr.cx("fr-m-0")}>{tCommon("removing")}</h6>
                        </div>
                    </div>
                </Wait>
            )}

            {permissionStatus !== "pending" && (
                <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-mt-6v", "fr-mb-16v")}>
                    <div
                        className={fr.cx("fr-col-12", "fr-py-0")}
                        style={{
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        <strong className={fr.cx("fr-text--xl", "fr-m-0", "fr-mr-2v")}>Permissions</strong>
                        <Badge severity="info" noIcon={true}>
                            {permissions?.length ?? 0}
                        </Badge>
                        <Button
                            linkProps={routes.datastore_add_permission({ datastoreId: datastoreId }).link}
                            iconId="fr-icon-add-line"
                            iconPosition="right"
                            className={fr.cx("fr-ml-auto")}
                        >
                            {t("list.add_permission")}
                        </Button>
                    </div>
                </div>

                // TODO recherche et filtres ici
            )}

            {datastoreStatus === "pending" || permissionStatus === "pending" ? (
                <Skeleton count={6} rectangleHeight={200} />
            ) : permissions?.length === 0 ? (
                <Alert className={fr.cx("fr-mb-1w")} severity={"info"} title={t("list.no_permissions")} closable />
            ) : (
                permissions !== undefined && (
                    <>
                        <ListHeader
                            nbResults={{
                                displayed: paginatedItems.length,
                                total: permissions.length,
                            }}
                            dataUpdatedAt={dataUpdatedAt}
                            isFetching={isFetching}
                            refetch={refetch}
                        />

                        <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                            {paginatedItems.map((permission) => {
                                const expired = permission.end_date !== undefined && compareAsc(new Date(permission.end_date), new Date()) < 0;
                                const expiringSoon = permission.end_date !== undefined && compareAsc(new Date(permission.end_date), new Date()) <= 30;

                                return (
                                    <div className={fr.cx("fr-col-12")} key={permission._id}>
                                        <Card
                                            title={permission.licence}
                                            end={
                                                <div
                                                    className={css({
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        gap: "0.5rem",
                                                    })}
                                                >
                                                    {expired ? (
                                                        <Badge severity="warning" as="span">
                                                            Expiré
                                                        </Badge>
                                                    ) : expiringSoon ? (
                                                        <Badge severity="warning" as="span">
                                                            Expire bientôt
                                                        </Badge>
                                                    ) : null}

                                                    {permission.end_date !== undefined ? (
                                                        <span>Expire le {formatDateFromISO(permission.end_date)}</span>
                                                    ) : (
                                                        <span>{"Aucune date d'expiration"}</span>
                                                    )}

                                                    <strong className={fr.cx("fr-text--md", "fr-mb-2v")}>Services</strong>
                                                    <ul className={fr.cx("fr-m-0")}>
                                                        {permission.offerings.map((offering) => (
                                                            <li key={offering._id}>
                                                                <span className={fr.cx("fr-mr-3v")}>{offering.layer_name}</span>
                                                                <Badge noIcon severity="info">
                                                                    {offering.type}
                                                                </Badge>
                                                            </li>
                                                        ))}
                                                    </ul>

                                                    {permission.beneficiary !== undefined && (
                                                        <>
                                                            <strong className={fr.cx("fr-text--md", "fr-mb-2v")}>Destinataire</strong>
                                                            <span>
                                                                {"name" in permission.beneficiary ? (
                                                                    <>
                                                                        {permission.beneficiary.name}
                                                                        <Tag className={fr.cx("fr-ml-3v")}>Communauté</Tag>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        {permission.beneficiary?.first_name} {permission.beneficiary?.last_name}
                                                                        <Tag className={fr.cx("fr-ml-3v")}>Utilisateur</Tag>
                                                                    </>
                                                                )}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            }
                                            footer={
                                                <ButtonsGroup
                                                    buttons={[
                                                        {
                                                            children: tCommon("modify"),
                                                            iconId: "fr-icon-edit-line",
                                                            onClick: routes.datastore_edit_permission({
                                                                datastoreId: datastoreId,
                                                                permissionId: permission._id,
                                                            }).push,
                                                        },
                                                        {
                                                            children: tCommon("delete"),
                                                            priority: "secondary",
                                                            iconId: "fr-icon-delete-line",
                                                            onClick: () => {
                                                                setCurrentPermission(permission._id);
                                                                ConfirmDialogModal.open();
                                                            },
                                                        },
                                                    ]}
                                                    inlineLayoutWhen="sm and up"
                                                    buttonsSize="small"
                                                />
                                            }
                                        />
                                    </div>
                                );
                            })}
                        </div>

                        {totalPages > 1 && (
                            <div className={fr.cx("fr-grid-row", "fr-grid-row--center", "fr-mt-6v")}>
                                <Pagination
                                    count={totalPages}
                                    showFirstLast={true}
                                    getPageLinkProps={(pageNumber) => ({
                                        ...routes.datastore_manage_permissions({ datastoreId, page: pageNumber, limit: limit }).link,
                                    })}
                                    defaultPage={page}
                                />
                            </div>
                        )}
                    </>
                )
            )}

            <ConfirmDialog
                title={t("list.confirm_remove")}
                onConfirm={() => {
                    if (currentPermission !== undefined) {
                        mutateRemove(currentPermission);
                    }
                }}
            />
        </DatastoreMain>
    );
};

export default DatastoreManagePermissions;
