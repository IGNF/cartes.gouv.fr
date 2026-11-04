import { fr } from "@codegouvfr/react-dsfr";
import { ButtonsGroup } from "@codegouvfr/react-dsfr/ButtonsGroup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef } from "react";
import { FormProvider, type Resolver, useForm, useWatch } from "react-hook-form";

import {
    ConfigurationTypeEnum,
    type DatasheetDetailed,
    type DatasheetStoredDataItem,
    type DatastoreEndpoint,
    EndpointTypeEnum,
    StoredDataStatusEnum,
    type VectorDb,
} from "@/@types/app";
import { CommunityMemberDtoRightsEnum } from "@/@types/entrepot";
import { useDatastore } from "@/contexts/datastore";
import api from "@/entrepot/api";
import useCommunityRights from "@/hooks/useCommunityRights";
import RQKeys from "@/modules/entrepot/RQKeys";
import { CartesApiException } from "@/modules/jsonFetch";
import { applyApiValidationErrors } from "@/modules/setApiFormErrors";
import { routes } from "@/router/router";
import MetadataSection from "../forms/MetadataSection";
import MetadataSectionsContainer from "../forms/MetadataSectionsContainer";
import AccessSection from "./sections/AccessSection";
import ServiceDescriptionSection from "./sections/ServiceDescriptionSection";
import ServiceTypeSection from "./sections/ServiceTypeSection";
import StylesSection from "./sections/StylesSection";
import TablesSection from "./sections/TablesSection";
import { buildServiceFormSchema, defaultServiceFormValues, type ServiceFormValues, type ServiceType } from "./serviceFormSchema";

/** types dont le formulaire est livré ; les autres cartes restent désactivées (tranches suivantes de #1117) */
export const IMPLEMENTED_SERVICE_TYPES: ServiceType[] = ["wfs", "wms"];

/** un flux WMS publié depuis une pyramide raster est un WMS-R */
export const isRasterPyramid = (datasheet: DatasheetDetailed | undefined, storedDataId: string): boolean =>
    (datasheet?.pyramid_raster_list ?? []).some((item) => item._id === storedDataId);

// type de configuration Entrepôt (et d’endpoint) correspondant au type de flux du formulaire
const configurationTypeFor = (type: ServiceType, isRaster: boolean): ConfigurationTypeEnum => {
    switch (type) {
        case "wfs":
            return ConfigurationTypeEnum.WFS;
        case "wms":
            return isRaster ? ConfigurationTypeEnum.WMSRASTER : ConfigurationTypeEnum.WMSVECTOR;
        case "tms":
        case "wmts":
            return ConfigurationTypeEnum.WMTSTMS;
    }
};

const storedDataOptionsFor = (type: ServiceType, datasheet: DatasheetDetailed): DatasheetStoredDataItem[] => {
    const generated = (items: DatasheetStoredDataItem[] | undefined) => (items ?? []).filter((item) => item.status === StoredDataStatusEnum.GENERATED);
    switch (type) {
        case "wfs":
            return generated(datasheet.vector_db_list);
        case "wms":
            return [...generated(datasheet.vector_db_list), ...generated(datasheet.pyramid_raster_list)];
        case "tms":
            return generated(datasheet.pyramid_vector_list);
        case "wmts":
            return generated(datasheet.pyramid_raster_list);
    }
};

const datasetSelectLabelFor = (type: ServiceType): string => (type === "tms" || type === "wmts" ? "Pyramide de données" : "Jeu de données");

type ServiceFormProps = {
    datastoreId: string;
    datasheetName: string;
    datasheet: DatasheetDetailed;
    /** type de flux, tenu par la page : il décide des requêtes et du schéma avant la création du formulaire */
    type: ServiceType;
    onTypeChange: (type: ServiceType) => void;
    defaultValues?: Partial<ServiceFormValues>;
    onSubmit: (values: ServiceFormValues) => Promise<unknown>;
    submitLabel?: string;
};

