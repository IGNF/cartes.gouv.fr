import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import Input from "@codegouvfr/react-dsfr/Input";
import Stepper from "@codegouvfr/react-dsfr/Stepper";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";

import type { PyramidRaster, Service } from "../../../../../@types/app";
import type { ConfigurationWmsVectorDetailsContent } from "../../../../../@types/entrepot";
import LoadingIcon from "../../../../../components/Utils/LoadingIcon";
import LoadingText from "../../../../../components/Utils/LoadingText";
import Wait from "../../../../../components/Utils/Wait";
import ZoomRange from "../../../../../components/Utils/ZoomRange";
import olDefaults from "../../../../../data/ol-defaults.json";
import useScrollToTopEffect from "../../../../../hooks/useScrollToTopEffect";
import { useTranslation } from "../../../../../i18n/i18n";
import RQKeys from "../../../../../modules/entrepot/RQKeys";
import { CartesApiException } from "../../../../../modules/jsonFetch";
import { routes } from "../../../../../router/router";
import { bboxToWkt } from "../../../../../utils";
import api from "../../../../api";
import { DatasheetViewActiveTabEnum } from "../../../datasheet/DatasheetView/DatasheetView/DatasheetView";
import Main from "../../../../../components/Layout/Main";

const STEPS = {
    TECHNICAL_NAME: 1,
    ZOOM_RANGE: 2,
};

type PyramidRasterGenerateFormType = {
    technical_name: string;
    zoom_range: number[];
};

