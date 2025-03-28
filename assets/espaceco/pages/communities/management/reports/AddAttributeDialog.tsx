import KeyValueList, { getKeyValueSchema, KeyValuesForm } from "@/components/Input/KeyValueList";
import { useKeyValue } from "@/hooks/useKeyValue";
import { fr } from "@codegouvfr/react-dsfr";
import Input from "@codegouvfr/react-dsfr/Input";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import ToggleSwitch from "@codegouvfr/react-dsfr/ToggleSwitch";
import { yupResolver } from "@hookform/resolvers/yup";
import { FC, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { AttributeDTO, AttributeType, AttributeTypes } from "../../../../../@types/espaceco";
import { useTranslation } from "../../../../../i18n/i18n";
import { AttributeValidations } from "./AttributeValidations";
import { AddOrEditAttributeFormType, getInputType, normalizeAttribute } from "./ThemeUtils";

type AddAttributeDialogProps = {
    modal: ReturnType<typeof createModal>;
    attributes: AttributeDTO[];
    onAdd: (attribute: AttributeDTO) => void;
};

const emptyKeyValue: KeyValuesForm = {
    useKeys: false,
    values: [],
};

const getDefautValues = (keyValue: KeyValuesForm): AddOrEditAttributeFormType => ({
    name: "",
    type: "text",
    mandatory: false,
    default: null,
    help: null,
    multiple: false,
    values: keyValue,
});

const AddAttributeDialog: FC<AddAttributeDialogProps> = ({ modal, attributes, onAdd }) => {
    const { keyValue, transformKeyValue } = useKeyValue([]);

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
        values: getKeyValueSchema().test({
            name: "isNotEmpty",
            message: t("dialog.attribute.empty_list_error"),
            test: (v, context) => {
                const {
                    parent: { type },
                } = context;
                return type === "list" ? v.values.length > 0 : true;
            },
        }),
    });

    const form = useForm<AddOrEditAttributeFormType>({
        mode: "onSubmit",
        defaultValues: getDefautValues(keyValue),
        resolver: yupResolver(schema),
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
    } = form;

    const mandatory = watch("mandatory");
    const multiple = watch("multiple");

    useEffect(() => {
        setFormValue("default", "");
        clearErrors(["default", "values"]);
        if (type !== "list") {
            setFormValue("values", emptyKeyValue);
            setFormValue("multiple", false);
        }
    }, [type, setFormValue, clearErrors]);

    useEffect(() => {
        setFormValue("type", type);
    }, [setFormValue, type]);

    const resetForm = () => {
        reset(getDefautValues(emptyKeyValue));
        setType("text");
        clearErrors();
    };

    const onSubmit = () => {
        modal.close();
        const values = transformKeyValue(getFormValues("values")) as (string | null)[];
        const datas = { ...getFormValues(), values: values };
        onAdd(normalizeAttribute(datas));
        resetForm();
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
                                resetForm();
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
                    <FormProvider {...form}>
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
                                    label: t("dialog.attribute.get_type", { type: attrType }),
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
                                    <KeyValueList label={t("dialog.add_attribute.list.values")} name={"values"} />
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
                    </FormProvider>
                </modal.Component>,
                document.body
            )}
        </>
    );
};

export { AddAttributeDialog };
