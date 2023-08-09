import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import Stepper from "@codegouvfr/react-dsfr/Stepper";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery } from "@tanstack/react-query";
import { FC, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";

import api from "../../../api";
import AppLayout from "../../../components/Layout/AppLayout";
import LoadingText from "../../../components/Utils/LoadingText";
import RCKeys from "../../../modules/RCKeys";
import Translator from "../../../modules/Translator";
import { routes } from "../../../router/router";
import { VectorDb } from "../../../types/app";
import TableSelection from "./tables/TableSelection";
import TableAttributeSelection from "./tables/TableAttributeSelection";

type WmsVectorServiceNewProps = {
    datastoreId: string;
    vectorDbId: string;
};
const WmsVectorServiceNew: FC<WmsVectorServiceNewProps> = ({ datastoreId, vectorDbId }) => {
    const STEPS = {
        TABLES_SELECTION: 1,
        TABLE_ATTRIBUTES: 2,
        METADATA: 3,
        DESCRIPTION: 4,
        ADDITIONALINFORMATIONS: 5,
        ACCESSRESTRICTIONS: 6,
    };

    const [currentStep, setCurrentStep] = useState(STEPS.TABLES_SELECTION);

    const vectorDbQuery = useQuery({
        queryKey: RCKeys.datastore_stored_data(datastoreId, vectorDbId),
        queryFn: () => api.storedData.get<VectorDb>(datastoreId, vectorDbId),
        staleTime: 600000,
    });

    const schemas = {
        1: yup.object({
            selected_tables: yup.array(yup.string()).min(1, "Veuillez choisir au moins une table").required("Veuillez choisir au moins une table"),
        }),
        2: yup.object({
            table_attributes: yup.object().test({
                name: "is-valid",
                test(/*tableAttributes, ctx*/) {
                    // TODO: désactive en attente de plus de précisions
                    // for (const tableName in tableAttributes) {
                    //     if (tableAttributes[tableName].length === 0) {
                    //         return ctx.createError({
                    //             message: "Veuillez choisir au moins un attribut pour chaque table",
                    //             path: `table_attributes_${tableName}`,
                    //         });
                    //     }
                    // }
                    return true;
                },
            }),
        }),
    };

    const form = useForm({ resolver: yupResolver(schemas[currentStep]), shouldUnregister: false });
    const {
        // handleSubmit,
        // formState: { errors },
        // setValue: setFormValue,
        // getValues: getFormValues,
        trigger,
    } = form;

    const previousStep = () => setCurrentStep((currentStep) => currentStep - 1);
    const nextStep = async () => {
        const isStepValid = await trigger();
        // console.log("formValues", getFormValues());
        // console.log("errors", errors);
        if (!isStepValid) return;

        if (currentStep < Object.values(STEPS).length) {
            setCurrentStep((currentStep) => currentStep + 1);
        } else {
            // TODO : onSubmit
            console.log("// TODO : onSubmit");
        }
    };

    return (
        <AppLayout>
            <h2>{Translator.trans("service.wms_vector.new.title")}</h2>

            {vectorDbQuery.isLoading ? (
                <LoadingText message={Translator.trans("service.wms_vector.new.loading_stored_data")} />
            ) : vectorDbQuery.data === undefined ? (
                <Alert
                    severity="error"
                    closable={false}
                    title="Récupération des informations sur la donnée stockée a échoué"
                    description={<Button linkProps={routes.datasheet_list().link}>Retour à mes données</Button>}
                />
            ) : (
                <>
                    <Stepper
                        currentStep={currentStep}
                        stepCount={Object.values(STEPS).length}
                        nextTitle={currentStep < STEPS.ACCESSRESTRICTIONS && Translator.trans(`service.wms_vector.new.step${currentStep + 1}`)}
                        title={Translator.trans(`service.wms_vector.new.step${currentStep}`)}
                    />

                    <TableSelection vectorDb={vectorDbQuery.data} visible={currentStep === STEPS.TABLES_SELECTION} form={form} />
                    <TableAttributeSelection vectorDb={vectorDbQuery.data} visible={currentStep === STEPS.TABLE_ATTRIBUTES} form={form} />

                    <ButtonsGroup
                        className={fr.cx("fr-mt-2w")}
                        alignment="between"
                        buttons={[
                            {
                                children: Translator.trans("previous_step"),
                                iconId: "fr-icon-arrow-left-fill",
                                priority: "tertiary",
                                onClick: previousStep,
                                disabled: currentStep === 1,
                            },
                            {
                                children:
                                    currentStep < Object.values(STEPS).length
                                        ? Translator.trans("continue")
                                        : Translator.trans("service.wms_vector.new.publish"),
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

export default WmsVectorServiceNew;
