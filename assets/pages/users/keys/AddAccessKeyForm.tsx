import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { yupResolver } from "@hookform/resolvers/yup";
import { TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";
import { FC, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import InputCollection from "../../../components/Input/InputCollection";
import AppLayout from "../../../components/Layout/AppLayout";
import { datastoreNavItems } from "../../../config/datastoreNavItems";
import { ComponentKey, useTranslation } from "../../../i18n/i18n";
import { UserKeyCreateDtoUserKeyInfoDtoTypeEnum } from "../../../types/entrepot";
import { getSchema } from "./AddAccessKeyValidation";
import BasicTypeInfoForm from "./BasicTypeInfoForm";
import HashTypeInfoForm from "./HashTypeInfoForm";
import isIP from "validator/lib/isIp";

const AddAccessKeyForm: FC = () => {
    const navItems = datastoreNavItems();

    const { t: tCommon } = useTranslation("Common");
    const { t } = useTranslation("AddAccessKey");

    // NOTE la clé de type header n'existe plus apparemment

    // TODO user_agent et referer
    const schema = (t: TranslationFunction<"AddAccessKey", ComponentKey>) => {
        const ipSchema = yup
            .array()
            .of(yup.string())
            .test({
                name: "is-ip",
                test: (values, context) => {
                    if (values === undefined || (Array.isArray(values) && values.length === 0)) return true;

                    const errors: string[] = [];
                    values.forEach((value) => {
                        if (value && !isIP(value)) {
                            errors.push(t("ip_error", { ip: value }));
                        }
                    });
                    if (errors.length) {
                        const message = errors.join(", ");
                        return context.createError({ message: message });
                    }
                    return true;
                },
            });

        return yup.object().shape({
            name: yup.string().required(t("name_required")),
            type: yup.string(),
            whitelist: ipSchema,
            blacklist: ipSchema,
            type_infos: yup.lazy(() => {
                return getSchema(keyType, t);
            }),
        });
    };

    // Formulaire
    const form = useForm({ mode: "onChange", resolver: yupResolver(schema(t)) });

    const {
        control,
        register,
        resetField,
        watch,
        getValues: getFormValues,
        formState: { errors },
        handleSubmit,
    } = form;

    const keyType = watch("type") ?? UserKeyCreateDtoUserKeyInfoDtoTypeEnum.BASIC;

    const onSubmit = () => {
        console.log(getFormValues());
    };

    useEffect(() => {
        resetField("type_infos", { defaultValue: {} });
        console.log(getFormValues());
    }, [keyType, resetField, getFormValues]);

    return (
        <AppLayout documentTitle={t("title")} navItems={navItems}>
            <h1>{t("title")}</h1>
            <div>
                <Input
                    label={t("key_name")}
                    state={errors.name ? "error" : "default"}
                    stateRelatedMessage={errors.name?.message?.toString()}
                    nativeInputProps={{ ...register("name") }}
                />
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
                <div className={fr.cx("fr-grid-row")}>
                    <div>
                        <Controller
                            control={control}
                            name="whitelist"
                            render={({ field }) => {
                                return (
                                    <InputCollection
                                        label={t("key_whitelist")}
                                        state={errors.whitelist ? "error" : "default"}
                                        stateRelatedMessage={errors?.whitelist?.message?.toString()}
                                        onChange={field.onChange}
                                    />
                                );
                            }}
                        />
                    </div>
                    <div>
                        <Controller
                            control={control}
                            name="blacklist"
                            render={({ field }) => {
                                return (
                                    <InputCollection
                                        label={t("key_blacklist")}
                                        state={errors.blacklist ? "error" : "default"}
                                        stateRelatedMessage={errors?.blacklist?.message?.toString()}
                                        onChange={field.onChange}
                                    />
                                );
                            }}
                        />
                    </div>
                </div>
                {keyType === UserKeyCreateDtoUserKeyInfoDtoTypeEnum.BASIC ? (
                    <BasicTypeInfoForm form={form} />
                ) : keyType === UserKeyCreateDtoUserKeyInfoDtoTypeEnum.HASH ? (
                    <HashTypeInfoForm form={form} />
                ) : (
                    <div />
                )}
                <div className={fr.cx("fr-grid-row", "fr-grid-row--right", "fr-mt-2v")}>
                    <Button onClick={handleSubmit(onSubmit)}>{tCommon("add")}</Button>
                </div>
            </div>
        </AppLayout>
    );
};

export default AddAccessKeyForm;
