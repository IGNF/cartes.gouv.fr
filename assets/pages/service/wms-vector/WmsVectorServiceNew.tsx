import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import Stepper from "@codegouvfr/react-dsfr/Stepper";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery } from "@tanstack/react-query";
import SldStyleParser from "geostyler-sld-parser";
import { FC, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";

import api from "../../../api";
import DatastoreLayout from "../../../components/Layout/DatastoreLayout";
import LoadingText from "../../../components/Utils/LoadingText";
import functions from "../../../functions";
import RCKeys from "../../../modules/RCKeys";
import Translator from "../../../modules/Translator";
import { routes } from "../../../router/router";
import { type StoredDataRelation, type VectorDb } from "../../../types/app";
import TableSelection from "./TableSelection";
import UploadMetadata from "./UploadMetadata";
import UploadStyleFile from "./UploadStyleFile";

type WmsVectorServiceNewProps = {
    datastoreId: string;
    vectorDbId: string;
};
const WmsVectorServiceNew: FC<WmsVectorServiceNewProps> = ({ datastoreId, vectorDbId }) => {
    const STEPS = {
        TABLES_SELECTION: 1,
        STYLE_FILE: 2,
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
            style_files: yup.lazy(() => {
                if (!selectedTables || selectedTables.length === 0) {
                    return yup.mixed().nullable().notRequired();
                }

                const styleFiles = {};
                selectedTables.forEach((table) => {
                    styleFiles[table.name] = yup
                        .mixed()
                        .required(`Veuillez fournir un fichier de style pour la table ${table.name}`)
                        .test({
                            name: "is-valid-sld",
                            async test(value, ctx) {
                                if (value instanceof FileList && value.length === 0) {
                                    return ctx.createError({ message: `Veuillez fournir un fichier de style pour la table ${table.name}` });
                                }

                                const file = value[0] ?? undefined;

                                // TODO : retravailler la validation du SLD, et éventuellement déplacer la fonction de validation ailleurs
                                if (file instanceof File) {
                                    if (functions.path.getFileExtension(file.name)?.toLowerCase() !== "sld") {
                                        return ctx.createError({
                                            message: `L'extension du fichier de style ${file.name} n'est pas correcte. Seule l'extension sld est acceptée.`,
                                        });
                                    }

                                    const styleString = await file.text();
                                    const sldParser = new SldStyleParser();
                                    const result = await sldParser.readStyle(styleString);

                                    if (result?.warnings || result?.unsupportedProperties || result?.errors) {
                                        return ctx.createError({ message: JSON.stringify(result) });
                                    }

                                    if (!result?.output || result?.output?.name === "") {
                                        return ctx.createError({
                                            message: `Le fichier de style de la table ${table.name} est invalide. Le champ [name] est invalide`,
                                        });
                                    }
                                } else {
                                    return ctx.createError({ message: `Le fichier de style de la table ${table.name} est invalide` });
                                }

                                return true;
                            },
                        });
                });
                return yup.object().shape(styleFiles);
            }),
        }),
        3: yup.object().shape({
            is_upload_file: yup.string().oneOf(["true", "false"]).required().default("false"),
            metadata_file_content: yup.mixed().when("is_upload_file", {
                is: "true",
                then: () =>
                    yup
                        .mixed()
                        .required()
                        .test({
                            name: "is-valid-metadata",
                            async test(value, ctx) {
                                if (value instanceof FileList && value.length === 0) {
                                    return ctx.createError({ message: "Veuillez fournir un fichier de métadonnées" });
                                }
                                const file = value[0] ?? undefined;

                                if (file instanceof File) {
                                    if (functions.path.getFileExtension(file.name)?.toLowerCase() !== "xml") {
                                        return ctx.createError({
                                            message: `L'extension du fichier de métadonnées ${file.name} n'est pas correcte. Seule l'extension xml est acceptée.`,
                                        });
                                    }

                                    //  TODO : valider le fichier de métadonnées
                                } else {
                                    return ctx.createError({ message: "Le fichier de style de métadonnées est invalide" });
                                }
                                return true;
                            },
                        }),
            }),
        }),
        4: yup.object(),
        5: yup.object(),
        6: yup.object(),
    };

    const defaultValues = {
        1: { selected_tables: [] },
        3: { is_upload_file: "false" },
    };

    const form = useForm({
        defaultValues: defaultValues[currentStep],
        resolver: yupResolver(schemas[currentStep]),
        mode: "onChange",
    });
    const {
        // handleSubmit,
        formState: { errors },
        getValues: getFormValues,
        // setValue: setFormValue,
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
        const isStepValid = await trigger();

        if (!isStepValid) return;

        if (currentStep < Object.values(STEPS).length) {
            setCurrentStep((currentStep) => currentStep + 1);
        } else {
            // TODO : onSubmit
            console.log("// TODO : onSubmit");
            console.log("formValues", getFormValues());
            console.log("errors", errors);
        }
    };

    return (
        <DatastoreLayout datastoreId={datastoreId}>
            <h1>{Translator.trans("service.wms_vector.new.title")}</h1>

            {vectorDbQuery.isLoading ? (
                <LoadingText message={Translator.trans("service.wms_vector.new.loading_stored_data")} />
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
                        nextTitle={currentStep < STEPS.ACCESSRESTRICTIONS && Translator.trans(`service.wms_vector.new.step${currentStep + 1}`)}
                        title={Translator.trans(`service.wms_vector.new.step${currentStep}`)}
                    />

                    <TableSelection visible={currentStep === STEPS.TABLES_SELECTION} vectorDb={vectorDbQuery.data} form={form} />
                    <UploadStyleFile visible={currentStep === STEPS.STYLE_FILE} selectedTables={selectedTables} form={form} />
                    <UploadMetadata visible={currentStep === STEPS.METADATA} form={form} />

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
        </DatastoreLayout>
    );
};

export default WmsVectorServiceNew;
