import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { AlertProps } from "@codegouvfr/react-dsfr/Alert";
import Table from "@codegouvfr/react-dsfr/Table";
import ToggleSwitch from "@codegouvfr/react-dsfr/ToggleSwitch";
import { FC, useEffect, useState } from "react";
import { symToStr } from "tsafe/symToStr";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import DatastoreLayout from "../../../components/Layout/DatastoreLayout";
import { useTranslation } from "../../../i18n";
import { formatDateFromISO } from "../../../utils";

import "./Alerts.scss";

interface IAlert {
    id: string;
    title: string;
    description: string;
    link: { url: string; label: string };
    severity: AlertProps["severity"];
    details: string;
    date: string;
    visibility: {
        homepage: boolean;
        contact: boolean;
        map: boolean;
        serviceLevel: boolean;
    };
}

const datastoreId = "5cb4fdb0-6f6c-4422-893d-e04564bfcc10";
const mock: IAlert[] = [
    {
        id: "1",
        title: "Titre d'alerte",
        description: "Description de l'alerte",
        link: { url: "https://example.com", label: "Lien vers la page" },
        severity: "info",
        details: "Détails supplémentaires",
        date: "2023-06-02T06:01:46+00:00",
        visibility: {
            homepage: true,
            contact: true,
            map: true,
            serviceLevel: true,
        },
    },
    {
        id: "2",
        title: "Titre d'alerte",
        description: "Description de l'alerte",
        link: { url: "https://example.com", label: "Lien vers la page" },
        severity: "warning",
        details: "Détails supplémentaires",
        date: "2023-06-03T06:01:46+00:00",
        visibility: {
            homepage: false,
            contact: false,
            map: true,
            serviceLevel: true,
        },
    },
    {
        id: "3",
        title: "Titre d'alerte",
        description: "Description de l'alerte",
        link: { url: "https://example.com", label: "Lien vers la page" },
        severity: "error",
        details: "Détails supplémentaires",
        date: "2023-06-03T06:01:46+00:00",
        visibility: {
            homepage: false,
            contact: false,
            map: true,
            serviceLevel: true,
        },
    },
    {
        id: "4",
        title: "Titre d'alerte",
        description: "Description de l'alerte",
        link: { url: "https://example.com", label: "Lien vers la page" },
        severity: "success",
        details: "Détails supplémentaires",
        date: "2023-06-03T06:01:46+00:00",
        visibility: {
            homepage: false,
            contact: false,
            map: true,
            serviceLevel: true,
        },
    },
];

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

function getIcon(severity: AlertProps["severity"]) {
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

const Alerts: FC = () => {
    const [alerts, setAlerts] = useState(mock);
    const { t } = useTranslation("ConfigAlerts");
    const title = t("title");

    const {
        control,
        setValue,
        getValues,
        formState: { errors },
        watch,
        handleSubmit,
    } = useForm({ mode: "onSubmit", defaultValues: { visibility: alerts.map((alert) => alert.visibility) }, resolver: yupResolver(schema) });

    function handleAdd() {
        console.log("add");
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

    function submit(values) {
        console.log("submit", values);
    }

    return (
        <DatastoreLayout datastoreId={datastoreId} documentTitle={title}>
            {/* <div className={fr.cx("fr-grid-row")}>
                <div className={fr.cx("fr-col")}>
                    <h1>{title}</h1>
                </div>
            </div> */}
            <form onSubmit={handleSubmit(submit)}>
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
                        formatDateFromISO(alert.date),
                        <Controller
                            key="switch-homepage"
                            control={control}
                            name={`visibility.${i}.homepage`}
                            render={({ field: { value } }) => (
                                <ToggleSwitch inputTitle={t("th.homepage")} label="" onChange={handleChange(i, "homepage")} checked={value} />
                            )}
                        />,
                        <Controller
                            key="switch-contact"
                            control={control}
                            name={`visibility.${i}.contact`}
                            render={({ field: { value } }) => (
                                <ToggleSwitch inputTitle={t("th.contact")} label="" onChange={handleChange(i, "contact")} checked={value} />
                            )}
                        />,
                        <Controller
                            key="switch-map"
                            control={control}
                            name={`visibility.${i}.map`}
                            render={({ field: { value } }) => (
                                <ToggleSwitch inputTitle={t("th.map")} label="" onChange={handleChange(i, "map")} checked={value} />
                            )}
                        />,
                        <Controller
                            key="switch-serviceLevel"
                            control={control}
                            name={`visibility.${i}.serviceLevel`}
                            render={({ field: { value } }) => (
                                <ToggleSwitch inputTitle={t("th.serviceLevel")} label="" onChange={handleChange(i, "serviceLevel")} checked={value} />
                            )}
                        />,
                    ])}
                    headers={[t("th.severity"), t("th.title"), t("th.date"), t("th.homepage"), t("th.contact"), t("th.map"), t("th.serviceLevel")]}
                />
                <Button iconId={"fr-icon-add-line"} type="submit">
                    {t("enregistrer")}
                </Button>
            </form>
        </DatastoreLayout>
    );
};
Alerts.displayName = symToStr({ Alerts });

export default Alerts;
