import { fr } from "@codegouvfr/react-dsfr";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import Table from "@codegouvfr/react-dsfr/Table";
import ToggleSwitch from "@codegouvfr/react-dsfr/ToggleSwitch";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { FC, useMemo, useState } from "react";
import { symToStr } from "tsafe/symToStr";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation, useQuery } from "@tanstack/react-query";

import { IAlert } from "../../../@types/alert";
import DatastoreLayout from "../../../components/Layout/DatastoreLayout";
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

function getNewAlert() {
    return {
        id: crypto.randomUUID(),
        title: "",
        description: "",
        link: { url: "", label: "" },
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

const { annexePath, datastoreId, fileName } = api.alerts;

interface INotification {
    severity: "success" | "warning" | "error";
    title: string;
}

const Alerts: FC = () => {
    const alerts = useAlertStore(({ alerts }) => alerts);
    const setAlerts = useAlertStore(({ setAlerts }) => setAlerts);
    const [alert, setAlert] = useState<IAlert>(getNewAlert());
    const { t } = useTranslation("alerts");
    const title = t("title");
    const [notification, setNotification] = useState<INotification | null>(null);

    // Load annex list and find annex matching the given path
    const { data } = useQuery<Annexe[], CartesApiException>({
        queryKey: RQKeys.datastore_annexe_list(api.alerts.datastoreId),
        queryFn: ({ signal }) => api.annexe.getList(datastoreId, { signal }),
    });
    const annexe = useMemo(() => data?.find((annexe) => annexe.paths.includes(annexePath)), [data]);

    // Update alerts mutation
    const { mutate, isPending } = useMutation<Annexe | undefined, CartesApiException, IAlert[]>({
        mutationFn: async (alerts) => {
            if (annexe?._id) {
                const data = alerts.map((alert) => ({ ...alert, date: alert.date.toISOString() }));
                const blob = new Blob([JSON.stringify(data)], {
                    type: "application/json",
                });
                const file = new File([blob], fileName);
                const response = await api.annexe.replaceFile(datastoreId, annexe?._id, file);
                setAlerts(alerts);
                return response;
            }
            return Promise.resolve(undefined);
        },
        onError: (error) => {
            setNotification({ severity: "error", title: t("alerts_update_error") });
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
            alerts.push({ ...alert, id: crypto.randomUUID() });
        }
        setValue("alerts", alerts);
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
            }
        };
    }

    const closable = notification?.severity !== "warning";
    return (
        <DatastoreLayout datastoreId={datastoreId} documentTitle={title}>
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
                    render={({ field: { value: alerts } }) => {
                        if (!alerts) {
                            return <></>;
                        }
                        return (
                            <Table
                                className="alerts__table"
                                caption={t("table_caption")}
                                noCaption
                                data={alerts.map((alert, i) => [
                                    getIcon(alert.severity),
                                    alert.title,
                                    formatDateTime(alert.date),
                                    <ToggleSwitch
                                        key="switch-homepage"
                                        inputTitle={t("alert.homepage")}
                                        label=""
                                        onChange={handleChange(i, "homepage")}
                                        checked={alert.visibility.homepage}
                                    />,
                                    <ToggleSwitch
                                        key="switch-contact"
                                        inputTitle={t("alert.contact")}
                                        label=""
                                        onChange={handleChange(i, "contact")}
                                        checked={alert.visibility.contact}
                                    />,
                                    <ToggleSwitch
                                        key="switch-map"
                                        inputTitle={t("alert.map")}
                                        label=""
                                        onChange={handleChange(i, "map")}
                                        checked={alert.visibility.map}
                                    />,
                                    <ToggleSwitch
                                        key="switch-serviceLevel"
                                        inputTitle={t("alert.serviceLevel")}
                                        label=""
                                        onChange={handleChange(i, "serviceLevel")}
                                        checked={alert.visibility.serviceLevel}
                                    />,
                                    <div key="actions">
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
                                    </div>,
                                ])}
                                headers={[
                                    t("alert.severity"),
                                    t("alert.title"),
                                    t("alert.date"),
                                    t("alert.homepage"),
                                    t("alert.contact"),
                                    t("alert.map"),
                                    t("alert.serviceLevel"),
                                    t("actions"),
                                ]}
                            />
                        );
                    }}
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
                <Button disabled={!annexe || isPending} iconId={"fr-icon-add-line"} type="submit">
                    {t("save")}
                </Button>
            </form>
            <CreateAlert key={alert.id} alert={alert} isEdit={Boolean(alert.title)} ModalComponent={modal.Component} onSubmit={addOrUpdateAlert} />
            {isPending && (
                <Wait>
                    <LoadingIcon largeIcon={true} />
                </Wait>
            )}
        </DatastoreLayout>
    );
};
Alerts.displayName = symToStr({ Alerts });

export default Alerts;

/**
 * TODO
 * - problem with browser cache (use `cache: "no-store"` temporary)
 * - no alerts in table
 * - dashboard integration
 * - make const id configurable?
 * - menu integration?
 * - detail as rich text (markdown)
 */
