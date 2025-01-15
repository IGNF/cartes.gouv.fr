import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import Stepper from "@codegouvfr/react-dsfr/Stepper";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, useCallback, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { symToStr } from "tsafe/symToStr";
import * as yup from "yup";

import { ConfigurationTypeEnum, EndpointTypeEnum, Service, ServiceFormValuesBaseType, StoredDataRelation, VectorDb } from "../../../../@types/app";
import DatastoreLayout from "../../../../components/Layout/DatastoreLayout";
import LoadingIcon from "../../../../components/Utils/LoadingIcon";
import LoadingText from "../../../../components/Utils/LoadingText";
import Wait from "../../../../components/Utils/Wait";
import { filterGeometricRelations } from "../../../../helpers";
import useScrollToTopEffect from "../../../../hooks/useScrollToTopEffect";
import { useTranslation } from "../../../../i18n/i18n";
import RQKeys from "../../../../modules/entrepot/RQKeys";
import { CartesApiException } from "../../../../modules/jsonFetch";
import { routes } from "../../../../router/router";
import { trimObject } from "../../../../utils";
import api from "../../../api";
import AccessRestrictions from "../common/AccessRestrictions/AccessRestrictions";
import { CommonSchemasValidation } from "../common/common-schemas-validation";
import { getWfsServiceFormDefaultValues } from "../common/default-values";
import AdditionalInfo from "../metadata/AdditionalInfo";
import Description from "../metadata/Description";
import UploadMDFile from "../metadata/UploadMDFile";
import TableInfosForm from "./TablesInfoForm";
import { regex } from "../../../../utils";

type TableInfoType = Record<string, WfsTableInfos>;

/* On ne garde dans table_infos que les tables sélectionnées
 Ajout du nom natif sur les tables et suppression des mots clés en doublon */
const formatTablesInfos = (selectedTables: string[] | undefined, table_infos: TableInfoType): WfsTableInfos[] => {
    const tables = selectedTables ?? [];

    const filteredInfos: TableInfoType = Object.keys(table_infos)
        .filter((key) => tables.includes(key))
        .reduce((obj, key) => {
            obj[key] = table_infos[key];
            return obj;
        }, {});

    const tInfos: WfsTableInfos[] = [];
    for (const [name, infos] of Object.entries(filteredInfos)) {
        const i = { native_name: name, ...infos };
        i.keywords = Array.from(new Set(i.keywords)); // Suppression des doublons
        tInfos.push(i);
    }
    return tInfos;
};

const createRequestBody = (formValues: WfsServiceFormValuesType) => {
    // Nettoyage => trim sur toutes les chaines
    const values = trimObject(formValues) as WfsServiceFormValuesType;

    values.free_keywords = Array.from(new Set(values.free_keywords)); // Suppression des doublons
    values.table_infos = formatTablesInfos(values.selected_tables, values.table_infos as TableInfoType);
    return values;
};

export type WfsServiceFormValuesType = ServiceFormValuesBaseType & {
    selected_tables?: string[];
    table_infos?: TableInfoType | WfsTableInfos[];
};

/**
 *
 * @param datastoreId identifiant du datastore
 * @param vectorDbId identifiant de la donnee stockée VECTOR-DB
 */
type WfsServiceFormProps = {
    datastoreId: string;
    vectorDbId: string;
    offeringId?: string;
};

export type WfsTableInfos = {
    native_name?: string;
    public_name?: string;
    title: string;
    description: string;
    keywords?: string[];
};

const STEPS = {
    TABLES_INFOS: 1,
    METADATAS_UPLOAD: 2,
    METADATAS_DESCRIPTION: 3,
    METADATAS_ADDITIONALINFORMATIONS: 4,
    ACCESSRESTRICTIONS: 5,
};

const commonValidation = new CommonSchemasValidation();

/**
 * Formulaire general de création d'un service WFS
 */
