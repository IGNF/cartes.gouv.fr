import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import Stepper from "@codegouvfr/react-dsfr/Stepper";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FC, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";

import api from "../../../api";
import DatastoreLayout from "../../../components/Layout/DatastoreLayout";
import LoadingText from "../../../components/Utils/LoadingText";
import Wait from "../../../components/Utils/Wait";
import RQKeys from "../../../modules/RQKeys";
import Translator from "../../../modules/Translator";
import { CartesApiException } from "../../../modules/jsonFetch";
import { routes } from "../../../router/router";
import type { Service, StoredDataRelation, VectorDb } from "../../../types/app";
import { regex } from "../../../utils";
import validations from "../../../validations";
import TableSelection from "../TableSelection";
import AccessRestrictions from "./AccessRestrictions";
import UploadStyleFile from "./UploadStyleFile";
import AdditionalInfo from "./metadata/AdditionalInfo";
import Description from "./metadata/Description";
import UploadMetadata from "./metadata/UploadMetadata";

import "../../../sass/components/spinner.scss";

const createFormData = (formValues: object) => {
    const fd = new FormData();

    fd.append("category", formValues["category"]);
    fd.append("charset", formValues["charset"]);
    fd.append("creation_date", formValues["creation_date"]);
    fd.append("description", formValues["description"]);
    fd.append("email_contact", formValues["email_contact"]);
    fd.append("encoding", formValues["encoding"]);
    fd.append("identifier", formValues["identifier"]);
    fd.append("languages", JSON.stringify(formValues["languages"]));
    fd.append("selected_tables", JSON.stringify(formValues["selected_tables"]));
    fd.append("organization", formValues["organization"]);
    fd.append("organization_email", formValues["organization_email"]);
    fd.append("projection", formValues["projection"]);
    fd.append("public_name", formValues["public_name"]);
    fd.append("resolution", formValues["resolution"]);
    fd.append("resource_genealogy", formValues["resource_genealogy"]);
    fd.append("share_with", formValues["share_with"]);
    fd.append("technical_name", formValues["technical_name"]);

    // filtrer en fonction des tables sélectionnées
    formValues["selected_tables"].forEach((tableName) => {
        fd.append(`style_${tableName}`, formValues["style_files"]?.[tableName]?.[0]);
    });

    return fd;
};

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

    const offeringsQuery = useQuery({
        queryKey: RQKeys.datastore_offering_list(datastoreId),
        queryFn: () => api.service.getOfferings(datastoreId),
        refetchInterval: 10000,
    });

    const schemas = {};
    schemas[STEPS.TABLES_SELECTION] = yup.object({
        selected_tables: yup.array(yup.string()).min(1, "Veuillez choisir au moins une table").required("Veuillez choisir au moins une table"),
    });
    schemas[STEPS.STYLE_FILE] = yup.object({
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
    });
    schemas[STEPS.METADATA] = yup.object().shape({
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
    });
    schemas[STEPS.DESCRIPTION] = yup
        .object({
            technical_name: yup
                .string()
                .required(Translator.trans("service.wms_vector.new.step_description.technical_name_error"))
                .matches(/^[\w-.]+$/, Translator.trans("service.wms_vector.new.step_description.technical_name_regex"))
                .test({
                    name: "is-unique",
                    test(technicalName, ctx) {
                        const technicalNameList = offeringsQuery?.data?.map((data) => data?.layer_name) ?? [];
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
                .required(Translator.trans("service.wms_vector.new.step_description.email_contact_mandatory_error"))
                .matches(regex.email, Translator.trans("service.wms_vector.new.step_description.email_contact_error")),
            creation_date: yup.date().required(Translator.trans("service.wms_vector.new.step_description.creation_date_error")),
            resource_genealogy: yup.string(),
            organization: yup.string().required(Translator.trans("service.wms_vector.new.step_description.organization_error")),
            organization_email: yup
                .string()
                .required(Translator.trans("service.wms_vector.new.step_description.organization_email_mandatory_error"))
                .matches(regex.email, Translator.trans("service.wms_vector.new.step_description.organization_email_error")),
        })
        .required();
    schemas[STEPS.ADDITIONALINFORMATIONS] = yup
        .object({
            languages: yup
                .array()
                .of(
                    yup.object({
                        language: yup.string(),
                        code: yup.string(),
                    })
                )
                .required(Translator.trans("service.wms_vector.new.step_additional_information.language_error"))
                .min(1, Translator.trans("service.wms_vector.new.step_additional_information.language_error")),
            charset: yup.string().required(Translator.trans("service.wms_vector.new.step_additional_information.charset_error")),
            projection: yup.string().required(Translator.trans("service.wms_vector.new.step_additional_information.projection_error")),
            encoding: yup.string().required(Translator.trans("service.wms_vector.new.step_additional_information.encoding_error")),
            resolution: yup.number(),
        })
        .required();
    schemas[STEPS.ACCESSRESTRICTIONS] = yup.object({
        share_with: yup.string().required(Translator.trans("service.wms_vector.new.step_access_retrictions.share_with_error")),
    });

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
            // formulaire est valide
            // TODO : filtrer fichiers de style en fonction des tables gardées
            // TODO : onSubmit

            const formValues = getFormValues();
            console.log("// TODO : onSubmit");
            console.log("formValues", formValues);
            console.log("errors", errors);

            createServiceMutation.mutate();
        }
    };

    const createServiceMutation = useMutation<Service, CartesApiException>({
        mutationFn: () => {
            const formValues = getFormValues();
            const formData = createFormData(formValues);

            console.log(formData);

            return api.wmsVector.add(datastoreId, vectorDbId, formData);
        },
        onSuccess(response) {
            console.log(response);

            // if (vectorDbQuery.data?.tags?.datasheet_name) {
            //     routes.datastore_datasheet_view({ datastoreId, datasheetName: vectorDbQuery.data?.tags.datasheet_name, activeTab: "services" }).push();
            // } else {
            //     routes.datasheet_list({ datastoreId }).push();
            // }
        },
    });

    return (
        <DatastoreLayout datastoreId={datastoreId} documentTitle="Créer et publier un service WMS-Vecteur">
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
                    {createServiceMutation.error && (
                        <Alert closable description={createServiceMutation.error.message} severity="error" title={Translator.trans("commons.error")} />
                    )}

                    <TableSelection visible={currentStep === STEPS.TABLES_SELECTION} vectorDb={vectorDbQuery.data} form={form} />
                    <UploadStyleFile visible={currentStep === STEPS.STYLE_FILE} selectedTables={selectedTables} form={form} />
                    <UploadMetadata visible={currentStep === STEPS.METADATA} form={form} />
                    <Description visible={currentStep === STEPS.DESCRIPTION} vectorDb={vectorDbQuery.data} form={form} />
                    <AdditionalInfo
                        visible={currentStep === STEPS.ADDITIONALINFORMATIONS}
                        vectorDb={vectorDbQuery.data}
                        datastoreId={datastoreId}
                        form={form}
                    />
                    <AccessRestrictions visible={currentStep === STEPS.ACCESSRESTRICTIONS} datastoreId={datastoreId} form={form} />

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
            {createServiceMutation.isLoading && (
                <Wait>
                    <div className={fr.cx("fr-container")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <div className={fr.cx("fr-col-2")}>
                                <i className={fr.cx("fr-icon-refresh-line", "fr-icon--lg") + " icons-spin"} />
                            </div>
                            <div className={fr.cx("fr-col-10")}>
                                <h6 className={fr.cx("fr-h6", "fr-m-0")}>{"Création du service WMS-Vecteur en cours"}</h6>
                            </div>
                        </div>
                    </div>
                </Wait>
            )}
        </DatastoreLayout>
    );
};

export default WmsVectorServiceNew;
