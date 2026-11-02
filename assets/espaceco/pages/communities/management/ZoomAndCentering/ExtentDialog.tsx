import { fr } from "@codegouvfr/react-dsfr";
import Input from "@codegouvfr/react-dsfr/Input";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { yupResolver } from "@hookform/resolvers/yup";
import { Extent } from "ol/extent";
import { FC, useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FieldValues, useForm } from "react-hook-form";
import * as yup from "yup";
import { SearchGridFilters } from "../../../../../@types/app_espaceco";
import { useTranslation } from "../../../../../i18n/i18n";
import { fieldErrorMessage } from "../../../../../utils";
import SearchGrids from "../SearchGrids";

type ExtentDialogProps = {
    onCancel: () => void;
    onApply: (extent: Extent) => void;
};

const ExtentDialogModal = createModal({
    id: "extent-modal",
    isOpenedByDefault: false,
});

type SearchOption = "autocomplete" | "manual";
type FieldName = "xmin" | "xmax" | "ymin" | "ymax";
type ManualExtent = Record<FieldName, number>;
type ExtentFormValues = Partial<ManualExtent> & { extent?: Extent };

const filters: SearchGridFilters = {
    fields: ["name", "title", "extent"],
    adm: true,
};

const transform = (value: unknown, origin: unknown) => (origin === "" ? undefined : value);

