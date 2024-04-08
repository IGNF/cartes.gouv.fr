import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import Table from "@codegouvfr/react-dsfr/Table";
import { useQuery } from "@tanstack/react-query";
import { compareAsc } from "date-fns";
import { declareComponentKeys } from "i18nifty";
import { FC, ReactNode, useMemo } from "react";
import api from "../../../api";
import DatastoreLayout from "../../../components/Layout/DatastoreLayout";
import LoadingText from "../../../components/Utils/LoadingText";
import functions from "../../../functions";
import { Translations, useTranslation } from "../../../i18n/i18n";
import RQKeys from "../../../modules/RQKeys";
import { Datastore } from "../../../types/app";
import { DatastorePermissionResponseDto, PermissionBeneficiaryDto } from "../../../types/entrepot";

type DatastoreManagePermissionsProps = {
    datastoreId: string;
};

const DatastoreManagePermissions: FC<DatastoreManagePermissionsProps> = ({ datastoreId }) => {
    const { t } = useTranslation("DatastoreManagePermissions");
    const { t: tCommon } = useTranslation("Common");

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
        staleTime: 3600000,
    });

    const headers = useMemo(() => [t("h_licence"), t("h_expiration_date"), t("h_granted_to"), t("h_services"), t("h_actions")], [t]);
    const datas = useMemo(() => {
        const result: ReactNode[][] = [[]];
        if (permissions === undefined) return result;

        return Array.from(permissions, (permission) => {
            const expired = permission.end_date !== undefined && compareAsc(new Date(permission.end_date), new Date()) < 0;
            const expiredNode = (
                <span style={expired ? { color: fr.colors.decisions.text.default.warning.default } : {}}>
                    {t("expires_on", { endDate: permission.end_date })}
                </span>
            );

            const data: ReactNode[] = [permission.licence, expiredNode, t("granted_to", { beneficiary: permission.beneficiary })];
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
                        /*onClick={() => {
                            routes.user_key_edit({ keyId: accessKey._id }).push();
                        }}*/
                    />
                    <Button
                        title={tCommon("delete")}
                        className={fr.cx("fr-ml-2v")}
                        priority="secondary"
                        iconId="fr-icon-delete-line"
                        size="small"
                        /*onClick={() => {
                            setCurrentKey(accessKey._id);
                            ConfirmDialogModal.open();
                        }}*/
                    />
                </div>
            );
            return data;
        });
    }, [permissions, tCommon, t]);

    return (
        <DatastoreLayout datastoreId={datastoreId} documentTitle={t("title", { datastoreName: datastore?.name })}>
            <h1>{t("title", { datastoreName: datastore?.name })}</h1>
            {datastoreStatus === "pending" || (permissionStatus === "pending" && <LoadingText />)}
            {datas.length === 0 ? (
                <Alert className={fr.cx("fr-mb-1w")} severity={"info"} title={t("no_permissions")} closable />
            ) : (
                <Table headers={headers} data={datas} />
            )}
            <Button className={fr.cx("fr-my-2v")}>{t("add_permission")}</Button>
        </DatastoreLayout>
    );
};

export default DatastoreManagePermissions;

/* ---------------------------- TRADUCTIONS ----------------------------- */

export const { i18n } = declareComponentKeys<
    | { K: "title"; P: { datastoreName?: string }; R: string }
    | "h_licence"
    | "h_expiration_date"
    | "h_granted_to"
    | "h_services"
    | "h_actions"
    | { K: "expires_on"; P: { endDate?: string }; R: string }
    | { K: "granted_to"; P: { beneficiary?: PermissionBeneficiaryDto }; R: string }
    | "no_permissions"
    | "add_permission"
>()({
    DatastoreManagePermissions,
});

const getExpiredDate = (lang: "fr" | "en", endDate?: string) => {
    if (endDate === undefined) {
        return lang === "fr" ? "Aucune" : "None";
    }

    const fmtDate = functions.date.format(endDate);
    if (compareAsc(new Date(endDate), new Date()) < 0) {
        return lang === "fr" ? `A expirée le ${fmtDate}` : `Expired on ${fmtDate}`;
    } else return lang === "fr" ? `Expire le ${fmtDate}` : `Expires on ${fmtDate}`;
};

const getGrantedTo = (lang: "fr" | "en", beneficiary?: PermissionBeneficiaryDto) => {
    if (beneficiary === undefined) return lang === "fr" ? "Personne" : "None";

    if ("name" in beneficiary) {
        return lang === "fr" ? `La communauté ${beneficiary.name}` : `Community ${beneficiary.name}`;
    } else
        return lang === "fr" ? `L'utilisateur ${beneficiary.first_name} ${beneficiary.last_name}` : `User ${beneficiary.first_name} ${beneficiary.last_name}`;
};

export const DatastoreManagePermissionsFrTranslations: Translations<"fr">["DatastoreManagePermissions"] = {
    title: ({ datastoreName }) => `Gérer les permissions de l'espace de travail${datastoreName ? " " + datastoreName : ""}`,
    h_licence: "Licence",
    h_expiration_date: "Date d'expiration",
    h_granted_to: "Accordée à",
    h_services: "Services",
    h_actions: "Actions",
    expires_on: ({ endDate }) => getExpiredDate("fr", endDate),
    granted_to: ({ beneficiary }) => getGrantedTo("fr", beneficiary),
    no_permissions: "Aucune permission",
    add_permission: "Ajouter une permission",
};

export const DatastoreManagePermissionsEnTranslations: Translations<"en">["DatastoreManagePermissions"] = {
    title: ({ datastoreName }) => `Manage workspace permissions${datastoreName ? " " + datastoreName : ""}`,
    h_licence: "Licence",
    h_expiration_date: "Expiration date",
    h_granted_to: "Granted to",
    h_services: "Services",
    h_actions: "Actions",
    expires_on: ({ endDate }) => getExpiredDate("en", endDate),
    granted_to: ({ beneficiary }) => getGrantedTo("en", beneficiary),
    no_permissions: "No permissions",
    add_permission: "Add permission",
};
