import { fr } from "@codegouvfr/react-dsfr";
import Input from "@codegouvfr/react-dsfr/Input";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import ToggleSwitch from "@codegouvfr/react-dsfr/ToggleSwitch";
import { yupResolver } from "@hookform/resolvers/yup";
import { FC, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { AttributeDTO, AttributeType, AttributeTypes } from "../../../../../@types/espaceco";
import { useTranslation } from "../../../../../i18n/i18n";
import { AttributeValidations, validateList } from "./AttributeValidations";
import { AddOrEditAttributeFormType, getInputType, normalizeAttribute } from "./ThemeUtils";

type AddAttributeDialogProps = {
    modal: ReturnType<typeof createModal>;
    attributes: AttributeDTO[];
    onAdd: (attribute: AttributeDTO) => void;
};

const defaultValues: AddOrEditAttributeFormType = {
    name: "",
    type: "text",
    mandatory: false,
    default: null,
    help: null,
    multiple: false,
    values: null,
};

const AddAttributeDialog: FC<AddAttributeDialogProps> = ({ modal, attributes, onAdd }) => {
    const { t: tCommon } = useTranslation("Common");
    const { t } = useTranslation("Theme");

    // Etrange, le register devrait suffire
    const [type, setType] = useState<AttributeType>("text");

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
        default: yup
            .string()
            .nullable()
            .test({
                name: "check-value",
                test: (value, context) => {
                    const validator = new AttributeValidations(context);
                    return validator.validateValue(value);
                },
            }),
        help: yup.string().nullable(),
        multiple: yup.boolean(),
        values: yup
            .string()
            .nullable()
            .test({
                name: "check-values",
                test: (value, context) => {
                    return validateList(value, context);
                },
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
    } = useForm<AddOrEditAttributeFormType>({
        mode: "onSubmit",
        defaultValues: defaultValues,
        resolver: yupResolver(schema),
    });

    const mandatory = watch("mandatory");
    const multiple = watch("multiple");

    useEffect(() => {
        setFormValue("default", "");
        clearErrors(["default", "values"]);
        if (type !== "list") {
            setFormValue("values", "");
            setFormValue("multiple", false);
        }
    }, [type, setFormValue, clearErrors]);

    useEffect(() => {
        setFormValue("type", type);
    }, [setFormValue, type]);

    const onSubmit = () => {
        modal.close();
        onAdd(normalizeAttribute(getFormValues()));
        reset(defaultValues);
    };

    return (
        <>
            {createPortal(
                <modal.Component
                    title={t("add_attribute")}
                    buttons={[
                        {
                            children: tCommon("cancel"),
                            priority: "secondary",
                            doClosesModal: false,
                            onClick: () => {
                                reset(defaultValues);
                                modal.close();
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
                        <RadioButtons // Ne fonctionne pas avec register ??????
                            legend={t("dialog.add_attribute.type")}
                            options={AttributeTypes.map((attrType) => ({
                                label: t("dialog.add_attribute.get_type", { type: attrType }),
                                nativeInputProps: {
                                    checked: attrType === type,
                                    onChange: () => setType(attrType),
                                },
                            }))}
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
                </modal.Component>,
                document.body
            )}
        </>
    );
};

export { AddAttributeDialog };
