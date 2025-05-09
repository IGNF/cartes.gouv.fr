import { fr } from "@codegouvfr/react-dsfr";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import ToggleSwitch from "@codegouvfr/react-dsfr/ToggleSwitch";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { FC, useMemo, useState } from "react";
import { symToStr } from "tsafe/symToStr";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { IAlert } from "../../../@types/alert";
import CreateAlert, { alertSchema } from "../../../components/Modal/CreateAlert/CreateAlert";
import Wait from "../../../components/Utils/Wait";
import LoadingIcon from "../../../components/Utils/LoadingIcon";
import { useTranslation } from "../../../i18n";
import { formatDateTime } from "../../../utils";
import { Annexe } from "../../../@types/app";
import { CartesApiException } from "../../../modules/jsonFetch";
import RQKeys from "../../../modules/entrepot/RQKeys";
import { useAlertStore } from "../../../stores/AlertStore";
import api from "../../api";

import "./Alerts.scss";
import Main from "@/components/Layout/Main";
import { useDatastore } from "@/contexts/datastore";

function getNewAlert() {
    return {
        id: crypto.randomUUID(),
        title: "",
        description: "",
        link: { url: "/niveau-de-service", label: "En savoir plus" },
        severity: "info" as const,
        details: "",
        date: new Date(),
        visibility: {
            homepage: false,
            contact: false,
            map: false,
            serviceLevel: false,
        },
    };
}

function getIcon(severity?: IAlert["severity"]) {
    switch (severity) {
        case "warning":
            return <span className={[fr.cx("fr-icon-warning-fill"), "alerts__icon--warning"].join(" ")} title={severity} />;
        case "alert":
            return <span className={[fr.cx("fr-icon-error-warning-fill"), "alerts__icon--error"].join(" ")} title={severity} />;
        default:
            return <span className={[fr.cx("fr-icon-info-fill"), "alerts__icon--info"].join(" ")} title={severity} />;
    }
}

const schema = yup.object({
    alerts: yup.array().of(alertSchema),
});

const modal = createModal({
    id: "alerts",
    isOpenedByDefault: false,
});

const { annexePath, fileName } = api.alerts;

interface INotification {
    severity: "success" | "warning" | "error";
    title: string;
}

