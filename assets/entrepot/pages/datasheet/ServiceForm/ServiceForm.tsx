import { fr } from "@codegouvfr/react-dsfr";
import { ButtonsGroup } from "@codegouvfr/react-dsfr/ButtonsGroup";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryOptions, skipToken, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";

import { type DatasheetDetailed, type DatastoreEndpoint, StoredDataStatusEnum, type VectorDb } from "@/@types/app";
import { CommunityMemberDtoRightsEnum } from "@/@types/entrepot";
import api from "@/entrepot/api";
import { filterGeometricRelations } from "@/helpers";
import { datastoreQueryOptions } from "@/hooks/queries/datastoreQueryOptions";
import useCommunityRights from "@/hooks/useCommunityRights";
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
import ServiceTypeSection from "./sections/ServiceTypeSection";
import StylesSection from "./sections/StylesSection";
import TablesSection from "./sections/TablesSection";
import {
    buildServiceFormSchema,
    configurationTypeFor,
    hasTables,
    isRasterPyramid,
    SERVICE_ACCESSES,
    type ServiceAccess,
    serviceFormDefaultValues,
    type ServiceFormOutput,
    type ServiceFormValues,
    type ServiceTableFormValues,
    type ServiceType,
} from "./serviceFormSchema";

// sans jeu choisi, la requête ne part pas et rien n’est mis en cache
const vectorDbQueryOptions = (datastoreId: string, storedDataId: string) =>
    queryOptions<VectorDb, ApiError>({
        queryKey: RQKeys.datastore_stored_data(datastoreId, storedDataId),
        queryFn: storedDataId === "" ? skipToken : ({ signal }) => api.storedData.get<VectorDb>(datastoreId, storedDataId, { signal }),
        staleTime: delta.minutes(1),
    });

// une ligne par table géométrique, aucune cochée
const defaultTables = (vectorDb: VectorDb): ServiceTableFormValues[] =>
    filterGeometricRelations(vectorDb.type_infos?.relations ?? [], true).map((relation) => ({
        native_name: relation.name,
        selected: false,
        title: relation.name,
        public_name: relation.name.toLowerCase(),
        description: "",
        keywords: [],
        style: undefined,
    }));

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
    const { userRights, isSupervisor } = useCommunityRights();
    const hasRight = (right: CommunityMemberDtoRightsEnum) => isSupervisor || !!userRights?.includes(right);
    const pyramidKind = type === "tms" ? "vector" : "raster";
    // mêmes droits que les routes de génération : la pyramide raster dépose aussi une légende en annexe
    const canGeneratePyramid = hasRight(CommunityMemberDtoRightsEnum.PROCESSING) && (pyramidKind === "vector" || hasRight(CommunityMemberDtoRightsEnum.ANNEX));
    const existingLayerNamesQuery = useQuery<string[], ApiError>({
        queryKey: RQKeys.datastore_layernames_list(datastoreId, configurationType),
        queryFn: ({ signal }) => api.service.getExistingLayerNames(datastoreId, configurationType, { signal }),
        staleTime: delta.minutes(1),
    });
    const endpointsQuery = useQuery<DatastoreEndpoint[], ApiError>({
        queryKey: RQKeys.datastore_endpoints(datastoreId),
        queryFn: ({ signal }) => api.datastore.getEndpoints(datastoreId, {}, { signal }),
        staleTime: delta.hours(1),
    });

    // tant que les endpoints ne sont pas lus, tout accès reste proposé ; le back refuse un accès sans endpoint
    const availableAccesses = useMemo<readonly ServiceAccess[]>(() => {
        if (!endpointsQuery.data) return SERVICE_ACCESSES;
        const endpoints = endpointsQuery.data.filter((item) => item.endpoint.type.toUpperCase() === configurationType);
        const hasOpen = endpoints.some((item) => item.endpoint.open);
        const hasPrivate = endpoints.some((item) => !item.endpoint.open);
        return SERVICE_ACCESSES.filter((access) => (access === "public" ? hasOpen : hasPrivate));
    }, [endpointsQuery.data, configurationType]);

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
                        <ServiceTypeSection value={type} onChange={changeType} />
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
                                        canGenerate={canGeneratePyramid}
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
                                to: "/tableau-de-bord/entrepots/$datastoreId/donnees/$datasheetName/nouvelle-vue",
                                params: { datastoreId, datasheetName },
                                search: { activeTab: "services" },
                            },
                        },
                        { children: t("submit"), type: "submit" },
                    ]}
                    inlineLayoutWhen="always"
                    alignment="right"
                    className={fr.cx("fr-mt-2w", "fr-mb-4w")}
                />
            </form>
        </FormProvider>
    );
}
