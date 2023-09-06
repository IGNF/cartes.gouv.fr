import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import Stepper from "@codegouvfr/react-dsfr/Stepper";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";

import api from "../../../api";
import DatastoreLayout from "../../../components/Layout/DatastoreLayout";
import LoadingText from "../../../components/Utils/LoadingText";
import RQKeys from "../../../modules/RQKeys";
import Translator from "../../../modules/Translator";
import { routes } from "../../../router/router";
import { type StoredDataRelation, type VectorDb } from "../../../types/app";
import { regex } from "../../../utils";
import validations from "../../../validations";
import TableSelection from "./TableSelection";
import UploadStyleFile from "./UploadStyleFile";
import Description from "./metadata/Description";
import UploadMetadata from "./metadata/UploadMetadata";

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
        queryKey: RQKeys.datastore_stored_data(datastoreId, vectorDbId),
        queryFn: () => api.storedData.get<VectorDb>(datastoreId, vectorDbId),
        staleTime: 600000,
    });

    const queryClient = useQueryClient();
    const offeringsQuery = useQuery({
        queryKey: RQKeys.datastore_offerings(datastoreId),
        queryFn: () => api.service.getOfferings(datastoreId),
        refetchInterval: 10000,
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
                                return validations.sldStyle.test(table.name, value as FileList, ctx);
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
                                return validations.metadata.test(value as FileList, ctx);
                            },
                        }),
            }),
        }),
        4: yup
            .object({
                technical_name: yup
                    .string()
                    .required(Translator.trans("service.wms_vector.new.step_description.technical_name_error"))
                    .matches(/^[\w-.]+$/, Translator.trans("service.wms_vector.new.step_description.technical_name_regex"))
                    .test({
                        name: "is-unique",
                        test(technicalName, ctx) {
                            const technicalNameList = offeringsQuery?.data?.map((data) => data?.layer_name);
                            if (technicalNameList?.includes(technicalName)) {
                                return ctx.createError({ message: `"${technicalName}" : Ce nom technique existe déjà` });
                            }

                            return true;
                        },
                    }),
                public_name: yup.string().required(Translator.trans("service.wms_vector.new.step_description.public_name_error")),
                description: yup.string().required(Translator.trans("service.wms_vector.new.step_description.description_error")),
                identifier: yup.string().required(Translator.trans("service.wms_vector.new.step_description.identifier_error")),
                category: yup
                    .array(yup.string())
                    .min(1, Translator.trans("service.wms_vector.new.step_description.category_error"))
                    .required(Translator.trans("service.wms_vector.new.step_description.category_error")),
                email_contact: yup
                    .string()
                    .matches(regex.email, Translator.trans("service.wms_vector.new.step_description.email_contact_error"))
                    .required(Translator.trans("service.wms_vector.new.step_description.email_contact_mandatory_error")),
                creation_date: yup.date().required(Translator.trans("service.wms_vector.new.step_description.creation_date_error")),
                resource_genealogy: yup.string(),
                organization: yup.string().required(Translator.trans("service.wms_vector.new.step_description.organization_error")),
                organization_email: yup
                    .string()
                    .matches(regex.email, Translator.trans("service.wms_vector.new.step_description.organization_email_error"))
                    .required(Translator.trans("service.wms_vector.new.step_description.organization_email_mandatory_error")),
            })
            .required(),
        5: yup.object(),
        6: yup.object(),
    };

    const form = useForm({
        resolver: yupResolver(schemas[currentStep]),
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
        return () => {
            queryClient.cancelQueries({ queryKey: [...RQKeys.datastore_offerings(datastoreId)] });
        };
    }, [datastoreId, queryClient, offeringsQuery.data]);

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
        const isStepValid = await trigger(undefined, { shouldFocus: true }); // demande de valider le formulaire
        if (!isStepValid) return;

        if (currentStep < Object.values(STEPS).length) {
            setCurrentStep((currentStep) => currentStep + 1);
        } else {
            // TODO : filtrer fichiers de style en fonction des tables gardées
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
                    <Description visible={currentStep === STEPS.DESCRIPTION} vectorDb={vectorDbQuery.data} form={form} />

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
