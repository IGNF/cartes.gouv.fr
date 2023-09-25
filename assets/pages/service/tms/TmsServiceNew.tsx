import { useQuery } from "@tanstack/react-query";
import { FC, useEffect, useState } from "react";
import RQKeys from "../../../modules/RQKeys";
import * as yup from "yup";
import { type StoredDataRelation, type VectorDb } from "../../../types/app";
import api from "../../../api";
import Translator from "../../../modules/Translator";
import DatastoreLayout from "../../../components/Layout/DatastoreLayout";
import Button from "@codegouvfr/react-dsfr/Button";
import LoadingText from "../../../components/Utils/LoadingText";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Stepper from "@codegouvfr/react-dsfr/Stepper";
import { routes } from "../../../router/router";
import TableSelection from "../wms-vector/TableSelection";
import TableAttributeSelection from "./tables/TableAttributeSelection";
import TableZoomLevels from "./tables/TableZoomLevels";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import { fr } from "@codegouvfr/react-dsfr";
import TippeCanoe from "./tippecanoes/Tippecanoe";
import RCSampleMap from "./sample/RCSampleMap";

type TmsServiceNewProps = {
    datastoreId: string;
    vectorDbId: string;
    technicalName: string;
};

const TmsServiceNew: FC<TmsServiceNewProps> = ({ datastoreId, vectorDbId, technicalName }) => {
    const STEPS = {
        TABLES_SELECTION: 1,
        ATTRIBUTES_SELECTION: 2,
        ZOOM_LEVELS: 3,
        GENERALIZE_OPTIONS: 4,
        SAMPLE: 5,
    };

    // Definition du schema
    const schema = {};
    schema[STEPS.TABLES_SELECTION] = yup.object({
        selected_tables: yup
            .array(yup.string())
            .min(1, Translator.trans("service.tms.new.step_tables.mandatory_error"))
            .required(Translator.trans("service.tms.new.step_tables.mandatory_error")),
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
                    .min(1, Translator.trans("service.tms.new.step_attributes.mandatory_error"))
                    .required(Translator.trans("service.tms.new.step_attributes.mandatory_error"));
            });
            return yup.object().shape(tableAttributes);
        }),
    });
    schema[STEPS.ZOOM_LEVELS] = yup.mixed().nullable().notRequired();
    schema[STEPS.GENERALIZE_OPTIONS] = yup.object({
        tippecanoe: yup.string().required(Translator.trans("service.tms.new.step_tippecanoe.mandatory_error")),
    });
    schema[STEPS.SAMPLE] = yup.mixed().nullable().notRequired();

    /* l'etape courante */
    const [currentStep, setCurrentStep] = useState(STEPS.TABLES_SELECTION);

    const vectorDbQuery = useQuery({
        queryKey: RQKeys.datastore_stored_data(datastoreId, vectorDbId),
        queryFn: () => api.storedData.get<VectorDb>(datastoreId, vectorDbId),
        staleTime: 600000,
    });

    const form = useForm({
        resolver: yupResolver(schema[currentStep]),
        mode: "onChange",
    });
    const {
        formState: { errors },
        getValues: getFormValues,
        watch,
        trigger,
    } = form;

    const selectedTableNamesList: string[] = watch("selected_tables");
    const [selectedTables, setSelectedTables] = useState<StoredDataRelation[]>([]);

    useEffect(() => {
        if (selectedTableNamesList && vectorDbQuery.data) {
            const relations = vectorDbQuery.data.type_infos?.relations ?? [];
            const tables = relations.filter((rel) => rel.type && rel.type === "TABLE");
            const selectedTables = tables.filter((table) => selectedTableNamesList.includes(table.name));
            setSelectedTables(selectedTables);
        }
    }, [selectedTableNamesList, vectorDbQuery.data]);

    const previousStep = () => setCurrentStep((currentStep) => currentStep - 1);

    const nextStep = async () => {
        console.log(getFormValues("tippecanoe"));
        const isStepValid = await trigger(undefined, { shouldFocus: true }); // demande de valider le formulaire
        if (!isStepValid) return;

        if (currentStep < Object.values(STEPS).length) {
            setCurrentStep((currentStep) => currentStep + 1);
        } else {
            // TODO Utiliser technicalName ici
            // TODO : onSubmit
            console.log("// TODO : onSubmit");
            console.log("formValues", getFormValues());
            console.log("errors", errors);
        }
    };

    return (
        <DatastoreLayout datastoreId={datastoreId} documentTitle="Créer et publier un service TMS">
            <h1>{Translator.trans("service.tms.new.title")}</h1>

            {vectorDbQuery.isLoading ? (
                <LoadingText message={Translator.trans("service.tms.new.loading_stored_data")} />
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
                        nextTitle={currentStep < STEPS.SAMPLE && Translator.trans(`service.tms.new.step${currentStep + 1}`)}
                        title={Translator.trans(`service.tms.new.step${currentStep}`)}
                    />
                    <TableSelection visible={currentStep === STEPS.TABLES_SELECTION} vectorDb={vectorDbQuery.data} form={form} />
                    <TableAttributeSelection visible={currentStep === STEPS.ATTRIBUTES_SELECTION} form={form} selectedTables={selectedTables} />
                    <TableZoomLevels visible={currentStep === STEPS.ZOOM_LEVELS} form={form} selectedTables={selectedTables} />
                    <TippeCanoe
                        visible={currentStep === STEPS.GENERALIZE_OPTIONS}
                        state={errors.tippecanoe ? "error" : "default"}
                        stateRelatedMessage={errors?.tippecanoe?.message as string}
                        form={form}
                    />
                    {/* <RCSampleMap visible={currentStep === STEPS.SAMPLE} form={form} onChange={(v) => console.log(v)} /> */}
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
                                    currentStep < Object.values(STEPS).length ? Translator.trans("continue") : Translator.trans("service.tms.new.publish"),
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

export default TmsServiceNew;
