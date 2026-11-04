import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { ConfigurationTypeEnum, type DatasheetDetailed, type Metadata, type Service } from "@/@types/app";
import { CommunityMemberDtoRightsEnum } from "@/@types/entrepot";
import Main from "@/components/Layout/Main";
import LoadingText from "@/components/Utils/LoadingText";
import ServiceFormErrors from "@/components/Utils/ServiceFormErrors";
import Wait from "@/components/Utils/Wait";
import api from "@/entrepot/api";
import useCommunityRights from "@/hooks/useCommunityRights";
import RQKeys from "@/modules/entrepot/RQKeys";
import { CartesApiException } from "@/modules/jsonFetch";
import { routes } from "@/router/router";
import { buildServiceFormData } from "../ServiceForm/buildServiceFormData";
import ServiceForm, { IMPLEMENTED_SERVICE_TYPES, isRasterPyramid } from "../ServiceForm/ServiceForm";
import { isServiceType, type ServiceFormValues, type ServiceType } from "../ServiceForm/serviceFormSchema";

type ServiceCreateProps = {
    datastoreId: string;
    datasheetName: string;
    /** type présélectionné depuis l’URL, repli WFS */
    type?: string;
    /** donnée stockée présélectionnée depuis l’URL */
    storedDataId?: string;
};

export default function ServiceCreate({ datastoreId, datasheetName, type, storedDataId }: ServiceCreateProps) {
    const queryClient = useQueryClient();
    const [serviceType, setServiceType] = useState<ServiceType>(isServiceType(type) && IMPLEMENTED_SERVICE_TYPES.includes(type) ? type : "wfs");
    const { userRights, isSupervisor } = useCommunityRights();
    const canBroadcast = isSupervisor || (userRights?.includes(CommunityMemberDtoRightsEnum.BROADCAST) ?? false);

    const datasheetQuery = useQuery<DatasheetDetailed, CartesApiException>({
        queryKey: RQKeys.datastore_datasheet(datastoreId, datasheetName),
        queryFn: ({ signal }) => api.datasheet.get(datastoreId, datasheetName, { signal }),
        staleTime: 60000,
        retry: false,
    });

    // la métadonnée de la fiche fournit les liens de la configuration : sans elle, pas de publication
    const metadataQuery = useQuery<Metadata, CartesApiException>({
        queryKey: RQKeys.datastore_datasheet_metadata(datastoreId, datasheetName),
        queryFn: ({ signal }) => api.metadata.getByDatasheetName(datastoreId, datasheetName, { signal }),
        staleTime: 60000,
        retry: false,
    });
    const metadataMissing = metadataQuery.isError && metadataQuery.error.code === 404;

    const publishMutation = useMutation<Service, CartesApiException, ServiceFormValues>({
        mutationFn: (values) => {
            const formData = buildServiceFormData(serviceType, values);
            switch (serviceType) {
                case "wfs":
                    return api.wfs.publish(datastoreId, values.stored_data_id, formData);
                case "wms":
                    return isRasterPyramid(datasheetQuery.data, values.stored_data_id)
                        ? api.pyramidRaster.publishFromForm(datastoreId, values.stored_data_id, ConfigurationTypeEnum.WMSRASTER, formData)
                        : api.wmsVector.publish(datastoreId, values.stored_data_id, formData);
                default:
                    return Promise.reject(new Error(`La publication d’un flux ${serviceType.toUpperCase()} n’est pas encore disponible`));
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: RQKeys.datastore_datasheet_service_list(datastoreId, datasheetName) });
            queryClient.invalidateQueries({ queryKey: RQKeys.datastore_datasheet(datastoreId, datasheetName) });
            routes.datastore_datasheet_view_next({ datastoreId, datasheetName, activeTab: "services" }).push();
        },
    });

    const defaultValues = useMemo<Partial<ServiceFormValues>>(() => ({ stored_data_id: storedDataId ?? "" }), [storedDataId]);

    const servicesTabLink = routes.datastore_datasheet_view_next({ datastoreId, datasheetName, activeTab: "services" }).link;
    const descriptionTabLink = routes.datastore_datasheet_view_next({ datastoreId, datasheetName, activeTab: "description" }).link;

    return (
        <Main title={`Créer un flux - ${datasheetName}`}>
            <h1 className={fr.cx("fr-mb-1w")}>Créer un flux</h1>
            <p className={fr.cx("fr-text--sm")}>Sauf mention contraire « (optionnel) » dans le label, tous les champs sont obligatoires.</p>

            {datasheetQuery.isLoading || metadataQuery.isLoading ? (
                <LoadingText as="p" message="Chargement de la fiche de données…" withSpinnerIcon />
            ) : !canBroadcast ? (
                <Alert
                    severity="warning"
                    title="Vous n’avez pas le droit de publier un flux sur cet entrepôt"
                    description={<a href={servicesTabLink.href}>Retour aux flux</a>}
                    closable={false}
                />
            ) : datasheetQuery.isError ? (
                <Alert severity="error" title="Erreur lors du chargement de la fiche de données" description={datasheetQuery.error.message} closable={false} />
            ) : metadataMissing ? (
                <Alert
                    severity="info"
                    title="Renseignez d’abord la description de la fiche de données"
                    description={
                        <>
                            La publication d’un flux s’appuie sur la description de la fiche. <a {...descriptionTabLink}>Compléter la description</a>
                        </>
                    }
                    closable={false}
                />
            ) : metadataQuery.isError ? (
                <Alert severity="error" title="Erreur lors du chargement de la fiche de données" description={metadataQuery.error.message} closable={false} />
            ) : datasheetQuery.data ? (
                <>
                    {publishMutation.isError && (
                        <Alert
                            className={fr.cx("fr-mb-2w")}
                            severity="error"
                            title="Erreur lors de la publication du flux"
                            description={<ServiceFormErrors message={publishMutation.error.message} />}
                            closable={false}
                        />
                    )}
                    <ServiceForm
                        datastoreId={datastoreId}
                        datasheetName={datasheetName}
                        datasheet={datasheetQuery.data}
                        type={serviceType}
                        onTypeChange={setServiceType}
                        defaultValues={defaultValues}
                        onSubmit={(values) => publishMutation.mutateAsync(values)}
                    />
                </>
            ) : null}

            {publishMutation.isPending && (
                <Wait>
                    <div className={fr.cx("fr-grid-row")}>
                        <LoadingText as="h6" message="Publication du flux en cours…" withSpinnerIcon />
                    </div>
                </Wait>
            )}
        </Main>
    );
}
