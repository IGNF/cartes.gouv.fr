import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import Stepper from "@codegouvfr/react-dsfr/Stepper";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format as datefnsFormat } from "date-fns";
import { declareComponentKeys } from "i18nifty";
import { FC, useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import api from "../../../api";
import DatastoreLayout from "../../../components/Layout/DatastoreLayout";
import LoadingIcon from "../../../components/Utils/LoadingIcon";
import LoadingText from "../../../components/Utils/LoadingText";
import Wait from "../../../components/Utils/Wait";
import { Translations, useTranslation } from "../../../i18n/i18n";
import RQKeys from "../../../modules/RQKeys";
import { CartesApiException } from "../../../modules/jsonFetch";
import { routes } from "../../../router/router";
import { EndpointTypeEnum, Pyramid, Service, ServiceFormValuesBaseType } from "../../../types/app";
import { ConfigurationWmtsTmsDetailsContent } from "../../../types/entrepot";
import { getProjectionCode, removeDiacritics } from "../../../utils";
import AccessRestrictions from "../AccessRestrictions";
import { CommonSchemasValidation } from "../common-schemas-validation";
import AdditionalInfo from "../metadatas/AdditionalInfo";
import Description, { getEndpointSuffix } from "../metadatas/Description";
import UploadMDFile from "../metadatas/UploadMDFile";

type PyramidVectorTmsServiceFormValuesType = ServiceFormValuesBaseType;

const STEPS = {
    METADATAS_UPLOAD: 1,
    METADATAS_DESCRIPTION: 2,
    METADATAS_ADDITIONALINFORMATIONS: 3,
    ACCESSRESTRICTIONS: 4,
};

type PyramidVectorTmsServiceFormProps = {
    datastoreId: string;
    pyramidId: string;
    offeringId?: string;
};

const PyramidVectorTmsServiceForm: FC<PyramidVectorTmsServiceFormProps> = ({ datastoreId, pyramidId, offeringId }) => {
    const { t } = useTranslation("PyramidVectorTmsServiceForm");
    const { t: tCommon } = useTranslation("Common");

    const editMode = useMemo(() => !!offeringId, [offeringId]);

    /* l'etape courante */
    const [currentStep, setCurrentStep] = useState(STEPS.METADATAS_UPLOAD);

    const queryClient = useQueryClient();

    const createServiceMutation = useMutation<Service, CartesApiException>({
        mutationFn: () => {
            const formValues = getFormValues();
            return api.pyramid.publish(datastoreId, pyramidId, formValues);
        },
        onSuccess() {
            if (pyramidQuery.data?.tags?.datasheet_name) {
                queryClient.invalidateQueries({
                    queryKey: RQKeys.datastore_datasheet(datastoreId, pyramidQuery.data?.tags.datasheet_name),
                });
                routes.datastore_datasheet_view({ datastoreId, datasheetName: pyramidQuery.data?.tags.datasheet_name, activeTab: "services" }).push();
            } else {
                routes.datasheet_list({ datastoreId }).push();
            }
        },
    });

    const editServiceMutation = useMutation<Service, CartesApiException>({
        mutationFn: () => {
            if (offeringId === undefined) {
                return Promise.reject();
            }

            const formValues = getFormValues();

            return api.pyramid.publishEdit(datastoreId, pyramidId, offeringId, formValues);
        },
        onSuccess() {
            if (pyramidQuery.data?.tags?.datasheet_name) {
                queryClient.invalidateQueries({
                    queryKey: RQKeys.datastore_datasheet(datastoreId, pyramidQuery.data?.tags.datasheet_name),
                });
                routes.datastore_datasheet_view({ datastoreId, datasheetName: pyramidQuery.data?.tags.datasheet_name, activeTab: "services" }).push();
            } else {
                routes.datasheet_list({ datastoreId }).push();
            }
        },
    });

    const pyramidQuery = useQuery({
        queryKey: RQKeys.datastore_stored_data(datastoreId, pyramidId),
        queryFn: () => api.storedData.get<Pyramid>(datastoreId, pyramidId),
        staleTime: Infinity,
        enabled: !(createServiceMutation.isPending || editServiceMutation.isPending),
    });

    const offeringsQuery = useQuery({
        queryKey: RQKeys.datastore_offering_list(datastoreId),
        queryFn: () => api.service.getOfferings(datastoreId),
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

    const commonValidation = useMemo(() => new CommonSchemasValidation(offeringsQuery.data), [offeringsQuery.data]);

    // Definition du schema
    const schemas = {};
    schemas[STEPS.METADATAS_UPLOAD] = commonValidation.getMDUploadFileSchema();
    schemas[STEPS.METADATAS_DESCRIPTION] = commonValidation.getMDDescriptionSchema(editMode, offeringQuery.data?.configuration.layer_name);
    schemas[STEPS.METADATAS_ADDITIONALINFORMATIONS] = commonValidation.getMDAdditionalInfoSchema();
    schemas[STEPS.ACCESSRESTRICTIONS] = commonValidation.getAccessRestrictionSchema();

    const defaultValues: PyramidVectorTmsServiceFormValuesType = useMemo(() => {
        let defValues: PyramidVectorTmsServiceFormValuesType;
        const now = datefnsFormat(new Date(), "yyyy-MM-dd");

        if (editMode) {
            const share_with = offeringQuery.data?.open === true ? "all_public" : "your_community";
            const typeInfos = offeringQuery.data?.configuration?.type_infos as ConfigurationWmtsTmsDetailsContent | undefined;

            defValues = {
                technical_name: offeringQuery.data?.configuration.layer_name,
                public_name: typeInfos?.title,
                share_with,
                // TODO : à récupérer depuis les métadonnées
                creation_date: now,
                resource_genealogy: "",
                email_contact: "",
                organization: "",
                organization_email: "",
                category: [],
                description: "",
                identifier: "",
                charset: "utf8",
                attribution_text: offeringQuery.data?.configuration.attribution?.title,
                attribution_url: offeringQuery.data?.configuration.attribution?.url,
            };
        } else {
            const suffix = getEndpointSuffix(EndpointTypeEnum.WMSVECTOR);
            const storedDataName = pyramidQuery.data?.name ?? "";
            const nice = removeDiacritics(storedDataName.toLowerCase()).replace(/ /g, "_");

            defValues = {
                technical_name: `${nice}_${suffix}`,
                public_name: storedDataName,
                creation_date: now,
                resource_genealogy: "",
                charset: "utf8",
            };
        }

        let projUrl = "";
        const projCode = getProjectionCode(pyramidQuery.data?.srs);
        if (projCode) {
            projUrl = `http://www.opengis.net/def/crs/EPSG/0/${projCode}`;
        }

        defValues = {
            ...defValues,
            projection: projUrl,
            languages: [{ language: "français", code: "fra" }],
        };

        return defValues;
    }, [editMode, pyramidQuery.data, offeringQuery.data]);

    const form = useForm<PyramidVectorTmsServiceFormValuesType>({
        resolver: yupResolver(schemas[currentStep]),
        mode: "onChange",
        values: defaultValues,
    });

    const { getValues: getFormValues, trigger } = form;

    // Etape precedente
    const previousStep = useCallback(() => setCurrentStep((currentStep) => currentStep - 1), []);

    // Etape suivante
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

            {pyramidQuery.isLoading || offeringQuery.isLoading ? (
                <LoadingText as="h2" message={editMode ? t("stored_data_and_offering.loading") : t("stored_data.loading")} />
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

                    <UploadMDFile visible={currentStep === STEPS.METADATAS_UPLOAD} form={form} />
                    <Description visible={currentStep === STEPS.METADATAS_DESCRIPTION} form={form} />
                    <AdditionalInfo
                        datastoreId={datastoreId}
                        storedData={pyramidQuery.data}
                        visible={currentStep === STEPS.METADATAS_ADDITIONALINFORMATIONS}
                        form={form}
                    />
                    <AccessRestrictions
                        datastoreId={datastoreId}
                        endpointType={EndpointTypeEnum.WMTSTMS}
                        visible={currentStep === STEPS.ACCESSRESTRICTIONS}
                        form={form}
                    />

                    <ButtonsGroup
                        className={fr.cx("fr-mt-2w")}
                        alignment="between"
                        buttons={[
                            {
                                children: t("previous_step"),
                                iconId: "fr-icon-arrow-left-fill",
                                priority: "tertiary",
                                onClick: previousStep,
                                disabled: currentStep === STEPS.METADATAS_UPLOAD,
                            },
                            {
                                children: currentStep < Object.values(STEPS).length ? t("continue") : t("publish"),
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

export default PyramidVectorTmsServiceForm;

export const { i18n } = declareComponentKeys<
    | { K: "title"; P: { editMode: boolean }; R: string }
    | "stored_data.loading"
    | "stored_data_and_offering.loading"
    | "stored_data.fetch_failed"
    | "offering.fetch_failed"
    | { K: "step.title"; P: { stepNumber: number }; R: string }
    | "previous_step"
    | "continue"
    | "publish"
    | "publish.in_progress"
    | "modify.in_progress"
    | "back_to_data_list"
>()({
    PyramidVectorTmsServiceForm,
});

export const PyramidVectorTmsServiceFormFrTranslations: Translations<"fr">["PyramidVectorTmsServiceForm"] = {
    title: ({ editMode }) => (editMode ? "Modifier le service TMS" : "Publier un service TMS"),
    "stored_data.loading": "Chargement de la donnée stockée...",
    "stored_data_and_offering.loading": "Chargement de la donnée stockée et le service à modifier...",
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
                return "Restrictions d'accès";

            default:
                return "";
        }
    },
    previous_step: "Étape précédente",
    continue: "Continuer",
    publish: "Publier le service maintenant",
    "publish.in_progress": "Création du service TMS en cours",
    "modify.in_progress": "Modification des informations du service TMS en cours",
    back_to_data_list: "Retour à mes données",
};

export const PyramidVectorTmsServiceFormEnTranslations: Translations<"en">["PyramidVectorTmsServiceForm"] = {
    title: undefined,
    "stored_data.loading": undefined,
    "stored_data_and_offering.loading": undefined,
    "stored_data.fetch_failed": undefined,
    "offering.fetch_failed": undefined,
    "step.title": undefined,
    previous_step: undefined,
    continue: undefined,
    publish: undefined,
    "publish.in_progress": undefined,
    "modify.in_progress": undefined,
    back_to_data_list: undefined,
};
