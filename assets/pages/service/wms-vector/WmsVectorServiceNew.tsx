import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import Stepper from "@codegouvfr/react-dsfr/Stepper";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FC, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { symToStr } from "tsafe/symToStr";
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
import validations from "../../../validations";
import AccessRestrictions from "../AccessRestrictions";
import TableSelection from "../TableSelection";
import { CommonSchemasValidation } from "../common-schemas-validation";
import AdditionalInfo from "../metadatas/AdditionalInfo";
import Description from "../metadatas/Description";
import UploadMDFile from "../metadatas/UploadMDFile";
import UploadStyleFile from "./UploadStyleFile";

import "../../../sass/components/spinner.scss";

const createFormData = (formValues: object) => {
    const fd = new FormData();

    fd.set("category", JSON.stringify(formValues["category"]));
    fd.set("charset", formValues["charset"]);
    fd.set("creation_date", formValues["creation_date"]);
    fd.set("description", formValues["description"]);
    fd.set("email_contact", formValues["email_contact"]);
    fd.set("encoding", formValues["encoding"]);
    fd.set("identifier", formValues["identifier"]);
    fd.set("languages", JSON.stringify(formValues["languages"]));
    fd.set("selected_tables", JSON.stringify(formValues["selected_tables"]));
    fd.set("organization", formValues["organization"]);
    fd.set("organization_email", formValues["organization_email"]);
    fd.set("projection", formValues["projection"]);
    fd.set("public_name", formValues["public_name"]);
    fd.set("resolution", formValues["resolution"]);
    fd.set("resource_genealogy", formValues["resource_genealogy"]);
    fd.set("share_with", formValues["share_with"]);
    fd.set("technical_name", formValues["technical_name"]);

    // filtrer en fonction des tables sélectionnées
    formValues["selected_tables"].forEach((tableName) => {
        fd.set(`style_${tableName}`, formValues["style_files"]?.[tableName]?.[0]);
    });

    return fd;
};

type WmsVectorServiceNewProps = {
    datastoreId: string;
    vectorDbId: string;
};
const WmsVectorServiceNew: FC<WmsVectorServiceNewProps> = ({ datastoreId, vectorDbId }) => {
    const STEPS = {
        TABLES_INFOS: 1,
        STYLE_FILE: 2,
        METADATAS_UPLOAD: 3,
        METADATAS_DESCRIPTION: 4,
        METADATAS_ADDITIONALINFORMATIONS: 5,
        ACCESSRESTRICTIONS: 6,
    };

    const [currentStep, setCurrentStep] = useState(STEPS.TABLES_INFOS);

    const vectorDbQuery = useQuery({
        queryKey: RQKeys.datastore_stored_data(datastoreId, vectorDbId),
        queryFn: () => api.storedData.get<VectorDb>(datastoreId, vectorDbId),
        staleTime: 600000,
    });

    const offeringsQuery = useQuery({
        queryKey: RQKeys.datastore_offering_list(datastoreId),
        queryFn: () => api.service.getOfferings(datastoreId),
        refetchInterval: 30000,
    });

    const commonValidation = useMemo(() => new CommonSchemasValidation(offeringsQuery.data), [offeringsQuery.data]);

    // Definition du schema
    const schemas = {};
    schemas[STEPS.TABLES_INFOS] = yup.object({
        selected_tables: yup
            .array(yup.string().trim())
            .min(1, "Veuillez choisir au moins une table")
            .required("Veuillez choisir au moins une table")
            .strict(true),
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
                            return validations.getValidator("sld").validate(table.name, value as FileList, ctx);
                            // return validations.sldStyle.test(table.name, value as FileList, ctx);
                        },
                    });
            });
            return yup.object().shape(styleFiles);
        }),
    });
    schemas[STEPS.METADATAS_UPLOAD] = commonValidation.getMDUploadFileSchema();
    schemas[STEPS.METADATAS_DESCRIPTION] = commonValidation.getMDDescriptionSchema();
    schemas[STEPS.METADATAS_ADDITIONALINFORMATIONS] = commonValidation.getMDAdditionalInfoSchema();
    schemas[STEPS.ACCESSRESTRICTIONS] = commonValidation.getAccessRestrictionSchema();

    const form = useForm({
        resolver: yupResolver(schemas[currentStep]),
        mode: "onChange",
    });
    const { getValues: getFormValues, watch, trigger } = form;

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

        if (!isStepValid) return; // ne fait rien si formulaire invalide

        // formulaire est valide
        if (currentStep < Object.values(STEPS).length) {
            // on passe à la prochaine étape du formulaire
            setCurrentStep((currentStep) => currentStep + 1);
        } else {
            // on est à la dernière étape du formulaire donc on envoie la sauce
            createServiceMutation.mutate();
        }
    };

    const createServiceMutation = useMutation<Service, CartesApiException>({
        mutationFn: () => {
            const formValues = getFormValues();
            const formData = createFormData(formValues);

            return api.wmsVector.add(datastoreId, vectorDbId, formData);
        },
        onSuccess() {
            if (vectorDbQuery.data?.tags?.datasheet_name) {
                routes.datastore_datasheet_view({ datastoreId, datasheetName: vectorDbQuery.data?.tags.datasheet_name, activeTab: "services" }).push();
            } else {
                routes.datasheet_list({ datastoreId }).push();
            }
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

                    <TableSelection visible={currentStep === STEPS.TABLES_INFOS} vectorDb={vectorDbQuery.data} form={form} />
                    <UploadStyleFile visible={currentStep === STEPS.STYLE_FILE} selectedTables={selectedTables} form={form} />
                    <UploadMDFile visible={currentStep === STEPS.METADATAS_UPLOAD} form={form} />
                    <Description
                        storedData={vectorDbQuery.data}
                        endpointType={"WMS-VECTOR"}
                        visible={currentStep === STEPS.METADATAS_DESCRIPTION}
                        form={form}
                    />
                    <AdditionalInfo
                        datastoreId={datastoreId}
                        storedData={vectorDbQuery.data}
                        visible={currentStep === STEPS.METADATAS_ADDITIONALINFORMATIONS}
                        form={form}
                    />
                    <AccessRestrictions datastoreId={datastoreId} endpointType={"WMS-VECTOR"} visible={currentStep === STEPS.ACCESSRESTRICTIONS} form={form} />

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
            {createServiceMutation.isPending && (
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

WmsVectorServiceNew.displayName = symToStr({ WmsVectorServiceNew });

export default WmsVectorServiceNew;
