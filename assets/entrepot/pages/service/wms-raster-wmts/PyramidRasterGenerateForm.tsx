import { fr } from "@codegouvfr/react-dsfr";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import Input from "@codegouvfr/react-dsfr/Input";
import Stepper from "@codegouvfr/react-dsfr/Stepper";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery } from "@tanstack/react-query";
import { declareComponentKeys } from "i18nifty";
import { FC, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";

import type { PyramidRaster, Service } from "../../../../@types/app";
import type { BoundingBox, ConfigurationWmsVectorDetailsContent } from "../../../../@types/entrepot";
import DatastoreLayout from "../../../../components/Layout/DatastoreLayout";
import LoadingIcon from "../../../../components/Utils/LoadingIcon";
import LoadingText from "../../../../components/Utils/LoadingText";
import Wait from "../../../../components/Utils/Wait";
import ZoomRange from "../../../../components/Utils/ZoomRange";
import olDefaults from "../../../../data/ol-defaults.json";
import useScrollToTopEffect from "../../../../hooks/useScrollToTopEffect";
import { Translations, useTranslation } from "../../../../i18n/i18n";
import RQKeys from "../../../../modules/entrepot/RQKeys";
import { CartesApiException } from "../../../../modules/jsonFetch";
import { routes } from "../../../../router/router";
import api from "../../../api";
import { DatasheetViewActiveTabEnum } from "../../datasheet/DatasheetView/DatasheetView";

function bboxToWkt(bbox: BoundingBox) {
    const str = "POLYGON((west north,east north,east south,west south,west north))";

    return str.replace(/[a-z]+/g, function (s) {
        return bbox[s];
    });
}

const STEPS = {
    TECHNICAL_NAME: 1,
    TOP_ZOOM_LEVEL: 2,
};

type PyramidRasterGenerateFormType = {
    technical_name: string;
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

    const schemas = {};
    schemas[STEPS.TECHNICAL_NAME] = yup.object({
        technical_name: yup.string().typeError(t("technical_name.error.mandatory")).required(t("technical_name.error.mandatory")),
    });

    schemas[STEPS.TOP_ZOOM_LEVEL] = yup.lazy(() => {
        // if (serviceQuery.data === undefined) {
        // }
        return yup.mixed().nullable().notRequired();
    });

    const form = useForm<PyramidRasterGenerateFormType>({
        resolver: yupResolver(schemas[currentStep]),
        mode: "onChange",
        // values: defaultValues,
    });

    const {
        register,
        trigger,
        getValues: getFormValues,
        formState: { errors },
    } = form;

    // console.log(bboxToWkt((serviceQuery.data?.configuration.type_infos as ConfigurationWmsVectorDetailsContent).bbox));

    const generatePyramidRasterMutation = useMutation<PyramidRaster, CartesApiException>({
        mutationFn: () => {
            const formData = {
                ...getFormValues(),
                wmsv_offering_id: offeringId,
                wmsv_config_bbox: bboxToWkt((serviceQuery.data?.configuration.type_infos as ConfigurationWmsVectorDetailsContent).bbox!),
            };

            console.log("formData", formData);

            return api.pyramidRaster.add(datastoreId, formData);
        },
        onSuccess() {
            // if (pyramidQuery.data?.tags?.datasheet_name) {
            //     queryClient.invalidateQueries({
            //         queryKey: RQKeys.datastore_datasheet(datastoreId, pyramidQuery.data?.tags.datasheet_name),
            //     });
            //     routes.datastore_datasheet_view({ datastoreId, datasheetName: pyramidQuery.data?.tags.datasheet_name, activeTab: "services" }).push();
            // } else {
            //     routes.datasheet_list({ datastoreId }).push();
            // }
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

    const [levels, setLevels] = useState([5, 15]);

    console.log("errors", errors);

    return (
        <DatastoreLayout datastoreId={datastoreId} documentTitle={t("title")}>
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
            ) : (
                <>
                    <Stepper
                        currentStep={currentStep}
                        stepCount={Object.values(STEPS).length}
                        nextTitle={currentStep < STEPS.TOP_ZOOM_LEVEL && t("step.title", { stepNumber: currentStep + 1 })}
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

                    <div className={fr.cx(currentStep !== STEPS.TOP_ZOOM_LEVEL && "fr-hidden")}>
                        <h3>{t("top_zoom_level.lead_text")}</h3>
                        <p>{t("top_zoom_level.explanation")}</p>

                        {currentStep === STEPS.TOP_ZOOM_LEVEL &&
                            (serviceQuery.data?.configuration.type_infos as ConfigurationWmsVectorDetailsContent).used_data?.[0]?.relations.map((rel) => (
                                <Accordion key={rel.name} label={rel.name} titleAs="h4" defaultExpanded={true}>
                                    <ZoomRange
                                        min={olDefaults.zoom_levels.TOP}
                                        max={olDefaults.zoom_levels.BOTTOM}
                                        values={levels}
                                        onChange={(values) => {
                                            console.log(values);
                                            setLevels((prevLevels) => [values[0], prevLevels[1]]);
                                        }}
                                        step={1}
                                        mode="top"
                                        overlayContent={t("top_zoom_level.overlay_text")}
                                    />
                                    {/* <ZoomRange
                                        min={olDefaults.zoom_levels.TOP}
                                        max={olDefaults.zoom_levels.BOTTOM}
                                        values={levels}
                                        onChange={(values) => {
                                            console.log(values);
                                            setLevels((prevLevels) => [prevLevels[0], values[0]]);
                                        }}
                                        step={1}
                                        mode="bottom"
                                    />
                                    <ZoomRange
                                        min={olDefaults.zoom_levels.TOP}
                                        max={olDefaults.zoom_levels.BOTTOM}
                                        values={levels}
                                        onChange={(values) => {
                                            console.log(values);
                                            setLevels(values);
                                        }}
                                        step={1}
                                    /> */}
                                </Accordion>
                            ))}
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
        </DatastoreLayout>
    );
};

export default PyramidRasterGenerateForm;

export const { i18n } = declareComponentKeys<
    | "title"
    | { K: "step.title"; P: { stepNumber: number }; R: string }
    | "wmsv-service.loading"
    | "wmsv-service.fetch_failed"
    | "back_to_datasheet"
    | "technical_name.lead_text"
    | "technical_name.label"
    | "technical_name.explanation"
    | "technical_name.error.mandatory"
    | "top_zoom_level.lead_text"
    | "top_zoom_level.explanation"
    | "top_zoom_level.overlay_text"
    | "generate.in_progress"
>()({
    PyramidRasterGenerateForm,
});

export const PyramidRasterGenerateFormFrTranslations: Translations<"fr">["PyramidRasterGenerateForm"] = {
    // title: "Créer un service raster WMS/WMTS",
    title: "Générer une pyramide de tuiles raster",
    "step.title": ({ stepNumber }) => {
        switch (stepNumber) {
            case 1:
                return "Nom de la pyramide de tuiles raster";
            case 2:
                return "Niveau de zoom top";
            default:
                return "";
        }
    },
    "wmsv-service.loading": "Chargement du service WMS-Vecteur...",
    "wmsv-service.fetch_failed": "Récupération des informations sur le service WMS-Vecteur a échoué",
    back_to_datasheet: "Retour à la fiche de données",
    "technical_name.lead_text": "Choisissez le nom technique de la pyramide de tuiles raster",
    "technical_name.label": "Nom technique de la pyramide de tuiles raster",
    "technical_name.explanation":
        "II s'agit du nom technique du service qui apparaitra dans votre espace de travail, il ne sera pas publié en ligne. Si vous le renommez, choisissez un nom explicite.",
    "technical_name.error.mandatory": "Le nom technique de la pyramide de tuiles raster est obligatoire",
    "top_zoom_level.lead_text": "Choisissez le niveau de zoom top de vos tables",
    "top_zoom_level.explanation": `Les niveaux de zoom de la pyramide de tuiles raster sont prédéfinis. Choisissez la borne minimum de votre pyramide de tuiles en vous aidant
                        de la carte de gauche. Le zoom maximum sur l’image de droite est fixe et ne peut être modifié. Tous les niveaux intermédiaires seront
                        générés.`,
    "top_zoom_level.overlay_text": "Le zoom maximum est déterminé par la résolution des images fournies en entrée",
    "generate.in_progress": "Génération de pyramide de tuiles raster en cours",
};

export const PyramidRasterGenerateFormEnTranslations: Translations<"en">["PyramidRasterGenerateForm"] = {
    title: undefined,
    "step.title": undefined,
    "wmsv-service.loading": undefined,
    "wmsv-service.fetch_failed": undefined,
    back_to_datasheet: undefined,
    "technical_name.error.mandatory": undefined,
    "technical_name.lead_text": undefined,
    "technical_name.label": undefined,
    "technical_name.explanation": undefined,
    "top_zoom_level.lead_text": undefined,
    "top_zoom_level.explanation": undefined,
    "top_zoom_level.overlay_text": undefined,
    "generate.in_progress": undefined,
};
