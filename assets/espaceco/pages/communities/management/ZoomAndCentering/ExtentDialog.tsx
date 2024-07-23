import { fr } from "@codegouvfr/react-dsfr";
import Input from "@codegouvfr/react-dsfr/Input";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { yupResolver } from "@hookform/resolvers/yup";
// import { Extent } from "ol/extent";
import { FC, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import * as yup from "yup";
// import { SearchGridFilters } from "../../../../../@types/app_espaceco";
import Skeleton from "../../../../../components/Utils/Skeleton";
import { useTranslation } from "../../../../../i18n/i18n";
import { Extent } from "ol/extent";
// import SearchGrids from "./SearchGrids";

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

/* const filters: SearchGridFilters = {
    searchBy: ["name", "title"],
    fields: ["name", "title", "extent"],
    adm: true,
}; */

const transform = (value, origin) => (origin === "" ? undefined : value);

const ExtentDialog: FC<ExtentDialogProps> = ({ onCancel, onApply }) => {
    const { t: tCommon } = useTranslation("Common");
    const { t: tValid } = useTranslation("ManageCommunityValidations");
    const { t } = useTranslation("ManageCommunity");

    const [choice, setChoice] = useState<SearchOption>("manual");

    const schema = yup.object({
        xmin: yup
            .number()
            .typeError(tValid("zoom.extent.nan", { field: "${path}" }))
            .min(-180, tValid("zoom.greater_than", { field: "${path}", v: -180 }))
            .max(180, tValid("zoom.less_than", { field: "${path}", v: 180 }))
            .required(tValid("zoom.extent.mandatory", { field: "${path}" }))
            .transform(transform)
            .test({
                name: "xmin_check",
                message: tValid("zoom.f1_less_than_f2", { field1: "xmin", field2: "xmax" }),
                test: (value, context) => {
                    const xmax = context.parent.xmax;
                    return xmax !== undefined ? value < xmax : true;
                },
            }),
        ymin: yup
            .number()
            .typeError(tValid("zoom.extent.nan", { field: "${path}" }))
            .min(-90, tValid("zoom.greater_than", { field: "${path}", v: -90 }))
            .max(90, tValid("zoom.less_than", { field: "${path}", v: 90 }))
            .required(tValid("zoom.extent.mandatory", { field: "${path}" }))
            .transform(transform)
            .test({
                name: "ymin_check",
                message: tValid("zoom.f1_less_than_f2", { field1: "ymin", field2: "ymax" }),
                test: (value, context) => {
                    const ymax = context.parent.ymax;
                    return ymax !== undefined ? value < ymax : true;
                },
            }),
        xmax: yup
            .number()
            .typeError(tValid("zoom.extent.nan", { field: "${path}" }))
            .min(-180, tValid("zoom.greater_than", { field: "${path}", v: -180 }))
            .max(180, tValid("zoom.less_than", { field: "${path}", v: 180 }))
            .required(tValid("zoom.extent.mandatory", { field: "${path}" }))
            .transform(transform)
            .test({
                name: "xmax_check",
                message: tValid("zoom.f1_less_than_f2", { field1: "xmin", field2: "xmax" }),
                test: (value, context) => {
                    const xmin = context.parent.xmin;
                    return xmin !== undefined ? value > xmin : true;
                },
            }),
        ymax: yup
            .number()
            .typeError(tValid("zoom.extent.nan", { field: "${path}" }))
            .min(-90, tValid("zoom.greater_than", { field: "${path}", v: -90 }))
            .max(90, tValid("zoom.less_than", { field: "${path}", v: 90 }))
            .required(tValid("zoom.extent.mandatory", { field: "${path}" }))
            .transform(transform)
            .test({
                name: "ymax_check",
                message: tValid("zoom.f1_less_than_f2", { field1: "ymin", field2: "ymax" }),
                test: (value, context) => {
                    const ymin = context.parent.ymin;
                    return ymin !== undefined ? value > ymin : true;
                },
            }),
    });

    const form = useForm({
        mode: "onChange",
        resolver: yupResolver(schema),
    });
    const {
        register,
        getValues: getFormValues,
        formState: { errors },
        handleSubmit,
        resetField,
    } = form;

    const clear = () => {
        ["xmin", "ymin", "xmax", "ymax"].forEach((f) => resetField(f as FieldName, undefined));
    };

    const onChoiceChanged = (v) => {
        clear();
        setChoice(v);
    };

    const onSubmit = () => {
        const values = getFormValues();
        onApply([values.xmin, values.ymin, values.xmax, values.ymax]);
        setChoice("manual");
        clear();
    };

    return (
        <>
            {createPortal(
                <ExtentDialogModal.Component
                    title={t("zoom.extent")}
                    buttons={[
                        {
                            children: tCommon("cancel"),
                            doClosesModal: false,
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
                        {/* TODO DECOMMENTER ET METTRE A LA PLACE DE Skeleton CI-DESSOUS
                            <SearchGrids
                                label={t("zoom.choice.autocomplete")}
                                filters={filters}
                                onChange={(extent) => {
                                    console.log(extent);
                                }}
                        /> */}
                        {choice === "autocomplete" ? (
                            <Skeleton count={1} rectangleHeight={30} />
                        ) : (
                            <div>
                                <label className={fr.cx("fr-label")}>{t("zoom.extent_enter_manually")}</label>
                                <div className={fr.cx("fr-grid-row")}>
                                    <div className={fr.cx("fr-col-6", "fr-px-2w")}>
                                        <Input
                                            label={t("zoom.xmin")}
                                            state={errors.xmin ? "error" : "default"}
                                            stateRelatedMessage={errors.xmin?.message?.toString()}
                                            nativeInputProps={register("xmin")}
                                        />
                                        <Input
                                            label={t("zoom.xmax")}
                                            state={errors.xmax ? "error" : "default"}
                                            stateRelatedMessage={errors.xmax?.message?.toString()}
                                            nativeInputProps={register("xmax")}
                                        />
                                    </div>
                                    <div className={fr.cx("fr-col-6", "fr-px-2w")}>
                                        <Input
                                            label={t("zoom.ymin")}
                                            state={errors.ymin ? "error" : "default"}
                                            stateRelatedMessage={errors.ymin?.message?.toString()}
                                            nativeInputProps={register("ymin")}
                                        />
                                        <Input
                                            label={t("zoom.ymax")}
                                            state={errors.ymax ? "error" : "default"}
                                            stateRelatedMessage={errors.ymax?.message?.toString()}
                                            nativeInputProps={register("ymax")}
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
