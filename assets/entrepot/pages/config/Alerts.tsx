import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import Table from "@codegouvfr/react-dsfr/Table";
import ToggleSwitch from "@codegouvfr/react-dsfr/ToggleSwitch";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { FC, useEffect, useState } from "react";
import { symToStr } from "tsafe/symToStr";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { IAlert, INewAlert } from "../../../@types/alert";
import DatastoreLayout from "../../../components/Layout/DatastoreLayout";
import CreateAlert from "../../../components/Modal/CreateAlert/CreateAlert";
import { useTranslation } from "../../../i18n";
import { formatDateFromISO } from "../../../utils";

import "./Alerts.scss";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";

const datastoreId = "5cb4fdb0-6f6c-4422-893d-e04564bfcc10";

const schema = yup.object({
    visibility: yup.array().of(
        yup.object({
            homepage: yup.boolean(),
            contact: yup.boolean(),
            map: yup.boolean(),
            serviceLevel: yup.boolean(),
        })
    ),
});

function getIcon(severity: IAlert["severity"]) {
    switch (severity) {
        case "success":
            return <span className={[fr.cx("fr-icon-success-fill"), "alerts__icon--success"].join(" ")} title={severity} />;
        case "warning":
            return <span className={[fr.cx("fr-icon-warning-fill"), "alerts__icon--warning"].join(" ")} title={severity} />;
        case "error":
            return <span className={[fr.cx("fr-icon-error-warning-fill"), "alerts__icon--error"].join(" ")} title={severity} />;
        default:
            return <span className={[fr.cx("fr-icon-info-fill"), "alerts__icon--info"].join(" ")} title={severity} />;
    }
}

const modal = createModal({
    id: "alerts",
    isOpenedByDefault: false,
});

const Alerts: FC = () => {
    const [alerts, setAlerts] = useState<IAlert[]>([]);
    const { t } = useTranslation("ConfigAlerts");
    const title = t("title");

    const { control, getValues, handleSubmit, setValue } = useForm({
        mode: "onSubmit",
        defaultValues: { visibility: alerts.map((alert) => alert.visibility) },
        resolver: yupResolver(schema),
    });

    function handleAdd() {
        modal.open();
    }

    function handleChange(index: number, visibility: "homepage" | "contact" | "map" | "serviceLevel") {
        return (checked) => {
            if (checked && (visibility === "homepage" || visibility === "contact")) {
                const values = getValues("visibility");
                if (values) {
                    alerts.forEach((_, i) => {
                        if (i !== index) {
                            values[i][visibility] = false;
                        }
                    });
                    values[index][visibility] = checked;
                    setValue("visibility", values);
                }
            } else {
                setValue(`visibility.${index}.${visibility}`, checked);
            }
        };
    }

    function submitAlerts(values) {
        console.log("submit", values);
    }

    function addAlert(alert: INewAlert) {
        setAlerts([...alerts, { ...alert, id: crypto.randomUUID() }]);
        modal.close();
    }

    useEffect(() => {
        // todo: fetch alerts from API
    }, []);

    return (
        <DatastoreLayout datastoreId={datastoreId} documentTitle={title}>
            {/* <div className={fr.cx("fr-grid-row")}>
                <div className={fr.cx("fr-col")}>
                    <h1>{title}</h1>
                </div>
            </div> */}
            <form onSubmit={handleSubmit(submitAlerts)}>
                <div className="alerts__caption">
                    <h1>{title}</h1>
                    <Button iconId={"fr-icon-add-line"} onClick={handleAdd} type="button">
                        {t("create_alert")}
                    </Button>
                </div>
                <Table
                    className="alerts__table"
                    fixed
                    caption={t("table_caption")}
                    noCaption
                    data={alerts.map((alert, i) => [
                        getIcon(alert.severity),
                        alert.title,
                        formatDateFromISO(alert.date.toISOString()),
                        <Controller
                            key="switch-homepage"
                            control={control}
                            name={`visibility.${i}.homepage`}
                            render={({ field: { value } }) => (
                                <ToggleSwitch inputTitle={t("alert.homepage")} label="" onChange={handleChange(i, "homepage")} checked={value} />
                            )}
                        />,
                        <Controller
                            key="switch-contact"
                            control={control}
                            name={`visibility.${i}.contact`}
                            render={({ field: { value } }) => (
                                <ToggleSwitch inputTitle={t("alert.contact")} label="" onChange={handleChange(i, "contact")} checked={value} />
                            )}
                        />,
                        <Controller
                            key="switch-map"
                            control={control}
                            name={`visibility.${i}.map`}
                            render={({ field: { value } }) => (
                                <ToggleSwitch inputTitle={t("alert.map")} label="" onChange={handleChange(i, "map")} checked={value} />
                            )}
                        />,
                        <Controller
                            key="switch-serviceLevel"
                            control={control}
                            name={`visibility.${i}.serviceLevel`}
                            render={({ field: { value } }) => (
                                <ToggleSwitch inputTitle={t("alert.serviceLevel")} label="" onChange={handleChange(i, "serviceLevel")} checked={value} />
                            )}
                        />,
                        <div key="actions">
                            <Button iconId="fr-icon-pencil-line" priority="tertiary no outline" title={t("update")} className={fr.cx("fr-mr-2v")} />
                            <Button iconId="fr-icon-delete-line" priority="tertiary no outline" title={t("delete")} />
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
                <Button iconId={"fr-icon-add-line"} type="submit">
                    {t("save")}
                </Button>
            </form>
            <CreateAlert ModalComponent={modal.Component} onSubmit={addAlert} />
        </DatastoreLayout>
    );
};
Alerts.displayName = symToStr({ Alerts });

export default Alerts;
