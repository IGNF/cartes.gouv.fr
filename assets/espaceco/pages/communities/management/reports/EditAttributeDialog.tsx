import KeyValueList, { getKeyValueSchema } from "@/components/Input/KeyValueList";
import { useKeyValue } from "@/hooks/useKeyValue";
import { fr } from "@codegouvfr/react-dsfr";
import Input from "@codegouvfr/react-dsfr/Input";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import ToggleSwitch from "@codegouvfr/react-dsfr/ToggleSwitch";
import { yupResolver } from "@hookform/resolvers/yup";
import { FC, useMemo } from "react";
import { createPortal } from "react-dom";
import { FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";
import { AttributeDTO, ThemeDTO } from "../../../../../@types/espaceco";
import { useTranslation } from "../../../../../i18n/i18n";
import { AttributeValidations } from "./AttributeValidations";
import { AddOrEditAttributeFormType, getInputType, normalizeAttribute } from "./ThemeUtils";

type EditAttributeDialogProps = {
    modal: ReturnType<typeof createModal>;
    theme: ThemeDTO;
    attribute: AttributeDTO;
    onModify: (newAttribute: AttributeDTO) => void;
};

const EditAttributeDialog: FC<EditAttributeDialogProps> = ({ modal, theme, attribute, onModify }) => {
    const { transformKeyValue, keyValue } = useKeyValue(attribute.values ?? []);

    const { t: tCommon } = useTranslation("Common");
    const { t } = useTranslation("Theme");

    const attributeNames: string[] = useMemo(() => {
        return Array.from(
            theme.attributes.filter((a) => a.name !== attribute.name),
            (a) => a.name
        );
    }, [theme, attribute]);

    const schema = yup.object({
        name: yup
            .string()
            .trim(t("trimmed_error"))
            .strict(true)
            .required(t("dialog.edit_attribute.name_mandatory_error"))
            .test("is-unique", t("dialog.edit_attribute.name_unique_error"), (value) => {
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

    const defaultValues = useMemo<AddOrEditAttributeFormType>(() => {
        return {
            name: attribute.name,
            type: attribute.type,
            mandatory: attribute.mandatory,
            default: attribute.default,
            multiple: attribute.multiple,
            help: attribute.help,
            values: keyValue,
        };
    }, [attribute, keyValue]);

    const form = useForm<AddOrEditAttributeFormType>({
        mode: "onSubmit",
        values: defaultValues,
        resolver: yupResolver(schema),
    });

    const {
        register,
        watch,
        formState: { errors },
        getValues: getFormValues,
        setValue: setFormValue,
        handleSubmit,
    } = form;

    const strType = useMemo(() => {
        const type = t("dialog.attribute.get_type", { type: getFormValues("type") });
        return `Type : ${type}`;
    }, [t, getFormValues]);

    const onSubmit = () => {
        modal.close();

        const values = transformKeyValue(getFormValues("values")) as (string | null)[];
        const datas = { ...getFormValues(), values: values };
        onModify(normalizeAttribute(datas));
    };

    const mandatory = watch("mandatory");
    const multiple = watch("multiple");

    return (
        <>
            {createPortal(
                <modal.Component
                    title={t("modify_attribute", { text: attribute.name })}
                    buttons={[
                        {
                            children: tCommon("cancel"),
                            priority: "secondary",
                            doClosesModal: false,
                            onClick: () => {
                                modal.close();
                            },
                        },
                        {
                            priority: "primary",
                            children: tCommon("modify"),
                            doClosesModal: false,
                            onClick: handleSubmit(onSubmit),
                        },
                    ]}
                >
                    <FormProvider {...form}>
                        <div>
                            <p>{strType}</p>
                            <p>{tCommon("mandatory_fields")}</p>
                            <Input
                                label={t("dialog.edit_attribute.name")}
                                state={errors.name ? "error" : "default"}
                                stateRelatedMessage={errors?.name?.message}
                                nativeInputProps={{
                                    ...register("name"),
                                }}
                            />
                            <ToggleSwitch
                                className={fr.cx("fr-mb-3w")}
                                inputTitle={""}
                                label={t("dialog.edit_attribute.mandatory")}
                                showCheckedHint
                                checked={mandatory}
                                onChange={(checked) => {
                                    setFormValue("mandatory", checked);
                                }}
                            />
                            {attribute.type === "list" && (
                                <>
                                    <KeyValueList label={t("dialog.edit_attribute.list.values")} name={"values"} />
                                    <ToggleSwitch
                                        className={fr.cx("fr-mb-3w")}
                                        inputTitle={""}
                                        label={t("dialog.edit_attribute.list.multiple")}
                                        showCheckedHint
                                        checked={multiple}
                                        onChange={(checked) => {
                                            setFormValue("multiple", checked);
                                        }}
                                    />
                                </>
                            )}
                            <Input
                                label={t("dialog.edit_attribute.value")}
                                state={errors.default ? "error" : "default"}
                                stateRelatedMessage={errors?.default?.message}
                                nativeInputProps={{
                                    type: getInputType(attribute.type),
                                    ...register("default"),
                                }}
                            />
                            <Input
                                label={t("dialog.edit_attribute.description")}
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

export default EditAttributeDialog;
