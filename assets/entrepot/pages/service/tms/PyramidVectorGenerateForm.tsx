import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import Stepper from "@codegouvfr/react-dsfr/Stepper";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery } from "@tanstack/react-query";
import { FC, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";

import { type StoredDataRelation, type VectorDb } from "../../../../@types/app";
import DatastoreLayout from "../../../../components/Layout/DatastoreLayout";
import LoadingText from "../../../../components/Utils/LoadingText";
import Wait from "../../../../components/Utils/Wait";
import olDefaults from "../../../../data/ol-defaults.json";
import useScrollToTopEffect from "../../../../hooks/useScrollToTopEffect";
import Translator from "../../../../modules/Translator";
import RQKeys from "../../../../modules/entrepot/RQKeys";
import { CartesApiException } from "../../../../modules/jsonFetch";
import { routes } from "../../../../router/router";
import api from "../../../api";
import TableSelection from "../TableSelection";
import formatForm from "./format-form";
import Sample, { type SampleType } from "./sample/Sample";
import TableAttributeSelection from "./tables/TableAttributeSelection";
import TableZoomLevels from "./tables/TableZoomLevels";
import TippeCanoe from "./tippecanoes/Tippecanoe";

export type PyramidVectorGenerateFormValuesType = {
    selected_tables?: string[];
    bottom_zoom_level?: number;
    sample?: SampleType;
    table_zoom_levels?: Record<string, number[]>;
    tippecanoe?: string;
};

const STEPS = {
    TABLES_SELECTION: 1,
    ATTRIBUTES_SELECTION: 2,
    ZOOM_LEVELS: 3,
    GENERALIZE_OPTIONS: 4,
    SAMPLE: 5,
};

type PyramidVectorNewProps = {
    datastoreId: string;
    vectorDbId: string;
    technicalName: string;
};

const PyramidVectorGenerateForm: FC<PyramidVectorNewProps> = ({ datastoreId, vectorDbId, technicalName }) => {
    // Definition du schema
    const schema = {};
    schema[STEPS.TABLES_SELECTION] = yup.object({
        selected_tables: yup
            .array(yup.string())
            .min(1, Translator.trans("pyramid_vector.new.step_tables.mandatory_error"))
            .required(Translator.trans("pyramid_vector.new.step_tables.mandatory_error")),
    });
    schema[STEPS.ATTRIBUTES_SELECTION] = yup.object({
        table_attributes: yup.lazy(() => {
            if (!selectedTables || selectedTables.length === 0) {
                return yup.mixed().nullable().notRequired();
            }

            const tableAttributes = {};
            selectedTables.forEach((table) => {
                tableAttributes[table.name] = yup
                    .array()
                    .of(yup.string())
                    .min(1, Translator.trans("pyramid_vector.new.step_attributes.mandatory_error"))
                    .required(Translator.trans("pyramid_vector.new.step_attributes.mandatory_error"));
            });
            return yup.object().shape(tableAttributes);
        }),
    });
    schema[STEPS.ZOOM_LEVELS] = yup.mixed().nullable().notRequired();
    schema[STEPS.GENERALIZE_OPTIONS] = yup.object({
        tippecanoe: yup.string().required(Translator.trans("pyramid_vector.new.step_tippecanoe.mandatory_error")),
    });
    schema[STEPS.SAMPLE] = yup.mixed().nullable().notRequired();

    /* l'etape courante */
    const [currentStep, setCurrentStep] = useState(STEPS.TABLES_SELECTION);

    const vectorDbQuery = useQuery({
        queryKey: RQKeys.datastore_stored_data(datastoreId, vectorDbId),
        queryFn: () => api.storedData.get<VectorDb>(datastoreId, vectorDbId),
        staleTime: 600000,
    });

    const form = useForm<PyramidVectorGenerateFormValuesType>({
        resolver: yupResolver(schema[currentStep]),
        mode: "onChange",
    });
    const {
        formState: { errors },
        getValues: getFormValues,
        watch,
        trigger,
    } = form;

    const selectedTableNamesList: string[] | undefined = watch("selected_tables");
    const [selectedTables, setSelectedTables] = useState<StoredDataRelation[]>([]);

    const bottomZoomLevel = watch("bottom_zoom_level", olDefaults.zoom_levels.BOTTOM);
    const sample: SampleType | undefined = watch("sample");

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [validationError, setValidationError] = useState<CartesApiException>();

    useEffect(() => {
        if (selectedTableNamesList && vectorDbQuery.data) {
            const relations = vectorDbQuery.data.type_infos?.relations ?? [];
            const tables = relations.filter((rel) => rel.type && rel.type === "TABLE");
            const selectedTables = tables.filter((table) => selectedTableNamesList.includes(table.name));
            setSelectedTables(selectedTables);
        }
    }, [selectedTableNamesList, vectorDbQuery.data]);

    useScrollToTopEffect(currentStep);

    const previousStep = () => setCurrentStep((currentStep) => currentStep - 1);

    const nextStep = async () => {
        const isStepValid = await trigger(undefined, { shouldFocus: true }); // demande de valider le formulaire
        if (!isStepValid) return;

        if (currentStep < Object.values(STEPS).length) {
            setCurrentStep((currentStep) => currentStep + 1);
            return;
        }

        const values = getFormValues();
        const formatted = formatForm(technicalName, vectorDbId, values);

        setIsSubmitting(true);

        api.pyramid
            .add(datastoreId, formatted)
            .then(() => {
                if (vectorDbQuery.data?.tags?.datasheet_name) {
                    routes.datastore_datasheet_view({ datastoreId, datasheetName: vectorDbQuery.data?.tags.datasheet_name, activeTab: "dataset" }).push();
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
        <DatastoreLayout datastoreId={datastoreId} documentTitle={Translator.trans("pyramid_vector.new.title")}>
            <h1>{Translator.trans("pyramid_vector.new.title")}</h1>

            {vectorDbQuery.isLoading ? (
                <LoadingText message={Translator.trans("pyramid_vector.new.loading_stored_data")} />
            ) : vectorDbQuery.data === undefined ? (
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
                        nextTitle={currentStep < STEPS.SAMPLE && Translator.trans(`pyramid_vector.new.step${currentStep + 1}`)}
                        title={Translator.trans(`pyramid_vector.new.step${currentStep}`)}
                    />
                    {validationError && (
                        <Alert
                            className="fr-preline"
                            closable
                            description={validationError.message}
                            severity="error"
                            title={Translator.trans("commons.error")}
                        />
                    )}
                    <TableSelection filterGeometric={true} visible={currentStep === STEPS.TABLES_SELECTION} vectorDb={vectorDbQuery.data} form={form} />
                    <TableAttributeSelection visible={currentStep === STEPS.ATTRIBUTES_SELECTION} form={form} selectedTables={selectedTables} />
                    <TableZoomLevels visible={currentStep === STEPS.ZOOM_LEVELS} form={form} selectedTables={selectedTables} />
                    <TippeCanoe
                        visible={currentStep === STEPS.GENERALIZE_OPTIONS}
                        state={errors.tippecanoe ? "error" : "default"}
                        stateRelatedMessage={errors?.tippecanoe?.message as string}
                        form={form}
                    />
                    <Sample visible={currentStep === STEPS.SAMPLE} bottomZoomLevel={bottomZoomLevel} form={form} />
                    <ButtonsGroup
                        className={fr.cx("fr-mt-2w")}
                        alignment="between"
                        buttons={[
                            {
                                children: Translator.trans("previous_step"),
                                iconId: "fr-icon-arrow-left-fill",
                                priority: "tertiary",
                                onClick: previousStep,
                                disabled: currentStep === STEPS.TABLES_SELECTION,
                            },
                            {
                                children:
                                    currentStep < Object.values(STEPS).length
                                        ? Translator.trans("continue")
                                        : sample?.is_sample === "true"
                                          ? Translator.trans("pyramid_vector.new.generate_sample")
                                          : Translator.trans("pyramid_vector.new.generate_pyramid"),
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
                                <i className={fr.cx("fr-icon-refresh-line", "fr-icon--lg") + " frx-icon-spin"} />
                            </div>
                            <div className={fr.cx("fr-col-10")}>
                                <h6 className={fr.cx("fr-h6", "fr-m-0")}>{"Demande de création de la pyramide de tuiles en cours ..."}</h6>
                            </div>
                        </div>
                    </div>
                </Wait>
            )}
        </DatastoreLayout>
    );
};

export default PyramidVectorGenerateForm;
