import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";
import { FC, useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import isIPRange from "validator/lib/isIPRange";
import * as yup from "yup";
import api from "../../../api";
import Cleaner from "../../../clean";
import InputCollection from "../../../components/Input/InputCollection";
import AppLayout from "../../../components/Layout/AppLayout";
import LoadingText from "../../../components/Utils/LoadingText";
import { datastoreNavItems } from "../../../config/datastoreNavItems";
import { ComponentKey, useTranslation } from "../../../i18n/i18n";
import RQKeys from "../../../modules/RQKeys";
import { routes } from "../../../router/router";
import { PermissionWithOfferingsDetailsResponseDto, UserKeyCreateDtoUserKeyInfoDtoTypeEnum, UserKeyResponseDto } from "../../../types/entrepot";
import { getSchema } from "./KeyTypeValidation";
import BasicTypeInfoForm from "./BasicTypeInfoForm";
import HashTypeInfoForm from "./HashTypeInfoForm";
import PermissionsForm from "./PermissionsForm";

const AddUserKeyForm: FC = () => {
    const navItems = datastoreNavItems();

    const { t: tCommon } = useTranslation("Common");
    const { t } = useTranslation("AddUserKey");

    const schema = (t: TranslationFunction<"AddUserKey", ComponentKey>) => {
        const ipSchema = yup
            .array()
            .of(yup.string())
            .test({
                name: "is-ip",
                test: (values, context) => {
                    if (!values || (Array.isArray(values) && values.length === 0)) return true;

                    const errors: string[] = [];
                    values.forEach((value) => {
                        if (value && !isIPRange(value)) {
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
            name: yup
                .string()
                .required(t("name_required"))
                .test("is-unique", t("name_exists"), (name) => {
                    return !keyNames.includes(name);
                }),
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

    /* Nettoyage des valeurs null ou vide ("") */
    const cleaner = useMemo(() => new Cleaner(), []);

    /* Changement de type de cle */
    useEffect(() => {
        resetField("type_infos", { defaultValue: {} });
    }, [keyType, resetField]);

    // Les cles d'acces (recuperee car le nom des cles doit etre unique)
    const { data: keys, isLoading: isLoadingKeys } = useQuery<UserKeyResponseDto[]>({
        queryKey: RQKeys.me_keys(),
        queryFn: ({ signal }) => api.user.getMyKeys({ signal }),
        staleTime: 3600000,
    });

    // Les permissions
    const { data: permissions, isLoading: isLoadingPermissions } = useQuery<PermissionWithOfferingsDetailsResponseDto[]>({
        queryKey: RQKeys.me_permissions(),
        queryFn: ({ signal }) => api.user.getMyPermissions({ signal }),
        staleTime: 3600000,
    });

    const keyNames = useMemo<string[]>(() => {
        if (!keys) return [];
        return Array.from(keys, (key) => {
            return key.name;
        });
    }, [keys]);

    const queryClient = useQueryClient();

    /* Ajout d'une cle */
    const addKeyMutation = useMutation({
        mutationFn: (values: object) => api.user.addKey(values),
        throwOnError: true,
        onSuccess() {
            queryClient.refetchQueries({ queryKey: RQKeys.me_keys() });
            routes.my_access_keys().push();
        },
    });

    const onSubmit = () => {
        const values = cleaner.cleanObject(getFormValues());
        if (values) {
            addKeyMutation.mutate(values);
        }
        console.log(values); // TODO SUPPRIMER
    };

    return (
        <AppLayout documentTitle={t("title")} navItems={navItems}>
            {isLoadingKeys || isLoadingPermissions ? (
                <LoadingText />
            ) : (
                <div>
                    <h1>{t("title")}</h1>
                    <p>{tCommon("mandatory_fields")}</p>
                    <div className={fr.cx("fr-grid-row")}>
                        <div className={fr.cx("fr-col-6", "fr-px-1v")}>
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
                            {keyType === UserKeyCreateDtoUserKeyInfoDtoTypeEnum.BASIC ? (
                                <BasicTypeInfoForm form={form} />
                            ) : keyType === UserKeyCreateDtoUserKeyInfoDtoTypeEnum.HASH ? (
                                <HashTypeInfoForm form={form} />
                            ) : (
                                <div />
                            )}
                            {/* whitelist et blacklist */}
                            <Controller
                                control={control}
                                name="whitelist"
                                render={({ field }) => {
                                    return (
                                        <InputCollection
                                            label={t("key_whitelist")}
                                            hintText={t("key_iprange_explain")}
                                            state={errors.whitelist ? "error" : "default"}
                                            stateRelatedMessage={errors?.whitelist?.message?.toString()}
                                            onChange={field.onChange}
                                        />
                                    );
                                }}
                            />
                            <Controller
                                control={control}
                                name="blacklist"
                                render={({ field }) => {
                                    return (
                                        <InputCollection
                                            label={t("key_blacklist")}
                                            hintText={t("key_iprange_explain")}
                                            state={errors.blacklist ? "error" : "default"}
                                            stateRelatedMessage={errors?.blacklist?.message?.toString()}
                                            onChange={field.onChange}
                                        />
                                    );
                                }}
                            />
                            <Input label={t("user_agent")} nativeInputProps={{ ...register("user_agent") }} />
                            <Input label={t("referer")} nativeInputProps={{ ...register("referer") }} />
                        </div>
                        <div className={fr.cx("fr-col-6", "fr-px-1v")}>
                            <PermissionsForm permissions={permissions} form={form} />
                        </div>
                    </div>
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--right", "fr-mt-2v")}>
                        <Button onClick={handleSubmit(onSubmit)}>{tCommon("add")}</Button>
                    </div>
                </div>
            )}
        </AppLayout>
    );
};

export default AddUserKeyForm;
