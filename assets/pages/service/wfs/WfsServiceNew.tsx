import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import Stepper from "@codegouvfr/react-dsfr/Stepper";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery } from "@tanstack/react-query";
import { FC, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";

import api from "../../../api";
import DatastoreLayout from "../../../components/Layout/DatastoreLayout";
import LoadingText from "../../../components/Utils/LoadingText";
import Wait from "../../../components/Utils/Wait";
import { filterGeometricRelations } from "../../../helpers";
import RQKeys from "../../../modules/RQKeys";
import Translator from "../../../modules/Translator";
import { CartesApiException } from "../../../modules/jsonFetch";
import { routes } from "../../../router/router";
import { EndpointTypeEnum, StoredDataRelation, VectorDb } from "../../../types/app";
import AccessRestrictions from "../AccessRestrictions";
import { CommonSchemasValidation } from "../common-schemas-validation";
import AdditionalInfo from "../metadatas/AdditionalInfo";
import Description from "../metadatas/Description";
import UploadMDFile from "../metadatas/UploadMDFile";
import TableInfosForm from "./TablesInfoForm";

/**
 *
 * @param datastoreId identifiant du datastore
 * @param vectorDbId identifiant de la donnee stockée VECTOR-DB
 */
type WfsServiceNewProps = {
    datastoreId: string;
    vectorDbId: string;
};

type TableInfos = {
    native_name?: string;
    public_name?: string;
    title: string;
    description: string;
    keywords?: string[];
};

/**
 * Formulaire general de création d'un service WFS
 */
const WfsServiceNew: FC<WfsServiceNewProps> = ({ datastoreId, vectorDbId }) => {
    const STEPS = {
        TABLES_INFOS: 1,
        METADATAS_UPLOAD: 2,
        METADATAS_DESCRIPTION: 3,
        METADATAS_ADDITIONALINFORMATIONS: 4,
        ACCESSRESTRICTIONS: 5,
    };

    /* l'etape courante */
    const [currentStep, setCurrentStep] = useState(STEPS.TABLES_INFOS);
    const [tables, setTables] = useState<StoredDataRelation[]>([]);

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [validationError, setValidationError] = useState<CartesApiException>();

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

    const commonValidation = useMemo(() => new CommonSchemasValidation(offeringsQuery.data), [offeringsQuery.data]);

    // Definition du schema
    const schemas = {};
    schemas[STEPS.TABLES_INFOS] = yup.object().shape({
        selected_tables: yup.array(yup.string()).min(1, "Veuillez choisir au moins une table").required("Veuillez choisir au moins une table"),
        table_infos: yup.lazy(() => {
            if (!selectedTables || selectedTables.length === 0) {
                return yup.mixed().nullable().notRequired();
            }

            const table_schemas = {};
            selectedTables.forEach((table) => {
                table_schemas[table] = yup.object({
                    public_name: yup.string().default(table),
                    title: yup.string().required(`Le titre de la table ${table} est obligatoire`),
                    description: yup.string().required(`Le résumé du contenu de la table ${table} est obligatoire`),
                    keywords: yup.array().of(yup.string()),
                });
            });
            return yup.object().shape(table_schemas);
        }),
    });
    schemas[STEPS.METADATAS_UPLOAD] = commonValidation.getMDUploadFileSchema();
    schemas[STEPS.METADATAS_DESCRIPTION] = commonValidation.getMDDescriptionSchema();
    schemas[STEPS.METADATAS_ADDITIONALINFORMATIONS] = commonValidation.getMDAdditionalInfoSchema();
    schemas[STEPS.ACCESSRESTRICTIONS] = commonValidation.getAccessRestrictionSchema();

    useEffect(() => {
        if (!vectorDbQuery.data) return;
        const relations = vectorDbQuery.data.type_infos?.relations ?? [];
        const tables = filterGeometricRelations(relations, true);
        setTables(tables);
    }, [vectorDbQuery.data]);

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

    const selectedTables = watch("selected_tables");

    // Ajout du nom natif et trim sur les mots cles
    const format = (table_infos: Record<string, TableInfos>) => {
        const tInfos: object[] = [];
        for (const [name, infos] of Object.entries(table_infos)) {
            tInfos.push({
                native_name: name,
                ...infos,
            });
        }
        return tInfos;
    };

    const previousStep = () => setCurrentStep((currentStep) => currentStep - 1);

    const nextStep = async () => {
        const isStepValid = await trigger(undefined, { shouldFocus: true }); // demande de valider le formulaire
        if (!isStepValid) return;

        if (currentStep < Object.values(STEPS).length) {
            setCurrentStep((currentStep) => currentStep + 1);
            return;
        }

        setIsSubmitting(true);

        // Nettoyage => trim sur toutes les chaines
        const values = JSON.parse(
            JSON.stringify(getFormValues(), (key, value) => {
                return typeof value === "string" ? value.trim() : value;
            })
        );
        values.table_infos = format(values.table_infos);

        api.wfs
            .add(datastoreId, vectorDbId, values)
            .then(() => {
                if (vectorDbQuery.data?.tags?.datasheet_name) {
                    routes.datastore_datasheet_view({ datastoreId, datasheetName: vectorDbQuery.data?.tags.datasheet_name, activeTab: "services" }).push();
                } else {
                    routes.datasheet_list({ datastoreId }).push();
                }
            })
            .catch((error) => {
                console.error(error);
                setValidationError(error as CartesApiException);
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    return (
        <DatastoreLayout datastoreId={datastoreId} documentTitle="Créer et publier un service WFS">
            <h1>{Translator.trans("service.wfs.new.title")}</h1>
            {vectorDbQuery.isLoading ? (
                <LoadingText message={Translator.trans("service.wfs.new.loading_stored_data")} />
            ) : vectorDbQuery.data === undefined ? (
                <Alert
                    severity="error"
                    closable={false}
                    title={Translator.trans("get_stored_data_failed")}
                    description={<Button linkProps={routes.datasheet_list({ datastoreId }).link}>{Translator.trans("back_to_my_datas")}</Button>}
                />
            ) : (
                <>
                    <Stepper
                        currentStep={currentStep}
                        nextTitle={currentStep < STEPS.ACCESSRESTRICTIONS && Translator.trans(`service.wfs.new.step${currentStep + 1}`)}
                        stepCount={5}
                        title={Translator.trans(`service.wfs.new.step${currentStep}`)}
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
                    <TableInfosForm
                        visible={currentStep === STEPS.TABLES_INFOS}
                        tables={tables}
                        form={form}
                        state={errors.selected_tables ? "error" : "default"}
                        stateRelatedMessage={errors?.selected_tables?.message?.toString()}
                    />
                    <UploadMDFile visible={currentStep === STEPS.METADATAS_UPLOAD} form={form} />
                    <Description visible={currentStep === STEPS.METADATAS_DESCRIPTION} form={form} />
                    <AdditionalInfo
                        datastoreId={datastoreId}
                        storedData={vectorDbQuery.data}
                        visible={currentStep === STEPS.METADATAS_ADDITIONALINFORMATIONS}
                        form={form}
                    />
                    <AccessRestrictions
                        datastoreId={datastoreId}
                        endpointType={EndpointTypeEnum.WFS}
                        visible={currentStep === STEPS.ACCESSRESTRICTIONS}
                        form={form}
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
                    <ButtonsGroup
                        className={fr.cx("fr-mt-2w")}
                        alignment="between"
                        buttons={[
                            {
                                children: Translator.trans("previous_step"),
                                iconId: "fr-icon-arrow-left-fill",
                                priority: "tertiary",
                                onClick: previousStep,
                                disabled: currentStep === STEPS.TABLES_INFOS,
                            },
                            {
                                children:
                                    currentStep < Object.values(STEPS).length ? Translator.trans("continue") : Translator.trans("service.wfs.new.publish"),
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
                                <h6 className={fr.cx("fr-h6", "fr-m-0")}>{"Création du service WFS en cours"}</h6>
                            </div>
                        </div>
                    </div>
                </Wait>
            )}
        </DatastoreLayout>
    );
};

export default WfsServiceNew;