const WfsServiceForm: FC<WfsServiceFormProps> = ({ datastoreId, vectorDbId, offeringId }) => {
    const { t } = useTranslation("WfsServiceForm");
    const { t: tCommon } = useTranslation("Common");

    /* l'etape courante */
    const [currentStep, setCurrentStep] = useState(STEPS.TABLES_INFOS);
    const editMode = useMemo(() => !!offeringId, [offeringId]);

    const queryClient = useQueryClient();

    const createServiceMutation = useMutation<Service, CartesApiException>({
        mutationFn: () => {
            let formValues = getFormValues();
            formValues = createRequestBody(formValues);

            return api.wfs.add(datastoreId, vectorDbId, formValues);
        },
        onSuccess() {
            if (vectorDbQuery.data?.tags?.datasheet_name) {
                queryClient.invalidateQueries({
                    queryKey: RQKeys.datastore_datasheet(datastoreId, vectorDbQuery.data?.tags.datasheet_name),
                });
                routes.datastore_datasheet_view({ datastoreId, datasheetName: vectorDbQuery.data?.tags.datasheet_name, activeTab: "services" }).push();
            } else {
                routes.datasheet_list({ datastoreId }).push();
            }
        },
    });

    const editServiceMutation = useMutation<Service, CartesApiException>({
        mutationFn: () => {
            if (offeringId === undefined) {
                return Promise.reject();
            }

            let formValues = getFormValues();
            formValues = createRequestBody(formValues);

            return api.wfs.edit(datastoreId, vectorDbId, offeringId, formValues);
        },
        onSuccess() {
            if (offeringId !== undefined) {
                queryClient.removeQueries({
                    queryKey: RQKeys.datastore_offering(datastoreId, offeringId),
                });
            }

            if (vectorDbQuery.data?.tags?.datasheet_name) {
                queryClient.invalidateQueries({
                    queryKey: RQKeys.datastore_datasheet(datastoreId, vectorDbQuery.data?.tags.datasheet_name),
                });
                routes.datastore_datasheet_view({ datastoreId, datasheetName: vectorDbQuery.data?.tags.datasheet_name, activeTab: "services" }).push();
                queryClient.refetchQueries({ queryKey: RQKeys.datastore_datasheet_metadata(datastoreId, vectorDbQuery.data?.tags?.datasheet_name) });
            } else {
                routes.datasheet_list({ datastoreId }).push();
            }
        },
    });

    const vectorDbQuery = useQuery({
        queryKey: RQKeys.datastore_stored_data(datastoreId, vectorDbId),
        queryFn: () => api.storedData.get<VectorDb>(datastoreId, vectorDbId),
        staleTime: Infinity,
        enabled: !(createServiceMutation.isPending || editServiceMutation.isPending),
    });

    const existingLayerNamesQuery = useQuery<string[], CartesApiException>({
        queryKey: RQKeys.datastore_layernames_list(datastoreId, ConfigurationTypeEnum.WFS),
        queryFn: ({ signal }) => api.service.getExistingLayerNames(datastoreId, ConfigurationTypeEnum.WFS, { signal }),
        refetchInterval: 30000,
        enabled: !(createServiceMutation.isPending || editServiceMutation.isPending),
    });

    const offeringQuery = useQuery<Service | null, CartesApiException>({
        queryKey: RQKeys.datastore_offering(datastoreId, offeringId ?? "xxxx"),
        queryFn: ({ signal }) => {
            if (offeringId) {
                return api.service.getService(datastoreId, offeringId, { signal });
            }
            return Promise.resolve(null);
        },
        enabled: editMode && !(createServiceMutation.isPending || editServiceMutation.isPending),
        staleTime: Infinity,
    });

    const metadataQuery = useQuery({
        queryKey: RQKeys.datastore_datasheet_metadata(datastoreId, vectorDbQuery.data?.tags?.datasheet_name ?? "XX"),
        queryFn: ({ signal }) => api.metadata.getByDatasheetName(datastoreId, vectorDbQuery.data?.tags?.datasheet_name ?? "XX", { signal }),
        enabled: !!vectorDbQuery.data?.tags?.datasheet_name,
    });

    // Definition du schema
    const schemas = {};
    schemas[STEPS.TABLES_INFOS] = yup.object().shape({
        selected_tables: yup.array(yup.string()).min(1, "Veuillez choisir au moins une table").required("Veuillez choisir au moins une table"),
        table_infos: yup.lazy(() => {
            if (!selectedTableNamesList || selectedTableNamesList.length === 0) {
                return yup.mixed().nullable().notRequired();
            }
            const table_schemas = {};
            selectedTableNamesList.forEach((table) => {
                table_schemas[table] = yup.object({
                    public_name: yup
                        .string()
                        .default(table)
                        .test("matches", t("public_name_regex"), (value) => {
                            if (!value || value.trim() === "") {
                                return true;
                            }
                            return regex.public_name.test(value);
                        }),
                    title: yup.string().trim(t("trimmed_error")).strict(true).required(`Le titre de la table ${table} est obligatoire`),
                    description: yup.string().trim(t("trimmed_error")).strict(true).required(`Le résumé du contenu de la table ${table} est obligatoire`),
                    keywords: yup.array().of(yup.string()),
                });
            });
            return yup.object().shape(table_schemas);
        }),
    });
    schemas[STEPS.METADATAS_UPLOAD] = commonValidation.getMDUploadFileSchema();
    schemas[STEPS.METADATAS_DESCRIPTION] = commonValidation.getMDDescriptionSchema(
        existingLayerNamesQuery.data,
        editMode,
        offeringQuery.data?.configuration.layer_name
    );
    schemas[STEPS.METADATAS_ADDITIONALINFORMATIONS] = commonValidation.getMDAdditionalInfoSchema();
    schemas[STEPS.ACCESSRESTRICTIONS] = commonValidation.getAccessRestrictionSchema();

    const defaultValues: WfsServiceFormValuesType = useMemo(
        () => getWfsServiceFormDefaultValues(offeringQuery.data, editMode, vectorDbQuery.data, metadataQuery.data),
        [editMode, vectorDbQuery.data, offeringQuery.data, metadataQuery?.data]
    );

    const tables: StoredDataRelation[] = useMemo(() => {
        if (!vectorDbQuery.data?.type_infos) return [];

        const relations = vectorDbQuery.data.type_infos?.relations ?? [];
        return filterGeometricRelations(relations, true);
    }, [vectorDbQuery.data?.type_infos]);

    const form = useForm<WfsServiceFormValuesType>({
        resolver: yupResolver(schemas[currentStep]),
        mode: "onChange",
        values: defaultValues,
    });
    const {
        formState: { errors },
        getValues: getFormValues,
        trigger,
    } = form;

    const selectedTableNamesList: string[] | undefined = useWatch({
        control: form.control,
        name: "selected_tables",
        defaultValue: [],
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

            if (editMode) {
                editServiceMutation.mutate();
            } else {
                createServiceMutation.mutate();
            }
        }
    }, [createServiceMutation, editServiceMutation, currentStep, trigger, editMode]);

    return (
        <DatastoreLayout datastoreId={datastoreId} documentTitle={t("title", { editMode })}>
            <h1>{t("title", { editMode })}</h1>

            {vectorDbQuery.isLoading || offeringQuery.isLoading || metadataQuery.isLoading ? (
                <LoadingText as="h2" message={editMode ? t("stored_data_and_offering.loading") : t("stored_data.loading")} />
            ) : vectorDbQuery.data === undefined ? (
                <Alert
                    severity="error"
                    closable={false}
                    title={t("stored_data.fetch_failed")}
                    description={
                        <>
                            <p>{vectorDbQuery.error?.message}</p>
                            <Button linkProps={routes.datasheet_list({ datastoreId }).link}>{t("back_to_data_list")}</Button>
                        </>
                    }
                />
            ) : editMode === true && offeringQuery.data === undefined ? (
                <Alert
                    severity="error"
                    closable={false}
                    title={t("offering.fetch_failed")}
                    description={
                        <>
                            <p>{offeringQuery.error?.message}</p>
                            <Button linkProps={routes.datasheet_list({ datastoreId }).link}>{t("back_to_data_list")}</Button>
                        </>
                    }
                />
            ) : (
                <>
                    <Stepper
                        currentStep={currentStep}
                        stepCount={Object.values(STEPS).length}
                        nextTitle={currentStep < STEPS.ACCESSRESTRICTIONS && t("step.title", { stepNumber: currentStep + 1 })}
                        title={t("step.title", { stepNumber: currentStep })}
                    />
                    {createServiceMutation.error && (
                        <Alert closable description={createServiceMutation.error.message} severity="error" title={tCommon("error")} />
                    )}
                    {editServiceMutation.error && <Alert closable description={editServiceMutation.error.message} severity="error" title={tCommon("error")} />}

                    <TableInfosForm
                        visible={currentStep === STEPS.TABLES_INFOS}
                        tables={tables}
                        form={form}
                        state={errors.selected_tables ? "error" : "default"}
                        stateRelatedMessage={errors?.selected_tables?.message?.toString()}
                    />

                    <UploadMDFile visible={currentStep === STEPS.METADATAS_UPLOAD} form={form} />
                    <Description visible={currentStep === STEPS.METADATAS_DESCRIPTION} form={form} editMode={editMode} />
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
                        service={offeringQuery.data}
                    />

                    <ButtonsGroup
                        className={fr.cx("fr-mt-2w")}
                        alignment="between"
                        buttons={[
                            {
                                children: t("previous_step"),
                                iconId: "fr-icon-arrow-left-fill",
                                priority: "tertiary",
                                onClick: previousStep,
                                disabled: currentStep === STEPS.TABLES_INFOS,
                            },
                            {
                                children: currentStep < Object.values(STEPS).length ? t("continue") : t("publish"),
                                onClick: nextStep,
                            },
                        ]}
                        inlineLayoutWhen="always"
                    />
                </>
            )}
            {(createServiceMutation.isPending || editServiceMutation.isPending) && (
                <Wait>
                    <div className={fr.cx("fr-container")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <div className={fr.cx("fr-col-2")}>
                                <LoadingIcon largeIcon={true} />
                            </div>
                            <div className={fr.cx("fr-col-10")}>
                                <h6 className={fr.cx("fr-h6", "fr-m-0")}>{editMode ? t("modify.in_progress") : t("publish.in_progress")}</h6>
                            </div>
                        </div>
                    </div>
                </Wait>
            )}
        </DatastoreLayout>
    );
};

WfsServiceForm.displayName = symToStr({ WfsServiceForm });

export default WfsServiceForm;
