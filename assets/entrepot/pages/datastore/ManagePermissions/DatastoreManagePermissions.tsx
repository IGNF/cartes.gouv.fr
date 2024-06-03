import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import Table from "@codegouvfr/react-dsfr/Table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { compareAsc } from "date-fns";
import { FC, ReactNode, useMemo, useState } from "react";
import api from "../../../api";
import DatastoreLayout from "../../../../components/Layout/DatastoreLayout";
import LoadingText from "../../../../components/Utils/LoadingText";
import { useTranslation } from "../../../../i18n/i18n";
import RQKeys from "../../../../modules/entrepot/RQKeys";
import { routes } from "../../../../router/router";
import { Datastore } from "../../../../@types/app";
import { DatastorePermissionResponseDto } from "../../../../@types/entrepot";
import ConfirmDialog, { ConfirmDialogModal } from "../../../../components/Utils/ConfirmDialog";
import { CartesApiException } from "../../../../modules/jsonFetch";
import Wait from "../../../../components/Utils/Wait";

type DatastoreManagePermissionsProps = {
    datastoreId: string;
};

const DatastoreManagePermissions: FC<DatastoreManagePermissionsProps> = ({ datastoreId }) => {
    const { t } = useTranslation("DatastorePermissions");
    const { t: tCommon } = useTranslation("Common");

    const queryClient = useQueryClient();

    // Le datastore
    const { data: datastore, status: datastoreStatus } = useQuery<Datastore>({
        queryKey: RQKeys.datastore(datastoreId),
        queryFn: ({ signal }) => api.datastore.get(datastoreId, { signal }),
        staleTime: 3600000,
    });

    // Les permissions
    const { data: permissions, status: permissionStatus } = useQuery<DatastorePermissionResponseDto[]>({
        queryKey: RQKeys.datastore_permissions(datastoreId),
        queryFn: ({ signal }) => api.datastore.getPermissions(datastoreId, { signal }),
        staleTime: 60000,
        refetchInterval: 60000,
    });

    /* Suppression d'une permission */
    const {
        status: removeStatus,
        error: removeError,
        mutate: mutateRemove,
    } = useMutation<null, CartesApiException, string>({
        mutationFn: (permissionId) => api.datastore.removePermission(datastoreId, permissionId),
        onSuccess() {
            queryClient.setQueryData<DatastorePermissionResponseDto[]>(RQKeys.datastore_permissions(datastoreId), (permissions) => {
                return permissions?.filter((permission) => permission._id !== currentPermission);
            });
        },
    });

    const [currentPermission, setCurrentPermission] = useState<string | undefined>(undefined);

    const headers = useMemo(
        () => [t("list.licence_header"), t("list.expiration_date_header"), t("list.granted_to_header"), t("list.services_header"), t("list.actions_header")],
        [t]
    );
    const datas = useMemo(() => {
        const result: ReactNode[][] = [[]];
        if (permissions === undefined) return result;

        return Array.from(permissions, (permission) => {
            const expired = permission.end_date !== undefined && compareAsc(new Date(permission.end_date), new Date()) < 0;
            const expiredNode = (
                <span style={expired ? { color: fr.colors.decisions.text.default.warning.default } : {}}>
                    {t("list.expires_on", { endDate: permission.end_date })}
                </span>
            );

            const data: ReactNode[] = [permission.licence, expiredNode, t("list.granted_to", { beneficiary: permission.beneficiary })];
            data.push(
                <ul /*className={fr.cx("fr-raw-list")}*/>
                    {permission.offerings.map((offering) => (
                        <li key={offering._id}>
                            <span>
                                {offering.layer_name}
                                <Badge className={fr.cx("fr-ml-1v")} noIcon severity="info">
                                    {offering.type}
                                </Badge>
                            </span>
                        </li>
                    ))}
                </ul>
            );
            data.push(
                <div className={fr.cx("fr-grid-row", "fr-grid-row--right")}>
                    <Button
                        title={tCommon("modify")}
                        priority="secondary"
                        iconId="fr-icon-edit-line"
                        size="small"
                        onClick={() => {
                            routes.datastore_edit_permission({ datastoreId: datastoreId, permissionId: permission._id }).push();
                        }}
                    />
                    <Button
                        title={tCommon("delete")}
                        className={fr.cx("fr-ml-2v")}
                        priority="secondary"
                        iconId="fr-icon-delete-line"
                        size="small"
                        onClick={() => {
                            setCurrentPermission(permission._id);
                            ConfirmDialogModal.open();
                        }}
                    />
                </div>
            );
            return data;
        });
    }, [datastoreId, permissions, tCommon, t]);

    return (
        <DatastoreLayout datastoreId={datastoreId} documentTitle={t("list.title", { datastoreName: datastore?.name })}>
            <h1>{t("list.title", { datastoreName: datastore?.name })}</h1>
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
            {datastoreStatus === "pending" || permissionStatus === "pending" ? (
                <LoadingText />
            ) : datas.length === 0 ? (
                <Alert className={fr.cx("fr-mb-1w")} severity={"info"} title={t("list.no_permissions")} closable />
            ) : (
                <Table headers={headers} data={datas} />
            )}
            <Button linkProps={routes.datastore_add_permission({ datastoreId: datastoreId }).link}>{t("list.add_permission")}</Button>
            <ConfirmDialog
                title={t("list.confirm_remove")}
                onConfirm={() => {
                    if (currentPermission !== undefined) {
                        mutateRemove(currentPermission);
                    }
                }}
            />
        </DatastoreLayout>
    );
};

export default DatastoreManagePermissions;
