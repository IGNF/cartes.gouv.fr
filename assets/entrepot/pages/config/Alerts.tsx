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
import { useTranslation } from "../../../i18n";
import { formatDateFromISO } from "../../../utils";
import { Annexe } from "../../../@types/app";
import { CartesApiException } from "../../../modules/jsonFetch";
import RQKeys from "../../../modules/entrepot/RQKeys";
import api from "../../api";

import "./Alerts.scss";

const datastoreId = "5cb4fdb0-6f6c-4422-893d-e04564bfcc10";
const annexePath = "/public/edito.json";
const fileBase = "https://data.geopf.fr/annexes/cartes.gouv.fr-config";

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

const schema = yup.object({
    alerts: yup.array().of(alertSchema),
});

function getIcon(severity?: IAlert["severity"]) {
    switch (severity) {
        // case "success":
        //     return <span className={[fr.cx("fr-icon-success-fill"), "alerts__icon--success"].join(" ")} title={severity} />;
        // case "warning":
        //     return <span className={[fr.cx("fr-icon-warning-fill"), "alerts__icon--warning"].join(" ")} title={severity} />;
        // case "error":
        //     return <span className={[fr.cx("fr-icon-error-warning-fill"), "alerts__icon--error"].join(" ")} title={severity} />;
        default:
            return <span className={[fr.cx("fr-icon-info-fill"), "alerts__icon--info"].join(" ")} title={severity} />;
    }
}

const modal = createModal({
    id: "alerts",
    isOpenedByDefault: false,
});

const Alerts: FC = () => {
    const [alert, setAlert] = useState<IAlert>(getNewAlert());
    const { t } = useTranslation("ConfigAlerts");
    const title = t("title");

    // Load annex list and find annex matching the given path
    const annexeListQuery = useQuery<Annexe[], CartesApiException>({
        queryKey: RQKeys.datastore_annexe_list(datastoreId),
        queryFn: ({ signal }) => api.annexe.getList(datastoreId, { signal }),
    });
    const annexe = useMemo(() => annexeListQuery?.data?.find((annexe) => annexe.paths.includes(annexePath)), [annexeListQuery.data]);

    // Update mutation
    const { mutate, isError, isPending, isSuccess } = useMutation<Annexe | undefined, CartesApiException, object>({
        mutationFn: (data) => {
            if (annexe?._id) {
                const blob = new Blob([JSON.stringify(data, null, 2)], {
                    type: "application/json",
                });
                return api.annexe.update(datastoreId, annexe?._id, blob);
            }
            return Promise.resolve(undefined);
        },
    });

    // Declare form
    const { control, getValues, handleSubmit, setValue } = useForm<{ alerts?: IAlert[] }>({
        mode: "onSubmit",
        defaultValues: { alerts: [] },
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
            }
        };
    }

    function submitAlerts({ alerts }: { alerts?: IAlert[] }) {
        if (alerts) {
            mutate(alerts.map((alert) => ({ ...alert, date: alert.date.toISOString() })));
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

    return (
        <DatastoreLayout datastoreId={datastoreId} documentTitle={title}>
            {/* <div className={fr.cx("fr-grid-row")}>
                <div className={fr.cx("fr-col")}>
                    <h1>{title}</h1>
                </div>
            </div> */}
            {isSuccess && <Alert description={t("alerts_updated")} title={t("alerts_updated")} severity="success" />}
            <form onSubmit={handleSubmit(submitAlerts)}>
                <div className="alerts__caption">
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
                                    formatDateFromISO(alert.date.toISOString()),
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
                <Button iconId={"fr-icon-add-line"} type="submit">
                    {t("save")}
                </Button>
            </form>
            <CreateAlert key={alert.id} alert={alert} isEdit={Boolean(alert.title)} ModalComponent={modal.Component} onSubmit={addOrUpdateAlert} />
        </DatastoreLayout>
    );
};
Alerts.displayName = symToStr({ Alerts });

export default Alerts;

/**
 * TODO
 * - update
 * - no alerts in table
 * - fetch alerts (json)
 * - submit alerts (json)
 * - make const id configurable
 * - menu integration?
 * - dashboard integration
 * - display alert:
 *   - homepage
 *   - contact
 *   - map?
 *   - service level
 */