export default function ServiceForm({
    datastoreId,
    datasheetName,
    datasheet,
    type,
    onTypeChange,
    defaultValues,
    onSubmit,
    submitLabel = "Publier le flux",
}: ServiceFormProps) {
    const { datastore } = useDatastore();
    const { userRights, isSupervisor } = useCommunityRights();
    const canManageAnnexes = isSupervisor || (userRights?.includes(CommunityMemberDtoRightsEnum.ANNEX) ?? false);

    // le schéma dépend de la donnée choisie (WMS-V ou WMS-R), connue seulement après la création du formulaire
    const schemaRef = useRef<ReturnType<typeof buildServiceFormSchema> | null>(null);
    const resolver: Resolver<ServiceFormValues> = (values, context, options) =>
        // même contournement que MetadataForm : les types conditionnels yup/RHF sont incompatibles
        (yupResolver(schemaRef.current!) as never as Resolver<ServiceFormValues>)(values, context, options);

    const form = useForm<ServiceFormValues>({
        resolver,
        mode: "onSubmit",
        reValidateMode: "onBlur",
        defaultValues: { ...defaultServiceFormValues, ...defaultValues },
    });
    const { handleSubmit, setError, setValue, control } = form;

    const storedDataId = useWatch({ control, name: "stored_data_id" });
    const isRaster = type === "wms" && isRasterPyramid(datasheet, storedDataId);
    const isWmsVector = type === "wms" && !isRaster;
    const configurationType = configurationTypeFor(type, isRaster);

    const existingLayerNamesQuery = useQuery<string[], CartesApiException>({
        queryKey: RQKeys.datastore_layernames_list(datastoreId, configurationType),
        queryFn: ({ signal }) => api.service.getExistingLayerNames(datastoreId, configurationType, { signal }),
        staleTime: 60000,
    });

    const schema = useMemo(
        () =>
            buildServiceFormSchema({
                type,
                isRasterPyramid: isRaster,
                existingLayerNames: existingLayerNamesQuery.data ?? [],
                layerNamePrefix: datastore.configuration_layer_name_prefix,
            }),
        [type, isRaster, existingLayerNamesQuery.data, datastore.configuration_layer_name_prefix]
    );
    useEffect(() => {
        schemaRef.current = schema;
    }, [schema]);

    // une pyramide raster n’a pas de tables : rien de caché ne doit partir avec le formulaire
    useEffect(() => {
        if (isRaster) {
            setValue("tables", []);
        }
    }, [isRaster, setValue]);

    const endpointsQuery = useQuery<DatastoreEndpoint[], CartesApiException>({
        queryKey: RQKeys.datastore_endpoints(datastoreId),
        queryFn: ({ signal }) => api.datastore.getEndpoints(datastoreId, {}, { signal }),
        staleTime: 3600000,
    });
    const endpointType = configurationType as string as EndpointTypeEnum;
    const endpointsOfType = (endpointsQuery.data ?? []).filter((item) => item.endpoint.type.toUpperCase() === endpointType);
    const hasPublicEndpoint = endpointsOfType.some((item) => item.endpoint.open);
    const hasPrivateEndpoint = endpointsOfType.some((item) => !item.endpoint.open);

    // tables de la base vecteur choisie (WFS, WMS-V)
    const storedDataQuery = useQuery<VectorDb, CartesApiException>({
        queryKey: RQKeys.datastore_stored_data(datastoreId, storedDataId),
        queryFn: ({ signal }) => api.storedData.get<VectorDb>(datastoreId, storedDataId, { signal }),
        enabled: (type === "wfs" || isWmsVector) && storedDataId !== "",
        staleTime: 60000,
    });

    const submit = handleSubmit(async (values) => {
        try {
            await onSubmit(values);
        } catch (e) {
            // les erreurs de validation du back retombent sur les champs ; l’erreur globale reste dans la mutation appelante
            applyApiValidationErrors(e, setError);
        }
    });

    return (
        <FormProvider {...form}>
            <form onSubmit={submit} noValidate>
                <MetadataSectionsContainer>
                    <MetadataSection title="Type de flux">
                        <ServiceTypeSection value={type} onChange={onTypeChange} availableTypes={IMPLEMENTED_SERVICE_TYPES} />
                    </MetadataSection>
                    <MetadataSection title="Description du flux">
                        <ServiceDescriptionSection
                            storedDataOptions={storedDataOptionsFor(type, datasheet)}
                            datasetSelectLabel={datasetSelectLabelFor(type)}
                            canManageAnnexes={canManageAnnexes}
                        />
                    </MetadataSection>
                    {(type === "wfs" || isWmsVector) && (
                        <MetadataSection title="Tables">
                            <TablesSection
                                relations={storedDataQuery.data?.type_infos?.relations}
                                isLoading={storedDataQuery.isLoading}
                                detailed={type === "wfs"}
                            />
                        </MetadataSection>
                    )}
                    {isWmsVector && (
                        <MetadataSection title="Style du flux">
                            <StylesSection />
                        </MetadataSection>
                    )}
                    {isRaster && (
                        <MetadataSection title="Style du flux">
                            <p className={fr.cx("fr-text--sm", "fr-mb-0")}>Le style du flux dépend des données raster sources.</p>
                        </MetadataSection>
                    )}
                    <MetadataSection title="Droits et accès">
                        <AccessSection hasPublicEndpoint={hasPublicEndpoint} hasPrivateEndpoint={hasPrivateEndpoint} canManageAnnexes={canManageAnnexes} />
                    </MetadataSection>
                </MetadataSectionsContainer>

                <ButtonsGroup
                    buttons={[
                        {
                            children: "Annuler",
                            priority: "secondary",
                            linkProps: routes.datastore_datasheet_view_next({ datastoreId, datasheetName, activeTab: "services" }).link,
                        },
                        {
                            children: submitLabel,
                            type: "submit",
                        },
                    ]}
                    inlineLayoutWhen="always"
                    alignment="right"
                    className={fr.cx("fr-mt-2w", "fr-mb-4w")}
                />
            </form>
        </FormProvider>
    );
}
