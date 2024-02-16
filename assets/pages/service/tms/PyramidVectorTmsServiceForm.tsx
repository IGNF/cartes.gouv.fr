import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import Stepper from "@codegouvfr/react-dsfr/Stepper";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format as datefnsFormat } from "date-fns";
import { FC, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import api from "../../../api";
import DatastoreLayout from "../../../components/Layout/DatastoreLayout";
import LoadingText from "../../../components/Utils/LoadingText";
import Wait from "../../../components/Utils/Wait";
import RQKeys from "../../../modules/RQKeys";
import Translator from "../../../modules/Translator";
import { CartesApiException } from "../../../modules/jsonFetch";
import { routes } from "../../../router/router";
import { EndpointTypeEnum, Pyramid, Service, ServiceFormValuesBaseType } from "../../../types/app";
import { getProjectionCode, removeDiacritics } from "../../../utils";
import AccessRestrictions from "../AccessRestrictions";
import { CommonSchemasValidation } from "../common-schemas-validation";
import AdditionalInfo from "../metadatas/AdditionalInfo";
import Description, { getEndpointSuffix } from "../metadatas/Description";
import UploadMDFile from "../metadatas/UploadMDFile";

type PyramidVectorTmsServiceFormValuesType = ServiceFormValuesBaseType;

const STEPS = {
    MD_UPLOAD_FILE: 1,
    MD_DESCRIPTION: 2,
    MD_ADDITIONNAL_INFOS: 3,
    ACCESS_RESTRICTIONS: 4,
};

type PyramidVectorTmsServiceFormProps = {
    datastoreId: string;
    pyramidId: string;
};

const PyramidVectorTmsServiceForm: FC<PyramidVectorTmsServiceFormProps> = ({ datastoreId, pyramidId }) => {
    /* l'etape courante */
    const [currentStep, setCurrentStep] = useState(STEPS.MD_UPLOAD_FILE);

    const queryClient = useQueryClient();

    const pyramidQuery = useQuery({
        queryKey: RQKeys.datastore_stored_data(datastoreId, pyramidId),
        queryFn: () => api.storedData.get<Pyramid>(datastoreId, pyramidId),
        staleTime: 600000,
    });

    const offeringsQuery = useQuery({
        queryKey: RQKeys.datastore_offering_list(datastoreId),
        queryFn: () => api.service.getOfferings(datastoreId),
        refetchInterval: 10000,
    });

    const commonValidation = useMemo(() => new CommonSchemasValidation(offeringsQuery.data), [offeringsQuery.data]);

    // Definition du schema
    const schemas = {};
    schemas[STEPS.MD_UPLOAD_FILE] = commonValidation.getMDUploadFileSchema();
    schemas[STEPS.MD_DESCRIPTION] = commonValidation.getMDDescriptionSchema();
    schemas[STEPS.MD_ADDITIONNAL_INFOS] = commonValidation.getMDAdditionalInfoSchema();
    schemas[STEPS.ACCESS_RESTRICTIONS] = commonValidation.getAccessRestrictionSchema();

    const defaultValues: PyramidVectorTmsServiceFormValuesType = useMemo(() => {
        let defValues: PyramidVectorTmsServiceFormValuesType;
        const now = datefnsFormat(new Date(), "yyyy-MM-dd");

        const suffix = getEndpointSuffix(EndpointTypeEnum.WMTSTMS);
        const storedDataName = pyramidQuery.data?.name ?? "";
        const nice = removeDiacritics(storedDataName.toLowerCase()).replace(/ /g, "_");

        defValues = {
            technical_name: `${nice}_${suffix}`,
            public_name: storedDataName,
            creation_date: now,
            resource_genealogy: "",
            charset: "utf8",
            languages: [{ language: "français", code: "fra" }],
        };

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
    }, [pyramidQuery.data]);

    const form = useForm<PyramidVectorTmsServiceFormValuesType>({
        resolver: yupResolver(schemas[currentStep]),
        mode: "onChange",
        values: defaultValues,
    });

    const { getValues: getFormValues, trigger } = form;

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

    // Etape precedente
    const previousStep = () => setCurrentStep((currentStep) => currentStep - 1);

    // Etape suivante
    const nextStep = async () => {
        const isStepValid = await trigger(undefined, { shouldFocus: true }); // demande de valider le formulaire

        if (!isStepValid) return;

        if (currentStep < Object.values(STEPS).length) {
            setCurrentStep((currentStep) => currentStep + 1);
            return;
        }

        createServiceMutation.mutate();
    };

    return (
        <DatastoreLayout datastoreId={datastoreId} documentTitle={Translator.trans("service.tms.new.title")}>
            <h1>{Translator.trans("service.tms.new.title")}</h1>

            {pyramidQuery.isLoading ? (
                <LoadingText message={Translator.trans("service.tms.new.loading_stored_data")} />
            ) : pyramidQuery.data === undefined ? (
                <Alert
                    severity="error"
                    closable={false}
                    title="Récupération des informations sur la donnée stockée a échoué"
                    description={<Button linkProps={routes.datasheet_list({ datastoreId }).link}>Retour à mes données</Button>}
                />
            ) : (
                <>
                    <Stepper
                        currentStep={currentStep}
                        stepCount={Object.values(STEPS).length}
                        nextTitle={currentStep < STEPS.ACCESS_RESTRICTIONS && Translator.trans(`service.tms.new.step${currentStep + 1}`)}
                        title={Translator.trans(`service.tms.new.step${currentStep}`)}
                    />
                    <UploadMDFile visible={currentStep === STEPS.MD_UPLOAD_FILE} form={form} />
                    <Description visible={currentStep === STEPS.MD_DESCRIPTION} form={form} />
                    <AdditionalInfo datastoreId={datastoreId} storedData={pyramidQuery.data} visible={currentStep === STEPS.MD_ADDITIONNAL_INFOS} form={form} />
                    <AccessRestrictions
                        datastoreId={datastoreId}
                        endpointType={EndpointTypeEnum.WMTSTMS}
                        visible={currentStep === STEPS.ACCESS_RESTRICTIONS}
                        form={form}
                    />
                    {createServiceMutation.error && (
                        <Alert
                            className="fr-preline"
                            closable
                            description={createServiceMutation.error.message}
                            severity="error"
                            title={Translator.trans("commons.error")}
                        />
                    )}
                    <ButtonsGroup
                        className={fr.cx("fr-mt-2w")}
                        alignment="between"
                        buttons={[
                            {
                                children: Translator.trans("previous_step"),
                                iconId: "fr-icon-arrow-left-fill",
                                priority: "tertiary",
                                onClick: previousStep,
                                disabled: currentStep === STEPS.MD_UPLOAD_FILE,
                            },
                            {
                                children:
                                    currentStep < Object.values(STEPS).length ? Translator.trans("continue") : Translator.trans("service.tms.new.publish"),
                                onClick: nextStep,
                            },
                        ]}
                        inlineLayoutWhen="always"
                    />
                </>
            )}
            {createServiceMutation.isPending && (
                <Wait>
                    <div className={fr.cx("fr-container")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <div className={fr.cx("fr-col-2")}>
                                <i className={fr.cx("fr-icon-refresh-line", "fr-icon--lg") + " frx-icon-spin"} />
                            </div>
                            <div className={fr.cx("fr-col-10")}>
                                <h6 className={fr.cx("fr-h6", "fr-m-0")}>{"Demande de publication d'un flux TMS en cours ..."}</h6>
                            </div>
                        </div>
                    </div>
                </Wait>
            )}
        </DatastoreLayout>
    );
};

export default PyramidVectorTmsServiceForm;
