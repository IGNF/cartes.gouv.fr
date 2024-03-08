import { fr } from "@codegouvfr/react-dsfr";
import Input from "@codegouvfr/react-dsfr/Input";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { FC } from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import InputCollection from "../../../components/Input/InputCollection";
import { useTranslation } from "../../../i18n/i18n";
import { AddKeyFormType } from "../../../types/app";
import { UserKeyCreateDtoUserKeyInfoDtoTypeEnum } from "../../../types/entrepot";
import BasicTypeInfoForm from "./BasicTypeInfoForm";
import HashTypeInfoForm from "./HashTypeInfoForm";

type SecurityOptionsFormProps = {
    form: UseFormReturn<AddKeyFormType>;
    visible: boolean;
};

const SecurityOptionsForm: FC<SecurityOptionsFormProps> = ({ form, visible }) => {
    const { t: tCommon } = useTranslation("Common");
    const { t } = useTranslation("AddUserKey");

    const {
        control,
        register,
        formState: { errors },
        watch,
    } = form;

    const keyType = watch("type");

    // TODO SUPPRIMER
    /*useEffect(() => {
        watch((value, { name, type }) => console.log(value, name, type));
    }, [watch]);*/

    return (
        <div className={fr.cx(!visible && "fr-hidden")}>
            <p>{tCommon("mandatory_fields")}</p>
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
                            value: UserKeyCreateDtoUserKeyInfoDtoTypeEnum.BASIC,
                            checked: UserKeyCreateDtoUserKeyInfoDtoTypeEnum.BASIC === keyType,
                        },
                    },
                    {
                        label: UserKeyCreateDtoUserKeyInfoDtoTypeEnum.HASH,
                        nativeInputProps: {
                            ...register("type"),
                            value: UserKeyCreateDtoUserKeyInfoDtoTypeEnum.HASH,
                            checked: UserKeyCreateDtoUserKeyInfoDtoTypeEnum.HASH === keyType,
                        },
                    },
                    {
                        label: UserKeyCreateDtoUserKeyInfoDtoTypeEnum.OAUTH2,
                        nativeInputProps: {
                            ...register("type"),
                            value: UserKeyCreateDtoUserKeyInfoDtoTypeEnum.OAUTH2,
                            checked: UserKeyCreateDtoUserKeyInfoDtoTypeEnum.OAUTH2 === keyType,
                        },
                    },
                ]}
            />
            {keyType === UserKeyCreateDtoUserKeyInfoDtoTypeEnum.BASIC ? (
                <BasicTypeInfoForm form={form} />
            ) : keyType === UserKeyCreateDtoUserKeyInfoDtoTypeEnum.HASH ? (
                <HashTypeInfoForm form={form} />
            ) : (
                <div />
            )}
            <RadioButtons
                legend={t("ip_list.label")}
                hintText={t("ip_list.hintText")}
                options={[
                    {
                        label: t("ip_list.whitelist"),
                        nativeInputProps: {
                            ...register("ip_list.name"),
                            value: "whitelist",
                        },
                    },
                    {
                        label: t("ip_list.blacklist"),
                        nativeInputProps: {
                            ...register("ip_list.name"),
                            value: "blacklist",
                        },
                    },
                ]}
                orientation="horizontal"
            />
            <Controller
                control={control}
                name="ip_list.addresses"
                render={({ field: { value, onChange } }) => {
                    return (
                        <InputCollection
                            label={t("ip_adresses")}
                            hintText={t("iprange_explain")}
                            value={value}
                            state={errors.ip_list?.addresses ? "error" : "default"}
                            stateRelatedMessage={errors.ip_list?.addresses?.message?.toString()}
                            onChange={onChange}
                        />
                    );
                }}
            />
            <Input label={t("user_agent")} nativeInputProps={{ ...register("user_agent") }} />
            <Input label={t("referer")} nativeInputProps={{ ...register("referer") }} />
        </div>
    );
};

export default SecurityOptionsForm;
