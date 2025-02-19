import { fr } from "@codegouvfr/react-dsfr";
import Input from "@codegouvfr/react-dsfr/Input";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import ToggleSwitch from "@codegouvfr/react-dsfr/ToggleSwitch";
import { yupResolver } from "@hookform/resolvers/yup";
import { FC, useMemo } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { AttributeDTO, ThemeDTO } from "../../../../../@types/espaceco";
import { useTranslation } from "../../../../../i18n/i18n";
import { AttributeValidations, validateList } from "./AttributeValidations";
import { AddOrEditAttributeFormType, getInputType, normalizeAttribute } from "./ThemeUtils";

type EditAttributeDialogProps = {
    modal: ReturnType<typeof createModal>;
    theme: ThemeDTO;
    attribute: AttributeDTO;
    onModify: (newAttribute: AttributeDTO) => void;
};

const EditAttributeDialog: FC<EditAttributeDialogProps> = ({ modal, theme, attribute, onModify }) => {
    const { t: tCommon } = useTranslation("Common");
    const { t } = useTranslation("Theme");

    const attributeNames: string[] = useMemo(() => {
        return Array.from(
            theme.attributes.filter((a) => a.name !== attribute.name),
            (a) => a.name
        );
    }, [theme, attribute]);

    const schema = yup.lazy(() => {
        const s = {
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
        };
        if (attribute.type === "list") {
            s["values"] = yup.string().test({
                name: "check-values",
                test: (value, context) => {
                    return validateList(value, context);
                },
            });
            s["multiple"] = yup.boolean();
        }
        return yup.object().shape(s);
    });

    const defaultValues = useMemo<AddOrEditAttributeFormType>(() => {
        const v = {
            name: attribute.name,
            type: attribute.type,
            mandatory: attribute.mandatory,
            default: attribute.default,
            multiple: attribute.multiple,
            help: attribute.help,
        };
        let list: string | null = null;
        if (attribute.values) {
            list = (attribute.values as string[]).join("|");
        }
        v["values"] = list;
        return v;
    }, [attribute]);

    const {
        register,
        watch,
        formState: { errors },
        getValues: getFormValues,
        setValue: setFormValue,
        handleSubmit,
    } = useForm<AddOrEditAttributeFormType>({
        mode: "onSubmit",
        values: defaultValues,
        resolver: yupResolver(schema),
    });

    const onSubmit = () => {
        modal.close();
        onModify(normalizeAttribute(getFormValues()));
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
                    <div>
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
                                <Input
                                    label={t("dialog.edit_attribute.list.values")}
                                    state={errors.values ? "error" : "default"}
                                    stateRelatedMessage={errors?.values?.message}
                                    nativeInputProps={{
                                        ...register("values"),
                                    }}
                                />
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
                </modal.Component>,
                document.body
            )}
        </>
    );
};

export default EditAttributeDialog;
