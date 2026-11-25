import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { ButtonsGroup } from "@codegouvfr/react-dsfr/ButtonsGroup";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";

import { type DatasheetDetailed, StoredDataStatusEnum } from "@/@types/app";
import api from "@/entrepot/api";
import { datastoreEndpointsQueryOptions } from "@/hooks/queries/datastoreEndpointsQueryOptions";
import { datastoreQueryOptions } from "@/hooks/queries/datastoreQueryOptions";
import { vectorDbQueryOptions } from "@/hooks/queries/vectorDbQueryOptions";
import useServiceRights from "@/hooks/useServiceRights";
import { useTranslation } from "@/i18n";
import { isApiError } from "@/modules/apiError";
import RQKeys from "@/modules/entrepot/RQKeys";
import { type ApiError } from "@/modules/jsonFetch";
import { setApiFormErrors } from "@/modules/setApiFormErrors";
import { delta } from "@/utils/delta";
import MetadataSection from "../forms/MetadataSection";
import MetadataSectionsContainer from "../forms/MetadataSectionsContainer";
import { mapServiceViolationPaths } from "./buildServiceFormData";
import AccessSection from "./sections/AccessSection";
import PyramidNotice from "./sections/PyramidNotice";
import ServiceDescriptionSection from "./sections/ServiceDescriptionSection";
import FeatureInfoSection from "./sections/FeatureInfoSection";
import ServiceTypeSection from "./sections/ServiceTypeSection";
import StylesSection from "./sections/StylesSection";
import TablesSection from "./sections/TablesSection";
import {
    availableServiceAccesses,
    buildServiceFormSchema,
    configurationTypeFor,
    hasTables,
    isRasterPyramid,
    isServiceTypeFull,
    SERVICE_TYPES,
    serviceFormDefaultValues,
    serviceQuotaWarnings,
    type ServiceFormOutput,
    type ServiceFormValues,
    type ServiceType,
} from "./serviceFormSchema";
import { defaultTables, featureInfoColumns } from "./serviceToFormValues";

type ServiceFormProps = {
    datastoreId: string;
    datasheetName: string;
    datasheet: DatasheetDetailed;
    /** type de flux tenu par la page : il décide des requêtes et du schéma */
    type: ServiceType;
    onTypeChange: (type: ServiceType) => void;
    /** l’erreur levée reste dans la mutation de la page ; ses erreurs de validation retombent sur les champs */
    onSubmit: (values: ServiceFormOutput) => Promise<unknown>;
};

