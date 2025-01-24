import { yupResolver } from "@hookform/resolvers/yup";
import { FC, useEffect } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { symToStr } from "tsafe/symToStr";
import * as yup from "yup";
import { fr } from "@codegouvfr/react-dsfr";
import Input from "@codegouvfr/react-dsfr/Input";
import { Select } from "@codegouvfr/react-dsfr/SelectNext";
import ToggleSwitch from "@codegouvfr/react-dsfr/ToggleSwitch";
import isURL from "validator/lib/isURL";

import { useTranslation } from "../../../i18n";
import { IAlert } from "../../../@types/alert";

import PreviewAlert from "./PreviewAlert";
import { ModalProps } from "@codegouvfr/react-dsfr/Modal";
import { formatDateTimeLocal } from "../../../utils";

const date = new Date();
export const alertSchema = yup.object({
    id: yup.string().required(),
    title: yup.string().required("Titre requis"),
    description: yup.string(),
    link: yup.object({
        label: yup.string(),
        url: yup.string().test("check-url", "La chaîne doit être une url valide", (value) => value === "" || isURL(value)),
    }),
    severity: yup.string().oneOf(["info", "warning", "alert"]).required("Sévérité requise"),
    details: yup.string().required("Détails requis"),
    date: yup.date().required("Date requise"),
    visibility: yup.object({
        homepage: yup.boolean().required(),
        contact: yup.boolean().required(),
        map: yup.boolean().required(),
        serviceLevel: yup.boolean().required(),
    }),
});

const severityOptions = [
    { value: "info", label: "info" },
    { value: "warning", label: "warning" },
    { value: "alert", label: "alert" },
];

interface CreateAlertProps {
    alert: IAlert;
    isEdit: boolean;
    ModalComponent: (props: ModalProps) => JSX.Element;
    onSubmit: (alert: IAlert) => void;
}

const CreateAlert: FC<CreateAlertProps> = (props) => {
    const { alert, isEdit, ModalComponent, onSubmit } = props;
    const { t } = useTranslation("ConfigAlerts");

    const methods = useForm({
        mode: "onSubmit",
        defaultValues: alert,
        resolver: yupResolver(alertSchema),
    });
    const {
        control,
        formState: { errors },
        handleSubmit,
        register,
        setValue,
    } = methods;

    useEffect(() => {
        setValue("visibility", alert.visibility);
    }, [alert.visibility, setValue]);

    const addAlert = handleSubmit((values) => {
        onSubmit(values);
    });

    return (
        <ModalComponent
            title={isEdit ? t("edit_alert") : t("create_alert")}
            size="large"
            buttons={[
                {
                    doClosesModal: true,
                    children: t("modal.cancel"),
                },
                {
                    doClosesModal: false,
                    children: isEdit ? t("modal.edit") : t("modal.add"),
                    onClick: addAlert,
                },
            ]}
        >
            <FormProvider {...methods}>
                <form onSubmit={addAlert}>
                    <PreviewAlert />
                    <Input
                        label={t("alert.title")}
                        nativeInputProps={{
                            ...register("title"),
                        }}
                        state={errors.title ? "error" : "default"}
                        stateRelatedMessage={errors?.title?.message?.toString()}
                    />
                    <Input
                        label={t("alert.description")}
                        nativeInputProps={{
                            ...register("description"),
                        }}
                        state={errors.description ? "error" : "default"}
                        stateRelatedMessage={errors?.description?.message?.toString()}
                    />
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                        <div className={fr.cx("fr-col-12", "fr-col-sm-6")}>
                            <Input
                                label={t("alert.linkLabel")}
                                nativeInputProps={{
                                    ...register("link.label"),
                                }}
                                state={errors.link?.label ? "error" : "default"}
                                stateRelatedMessage={errors?.link?.label?.message?.toString()}
                            />
                        </div>
                        <div className={fr.cx("fr-col-12", "fr-col-sm-6")}>
                            <Input
                                label={t("alert.linkUrl")}
                                nativeInputProps={{
                                    ...register("link.url"),
                                }}
                                state={errors.link?.url ? "error" : "default"}
                                stateRelatedMessage={errors?.link?.url?.message?.toString()}
                            />
                        </div>
                        <div className={fr.cx("fr-col-12", "fr-col-sm-6")}>
                            <Select
                                label={t("alert.severity")}
                                nativeSelectProps={{
                                    ...register("severity"),
                                }}
                                options={severityOptions}
                                placeholder="Select an option"
                                state={errors.severity ? "error" : "default"}
                                stateRelatedMessage={errors?.severity?.message?.toString()}
                            />
                        </div>
                        <div className={fr.cx("fr-col-12", "fr-col-sm-6")}>
                            <Controller
                                control={control}
                                name="date"
                                render={({ field: { onChange, value } }) => (
                                    <Input
                                        label={t("alert.date")}
                                        nativeInputProps={{
                                            value: formatDateTimeLocal(value),
                                            min: formatDateTimeLocal(date),
                                            type: "datetime-local",
                                            onChange,
                                        }}
                                        state={errors.date ? "error" : "default"}
                                        stateRelatedMessage={errors.date?.message?.toString()}
                                    />
                                )}
                            />
                        </div>
                    </div>
                    <Input
                        className="fr-mt-3w"
                        label={t("alert.details")}
                        nativeInputProps={{
                            ...register("details"),
                        }}
                        state={errors.details ? "error" : "default"}
                        stateRelatedMessage={errors?.details?.message?.toString()}
                    />
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                        <div className={fr.cx("fr-col-12", "fr-col-sm-6")}>
                            <div className={fr.cx("fr-input-group")}>
                                <Controller
                                    control={control}
                                    name="visibility.homepage"
                                    render={({ field: { onChange, value } }) => (
                                        <ToggleSwitch inputTitle={t("alert.homepage")} label={t("alert.homepage")} onChange={onChange} checked={value} />
                                    )}
                                />
                            </div>
                        </div>
                        <div className={fr.cx("fr-col-12", "fr-col-sm-6")}>
                            <div className={fr.cx("fr-input-group")}>
                                <Controller
                                    control={control}
                                    name="visibility.contact"
                                    render={({ field: { onChange, value } }) => (
                                        <ToggleSwitch inputTitle={t("alert.contact")} label={t("alert.contact")} onChange={onChange} checked={value} />
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                        <div className={fr.cx("fr-col-12", "fr-col-sm-6")}>
                            <div className={fr.cx("fr-input-group")}>
                                <Controller
                                    control={control}
                                    name="visibility.map"
                                    render={({ field: { onChange, value } }) => (
                                        <ToggleSwitch inputTitle={t("alert.map")} label={t("alert.map")} onChange={onChange} checked={value} />
                                    )}
                                />
                            </div>
                        </div>
                        <div className={fr.cx("fr-col-12", "fr-col-sm-6")}>
                            <div className={fr.cx("fr-input-group")}>
                                <Controller
                                    control={control}
                                    name="visibility.serviceLevel"
                                    render={({ field: { onChange, value } }) => (
                                        <ToggleSwitch
                                            inputTitle={t("alert.serviceLevel")}
                                            label={t("alert.serviceLevel")}
                                            onChange={onChange}
                                            checked={value}
                                        />
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                    <input type="submit" hidden />
                </form>
            </FormProvider>
        </ModalComponent>
    );
};
CreateAlert.displayName = symToStr({ CreateAlert });

export default CreateAlert;
