import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import Stepper from "@codegouvfr/react-dsfr/Stepper";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { compareAsc } from "date-fns";
import { FC, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import isIPRange from "validator/lib/isIPRange";
import * as yup from "yup";
import api from "../../../api";
import AppLayout from "../../../components/Layout/AppLayout";
import LoadingText from "../../../components/Utils/LoadingText";
import Wait from "../../../components/Utils/Wait";
import { datastoreNavItems } from "../../../config/datastoreNavItems";
import { getTranslation, useTranslation } from "../../../i18n/i18n";
import RQKeys from "../../../modules/RQKeys";
import { routes } from "../../../router/router";
import { AddKeyFormType } from "../../../types/app";
import { PermissionWithOfferingsDetailsResponseDto, UserKeyCreateDtoUserKeyInfoDtoTypeEnum, UserKeyResponseDto } from "../../../types/entrepot";
import "./../../../../assets/sass/pages/my_keys.scss";
import { getSecuritySchema } from "./KeyTypeValidation";
import SecurityOptionsForm from "./SecurityOptionsForm";
import ServicesForm from "./ServicesForm";

const { t } = getTranslation("AddUserKey");

/* Schema pour une liste de plages d'adresses IP */
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

const AddUserKeyForm: FC = () => {
    const navItems = datastoreNavItems();

    const { t: tCommon } = useTranslation("Common");

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

    /* Les noms de toutes les cles */
    const keyNames = useMemo<string[]>(() => {
        if (!keys) return [];
        return Array.from(keys, (key) => {
            return key.name;
        });
    }, [keys]);

    /* Les permissions non expirees */
    const validPermissions = useMemo(() => {
        if (permissions === undefined) return [];
        return permissions.filter((permission) => {
            return !(permission.end_date && compareAsc(new Date(permission.end_date), new Date()) < 0);
        });
    }, [permissions]);

    const STEPS = {
        ACCESSIBLE_SERVICES: 1,
        SECURITY_OPTIONS: 2,
    };

    const schema = {};
    schema[STEPS.ACCESSIBLE_SERVICES] = yup.object().shape({
        name: yup
            .string()
            .required(t("name_required"))
            .test("is-unique", t("name_exists"), (name) => {
                return !keyNames.includes(name);
            }),
        type: yup.string(),
        accesses: yup
            .array()
            .of(
                yup.object().shape({
                    permission: yup.string(),
                    offerings: yup.array().of(yup.string()),
                })
            )
            .min(1, t("accesses_required"))
            .required(t("accesses_required")),
    });
    schema[STEPS.SECURITY_OPTIONS] = yup.object().shape({
        type: yup.string(),
        type_infos: yup.lazy(() => {
            return getSecuritySchema(keyType, t);
        }),
        ip_list: yup.object({
            type: yup.string(),
            adresses: ipSchema,
        }),
        user_agent: yup.string(), // TODO Validation
        referer: yup.string(), // TODO Validation
    });

    /* l'etape courante */
    const [currentStep, setCurrentStep] = useState(STEPS.ACCESSIBLE_SERVICES);

    // Formulaire
    const form = useForm<AddKeyFormType>({
        mode: "onChange",
        resolver: yupResolver(schema[currentStep]),
        defaultValues: {
            name: "",
            accesses: [
                /*{
                    permission: "1eb4b782-7672-4ed1-8c4a-5172cfed4394",
                    offerings: ["6c67e296-c399-456f-942f-8816a5766e2b", "17c8e804-4651-471b-8d08-410859307ccb"],
                },*/
            ],
            type: UserKeyCreateDtoUserKeyInfoDtoTypeEnum.HASH,
            type_infos: { hash: "" },
            ip_list: {
                name: "whitelist",
                addresses: [
                    /*"192.168.1.1/32", "192.168.0.1/24"*/
                ],
            },
            user_agent: "",
            referer: "",
        },
    });

    const { getValues: getFormValues, trigger, watch } = form;
    const keyType = watch("type");

    const previousStep = () => setCurrentStep((currentStep) => currentStep - 1);
    const nextStep = async () => {
        const isStepValid = await trigger(undefined, { shouldFocus: true }); // demande de valider le formulaire
        if (!isStepValid) return;

        if (currentStep < Object.values(STEPS).length) {
            setCurrentStep((currentStep) => currentStep + 1);
            return;
        }

        mutate(getFormValues());
    };

    const queryClient = useQueryClient();

    /* Ajout d'une cle */
    const { isPending: addkeyIsPending, mutate } = useMutation({
        mutationFn: (values: object) => api.user.addKey(values),
        throwOnError: true,
        onSuccess() {
            // TODO A VOIR POURQUOI refetchQueries
            // queryClient.refetchQueries({ queryKey: RQKeys.me_keys() });
            queryClient.invalidateQueries({ queryKey: RQKeys.me_keys() });
            routes.my_access_keys().push();
        },
    });

    return (
        <AppLayout documentTitle={t("title")} navItems={navItems}>
            <h1>{t("title")}</h1>
            {addkeyIsPending && (
                <Wait>
                    <div className={fr.cx("fr-container")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <i className={fr.cx("fr-icon-refresh-line", "fr-icon--lg", "fr-mr-2v") + " frx-icon-spin"} />
                            <h6 className={fr.cx("fr-m-0")}>{tCommon("adding")}</h6>
                        </div>
                    </div>
                </Wait>
            )}
            {isLoadingKeys || isLoadingPermissions ? (
                <LoadingText />
            ) : validPermissions.length === 0 ? (
                <Alert severity="warning" closable={false} title={tCommon("warning")} description={t("no_permission")} />
            ) : (
                <>
                    <Stepper
                        currentStep={currentStep}
                        stepCount={Object.values(STEPS).length}
                        nextTitle={currentStep < STEPS.SECURITY_OPTIONS && t("step", { num: currentStep + 1 })}
                        title={t("step", { num: currentStep })}
                    />
                    <ServicesForm form={form} permissions={validPermissions} visible={currentStep === STEPS.ACCESSIBLE_SERVICES} />
                    <SecurityOptionsForm form={form} visible={currentStep === STEPS.SECURITY_OPTIONS} />
                    <ButtonsGroup
                        className={fr.cx("fr-mt-2w")}
                        alignment="between"
                        buttons={[
                            {
                                children: tCommon("previous_step"),
                                priority: "tertiary",
                                onClick: previousStep,
                                disabled: currentStep === STEPS.ACCESSIBLE_SERVICES,
                            },
                            {
                                children: currentStep < Object.values(STEPS).length ? tCommon("next_step") : tCommon("add"),
                                onClick: nextStep,
                            },
                        ]}
                        inlineLayoutWhen="always"
                    />
                </>
            )}
        </AppLayout>
    );
};

export default AddUserKeyForm;
