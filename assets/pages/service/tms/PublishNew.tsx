import { useQuery } from "@tanstack/react-query";
import { FC, useMemo, useState } from "react";
import RQKeys from "../../../modules/RQKeys";
import api from "../../../api";
import { Pyramid } from "../../../types/app";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import DatastoreLayout from "../../../components/Layout/DatastoreLayout";
import Translator from "../../../modules/Translator";
import LoadingText from "../../../components/Utils/LoadingText";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { routes } from "../../../router/router";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import { fr } from "@codegouvfr/react-dsfr";
import Stepper from "@codegouvfr/react-dsfr/Stepper";
import UploadMDFile from "../metadatas/UploadMDFile";
import Description from "../metadatas/Description";
import AdditionalInfo from "../metadatas/AdditionalInfo";
import AccessRestrictions from "../AccessRestrictions";
import Wait from "../../../components/Utils/Wait";
import { CartesApiException } from "../../../modules/jsonFetch";
import { CommonSchemasValidation } from "../common-schemas-validation";

type PublishNewProps = {
    datastoreId: string;
    pyramidId: string;
};

const format = (values) => {
    const languages = values.languages.map((language) => language.code);

    const v = { ...values };
    v.languages = languages;
    delete v.metadata_file_content;

    return v;
};

const PublishNew: FC<PublishNewProps> = ({ datastoreId, pyramidId }) => {
    const STEPS = {
        MD_UPLOAD_FILE: 1,
        MD_DESCRIPTION: 2,
        MD_ADDITIONNAL_INFOS: 3,
        ACCESS_RESTRICTIONS: 4,
    };

    /* l'etape courante */
    const [currentStep, setCurrentStep] = useState(STEPS.MD_UPLOAD_FILE);

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [validationError, setValidationError] = useState<CartesApiException>();

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

    const form = useForm({
        resolver: yupResolver(schemas[currentStep]),
        mode: "onChange",
    });

    const { getValues: getFormValues, trigger } = form;

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

        setIsSubmitting(true);

        const values = format(getFormValues());
        api.pyramid
            .publish(datastoreId, pyramidId, values)
            .then(() => {
                if (pyramidQuery.data?.tags?.datasheet_name) {
                    routes.datastore_datasheet_view({ datastoreId, datasheetName: pyramidQuery.data?.tags.datasheet_name, activeTab: "dataset" }).push();
                } else {
                    routes.datasheet_list({ datastoreId }).push();
                }
            })
            .catch((error) => {
                setValidationError(error as CartesApiException);
            })
            .finally(() => {
                setIsSubmitting(false);
            });
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
                    <Description storedData={pyramidQuery.data} serviceType={"TMS"} visible={currentStep === STEPS.MD_DESCRIPTION} form={form} />
                    <AdditionalInfo datastoreId={datastoreId} storedData={pyramidQuery.data} visible={currentStep === STEPS.MD_ADDITIONNAL_INFOS} form={form} />
                    <AccessRestrictions datastoreId={datastoreId} endpointType={"WMTS-TMS"} visible={currentStep === STEPS.ACCESS_RESTRICTIONS} form={form} />
                    {validationError && (
                        <Alert
                            className="fr-preline"
                            closable
                            description={validationError.message}
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
            {isSubmitting && (
                <Wait>
                    <div className={fr.cx("fr-container")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <div className={fr.cx("fr-col-2")}>
                                <i className={fr.cx("fr-icon-refresh-line", "fr-icon--lg") + " icons-spin"} />
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

export default PublishNew;