const Alerts: FC = () => {
    const alerts = useAlertStore(({ alerts }) => alerts);
    const [alert, setAlert] = useState<IAlert>(getNewAlert());
    const { t } = useTranslation("alerts");
    const title = t("title");
    const [notification, setNotification] = useState<INotification | null>(null);
    const queryClient = useQueryClient();
    const { datastore } = useDatastore();

    // Load annex list and find annex matching the given path
    const { data } = useQuery<Annexe[], CartesApiException>({
        queryKey: RQKeys.datastore_annexe_list(datastore?._id),
        queryFn: ({ signal }) => api.annexe.getList(datastore?._id, { signal }),
    });
    const annexe = useMemo(() => data?.find((annexe) => annexe.paths.includes(annexePath)), [data]);

    // Update alerts mutation
    const { mutate, isPending } = useMutation<Annexe | undefined, CartesApiException, IAlert[]>({
        mutationFn: (alerts) => {
            const data = alerts.map((alert) => ({ ...alert, date: alert.date.toISOString() }));
            const blob = new Blob([JSON.stringify(data)], {
                type: "application/json",
            });
            const file = new File([blob], fileName);
            queryClient.setQueryData(RQKeys.alerts(), () => data);
            if (annexe?._id) {
                return api.annexe.replaceFile(datastore?._id, annexe?._id, file);
            }
            return api.annexe.add(datastore?._id, annexePath, file);
        },
        onError: (error) => {
            setNotification({ severity: "error", title: t("alerts_update_error") });
            queryClient.refetchQueries({ queryKey: RQKeys.alerts() });
            console.error(error);
        },
        onSuccess: () => {
            setNotification({ severity: "success", title: t("alerts_updated") });
        },
    });

    // Declare form
    const { control, getValues, handleSubmit, setValue } = useForm<{ alerts?: IAlert[] }>({
        mode: "onSubmit",
        values: { alerts },
        resolver: yupResolver(schema),
    });

    function handleChange(index: number, visibility: "homepage" | "contact" | "map" | "serviceLevel") {
        return (checked) => {
            const alerts = getValues("alerts");
            if (alerts) {
                if (checked && (visibility === "homepage" || visibility === "contact")) {
                    alerts.forEach((value) => (value.visibility[visibility] = false));
                }
                alerts[index].visibility[visibility] = checked;
                setValue("alerts", alerts);
                setNotification({ severity: "warning", title: t("alerts_unsaved") });
            }
        };
    }

    function submitAlerts({ alerts }: { alerts?: IAlert[] }) {
        if (alerts) {
            mutate(alerts);
        }
    }

    function openAddAlert() {
        setAlert(getNewAlert());
        setTimeout(() => modal.open(), 0);
    }

    function openUpdateAlert(alert: IAlert) {
        return () => {
            setAlert(alert);
            setTimeout(() => modal.open(), 0);
        };
    }

    function addOrUpdateAlert(alert: IAlert) {
        const alerts = getValues("alerts") ?? [];
        if (alert.visibility.homepage) {
            alerts.forEach((value) => (value.visibility.homepage = false));
        }
        if (alert.visibility.contact) {
            alerts.forEach((value) => (value.visibility.contact = false));
        }
        const index = alerts.findIndex((value) => value.id === alert.id);
        if (index !== -1) {
            alerts[index] = alert;
        } else {
            alerts.unshift({ ...alert, id: crypto.randomUUID() });
        }
        setValue(
            "alerts",
            alerts.sort((a, b) => b.date.getTime() - a.date.getTime())
        );
        setNotification({ severity: "warning", title: t("alerts_unsaved") });
        modal.close();
    }

    function deleteAlert(alert: IAlert) {
        return () => {
            const alerts = getValues("alerts") ?? [];
            const index = alerts.findIndex((value) => value.id === alert.id);
            if (index !== -1) {
                alerts.splice(index, 1);
                setValue("alerts", alerts);
                setNotification({ severity: "warning", title: t("alerts_unsaved") });
            }
        };
    }

    const closable = notification?.severity !== "warning";
    return (
        <Main title={title}>
            <form onSubmit={handleSubmit(submitAlerts)}>
                <div className={[fr.cx("fr-mb-5w"), "alerts__caption"].join(" ")}>
                    <h1>{title}</h1>
                    <Button iconId={"fr-icon-add-line"} onClick={openAddAlert} type="button">
                        {t("create_alert")}
                    </Button>
                </div>
                <Controller
                    control={control}
                    name="alerts"
                    render={({ field: { value: alerts } }) => (
                        <div className={fr.cx("fr-table", "fr-table--no-caption")}>
                            <div className={fr.cx("fr-table__wrapper")}>
                                <div className={fr.cx("fr-table__container")}>
                                    <div className={fr.cx("fr-table__content")}>
                                        <table className="alerts__table">
                                            <caption>{t("table_caption")}</caption>
                                            <thead>
                                                <tr>
                                                    <th />
                                                    <th />
                                                    <th />
                                                    <th colSpan={4}>{t("alert.visible")}</th>
                                                    <th />
                                                </tr>
                                                <tr>
                                                    <th>{t("alert.severity")}</th>
                                                    <th>{t("alert.title")}</th>
                                                    <th>{t("alert.date")}</th>
                                                    <th>{t("alert.homepage")}</th>
                                                    <th>{t("alert.contact")}</th>
                                                    <th>{t("alert.map")}</th>
                                                    <th>{t("alert.serviceLevel")}</th>
                                                    <th>{t("actions")}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(!alerts || alerts.length === 0) && (
                                                    <tr>
                                                        <td colSpan={8}>{t("no_alerts")}</td>
                                                    </tr>
                                                )}
                                                {alerts?.map((alert, i) => (
                                                    <tr key={i} data-row-key={i + 1}>
                                                        <td>{getIcon(alert.severity)}</td>
                                                        <td className="alerts__cell-title" title={alert.title}>
                                                            {alert.title}
                                                        </td>
                                                        <td>{formatDateTime(alert.date)}</td>
                                                        <td>
                                                            <ToggleSwitch
                                                                inputTitle={t("alert.homepage")}
                                                                label=""
                                                                onChange={handleChange(i, "homepage")}
                                                                checked={alert.visibility.homepage}
                                                            />
                                                        </td>
                                                        <td>
                                                            <ToggleSwitch
                                                                inputTitle={t("alert.contact")}
                                                                label=""
                                                                onChange={handleChange(i, "contact")}
                                                                checked={alert.visibility.contact}
                                                            />
                                                        </td>
                                                        <td>
                                                            <ToggleSwitch
                                                                inputTitle={t("alert.map")}
                                                                label=""
                                                                onChange={handleChange(i, "map")}
                                                                checked={alert.visibility.map}
                                                            />
                                                        </td>
                                                        <td>
                                                            <ToggleSwitch
                                                                inputTitle={t("alert.serviceLevel")}
                                                                label=""
                                                                onChange={handleChange(i, "serviceLevel")}
                                                                checked={alert.visibility.serviceLevel}
                                                            />
                                                        </td>
                                                        <td>
                                                            <div>
                                                                <Button
                                                                    iconId="fr-icon-pencil-line"
                                                                    priority="tertiary no outline"
                                                                    title={t("update")}
                                                                    type="button"
                                                                    className={fr.cx("fr-mr-2v")}
                                                                    onClick={openUpdateAlert(alert)}
                                                                />
                                                                <Button
                                                                    iconId="fr-icon-delete-line"
                                                                    priority="tertiary no outline"
                                                                    title={t("delete")}
                                                                    type="button"
                                                                    onClick={deleteAlert(alert)}
                                                                />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                />
                {notification && (
                    <Alert
                        className={fr.cx("fr-mb-5w")}
                        title={notification.title}
                        severity={notification.severity}
                        small={false}
                        {...(closable ? { onClose: () => setNotification(null), closable: true } : { closable: false })}
                    />
                )}
                <Button disabled={isPending} iconId={"fr-icon-add-line"} type="submit">
                    {t("save")}
                </Button>
            </form>
            <CreateAlert key={alert.id} alert={alert} isEdit={Boolean(alert.title)} ModalComponent={modal.Component} onSubmit={addOrUpdateAlert} />
            {isPending && (
                <Wait>
                    <LoadingIcon largeIcon={true} />
                </Wait>
            )}
        </Main>
    );
};
Alerts.displayName = symToStr({ Alerts });

export default Alerts;
