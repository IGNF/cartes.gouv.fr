import { fr } from "@codegouvfr/react-dsfr";
import { ButtonsGroup } from "@codegouvfr/react-dsfr/ButtonsGroup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";

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
import WfsTablesSection from "./sections/WfsTablesSection";
import { buildServiceFormSchema, defaultServiceFormValues, type ServiceFormValues, type ServiceType } from "./serviceFormSchema";

/** types dont le formulaire est livré ; les autres cartes restent désactivées (tranches suivantes de #1117) */
export const IMPLEMENTED_SERVICE_TYPES: ServiceType[] = ["wfs"];

// type de configuration Entrepôt (et d’endpoint) correspondant au type de flux du formulaire
const configurationTypeFor = (type: ServiceType): ConfigurationTypeEnum => {
    switch (type) {
        case "wfs":
            return ConfigurationTypeEnum.WFS;
        case "wms":
            return ConfigurationTypeEnum.WMSVECTOR;
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

    const existingLayerNamesQuery = useQuery<string[], CartesApiException>({
        queryKey: RQKeys.datastore_layernames_list(datastoreId, configurationTypeFor(type)),
        queryFn: ({ signal }) => api.service.getExistingLayerNames(datastoreId, configurationTypeFor(type), { signal }),
        staleTime: 60000,
    });

    // React Hook Form relit ses options à chaque rendu : le schéma suit les noms de couches chargés après le montage
    const schema = useMemo(
        () =>
            buildServiceFormSchema({
                type,
                existingLayerNames: existingLayerNamesQuery.data ?? [],
                layerNamePrefix: datastore.configuration_layer_name_prefix,
            }),
        [type, existingLayerNamesQuery.data, datastore.configuration_layer_name_prefix]
    );

    const form = useForm<ServiceFormValues>({
        // même contournement que MetadataForm : les types conditionnels yup/RHF sont incompatibles
        resolver: yupResolver(schema) as never,
        mode: "onSubmit",
        reValidateMode: "onBlur",
        defaultValues: { ...defaultServiceFormValues, ...defaultValues },
    });
    const { handleSubmit, setError, control } = form;

    const storedDataId = useWatch({ control, name: "stored_data_id" });

    const endpointsQuery = useQuery<DatastoreEndpoint[], CartesApiException>({
        queryKey: RQKeys.datastore_endpoints(datastoreId),
        queryFn: ({ signal }) => api.datastore.getEndpoints(datastoreId, {}, { signal }),
        staleTime: 3600000,
    });
    const endpointType = configurationTypeFor(type) as string as EndpointTypeEnum;
    const endpointsOfType = (endpointsQuery.data ?? []).filter((item) => item.endpoint.type.toUpperCase() === endpointType);
    const hasPublicEndpoint = endpointsOfType.some((item) => item.endpoint.open);
    const hasPrivateEndpoint = endpointsOfType.some((item) => !item.endpoint.open);

    // tables de la base vecteur choisie (WFS)
    const storedDataQuery = useQuery<VectorDb, CartesApiException>({
        queryKey: RQKeys.datastore_stored_data(datastoreId, storedDataId),
        queryFn: ({ signal }) => api.storedData.get<VectorDb>(datastoreId, storedDataId, { signal }),
        enabled: type === "wfs" && storedDataId !== "",
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
                    {type === "wfs" && (
                        <MetadataSection title="Tables">
                            <WfsTablesSection relations={storedDataQuery.data?.type_infos?.relations} isLoading={storedDataQuery.isLoading} />
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
