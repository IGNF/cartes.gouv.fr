import { fr } from "@codegouvfr/react-dsfr";
import Input from "@codegouvfr/react-dsfr/Input";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import ToggleSwitch from "@codegouvfr/react-dsfr/ToggleSwitch";
import { yupResolver } from "@hookform/resolvers/yup";
import { FC, useCallback, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { AttributeDTO, AttributeTypes } from "../../../../../@types/espaceco";
import { useTranslation } from "../../../../../i18n/i18n";
import { AttributeValidations, validateList } from "./AttributeValidations";

const AddAttributeDialogModal = createModal({
    id: "add-attribute",
    isOpenedByDefault: false,
});

type AddAttributeDialogProps = {
    attributes: AttributeDTO[];
    onAdd: (attribute: AttributeDTO) => void;
};

type AddAttributeFormType = {
    name: string;
    type: string;
    mandatory?: boolean;
    default?: string;
    help?: string;
    multiple?: boolean;
    values?: string;
};

const defaultValues: AddAttributeFormType = {
    name: "",
    type: "text",
    mandatory: false,
    default: "",
    help: "",
    multiple: false,
    values: "",
};

const AddAttributeDialog: FC<AddAttributeDialogProps> = ({ attributes, onAdd }) => {
    const { t: tCommon } = useTranslation("Common");
    const { t } = useTranslation("Theme");

    const attributeNames: string[] = useMemo(() => {
        return Array.from(attributes, (a) => a.name);
    }, [attributes]);

    const schema = yup.object({
        name: yup
            .string()
            .trim(t("trimmed_error"))
            .strict(true)
            .required(t("dialog.add_attribute.name_mandatory_error"))
            .test("is-unique", t("dialog.add_attribute.name_unique_error"), (value) => {
                const v = value.trim();
                return !attributeNames.includes(v);
            }),
        type: yup.string().required(),
        mandatory: yup.boolean(),
        default: yup.string().test({
            name: "check-value",
            test: (value, context) => {
                const validator = new AttributeValidations(context);
                return validator.validateValue(value);
            },
        }),
        help: yup.string(),
        multiple: yup.boolean(),
        /*values: yup.string().test({
            name: "check-values",
            test: (value, context) => {
                return validateList(value, context);
            },
        }),*/
        values: yup.string().transform((value, origin) => {
            const v = origin ? origin.split("|") : [];
            return [...new Set(v)];
        }),
    });

    const {
        register,
        watch,
        formState: { errors },
        getValues: getFormValues,
        setValue: setFormValue,
        reset,
        clearErrors,
        handleSubmit,
    } = useForm<AddAttributeFormType>({
        mode: "onSubmit",
        defaultValues: defaultValues,
        resolver: yupResolver(schema),
    });

    const type = watch("type");
    const mandatory = watch("mandatory");
    const multiple = watch("multiple");

    const typeOptions = useMemo(() => {
        return Array.from(AttributeTypes, (at) => {
            return {
                label: t("dialog.add_attribute.get_type", { type: at }),
                nativeInputProps: {
                    ...register("type"),
                    value: at,
                    checked: at === type,
                },
            };
        });
    }, [t, register, type]);

    useEffect(() => {
        setFormValue("default", "");
        clearErrors(["default", "values"]);
        if (type !== "list") {
            setFormValue("values", "");
            setFormValue("multiple", false);
        }
    }, [type, setFormValue, clearErrors]);

    /* Recuperation de input type à partir de type */
    const getInputType = useCallback((type: string) => {
        switch (type) {
            case "date":
                return "date";
            default:
                return "text";
        }
    }, []);

    const normalize = useCallback((): AttributeDTO => {
        const formValues = getFormValues();

        const result: AttributeDTO = { name: formValues.name, type: formValues.type };
        if (formValues.type === "list") {
            result.values = formValues.values?.split("|");
        }

        ["mandatory", "multiple", "help"].forEach((f) => {
            if (formValues[f]) {
                result[f] = formValues[f];
            }
        });

        return result;
    }, [getFormValues]);

    const onSubmit = () => {
        AddAttributeDialogModal.close();
        onAdd(normalize());
        reset(defaultValues);
    };

    return (
        <>
            {createPortal(
                <AddAttributeDialogModal.Component
                    title={t("add_attribute")}
                    buttons={[
                        {
                            children: tCommon("cancel"),
                            priority: "secondary",
                            doClosesModal: false,
                            onClick: () => {
                                reset(defaultValues);
                                AddAttributeDialogModal.close();
                            },
                        },
                        {
                            priority: "primary",
                            children: tCommon("add"),
                            doClosesModal: false,
                            onClick: handleSubmit(onSubmit),
                        },
                    ]}
                >
                    <div>
                        <p>{tCommon("mandatory_fields")}</p>
                        <Input
                            label={t("dialog.add_attribute.name")}
                            state={errors.name ? "error" : "default"}
                            stateRelatedMessage={errors?.name?.message}
                            nativeInputProps={{
                                ...register("name"),
                            }}
                        />
                        <RadioButtons
                            legend={t("dialog.add_attribute.type")}
                            options={typeOptions}
                            orientation={"horizontal"}
                            state={errors.type ? "error" : "default"}
                            stateRelatedMessage={errors?.type?.message}
                        />
                        <ToggleSwitch
                            className={fr.cx("fr-mb-3w")}
                            inputTitle={""}
                            label={t("dialog.add_attribute.mandatory")}
                            showCheckedHint
                            checked={mandatory}
                            onChange={(checked) => {
                                setFormValue("mandatory", checked);
                            }}
                        />
                        {type === "list" && (
                            <>
                                <Input
                                    label={t("dialog.add_attribute.list.values")}
                                    state={errors.values ? "error" : "default"}
                                    stateRelatedMessage={errors?.values?.message}
                                    nativeInputProps={{
                                        ...register("values"),
                                    }}
                                />
                                <ToggleSwitch
                                    className={fr.cx("fr-mb-3w")}
                                    inputTitle={""}
                                    label={t("dialog.add_attribute.list.multiple")}
                                    showCheckedHint
                                    checked={multiple}
                                    onChange={(checked) => {
                                        setFormValue("multiple", checked);
                                    }}
                                />
                            </>
                        )}
                        <Input
                            label={t("dialog.add_attribute.value")}
                            state={errors.default ? "error" : "default"}
                            stateRelatedMessage={errors?.default?.message}
                            nativeInputProps={{
                                type: getInputType(type),
                                ...register("default"),
                            }}
                        />
                        <Input
                            label={t("dialog.add_attribute.description")}
                            state={errors.help ? "error" : "default"}
                            stateRelatedMessage={errors?.help?.message}
                            nativeInputProps={{
                                ...register("help"),
                            }}
                        />
                    </div>
                </AddAttributeDialogModal.Component>,
                document.body
            )}
        </>
    );
};

export { AddAttributeDialog, AddAttributeDialogModal };
