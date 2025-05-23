import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import Stepper from "@codegouvfr/react-dsfr/Stepper";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import SldStyleParser from "geostyler-sld-parser";
import { FC, useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { symToStr } from "tsafe/symToStr";
import * as yup from "yup";

import {
    ConfigurationTypeEnum,
    EndpointTypeEnum,
    type Service,
    type ServiceFormValuesBaseType,
    type StoredDataRelation,
    type VectorDb,
} from "../../../../@types/app";
import Main from "../../../../components/Layout/Main";
import LoadingIcon from "../../../../components/Utils/LoadingIcon";
import LoadingText from "../../../../components/Utils/LoadingText";
import Wait from "../../../../components/Utils/Wait";
import useScrollToTopEffect from "../../../../hooks/useScrollToTopEffect";
import { useTranslation } from "../../../../i18n/i18n";
import RQKeys from "../../../../modules/entrepot/RQKeys";
import { CartesApiException } from "../../../../modules/jsonFetch";
import { routes } from "../../../../router/router";
import SldStyleWmsVectorValidator from "../../../../validations/sld/sldStyle";
import api from "../../../api";
import AccessRestrictions from "../common/AccessRestrictions/AccessRestrictions";
import TableSelection from "../common/TableSelection/TableSelection";
import { CommonSchemasValidation } from "../common/common-schemas-validation";
import { getWmsVectorServiceFormDefaultValues } from "../common/default-values";
import AdditionalInfo from "../metadata/AdditionalInfo";
import Description from "../metadata/Description";
import UploadMDFile from "../metadata/UploadMDFile";
import UploadStyleFile from "./UploadStyleFile";

/**
 * Convertir en v1.0.0 si l'utilisateur a déposé un sld en v1.1.0
 */
const getSld100 = async (originalFile: File): Promise<File> => {
    const fileContent = await originalFile.text();

    const sldParser = new SldStyleParser({ locale: "fr" });

    const result = await sldParser.readStyle(fileContent);
    if (sldParser.readingSldVersion === "1.1.0") {
        sldParser.sldVersion = "1.0.0";
        const convertedStyle = await sldParser.writeStyle(result.output!);

        const blob = new Blob([convertedStyle.output!]);
        const newFile = new File([blob], originalFile.name);
        return newFile;
    } else {
        return originalFile;
    }
};

const createFormData = async (formValues: WmsVectorServiceFormValuesType) => {
    const fd = new FormData();

    formValues.category?.forEach((c) => fd.append("category[]", c));
    formValues.keywords?.forEach((c) => fd.append("keywords[]", c));
    formValues.free_keywords?.forEach((c) => fd.append("free_keywords[]", c));

    if (formValues.attribution_text) {
        fd.set("attribution_text", formValues.attribution_text!);
    }
    if (formValues.attribution_url) {
        fd.set("attribution_url", formValues.attribution_url!);
    }

    fd.set("charset", formValues.charset!);
    fd.set("creation_date", formValues.creation_date!);
    fd.set("description", formValues.description!);
    fd.set("email_contact", formValues.email_contact!);
    // fd.set("encoding", formValues.encoding!);
    fd.set("identifier", formValues.identifier!);

    fd.set("language[language]", formValues.language!.language);
    fd.set("language[code]", formValues.language!.code);

    formValues.selected_tables?.forEach((c) => fd.append("selected_tables[]", c));

    fd.set("organization", formValues.organization!);
    fd.set("organization_email", formValues.organization_email!);
    fd.set("projection", formValues.projection!);
    fd.set("public_name", formValues.public_name!);
    fd.set("service_name", formValues.service_name!);
    fd.set("resolution", formValues.resolution!);
    fd.set("resource_genealogy", formValues.resource_genealogy!);
    fd.set("hierarchy_level", formValues.hierarchy_level!);
    fd.set("frequency_code", formValues.frequency_code!);
    fd.set("share_with", formValues.share_with!);
    fd.set("allow_view_data", String(formValues.allow_view_data!));
    fd.set("technical_name", formValues.technical_name!);

    // filtrer en fonction des tables sélectionnées
    for (const tableName of formValues.selected_tables!) {
        if (formValues?.style_files?.[tableName]?.[0] !== undefined) {
            fd.set(`style_${tableName}`, await getSld100(formValues?.style_files?.[tableName]?.[0]));
        }
    }

    return fd;
};

const commonValidation = new CommonSchemasValidation();

const STEPS = {
    TABLES_INFOS: 1,
    STYLE_FILE: 2,
    METADATAS_UPLOAD: 3,
    METADATAS_DESCRIPTION: 4,
    METADATAS_ADDITIONALINFORMATIONS: 5,
    ACCESSRESTRICTIONS: 6,
};

export type WmsVectorServiceFormValuesType = ServiceFormValuesBaseType & {
    selected_tables?: string[];
    style_files?: Record<string, FileList>;
};

type WmsVectorServiceFormProps = {
    datastoreId: string;
    vectorDbId: string;
    offeringId?: string;
};
const WmsVectorServiceForm: FC<WmsVectorServiceFormProps> = ({ datastoreId, vectorDbId, offeringId }) => {
    const { t } = useTranslation("WmsVectorServiceForm");
    const { t: tCommon } = useTranslation("Common");

    const [currentStep, setCurrentStep] = useState(STEPS.TABLES_INFOS);
    const editMode = useMemo(() => !!offeringId, [offeringId]);

    const queryClient = useQueryClient();

    const createServiceMutation = useMutation<Service, CartesApiException>({
        mutationFn: async () => {
            const formValues = getFormValues();
            const formData = await createFormData(formValues);

            return api.wmsVector.add(datastoreId, vectorDbId, formData);
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
        mutationFn: async () => {
            if (offeringId === undefined) {
                return Promise.reject();
            }

            const formValues = getFormValues();
            const formData = await createFormData(formValues);

            return api.wmsVector.edit(datastoreId, vectorDbId, offeringId, formData);
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
        queryKey: RQKeys.datastore_layernames_list(datastoreId, ConfigurationTypeEnum.WMSVECTOR),
        queryFn: ({ signal }) => api.service.getExistingLayerNames(datastoreId, ConfigurationTypeEnum.WMSVECTOR, { signal }),
        refetchInterval: 30000,
        enabled: currentStep === STEPS.METADATAS_DESCRIPTION && !(createServiceMutation.isPending || editServiceMutation.isPending),
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
                styleFiles[table.name] = yup.mixed().test({
                    name: "is-valid-sld",
                    async test(value, ctx) {
                        return new SldStyleWmsVectorValidator().validate(table.name, value as FileList, ctx, offeringQuery.data);
                    },
                });
            });
            return yup.object().shape(styleFiles);
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

    const defaultValues: WmsVectorServiceFormValuesType = useMemo(
        () => getWmsVectorServiceFormDefaultValues(offeringQuery.data, editMode, vectorDbQuery.data, metadataQuery.data),
        [editMode, offeringQuery.data, vectorDbQuery.data, metadataQuery.data]
    );

    const form = useForm<WmsVectorServiceFormValuesType>({
        resolver: yupResolver(schemas[currentStep]),
        mode: "onChange",
        values: defaultValues,
    });
    const { getValues: getFormValues, trigger, watch } = form;

    const selectedTableNamesList: string[] | undefined = watch("selected_tables", []);

    const selectedTables: StoredDataRelation[] = useMemo(() => {
        if (selectedTableNamesList && vectorDbQuery.data) {
            const relations = vectorDbQuery.data.type_infos?.relations ?? [];
            const tables = relations.filter((rel) => rel.type && rel.type === "TABLE");
            const selectedTables = tables.filter((table) => selectedTableNamesList.includes(table.name));
            return selectedTables;
        }
        return [];
    }, [selectedTableNamesList, vectorDbQuery.data]);

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
        <Main title={t("title", { editMode })}>
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

                    <TableSelection visible={currentStep === STEPS.TABLES_INFOS} vectorDb={vectorDbQuery.data} form={form} />
                    <UploadStyleFile visible={currentStep === STEPS.STYLE_FILE} selectedTables={selectedTables} form={form} />
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
                        endpointType={EndpointTypeEnum.WMSVECTOR}
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
                                disabled: currentStep === 1,
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
        </Main>
    );
};

WmsVectorServiceForm.displayName = symToStr({ WmsVectorServiceForm });

export default WmsVectorServiceForm;
