import { fr } from "@codegouvfr/react-dsfr";
import Input from "@codegouvfr/react-dsfr/Input";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { FC, useEffect } from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { KeyFormValuesType, UserKeyInfoDtoTypeEnum } from "../../../../@types/app";
import { UserKeyCreateDtoUserKeyInfoDtoTypeEnum } from "../../../../@types/entrepot";
import InputCollection from "../../../../components/Input/InputCollection";
import { useTranslation } from "../../../../i18n/i18n";
import BasicTypeInfoForm from "./BasicTypeInfoForm";

type SecurityOptionsFormProps = {
    editMode: boolean;
    form: UseFormReturn<KeyFormValuesType>;
    hasOauth2: boolean;
    visible: boolean;
};

const SecurityOptionsForm: FC<SecurityOptionsFormProps> = ({ editMode, form, hasOauth2, visible }) => {
    const { t: tCommon } = useTranslation("Common");
    const { t } = useTranslation("UserKey");

    const {
        control,
        register,
        formState: { errors },
        watch,
        setValue: setFormValue,
    } = form;

    const keyType = watch("type");
    const ipListName = watch("ip_list_name");

    useEffect(() => {
        if (editMode) {
            return;
        }

        let value = {};
        switch (keyType) {
            case UserKeyInfoDtoTypeEnum.BASIC:
                value = { login: "", password: "" };
                break;
            case UserKeyInfoDtoTypeEnum.HASH:
                value = { hash: "" };
                break;
            default:
                break;
        }
        setFormValue("type_infos", value);
    }, [editMode, keyType, setFormValue]);

    return (
        <div className={fr.cx(!visible && "fr-hidden")}>
            <p>{tCommon("mandatory_fields")}</p>
            {editMode ? (
                t("key_is_type", { type: keyType })
            ) : (
                <RadioButtons
                    legend={t("key_type")}
                    state={errors.type ? "error" : "default"}
                    stateRelatedMessage={errors?.type?.message?.toString()}
                    orientation="horizontal"
                    options={[
                        {
                            label: UserKeyCreateDtoUserKeyInfoDtoTypeEnum.BASIC,
                            nativeInputProps: {
                                ...register("type"),
                                value: UserKeyInfoDtoTypeEnum.BASIC,
                                checked: UserKeyInfoDtoTypeEnum.BASIC === keyType,
                            },
                        },
                        {
                            label: UserKeyCreateDtoUserKeyInfoDtoTypeEnum.HASH,
                            nativeInputProps: {
                                ...register("type"),
                                value: UserKeyInfoDtoTypeEnum.HASH,
                                checked: UserKeyInfoDtoTypeEnum.HASH === keyType,
                            },
                        },
                        {
                            label: UserKeyCreateDtoUserKeyInfoDtoTypeEnum.OAUTH2,
                            nativeInputProps: {
                                ...register("type"),
                                disabled: hasOauth2,
                                value: UserKeyInfoDtoTypeEnum.OAUTH2,
                                checked: UserKeyInfoDtoTypeEnum.OAUTH2 === keyType,
                            },
                        },
                    ]}
                />
            )}
            {keyType === UserKeyInfoDtoTypeEnum.BASIC && editMode === false ? (
                <>
                    {t("basic_type_explain")}
                    <BasicTypeInfoForm form={form} />
                </>
            ) : keyType === UserKeyInfoDtoTypeEnum.HASH ? (
                editMode === false && t("hash_type_explain")
            ) : (
                editMode === false && t("oauth2_type_explain")
            )}
            <RadioButtons
                legend={t("ip_list.label")}
                hintText={t("ip_list.hintText")}
                options={[
                    {
                        label: t("ip_list.no_filter"),
                        nativeInputProps: {
                            ...register("ip_list_name"),
                            value: "none",
                        },
                    },
                    {
                        label: t("ip_list.whitelist"),
                        nativeInputProps: {
                            ...register("ip_list_name"),
                            value: "whitelist",
                        },
                    },
                    {
                        label: t("ip_list.blacklist"),
                        nativeInputProps: {
                            ...register("ip_list_name"),
                            value: "blacklist",
                        },
                    },
                ]}
                orientation="horizontal"
            />
            {(ipListName === "whitelist" || ipListName === "blacklist") && (
                <Controller
                    control={control}
                    name="ip_list_addresses"
                    render={({ field: { value, onChange } }) => {
                        return (
                            <InputCollection
                                label={t("ip_addresses")}
                                hintText={t("iprange_explain")}
                                value={value}
                                state={errors.ip_list_addresses ? "error" : "default"}
                                stateRelatedMessage={errors.ip_list_addresses?.message?.toString()}
                                onChange={onChange}
                            />
                        );
                    }}
                />
            )}
            <Input label={t("user_agent")} hintText={t("user_agent_hintext")} nativeInputProps={{ ...register("user_agent") }} />
            <Input label={t("referer")} hintText={t("referer_hintext")} nativeInputProps={{ ...register("referer") }} />
        </div>
    );
};

export default SecurityOptionsForm;
