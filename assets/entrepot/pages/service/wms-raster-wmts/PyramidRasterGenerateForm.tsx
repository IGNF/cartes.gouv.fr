import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import Input from "@codegouvfr/react-dsfr/Input";
import Stepper from "@codegouvfr/react-dsfr/Stepper";
import { useQuery } from "@tanstack/react-query";
import { declareComponentKeys } from "i18nifty";
import { FC, useCallback, useState } from "react";

import { Service } from "../../../../@types/app";
import DatastoreLayout from "../../../../components/Layout/DatastoreLayout";
import LoadingText from "../../../../components/Utils/LoadingText";
import useScrollToTopEffect from "../../../../hooks/useScrollToTopEffect";
import { Translations, useTranslation } from "../../../../i18n/i18n";
import RQKeys from "../../../../modules/entrepot/RQKeys";
import { CartesApiException } from "../../../../modules/jsonFetch";
import { routes } from "../../../../router/router";
import api from "../../../api";
import { DatasheetViewActiveTabEnum } from "../../datasheet/DatasheetView/DatasheetView";

const STEPS = {
    TECHNICAL_NAME: 1,
    TOP_ZOOM_LEVEL: 2,
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

    useScrollToTopEffect(currentStep);

    const previousStep = useCallback(() => setCurrentStep((currentStep) => currentStep - 1), []);

    const nextStep = useCallback(async () => {
        // const isStepValid = await trigger(undefined, { shouldFocus: true }); // demande de valider le formulaire
        // if (!isStepValid) return; // ne fait rien si formulaire invalide
        // formulaire est valide
        if (currentStep < Object.values(STEPS).length) {
            // on passe à la prochaine étape du formulaire
            setCurrentStep((currentStep) => currentStep + 1);
        } else {
            // on est à la dernière étape du formulaire donc on envoie la sauce
            // if (editMode) {
            //     editServiceMutation.mutate();
            // } else {
            //     createServiceMutation.mutate();
            // }
        }
    }, [
        currentStep,
        /*createServiceMutation, editServiceMutation,  trigger, editMode*/
    ]);

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

                    <div className={fr.cx(currentStep !== STEPS.TECHNICAL_NAME && "fr-hidden")}>
                        <h3>Choisissez le nom technique de la pyramide de tuiles raster</h3>
                        <Input
                            label={"Nom technique de la pyramide de tuiles raster"}
                            hintText={
                                "II s'agit du nom technique du service qui apparaitra dans votre espace de travail, il ne sera pas publié en ligne. Si vous le renommez, choisissez un nom explicite."
                            }
                        />
                    </div>

                    <div className={fr.cx(currentStep !== STEPS.TOP_ZOOM_LEVEL && "fr-hidden")}>
                        <h3>{"Choisissez le niveau de zoom top de vos tables"}</h3>
                        <p>
                            {`Les niveaux de zoom de la pyramide de tuiles raster sont prédéfinis. Choisissez la borne minimum de votre pyramide de tuiles en vous aidant
                        de la carte de gauche. Le zoom maximum sur l’image de droite est fixe et ne peut être modifié. Tous les niveaux intermédiaires seront
                        générés.`}
                        </p>
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
        </DatastoreLayout>
    );
};

export default PyramidRasterGenerateForm;

export const { i18n } = declareComponentKeys<
    "title" | { K: "step.title"; P: { stepNumber: number }; R: string } | "wmsv-service.loading" | "wmsv-service.fetch_failed" | "back_to_datasheet"
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
};

export const PyramidRasterGenerateFormEnTranslations: Translations<"en">["PyramidRasterGenerateForm"] = {
    title: undefined,
    "step.title": undefined,
    "wmsv-service.loading": undefined,
    "wmsv-service.fetch_failed": undefined,
    back_to_datasheet: undefined,
};