const ExtentDialog: FC<ExtentDialogProps> = ({ onCancel, onApply }) => {
    const { t: tCommon } = useTranslation("Common");
    const { t: tValid } = useTranslation("ManageCommunityValidations");
    const { t } = useTranslation("ManageCommunity");

    const [choice, setChoice] = useState<SearchOption>("manual");

    const schema: Record<SearchOption, yup.ObjectSchema<FieldValues>> = {
        manual: yup.object({
            xmin: yup
                .number()
                // .typeError(tValid("zoom.extent.nan", { field: "${path}" }))
                .min(-180, tValid("zoom.greater_than", { field: "${path}", v: -180 }))
                .max(180, tValid("zoom.less_than", { field: "${path}", v: 180 }))
                .required(tValid("zoom.extent.mandatory", { field: "${path}" }))
                .transform(transform)
                .test({
                    name: "xmin_check",
                    message: tValid("zoom.f1_less_than_f2", { field1: "xmin", field2: "xmax" }),
                    test: (value, context) => {
                        const xmax = (context.parent as ManualExtent).xmax;
                        if (value) {
                            return !isNaN(xmax) ? value < xmax : true;
                        }
                        return true;
                    },
                }),
            ymin: yup
                .number()
                // .typeError(tValid("zoom.extent.nan", { field: "${path}" }))
                .min(-90, tValid("zoom.greater_than", { field: "${path}", v: -90 }))
                .max(90, tValid("zoom.less_than", { field: "${path}", v: 90 }))
                .required(tValid("zoom.extent.mandatory", { field: "${path}" }))
                .transform(transform)
                .test({
                    name: "ymin_check",
                    message: tValid("zoom.f1_less_than_f2", { field1: "ymin", field2: "ymax" }),
                    test: (value, context) => {
                        const ymax = (context.parent as ManualExtent).ymax;
                        if (value) {
                            return !isNaN(ymax) ? value < ymax : true;
                        }
                        return true;
                    },
                }),
            xmax: yup
                .number()
                // .typeError(tValid("zoom.extent.nan", { field: "${path}" }))
                .min(-180, tValid("zoom.greater_than", { field: "${path}", v: -180 }))
                .max(180, tValid("zoom.less_than", { field: "${path}", v: 180 }))
                .required(tValid("zoom.extent.mandatory", { field: "${path}" }))
                .transform(transform)
                .test({
                    name: "xmax_check",
                    message: tValid("zoom.f1_more_than_f2", { field1: "xmax", field2: "xmin" }),
                    test: (value, context) => {
                        const xmin = (context.parent as ManualExtent).xmin;
                        if (value) {
                            return !isNaN(xmin) ? value > xmin : true;
                        }
                        return true;
                    },
                }),
            ymax: yup
                .number()
                // .typeError(tValid("zoom.extent.nan", { field: "${path}" }))
                .min(-90, tValid("zoom.greater_than", { field: "${path}", v: -90 }))
                .max(90, tValid("zoom.less_than", { field: "${path}", v: 90 }))
                .required(tValid("zoom.extent.mandatory", { field: "${path}" }))
                .transform(transform)
                .test({
                    name: "ymax_check",
                    message: tValid("zoom.f1_more_than_f2", { field1: "ymax", field2: "ymin" }),
                    test: (value, context) => {
                        const ymin = (context.parent as ManualExtent).ymin;
                        if (value) {
                            return !isNaN(ymin) ? value > ymin : true;
                        }
                        return true;
                    },
                }),
        }),
        autocomplete: yup.object({
            extent: yup.array().of(yup.number()).required(tValid("zoom.extent.required")),
        }),
    };

    const form = useForm<ExtentFormValues>({
        mode: "onSubmit",
        resolver: yupResolver(schema[choice]),
    });
    const {
        register,
        getValues: getFormValues,
        setValue: setFormValue,
        formState: { errors },
        clearErrors,
        handleSubmit,
        resetField,
    } = form;

    const onChoiceChanged = (v: SearchOption) => {
        setChoice(v);
    };

    const clear = useCallback(() => {
        ["xmin", "ymin", "xmax", "ymax"].forEach((f) => resetField(f as FieldName, undefined));
    }, [resetField]);

    useEffect(() => {
        if (choice === "autocomplete") {
            clear();
        } else {
            resetField("extent", undefined);
        }
    }, [choice, clear, resetField]);

    const onSubmit = () => {
        ExtentDialogModal.close();

        const values = getFormValues();

        let extent;
        if (choice === "manual") {
            extent = [values.xmin, values.ymin, values.xmax, values.ymax].map((c) => Number(c));
        } else {
            extent = values.extent as Extent;
        }
        onApply(extent);

        if (choice !== "manual") {
            setChoice("manual");
        } else {
            clear();
        }
    };

    return (
        <>
            {createPortal(
                <ExtentDialogModal.Component
                    title={t("zoom.extent")}
                    buttons={[
                        {
                            children: tCommon("cancel"),
                            doClosesModal: true,
                            onClick: () => {
                                setChoice("manual");
                                clear();
                                onCancel();
                            },
                            priority: "secondary",
                        },
                        {
                            children: tCommon("apply"),
                            doClosesModal: false,
                            onClick: handleSubmit(onSubmit),
                            priority: "primary",
                        },
                    ]}
                >
                    <>
                        <RadioButtons
                            options={[
                                {
                                    label: t("zoom.choice.autocomplete"),
                                    nativeInputProps: {
                                        checked: choice === "autocomplete",
                                        onChange: () => onChoiceChanged("autocomplete"),
                                    },
                                },
                                {
                                    label: t("zoom.choice.manual"),
                                    nativeInputProps: {
                                        checked: choice === "manual",
                                        onChange: () => onChoiceChanged("manual"),
                                    },
                                },
                            ]}
                        />
                        {choice === "autocomplete" ? (
                            <div>
                                <SearchGrids
                                    label={t("zoom.choice.autocomplete")}
                                    disableClearable={true}
                                    filters={filters}
                                    state={errors.extent ? "error" : "default"}
                                    stateRelatedMessage={fieldErrorMessage(errors.extent)}
                                    onChange={(grid) => {
                                        setFormValue("extent", grid ? grid.extent : undefined);
                                        clearErrors();
                                    }}
                                />
                            </div>
                        ) : (
                            <div>
                                <label className={fr.cx("fr-label")}>{t("zoom.extent_enter_manually")}</label>
                                <div className={fr.cx("fr-grid-row", "fr-mt-1w")}>
                                    <div className={fr.cx("fr-col-6", "fr-px-2w")}>
                                        <Input
                                            label={t("zoom.xmin")}
                                            state={errors.xmin ? "error" : "default"}
                                            stateRelatedMessage={fieldErrorMessage(errors.xmin)}
                                            nativeInputProps={{
                                                type: "number",
                                                ...register("xmin"),
                                            }}
                                        />
                                        <Input
                                            label={t("zoom.xmax")}
                                            state={errors.xmax ? "error" : "default"}
                                            stateRelatedMessage={fieldErrorMessage(errors.xmax)}
                                            nativeInputProps={{
                                                type: "number",
                                                ...register("xmax"),
                                            }}
                                        />
                                    </div>
                                    <div className={fr.cx("fr-col-6", "fr-px-2w")}>
                                        <Input
                                            label={t("zoom.ymin")}
                                            state={errors.ymin ? "error" : "default"}
                                            stateRelatedMessage={fieldErrorMessage(errors.ymin)}
                                            nativeInputProps={{
                                                type: "number",
                                                ...register("ymin"),
                                            }}
                                        />
                                        <Input
                                            label={t("zoom.ymax")}
                                            state={errors.ymax ? "error" : "default"}
                                            stateRelatedMessage={fieldErrorMessage(errors.ymax)}
                                            nativeInputProps={{
                                                type: "number",
                                                ...register("ymax"),
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                </ExtentDialogModal.Component>,
                document.body
            )}
        </>
    );
};

export { ExtentDialog, ExtentDialogModal };