export default function ServiceForm({ datastoreId, datasheetName, datasheet, type, onTypeChange, onSubmit }: ServiceFormProps) {
    const { t } = useTranslation("ServiceForm");
    const queryClient = useQueryClient();
    // tenu à part : le schéma en dépend et se construit avant le formulaire
    const [rasterPyramidSelected, setRasterPyramidSelected] = useState(false);
    // WMTS toujours, WMS quand la donnée choisie est une pyramide raster : ni tables ni dépôt de style
    const raster = type === "wmts" || (type === "wms" && rasterPyramidSelected);
    const configurationType = configurationTypeFor(type, raster);
    const withTables = hasTables(type, rasterPyramidSelected);

    const { data: datastore } = useQuery(datastoreQueryOptions(datastoreId));
    const { canGeneratePyramid } = useServiceRights();
    const pyramidKind = type === "tms" ? "vector" : "raster";
    const existingLayerNamesQuery = useQuery<string[], ApiError>({
        queryKey: RQKeys.datastore_layernames_list(datastoreId, configurationType),
        queryFn: ({ signal }) => api.service.getExistingLayerNames(datastoreId, configurationType, { signal }),
        staleTime: delta.minutes(1),
    });
    const endpointsQuery = useQuery(datastoreEndpointsQueryOptions(datastoreId));
    // lecture en échec : la copie persistée peut dater, le formulaire fait sans quotas
    const endpoints = endpointsQuery.isSuccess ? endpointsQuery.data : undefined;

    const disabledTypes = useMemo(() => SERVICE_TYPES.filter((serviceType) => isServiceTypeFull(endpoints, serviceType)), [endpoints]);
    const allFull = disabledTypes.length === SERVICE_TYPES.length;
    const quotaWarnings = serviceQuotaWarnings(endpoints, type);

    const availableAccesses = useMemo(() => availableServiceAccesses(endpoints, configurationType), [endpoints, configurationType]);

    const schema = useMemo(
        () =>
            buildServiceFormSchema({
                t,
                type,
                rasterPyramid: raster,
                existingLayerNames: existingLayerNamesQuery.data ?? [],
                layerNamePrefix: datastore?.configuration_layer_name_prefix,
                availableAccesses,
            }),
        [t, type, raster, existingLayerNamesQuery.data, datastore?.configuration_layer_name_prefix, availableAccesses]
    );

    const form = useForm<ServiceFormValues, unknown, ServiceFormOutput>({
        resolver: zodResolver(schema),
        mode: "onSubmit",
        reValidateMode: "onBlur",
        defaultValues: serviceFormDefaultValues,
    });
    const { handleSubmit, setError, setValue, getValues, control } = form;

    const storedDataId = useWatch({ control, name: "stored_data_id" });
    const vectorDbQuery = useQuery(vectorDbQueryOptions(datastoreId, withTables ? storedDataId : ""));
    const featureInfoTableColumns = useMemo(() => featureInfoColumns(vectorDbQuery.data), [vectorDbQuery.data]);

    // les tables appartiennent au jeu précédent : vidées, puis remplies quand la base choisie est lue
    const loadTables = (id: string) => {
        setValue("tables", []);
        const raster = isRasterPyramid(datasheet, id);
        setRasterPyramidSelected(raster);
        if (id === "" || !hasTables(type, raster)) return;
        queryClient
            .query(vectorDbQueryOptions(datastoreId, id))
            .then((vectorDb) => {
                // un choix plus récent l’emporte sur une lecture arrivée en retard
                if (getValues("stored_data_id") === id) setValue("tables", defaultTables(vectorDb));
            })
            // l’erreur reste dans la requête, affichée par la section Tables
            .catch(() => undefined);
    };

    // les données proposées dépendent du type : le choix précédent est vidé
    const changeType = (next: ServiceType) => {
        setValue("stored_data_id", "");
        setValue("tables", []);
        setRasterPyramidSelected(false);
        onTypeChange(next);
    };

    const storedDataOptions = [
        ...(type === "wfs" || type === "wms" ? (datasheet.vector_db_list ?? []) : []),
        ...(type === "wms" || type === "wmts" ? (datasheet.pyramid_raster_list ?? []) : []),
        ...(type === "tms" ? (datasheet.pyramid_vector_list ?? []) : []),
    ].filter((item) => item.status === StoredDataStatusEnum.GENERATED);

    const submit = handleSubmit(async (values) => {
        try {
            await onSubmit(values);
        } catch (error) {
            if (isApiError(error)) setApiFormErrors(mapServiceViolationPaths(error, values.tables), setError);
        }
    });

    return (
        <FormProvider {...form}>
            <form onSubmit={(e) => void submit(e)} noValidate>
                <MetadataSectionsContainer>
                    <MetadataSection title={t("section.type")}>
                        <ServiceTypeSection
                            value={type}
                            onChange={changeType}
                            disabledTypes={disabledTypes}
                            alert={
                                allFull ? (
                                    <Alert severity="warning" small description={t("quota.all_full")} />
                                ) : (
                                    quotaWarnings.length > 0 && (
                                        <Alert
                                            severity="warning"
                                            small
                                            description={
                                                <ul className={fr.cx("fr-raw-list")}>
                                                    {quotaWarnings.map((warning) => {
                                                        const service = t(`quota.service.${warning.configurationType}`);
                                                        const access = t("quota.access", { open: warning.open });
                                                        return (
                                                            <li key={`${warning.configurationType}-${warning.open}`}>
                                                                {!warning.full
                                                                    ? t("quota.near", { remaining: warning.remaining, service, access })
                                                                    : warning.otherAvailable
                                                                      ? t("quota.full", {
                                                                            service,
                                                                            access,
                                                                            other: t("quota.access", { open: !warning.open }),
                                                                        })
                                                                      : t("quota.full_both", { service })}
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            }
                                        />
                                    )
                                )
                            }
                        />
                    </MetadataSection>
                    <MetadataSection title={t("section.description")}>
                        <ServiceDescriptionSection
                            storedDataOptions={storedDataOptions}
                            onStoredDataChange={loadTables}
                            storedDataLabel={t(type === "wmts" || type === "tms" ? "stored_data.label_pyramid" : "stored_data.label")}
                            storedDataNotice={
                                type !== "wfs" && (
                                    <PyramidNotice
                                        datastoreId={datastoreId}
                                        datasheetName={datasheetName}
                                        service={type.toUpperCase()}
                                        kind={pyramidKind}
                                        canGenerate={canGeneratePyramid(pyramidKind)}
                                    />
                                )
                            }
                            withDataKind={type === "wms"}
                            withDescription={type !== "wfs"}
                        />
                    </MetadataSection>
                    {withTables && (
                        <MetadataSection title={t("section.tables")}>
                            <TablesSection
                                status={storedDataId === "" ? "idle" : vectorDbQuery.status}
                                noGeometricTable={vectorDbQuery.data !== undefined && defaultTables(vectorDbQuery.data).length === 0}
                                detailed={type === "wfs"}
                            />
                        </MetadataSection>
                    )}
                    {(type === "wms" || type === "wmts") && (
                        <MetadataSection title={t("section.styles")}>
                            {raster ? <p className={fr.cx("fr-mb-0")}>{t("styles.raster")}</p> : <StylesSection />}
                        </MetadataSection>
                    )}
                    {withTables && type === "wms" && (
                        <MetadataSection title={t("section.featureinfo")}>
                            <FeatureInfoSection columns={featureInfoTableColumns} />
                        </MetadataSection>
                    )}
                    <MetadataSection title={t("section.access")}>
                        <AccessSection availableAccesses={availableAccesses} />
                    </MetadataSection>
                </MetadataSectionsContainer>

                <ButtonsGroup
                    buttons={[
                        {
                            children: t("cancel"),
                            priority: "secondary",
                            linkProps: {
                                to: "/tableau-de-bord/entrepots/$datastoreId/donnees/$datasheetName",
                                params: { datastoreId, datasheetName },
                                search: { activeTab: "services" },
                            },
                        },
                        // quotas tous atteints : rien à publier
                        ...(allFull ? [] : [{ children: t("submit"), type: "submit" as const }]),
                    ]}
                    inlineLayoutWhen="always"
                    alignment="right"
                    className={fr.cx("fr-mt-2w", "fr-mb-4w")}
                />
            </form>
        </FormProvider>
    );
}
