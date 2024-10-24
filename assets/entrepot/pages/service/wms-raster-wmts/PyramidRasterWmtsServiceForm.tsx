import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import Stepper from "@codegouvfr/react-dsfr/Stepper";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { declareComponentKeys } from "i18nifty";
import { FC, useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { symToStr } from "tsafe/symToStr";

import { ConfigurationTypeEnum, EndpointTypeEnum, PyramidRaster, Service, ServiceFormValuesBaseType } from "../../../../@types/app";
import DatastoreLayout from "../../../../components/Layout/DatastoreLayout";
import LoadingIcon from "../../../../components/Utils/LoadingIcon";
import LoadingText from "../../../../components/Utils/LoadingText";
import Wait from "../../../../components/Utils/Wait";
import useScrollToTopEffect from "../../../../hooks/useScrollToTopEffect";
import { Translations, useTranslation } from "../../../../i18n/i18n";
import RQKeys from "../../../../modules/entrepot/RQKeys";
import { CartesApiException } from "../../../../modules/jsonFetch";
import { routes } from "../../../../router/router";
import api from "../../../api";
import AccessRestrictions from "../AccessRestrictions";
import { CommonSchemasValidation } from "../common-schemas-validation";
import { getPyramidRasterWmtsServiceFormDefaultValues } from "../default-values";
import AdditionalInfo from "../metadatas/AdditionalInfo";
import Description from "../metadatas/Description";
import UploadMDFile from "../metadatas/UploadMDFile";

const STEPS = {
    METADATA_UPLOAD: 1,
    METADATA_DESCRIPTION: 2,
    METADATA_ADDITIONALINFORMATIONS: 3,
    ACCESSRESTRICTIONS: 4,
};

const commonValidation = new CommonSchemasValidation();

type PyramidRasterWmtsServiceFormProps = {
    datastoreId: string;
    pyramidId: string;
    datasheetName: string;
    offeringId?: string;
};
const PyramidRasterWmtsServiceForm: FC<PyramidRasterWmtsServiceFormProps> = ({ datastoreId, pyramidId, datasheetName, offeringId }) => {
    const { t } = useTranslation("PyramidRasterWmtsServiceForm");
    const { t: tCommon } = useTranslation("Common");

    const editMode = useMemo(() => Boolean(offeringId), [offeringId]);

    const [currentStep, setCurrentStep] = useState(STEPS.METADATA_UPLOAD);

    const queryClient = useQueryClient();

    const createServiceMutation = useMutation<Service, CartesApiException>({
        mutationFn: () => {
            const formValues = getFormValues();
            return api.pyramidRaster.publishWmsRasterWmts(datastoreId, pyramidId, ConfigurationTypeEnum.WMTSTMS, formValues);
        },
        onSuccess() {
            queryClient.invalidateQueries({ queryKey: RQKeys.datastore_datasheet(datastoreId, datasheetName) });
            routes.datastore_datasheet_view({ datastoreId, datasheetName: datasheetName, activeTab: "services" }).push();
        },
    });

    const editServiceMutation = useMutation<Service, CartesApiException>({
        mutationFn: () => {
            if (offeringId === undefined) {
                return Promise.reject();
            }

            const formValues = getFormValues();
            return api.pyramidRaster.editWmsRasterWmts(datastoreId, pyramidId, offeringId, ConfigurationTypeEnum.WMTSTMS, formValues);
        },
        onSuccess() {
            if (offeringId !== undefined) {
                queryClient.removeQueries({ queryKey: RQKeys.datastore_offering(datastoreId, offeringId) });
            }

            queryClient.invalidateQueries({ queryKey: RQKeys.datastore_datasheet(datastoreId, datasheetName) });
            routes.datastore_datasheet_view({ datastoreId, datasheetName: datasheetName, activeTab: "services" }).push();
            queryClient.refetchQueries({ queryKey: RQKeys.datastore_metadata_by_datasheet_name(datastoreId, datasheetName) });
        },
    });

    const pyramidQuery = useQuery<PyramidRaster, CartesApiException>({
        queryKey: RQKeys.datastore_stored_data(datastoreId, pyramidId),
        queryFn: () => api.storedData.get<PyramidRaster>(datastoreId, pyramidId),
        staleTime: Infinity,
        enabled: !(createServiceMutation.isPending || editServiceMutation.isPending),
    });

    const existingLayerNamesQuery = useQuery<string[], CartesApiException>({
        queryKey: RQKeys.datastore_layernames_list(datastoreId, ConfigurationTypeEnum.WMTSTMS),
        queryFn: ({ signal }) => api.service.getExistingLayerNames(datastoreId, ConfigurationTypeEnum.WMTSTMS, { signal }),
        refetchInterval: 30000,
        enabled: !(createServiceMutation.isPending || editServiceMutation.isPending),
    });

    const offeringQuery = useQuery<Service | null, CartesApiException>({
        queryKey: RQKeys.datastore_offering(datastoreId, offeringId ?? "xxxx"),
        queryFn: ({ signal }) => {
            if (offeringId) {
                return api.service.getService(datastoreId, offeringId, { signal });
            }
            return Promise.resolve(null);
        },
        enabled: editMode && !(createServiceMutation.isPending || editServiceMutation.isPending),
        staleTime: Infinity,
    });

    const metadataQuery = useQuery({
        queryKey: RQKeys.datastore_metadata_by_datasheet_name(datastoreId, datasheetName),
        queryFn: ({ signal }) => api.metadata.getByDatasheetName(datastoreId, datasheetName, { signal }),
        enabled: !(createServiceMutation.isPending || editServiceMutation.isPending),
    });

    const schemas = {};
    schemas[STEPS.METADATA_UPLOAD] = commonValidation.getMDUploadFileSchema();
    schemas[STEPS.METADATA_DESCRIPTION] = commonValidation.getMDDescriptionSchema(
        existingLayerNamesQuery.data,
        editMode,
        offeringQuery.data?.configuration.layer_name
    );
    schemas[STEPS.METADATA_ADDITIONALINFORMATIONS] = commonValidation.getMDAdditionalInfoSchema();
    schemas[STEPS.ACCESSRESTRICTIONS] = commonValidation.getAccessRestrictionSchema();

    const defaultValues: ServiceFormValuesBaseType = useMemo(
        () => getPyramidRasterWmtsServiceFormDefaultValues(offeringQuery.data, editMode, pyramidQuery.data, metadataQuery.data),
        [editMode, offeringQuery.data, pyramidQuery.data, metadataQuery.data]
    );

    const form = useForm<ServiceFormValuesBaseType>({
        resolver: yupResolver(schemas[currentStep]),
        mode: "onChange",
        values: defaultValues,
    });

    const { getValues: getFormValues, trigger } = form;

    useScrollToTopEffect(currentStep);

    const previousStep = useCallback(() => setCurrentStep((currentStep) => currentStep - 1), []);

    const nextStep = useCallback(async () => {
        const isStepValid = await trigger(undefined, { shouldFocus: true }); // demande de valider le formulaire

        if (!isStepValid) return; // ne fait rien si formulaire invalide

        // formulaire est valide
        if (currentStep < Object.values(STEPS).length) {
            // on passe à la prochaine étape du formulaire
            setCurrentStep((currentStep) => currentStep + 1);
        } else {
            // on est à la dernière étape du formulaire donc on envoie la sauce
            if (editMode) {
                editServiceMutation.mutate();
            } else {
                createServiceMutation.mutate();
            }
        }
    }, [createServiceMutation, editServiceMutation, currentStep, trigger, editMode]);

    return (
        <DatastoreLayout datastoreId={datastoreId} documentTitle={t("title", { editMode })}>
            <h1>{t("title", { editMode })}</h1>

            {pyramidQuery.isLoading || offeringQuery.isLoading || metadataQuery.isLoading ? (
                <LoadingText as="h2" message={editMode ? t("stored_data_and_offering.loading") : t("stored_data.loading")} withSpinnerIcon={true} />
            ) : pyramidQuery.data === undefined ? (
                <Alert
                    severity="error"
                    closable={false}
                    title={t("stored_data.fetch_failed")}
                    description={
                        <>
                            <p>{pyramidQuery.error?.message}</p>
                            <Button linkProps={routes.datasheet_list({ datastoreId }).link}>{t("back_to_data_list")}</Button>
                        </>
                    }
                />
            ) : editMode === true && offeringQuery.data === undefined ? (
                <Alert
                    severity="error"
                    closable={false}
                    title={t("offering.fetch_failed")}
                    description={
                        <>
                            <p>{offeringQuery.error?.message}</p>
                            <Button linkProps={routes.datasheet_list({ datastoreId }).link}>{t("back_to_data_list")}</Button>
                        </>
                    }
                />
            ) : (
                <>
                    <Stepper
                        currentStep={currentStep}
                        stepCount={Object.values(STEPS).length}
                        nextTitle={currentStep < STEPS.ACCESSRESTRICTIONS && t("step.title", { stepNumber: currentStep + 1 })}
                        title={t("step.title", { stepNumber: currentStep })}
                    />
                    {createServiceMutation.error && (
                        <Alert closable description={createServiceMutation.error.message} severity="error" title={tCommon("error")} />
                    )}
                    {editServiceMutation.error && <Alert closable description={editServiceMutation.error.message} severity="error" title={tCommon("error")} />}

                    <UploadMDFile visible={currentStep === STEPS.METADATA_UPLOAD} form={form} />
                    <Description visible={currentStep === STEPS.METADATA_DESCRIPTION} form={form} editMode={editMode} />
                    <AdditionalInfo
                        datastoreId={datastoreId}
                        storedData={pyramidQuery.data}
                        visible={currentStep === STEPS.METADATA_ADDITIONALINFORMATIONS}
                        form={form}
                    />
                    <AccessRestrictions
                        datastoreId={datastoreId}
                        endpointType={EndpointTypeEnum.WMTSTMS}
                        visible={currentStep === STEPS.ACCESSRESTRICTIONS}
                        form={form}
                        service={offeringQuery.data}
                    />

                    <ButtonsGroup
                        className={fr.cx("fr-mt-2w")}
                        alignment="between"
                        buttons={[
                            {
                                children: tCommon("previous_step"),
                                iconId: "fr-icon-arrow-left-fill",
                                priority: "tertiary",
                                onClick: previousStep,
                                disabled: currentStep === STEPS.METADATA_UPLOAD,
                            },
                            {
                                children: currentStep < Object.values(STEPS).length ? tCommon("continue") : t("publish"),
                                onClick: nextStep,
                            },
                        ]}
                        inlineLayoutWhen="always"
                    />
                </>
            )}

            {(createServiceMutation.isPending || editServiceMutation.isPending) && (
                <Wait>
                    <div className={fr.cx("fr-container")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <div className={fr.cx("fr-col-2")}>
                                <LoadingIcon largeIcon={true} />
                            </div>
                            <div className={fr.cx("fr-col-10")}>
                                <h6 className={fr.cx("fr-h6", "fr-m-0")}>{editMode ? t("modify.in_progress") : t("publish.in_progress")}</h6>
                            </div>
                        </div>
                    </div>
                </Wait>
            )}
        </DatastoreLayout>
    );
};

PyramidRasterWmtsServiceForm.displayName = symToStr({ PyramidRasterWmtsServiceForm });

export default PyramidRasterWmtsServiceForm;

export const { i18n } = declareComponentKeys<
    | { K: "title"; P: { editMode: boolean }; R: string }
    | "stored_data.loading"
    | "stored_data_and_offering.loading"
    | "stored_data.fetch_failed"
    | "offering.fetch_failed"
    | { K: "step.title"; P: { stepNumber: number }; R: string }
    | "publish"
    | "publish.in_progress"
    | "modify.in_progress"
    | "back_to_data_list"
>()({
    PyramidRasterWmtsServiceForm,
});

export const PyramidRasterWmtsServiceFormFrTranslations: Translations<"fr">["PyramidRasterWmtsServiceForm"] = {
    title: ({ editMode }) => (editMode ? "Modifier le service WMTS" : "Publier un service WMTS"),
    "stored_data.loading": "Chargement de la donnée stockée",
    "stored_data_and_offering.loading": "Chargement de la donnée stockée et du service à modifier",
    "stored_data.fetch_failed": "Récupération des informations sur la donnée stockée a échoué",
    "offering.fetch_failed": "Récupération des informations sur le service à modifier a échoué",
    "step.title": ({ stepNumber }) => {
        switch (stepNumber) {
            case 1:
                return "Source des métadonnées";
            case 2:
                return "Description de la ressource";
            case 3:
                return "Informations supplémentaires";
            case 4:
                return "Restrictions d’accès";

            default:
                return "";
        }
    },
    publish: "Publier le service maintenant",
    "publish.in_progress": "Création du service WMTS en cours",
    "modify.in_progress": "Modification des informations du service WMTS en cours",
    back_to_data_list: "Retour à mes données",
};

export const PyramidRasterWmtsServiceFormEnTranslations: Translations<"en">["PyramidRasterWmtsServiceForm"] = {
    title: undefined,
    "stored_data.loading": undefined,
    "stored_data_and_offering.loading": undefined,
    "stored_data.fetch_failed": undefined,
    "offering.fetch_failed": undefined,
    "step.title": undefined,
    publish: undefined,
    "publish.in_progress": undefined,
    "modify.in_progress": undefined,
    back_to_data_list: undefined,
};
