import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/SelectNext";
import Stepper from "@codegouvfr/react-dsfr/Stepper";
import { yupResolver } from "@hookform/resolvers/yup";
import { skipToken, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, useCallback, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import * as yup from "yup";

import { OfferingTypeEnum, type PyramidRaster, type Service } from "@/@types/app";
import type { ConfigurationWmsVectorDetailsContent } from "@/@types/entrepot";
import Main from "@/components/Layout/Main";
import LoadingText from "@/components/Utils/LoadingText";
import Wait from "@/components/Utils/Wait";
import ZoomRange from "@/components/Utils/ZoomRange";
import olDefaults from "@/data/ol-defaults.json";
import useServiceQuery from "@/hooks/queries/useServiceQuery";
import useScrollToTopEffect from "@/hooks/useScrollToTopEffect";
import { useTranslation } from "@/i18n/i18n";
import RQKeys from "@/modules/entrepot/RQKeys";
import { ApiError } from "@/modules/jsonFetch";
import { getApiErrorMessage } from "@/modules/apiError";
import { bboxToWkt, regex } from "@/utils";
import { isOfferingUnavailable } from "@/utils/offering";
import api from "../../../../api";

const STEPS = {
    TECHNICAL_NAME: 1,
    ZOOM_RANGE: 2,
};

type PyramidRasterGenerateFormType = {
    wmsv_offering_id: string;
    technical_name: string;
    zoom_range: number[];
    email_notification: boolean;
};

type PyramidRasterGenerateFormProps = {
    datastoreId: string;
    datasheetName: string;
    /** flux WMS-V présélectionné */
    offeringId?: string;
};
const PyramidRasterGenerateForm: FC<PyramidRasterGenerateFormProps> = ({ datastoreId, datasheetName, offeringId }) => {
    const navigate = useNavigate();
    const { t } = useTranslation("PyramidRasterGenerateForm");
    const { t: tCommon } = useTranslation("Common");

    const [currentStep, setCurrentStep] = useState(STEPS.TECHNICAL_NAME);

    const datasheetView = {
        to: "/tableau-de-bord/entrepots/$datastoreId/donnees/$datasheetName/nouvelle-vue",
        params: { datastoreId, datasheetName },
    } as const;

    // même requête que l’onglet Flux : servie par le cache
    const serviceListQuery = useQuery<Service[], ApiError>({
        queryKey: RQKeys.datastore_datasheet_service_list(datastoreId, datasheetName),
        queryFn: ({ signal }) => api.datasheet.getServices(datastoreId, datasheetName, { signal }),
        staleTime: 60000,
        retry: false,
    });
    const wmsvServices = useMemo(
        () => (serviceListQuery.data ?? []).filter((service) => service.type === OfferingTypeEnum.WMSVECTOR && !isOfferingUnavailable(service.status)),
        [serviceListQuery.data]
    );

    const queryClient = useQueryClient();

    const schemas: Record<number, yup.AnyObjectSchema> = {};
    schemas[STEPS.TECHNICAL_NAME] = yup.object({
        // flux présélectionné par l’URL mais indisponible : refusé comme un choix vide
        wmsv_offering_id: yup
            .string()
            .required(t("wmsv_service.error.mandatory"))
            .oneOf(
                wmsvServices.map((service) => service._id),
                t("wmsv_service.error.mandatory")
            ),
        technical_name: yup
            .string()
            .typeError(t("technical_name.error.mandatory"))
            .required(t("technical_name.error.mandatory"))
            .matches(regex.technical_name, t("technical_name.error.regex")),
    });

    schemas[STEPS.ZOOM_RANGE] = yup.object({
        zoom_range: yup
            .array()
            .of(
                yup
                    .number()
                    .min(olDefaults.zoom_levels.TOP, t("zoom_range.bounds_error", { min: olDefaults.zoom_levels.TOP, max: olDefaults.zoom_levels.BOTTOM }))
                    .max(olDefaults.zoom_levels.BOTTOM, t("zoom_range.bounds_error", { min: olDefaults.zoom_levels.TOP, max: olDefaults.zoom_levels.BOTTOM }))
            )
            .length(2, t("zoom_range.error"))
            .required(t("zoom_range.error")),
    });

    const form = useForm<PyramidRasterGenerateFormType>({
        resolver: yupResolver(schemas[currentStep]),
        mode: "onChange",
        defaultValues: {
            wmsv_offering_id: offeringId ?? "",
            technical_name: "",
            zoom_range: [4, 16],
            email_notification: true,
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
    const selectedOfferingId = watch("wmsv_offering_id");

    const serviceQuery = useServiceQuery(datastoreId, selectedOfferingId, selectedOfferingId === "" ? { queryFn: skipToken } : undefined);
    const bbox = (serviceQuery.data?.configuration.type_infos as ConfigurationWmsVectorDetailsContent | undefined)?.bbox;

    const generatePyramidRasterMutation = useMutation<PyramidRaster, ApiError>({
        mutationFn: () => {
            const formData = {
                ...getFormValues(),
                wmsv_config_bbox: bboxToWkt(bbox!),
            };

            return api.pyramidRaster.add(datastoreId, formData);
        },
        onSuccess() {
            void queryClient.invalidateQueries({ queryKey: RQKeys.datastore_datasheet(datastoreId, datasheetName) });
            void queryClient.invalidateQueries({ queryKey: RQKeys.datastore_processing_execution_list(datastoreId) });
            void navigate({ ...datasheetView, search: { activeTab: "dataset" } });
        },
    });

    const { mutate: generatePyramidRaster } = generatePyramidRasterMutation;

    useScrollToTopEffect(currentStep);

    const previousStep = useCallback(() => setCurrentStep((currentStep) => currentStep - 1), []);

    const nextStep = useCallback(async () => {
        const isStepValid = await trigger(undefined, { shouldFocus: true }); // demande de valider le formulaire
        if (!isStepValid) return; // ne fait rien si formulaire invalide
        // l’emprise à moissonner vient du flux choisi
        if (bbox === undefined) return;
        if (currentStep < Object.values(STEPS).length) {
            // on passe à la prochaine étape du formulaire
            setCurrentStep((currentStep) => currentStep + 1);
        } else {
            // on est à la dernière étape du formulaire donc on envoie la sauce
            generatePyramidRaster();
        }
    }, [currentStep, generatePyramidRaster, trigger, bbox]);

    const renderContent = () => {
        if (serviceListQuery.isPending) {
            return <LoadingText as="p" message={t("wmsv-service.loading")} withSpinnerIcon />;
        }

        if (serviceListQuery.isError) {
            return (
                <Alert
                    severity="error"
                    closable={false}
                    title={t("wmsv-service.fetch_failed")}
                    description={
                        <>
                            <p>{getApiErrorMessage(serviceListQuery.error)}</p>
                            <Button linkProps={{ ...datasheetView, search: { activeTab: "services" } }}>{t("back_to_datasheet")}</Button>
                        </>
                    }
                />
            );
        }

        if (wmsvServices.length === 0) {
            return (
                <Alert
                    severity="info"
                    closable={false}
                    title={t("no_wmsv_service.title")}
                    description={
                        <>
                            <p>{t("no_wmsv_service.description")}</p>
                            <Button
                                linkProps={{
                                    to: "/tableau-de-bord/entrepots/$datastoreId/donnees/$datasheetName/flux/ajout",
                                    params: { datastoreId, datasheetName },
                                    search: { type: "wms" },
                                }}
                            >
                                {t("no_wmsv_service.create_service")}
                            </Button>
                        </>
                    }
                />
            );
        }

        return (
            <>
                <Stepper
                    currentStep={currentStep}
                    stepCount={Object.values(STEPS).length}
                    nextTitle={currentStep < STEPS.ZOOM_RANGE && t("step.title", { stepNumber: currentStep + 1 })}
                    title={t("step.title", { stepNumber: currentStep })}
                />

                {generatePyramidRasterMutation.error && (
                    <Alert closable description={getApiErrorMessage(generatePyramidRasterMutation.error)} severity="error" title={tCommon("error")} />
                )}

                <div className={fr.cx(currentStep !== STEPS.TECHNICAL_NAME && "fr-hidden")}>
                    <Select
                        label={t("wmsv_service.label")}
                        placeholder={t("wmsv_service.placeholder")}
                        options={wmsvServices.map((service) => ({ value: service._id, label: `${service.configuration.name} - ${service.layer_name}` }))}
                        state={errors.wmsv_offering_id?.message !== undefined ? "error" : "default"}
                        stateRelatedMessage={errors.wmsv_offering_id?.message}
                        nativeSelectProps={register("wmsv_offering_id")}
                    />
                    {serviceQuery.isError ? (
                        <Alert
                            className={fr.cx("fr-mb-3w")}
                            severity="error"
                            small
                            description={`${t("wmsv-service.fetch_failed")} : ${getApiErrorMessage(serviceQuery.error)}`}
                        />
                    ) : (
                        serviceQuery.isSuccess &&
                        bbox === undefined && <Alert className={fr.cx("fr-mb-3w")} severity="error" small description={t("wmsv-service.bbox_not_found")} />
                    )}

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
                    <hr className={fr.cx("fr-mt-3w")} />
                    <Checkbox
                        options={[
                            {
                                label: tCommon("email_notification"),
                                nativeInputProps: {
                                    ...register("email_notification"),
                                },
                            },
                        ]}
                    />
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
                            onClick: () => void nextStep(),
                        },
                    ]}
                    inlineLayoutWhen="always"
                />
            </>
        );
    };

    return (
        <Main title={`${t("title")} - ${datasheetName}`} breadcrumbSeparator>
            <h1 className={fr.cx("fr-mb-1w")}>{t("title")}</h1>
            <p className={fr.cx("fr-text--sm")}>{tCommon("mandatory_fields")}</p>
            {renderContent()}
            {generatePyramidRasterMutation.isPending && (
                <Wait>
                    <LoadingText as="h6" message={t("generate.in_progress")} withSpinnerIcon />
                </Wait>
            )}
        </Main>
    );
};

export default PyramidRasterGenerateForm;