type PyramidRasterGenerateFormProps = {
    datastoreId: string;
    offeringId: string;
    datasheetName: string;
};
const PyramidRasterGenerateForm: FC<PyramidRasterGenerateFormProps> = ({ datastoreId, offeringId, datasheetName }) => {
    const { t } = useTranslation("PyramidRasterGenerateForm");
    const { t: tCommon } = useTranslation("Common");

    const [currentStep, setCurrentStep] = useState(STEPS.TECHNICAL_NAME);

    const serviceQuery = useQuery<Service, CartesApiException>({
        queryKey: RQKeys.datastore_offering(datastoreId, offeringId),
        queryFn: () => api.service.getService(datastoreId, offeringId),
        staleTime: 60000,
    });

    const queryClient = useQueryClient();

    const schemas = {};
    schemas[STEPS.TECHNICAL_NAME] = yup.object({
        technical_name: yup.string().typeError(t("technical_name.error.mandatory")).required(t("technical_name.error.mandatory")),
    });

    schemas[STEPS.ZOOM_RANGE] = yup.object({
        zoom_range: yup.array().of(yup.number()).length(2, t("zoom_range.error")).required(t("zoom_range.error")),
    });

    const form = useForm<PyramidRasterGenerateFormType>({
        resolver: yupResolver(schemas[currentStep]),
        mode: "onChange",
        defaultValues: {
            technical_name: "",
            zoom_range: [4, 16],
        },
    });

    const {
        register,
        trigger,
        getValues: getFormValues,
        setValue: setFormValue,
        formState: { errors },
        watch,
    } = form;

    const zoomRange = watch("zoom_range");

    const generatePyramidRasterMutation = useMutation<PyramidRaster, CartesApiException>({
        mutationFn: () => {
            const formData = {
                ...getFormValues(),
                wmsv_offering_id: offeringId,
                wmsv_config_bbox: bboxToWkt((serviceQuery.data?.configuration.type_infos as ConfigurationWmsVectorDetailsContent).bbox!),
            };

            return api.pyramidRaster.add(datastoreId, formData);
        },
        onSuccess() {
            queryClient.invalidateQueries({ queryKey: RQKeys.datastore_datasheet(datastoreId, datasheetName) });
            queryClient.invalidateQueries({ queryKey: RQKeys.datastore_processing_execution_list(datastoreId) });
            routes.datastore_datasheet_view({ datastoreId, datasheetName: datasheetName, activeTab: "dataset" }).push();
        },
    });

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
            generatePyramidRasterMutation.mutate();
        }
    }, [currentStep, generatePyramidRasterMutation, trigger]);

    return (
        <Main title={t("title")}>
            <h1>{t("title")}</h1>

            {serviceQuery.isLoading ? (
                <LoadingText as="h2" message={t("wmsv-service.loading")} />
            ) : serviceQuery.error !== null ? (
                <Alert
                    severity="error"
                    closable={false}
                    title={t("wmsv-service.fetch_failed")}
                    description={
                        <>
                            <p>{serviceQuery.error?.message}</p>
                            <Button
                                linkProps={routes.datastore_datasheet_view({ datastoreId, datasheetName, activeTab: DatasheetViewActiveTabEnum.Services }).link}
                            >
                                {t("back_to_datasheet")}
                            </Button>
                        </>
                    }
                />
            ) : (serviceQuery.data?.configuration.type_infos as ConfigurationWmsVectorDetailsContent).bbox === undefined ? (
                <Alert
                    severity="error"
                    closable={false}
                    title={t("wmsv-service.bbox_not_found")}
                    description={
                        <Button
                            linkProps={routes.datastore_datasheet_view({ datastoreId, datasheetName, activeTab: DatasheetViewActiveTabEnum.Services }).link}
                        >
                            {t("back_to_datasheet")}
                        </Button>
                    }
                />
            ) : (
                <>
                    <Stepper
                        currentStep={currentStep}
                        stepCount={Object.values(STEPS).length}
                        nextTitle={currentStep < STEPS.ZOOM_RANGE && t("step.title", { stepNumber: currentStep + 1 })}
                        title={t("step.title", { stepNumber: currentStep })}
                    />

                    <p>{tCommon("mandatory_fields")}</p>

                    {generatePyramidRasterMutation.error && (
                        <Alert closable description={generatePyramidRasterMutation.error.message} severity="error" title={tCommon("error")} />
                    )}

                    <div className={fr.cx(currentStep !== STEPS.TECHNICAL_NAME && "fr-hidden")}>
                        <h3>{t("technical_name.lead_text")}</h3>
                        <Input
                            label={t("technical_name.label")}
                            hintText={t("technical_name.explanation")}
                            nativeInputProps={{
                                ...register("technical_name"),
                            }}
                            state={errors.technical_name?.message !== undefined ? "error" : "default"}
                            stateRelatedMessage={errors.technical_name?.message}
                        />
                    </div>

                    <div className={fr.cx(currentStep !== STEPS.ZOOM_RANGE && "fr-hidden")}>
                        <h3>{t("zoom_range.lead_text")}</h3>
                        <p>{t("zoom_range.explanation")}</p>
                        {currentStep === STEPS.ZOOM_RANGE && (
                            <>
                                <ZoomRange
                                    min={olDefaults.zoom_levels.TOP}
                                    max={olDefaults.zoom_levels.BOTTOM}
                                    values={zoomRange}
                                    onChange={(values) => setFormValue("zoom_range", values)}
                                />
                                {errors.zoom_range?.message !== undefined && <p className={fr.cx("fr-error-text")}>{errors.zoom_range?.message}</p>}
                            </>
                        )}
                    </div>

                    <ButtonsGroup
                        className={fr.cx("fr-mt-2w")}
                        alignment="between"
                        buttons={[
                            {
                                children: tCommon("previous_step"),
                                iconId: "fr-icon-arrow-left-fill",
                                priority: "tertiary",
                                onClick: previousStep,
                                disabled: currentStep === STEPS.TECHNICAL_NAME,
                            },
                            {
                                children: currentStep < Object.values(STEPS).length ? tCommon("continue") : tCommon("publish"),
                                onClick: nextStep,
                            },
                        ]}
                        inlineLayoutWhen="always"
                    />
                </>
            )}

            {generatePyramidRasterMutation.isPending && (
                <Wait>
                    <div className={fr.cx("fr-container")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <div className={fr.cx("fr-col-2")}>
                                <LoadingIcon largeIcon={true} />
                            </div>
                            <div className={fr.cx("fr-col-10")}>
                                <h6 className={fr.cx("fr-h6", "fr-m-0")}>{t("generate.in_progress")}</h6>
                            </div>
                        </div>
                    </div>
                </Wait>
            )}
        </Main>
    );
};

export default PyramidRasterGenerateForm;
