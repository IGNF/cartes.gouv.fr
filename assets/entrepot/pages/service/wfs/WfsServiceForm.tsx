import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import Stepper from "@codegouvfr/react-dsfr/Stepper";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { declareComponentKeys } from "i18nifty";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { symToStr } from "tsafe/symToStr";
import * as yup from "yup";

import { ConfigurationTypeEnum, EndpointTypeEnum, Service, ServiceFormValuesBaseType, StoredDataRelation, VectorDb } from "../../../../@types/app";
import DatastoreLayout from "../../../../components/Layout/DatastoreLayout";
import LoadingIcon from "../../../../components/Utils/LoadingIcon";
import LoadingText from "../../../../components/Utils/LoadingText";
import Wait from "../../../../components/Utils/Wait";
import { filterGeometricRelations } from "../../../../helpers";
import { Translations, useTranslation } from "../../../../i18n/i18n";
import RQKeys from "../../../../modules/entrepot/RQKeys";
import { CartesApiException } from "../../../../modules/jsonFetch";
import { routes } from "../../../../router/router";
import api from "../../../api";
import AccessRestrictions from "../AccessRestrictions";
import { CommonSchemasValidation } from "../common-schemas-validation";
import { getWfsServiceFormDefaultValues } from "../default-values";
import AdditionalInfo from "../metadatas/AdditionalInfo";
import Description from "../metadatas/Description";
import UploadMDFile from "../metadatas/UploadMDFile";
import TableInfosForm from "./TablesInfoForm";

// Ajout du nom natif et trim sur les mots cles
const formatTablesInfos = (table_infos: Record<string, WfsTableInfos>) => {
    const tInfos: object[] = [];
    for (const [name, infos] of Object.entries(table_infos)) {
        tInfos.push({
            native_name: name,
            ...infos,
        });
    }
    return tInfos;
};

const createRequestBody = (formValues: WfsServiceFormValuesType) => {
    // Nettoyage => trim sur toutes les chaines
    const values = JSON.parse(
        JSON.stringify(formValues, (key, value) => {
            return typeof value === "string" ? value.trim() : value;
        })
    );
    values.table_infos = formatTablesInfos(values.table_infos);
    return values;
};

export type WfsServiceFormValuesType = ServiceFormValuesBaseType & {
    selected_tables?: string[];
    table_infos?: Record<string, WfsTableInfos>;
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
            if (vectorDbQuery.data?.tags?.datasheet_name) {
                queryClient.invalidateQueries({
                    queryKey: RQKeys.datastore_datasheet(datastoreId, vectorDbQuery.data?.tags.datasheet_name),
                });
                routes.datastore_datasheet_view({ datastoreId, datasheetName: vectorDbQuery.data?.tags.datasheet_name, activeTab: "services" }).push();
                queryClient.refetchQueries({ queryKey: RQKeys.datastore_metadata_by_datasheet_name(datastoreId, vectorDbQuery.data?.tags?.datasheet_name) });
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
        queryKey: RQKeys.datastore_metadata_by_datasheet_name(datastoreId, vectorDbQuery.data?.tags?.datasheet_name ?? "XX"),
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

    useEffect(() => {
        window?.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }, [currentStep]);

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

            {vectorDbQuery.isLoading || offeringQuery.isLoading ? (
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

export const { i18n } = declareComponentKeys<
    | { K: "title"; P: { editMode: boolean }; R: string }
    | "stored_data.loading"
    | "stored_data_and_offering.loading"
    | "stored_data.fetch_failed"
    | "offering.fetch_failed"
    | { K: "step.title"; P: { stepNumber: number }; R: string }
    | "previous_step"
    | "continue"
    | "publish"
    | "publish.in_progress"
    | "modify.in_progress"
    | "back_to_data_list"
>()({
    WfsServiceForm,
});

export const WfsServiceFormFrTranslations: Translations<"fr">["WfsServiceForm"] = {
    title: ({ editMode }) => (editMode ? "Modifier le service WFS" : "Créer et publier un service WFS"),
    "stored_data.loading": "Chargement de la donnée stockée...",
    "stored_data_and_offering.loading": "Chargement de la donnée stockée et le service à modifier...",
    "stored_data.fetch_failed": "Récupération des informations sur la donnée stockée a échoué",
    "offering.fetch_failed": "Récupération des informations sur le service à modifier a échoué",
    "step.title": ({ stepNumber }) => {
        switch (stepNumber) {
            case 1:
                return "Tables";
            case 2:
                return "Source des métadonnées";
            case 3:
                return "Description de la ressource";
            case 4:
                return "Informations supplémentaires";
            case 5:
                return "Restrictions d'accès";
            default:
                return "";
        }
    },
    previous_step: "Étape précédente",
    continue: "Continuer",
    publish: "Publier le service maintenant",
    "publish.in_progress": "Création du service WFS en cours",
    "modify.in_progress": "Modification des informations du service WFS en cours",
    back_to_data_list: "Retour à mes données",
};

export const WfsServiceFormEnTranslations: Translations<"en">["WfsServiceForm"] = {
    title: undefined,
    "stored_data.loading": undefined,
    "stored_data_and_offering.loading": undefined,
    "stored_data.fetch_failed": undefined,
    "offering.fetch_failed": undefined,
    "step.title": undefined,
    previous_step: undefined,
    continue: undefined,
    publish: undefined,
    "publish.in_progress": undefined,
    "modify.in_progress": undefined,
    back_to_data_list: undefined,
};
