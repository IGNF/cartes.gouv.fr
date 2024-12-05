import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import Stepper from "@codegouvfr/react-dsfr/Stepper";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { compareAsc } from "date-fns";
import { FC, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { KeyFormValuesType, UserKeyDetailedWithAccessesResponseDto, UserKeyInfoDtoTypeEnum, UserKeyWithAccessesResponseDto } from "../../../../@types/app";
import { PermissionWithOfferingsDetailsResponseDto, UserKeyResponseDto, UserKeyResponseDtoTypeEnum } from "../../../../@types/entrepot";
import AppLayout from "../../../../components/Layout/AppLayout";
import LoadingText from "../../../../components/Utils/LoadingText";
import Wait from "../../../../components/Utils/Wait";
import { datastoreNavItems } from "../../../../config/navItems/datastoreNavItems";
import { getTranslation, useTranslation } from "../../../../i18n/i18n";
import RQKeys from "../../../../modules/entrepot/RQKeys";
import { CartesApiException } from "../../../../modules/jsonFetch";
import { routes } from "../../../../router/router";
import "../../../../sass/pages/my_keys.scss";
import api from "../../../api";

import SecurityOptionsForm from "./SecurityOptionsForm";
import ServicesForm from "./ServicesForm";
import { getSecurityOptionsSchema, getServicesSchema } from "./ValidationSchemas";
import { UserKeyDefaultValues, getDefaultValues } from "./utils/DefaultValues";

const { t } = getTranslation("UserKey");

type UserKeyFormProps = {
    keyId?: string;
};

const createRequestBody = (editMode: boolean, formValues: KeyFormValuesType) => {
    // Nettoyage => trim sur toutes les chaines
    const values = JSON.parse(
        JSON.stringify(formValues, (_, value) => {
            return typeof value === "string" ? value.trim() : value;
        })
    );

    // Pas de filtrage, on supprime la liste des adresses IP
    if (values["ip_list_name"] === "none") {
        delete values["ip_list_name"];
        delete values["ip_list_addresses"];
    }
    if ([UserKeyInfoDtoTypeEnum.HASH, UserKeyInfoDtoTypeEnum.OAUTH2].includes(values["type"])) {
        delete values["type_infos"];
    }

    if (editMode) {
        delete values["type"];
    }

    return values;
};

const UserKeyForm: FC<UserKeyFormProps> = ({ keyId }) => {
    const navItems = datastoreNavItems();
    const { t: tCommon } = useTranslation("Common");

    /* Mode edition ? */
    const editMode = useMemo(() => !!keyId, [keyId]);

    // La cle d'acces en mode edition
    const { data: key, isLoading: isLoadingKey } = useQuery<UserKeyDetailedWithAccessesResponseDto | undefined>({
        queryKey: RQKeys.my_key(keyId ?? ""),
        queryFn: ({ signal }) => {
            if (keyId) {
                return api.user.getMyKeyDetailedWithAccesses(keyId, { signal });
            }
            return Promise.resolve(undefined);
        },
        enabled: editMode,
        staleTime: 3600000,
    });

    // Les cles d'acces (recuperee car le nom des cles doit etre unique)
    const { data: keys, isLoading: isLoadingKeys } = useQuery<UserKeyResponseDto[]>({
        queryKey: RQKeys.my_keys(),
        queryFn: ({ signal }) => api.user.getMyKeys({ signal }),
        staleTime: 3600000,
    });

    // Les permissions
    const { data: permissions, isLoading: isLoadingPermissions } = useQuery<PermissionWithOfferingsDetailsResponseDto[]>({
        queryKey: RQKeys.my_permissions(),
        queryFn: ({ signal }) => api.user.getMyPermissions({ signal }),
        staleTime: 3600000,
    });

    /* Le nom de la cle */
    const keyName = useMemo(() => {
        return key?.name ?? "";
    }, [key]);

    /* Les noms de toutes les cles */
    const keyNames = useMemo<string[]>(() => {
        if (!keys) return [];
        return Array.from(keys, (key) => {
            return key.name;
        });
    }, [keys]);

    /* Y-a-t-il deja une cle OAUTH2 */
    const hasOauth2 = useMemo(() => {
        const f = keys?.find((key) => key.type === UserKeyResponseDtoTypeEnum.OAUTH2);
        return !!f;
    }, [keys]);

    /**
     * On filtre les permissions avec les conditions suivantes :
     *  - La date de fin est non definie ou superieure a la date du jour
     *  - S'il possède une clé de type OAUTH2, on prend uniquement celles dont only_oauth === false
     */
    const filteredPermissions = useMemo(() => {
        return (
            permissions?.filter((permission) => {
                const isValid = permission.end_date === undefined || compareAsc(new Date(permission.end_date), new Date()) > 0;
                return hasOauth2 ? isValid && permission.only_oauth === false : isValid;
            }) ?? []
        );
    }, [permissions, hasOauth2]);

    const STEPS = {
        ACCESSIBLE_SERVICES: 1,
        SECURITY_OPTIONS: 2,
    };

    const schema = {};
    schema[STEPS.ACCESSIBLE_SERVICES] = yup.lazy(() => {
        return getServicesSchema(editMode, keyName, keyNames);
    });
    schema[STEPS.SECURITY_OPTIONS] = yup.lazy(() => {
        return getSecurityOptionsSchema(editMode, keyType);
    });

    /* l'etape courante */
    const [currentStep, setCurrentStep] = useState(STEPS.ACCESSIBLE_SERVICES);

    const defaultValues = useMemo(() => {
        if (key === undefined) return UserKeyDefaultValues;
        return getDefaultValues(editMode, key);
    }, [editMode, key]);

    // Formulaire
    const form = useForm<KeyFormValuesType>({
        mode: "onChange",
        resolver: yupResolver(schema[currentStep]),
        values: defaultValues,
    });

    const { getValues: getFormValues, trigger, watch } = form;
    const keyType = watch("type");

    // TODO SUPPRIMER
    /*useEffect(() => {
        watch((value, { name, type }) => console.log(value, name, type));
    }, [watch]); */

    const previousStep = () => setCurrentStep((currentStep) => currentStep - 1);
    const nextStep = async () => {
        const isStepValid = await trigger(undefined, { shouldFocus: true }); // demande de valider le formulaire
        if (!isStepValid) return;

        if (currentStep < Object.values(STEPS).length) {
            setCurrentStep((currentStep) => currentStep + 1);
            return;
        }

        const values = createRequestBody(editMode, getFormValues());
        editMode ? mutateUpdate(values) : mutateAdd(values);
    };

    const queryClient = useQueryClient();

    /* Ajout d'une cle */
    const {
        status: addKeyStatus,
        error: addKeyError,
        mutate: mutateAdd,
    } = useMutation({
        mutationFn: (values: object) => api.user.addKey(values),
        onSuccess(keyWithAccesses) {
            queryClient.setQueryData<UserKeyWithAccessesResponseDto[]>(RQKeys.my_keys(), (keys) => {
                keys?.push(keyWithAccesses);
                return keys;
            });
            routes.my_access_keys().push();
        },
    });

    /* Modification d'une cle */
    const {
        status: updatekeyStatus,
        error: updatekeyError,
        mutate: mutateUpdate,
    } = useMutation<UserKeyWithAccessesResponseDto | null, CartesApiException, object>({
        mutationFn: (datas) => {
            if (key) return api.user.updateKey(key._id, datas);
            return Promise.resolve(null);
        },
        onSuccess(keyWithAccesses) {
            if (keyWithAccesses) {
                queryClient.setQueryData<UserKeyWithAccessesResponseDto[]>(RQKeys.my_keys(), (keys) => {
                    const newKeys = keys?.filter((k) => k._id !== keyWithAccesses._id) || [];
                    newKeys.push(keyWithAccesses);
                    return newKeys;
                });
            }

            if (keyId && keyWithAccesses) {
                queryClient.setQueryData<UserKeyWithAccessesResponseDto>(RQKeys.my_key(keyId), keyWithAccesses);
            }
            routes.my_access_keys().push();
        },
    });

    return (
        <AppLayout documentTitle={t("title", { keyId: keyId })} navItems={navItems}>
            <h1>{t("title", { keyId: keyId })}</h1>
            {(addKeyStatus === "pending" || updatekeyStatus === "pending") && (
                <Wait>
                    <div className={fr.cx("fr-container")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <i className={cx(fr.cx("fr-icon-refresh-line", "fr-icon--lg", "fr-mr-2v"), "frx-icon-spin")} />
                            <h6 className={fr.cx("fr-m-0")}>{addKeyStatus === "pending" ? tCommon("adding") : tCommon("modifying")}</h6>
                        </div>
                    </div>
                </Wait>
            )}
            {addKeyError && <Alert severity="warning" closable title={tCommon("error")} description={addKeyError.message} />}
            {updatekeyError && <Alert severity="warning" closable title={tCommon("error")} description={updatekeyError.message} />}
            {isLoadingKey || isLoadingKeys || isLoadingPermissions ? (
                <LoadingText />
            ) : filteredPermissions.length === 0 ? (
                <Alert severity="warning" closable={false} title={tCommon("warning")} description={t("no_permission")} />
            ) : editMode === true && key === undefined ? (
                <Alert severity="error" closable={false} title={tCommon("error")} description={t("key_not_found")} />
            ) : (
                <>
                    <Stepper
                        currentStep={currentStep}
                        stepCount={Object.values(STEPS).length}
                        nextTitle={currentStep < STEPS.SECURITY_OPTIONS && t("step", { num: currentStep + 1 })}
                        title={t("step", { num: currentStep })}
                    />
                    <ServicesForm form={form} permissions={filteredPermissions} visible={currentStep === STEPS.ACCESSIBLE_SERVICES} />
                    <SecurityOptionsForm editMode={editMode} form={form} visible={currentStep === STEPS.SECURITY_OPTIONS} hasOauth2={hasOauth2} />
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
                                children: currentStep < Object.values(STEPS).length ? tCommon("next_step") : editMode ? tCommon("modify") : tCommon("add"),
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

export default UserKeyForm;
