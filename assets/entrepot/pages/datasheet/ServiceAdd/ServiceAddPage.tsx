import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { type DatasheetDetailed, type Service } from "@/@types/app";
import Main from "@/components/Layout/Main";
import LoadingText from "@/components/Utils/LoadingText";
import Wait from "@/components/Utils/Wait";
import api from "@/entrepot/api";
import { datasheetMetadataQueryOptions } from "@/hooks/queries/datasheetMetadataQueryOptions";
import { useTranslation } from "@/i18n";
import { getApiErrorMessage } from "@/modules/apiError";
import RQKeys from "@/modules/entrepot/RQKeys";
import { type ApiError } from "@/modules/jsonFetch";
import { buildServiceFormData } from "../ServiceForm/buildServiceFormData";
import ServiceForm from "../ServiceForm/ServiceForm";
import { configurationTypeFor, isRasterPyramid, rasterPyramidPublishType, type ServiceFormOutput, type ServiceType } from "../ServiceForm/serviceFormSchema";

// WMTS et WMS raster passent par api.pyramidRaster.publish
const publishers: Partial<Record<ServiceType, (datastoreId: string, storedDataId: string, formData: FormData) => Promise<Service>>> = {
    wfs: api.wfs.publish,
    wms: api.wmsVector.publish,
    tms: api.pyramidVector.publishTms,
};

type ServiceAddPageProps = {
    datastoreId: string;
    datasheetName: string;
    /** type présélectionné par l’URL */
    type: ServiceType;
};

/** page « Créer un flux » : publication d’un flux depuis la fiche ; sans fiche de métadonnées, renvoie vers l’onglet Description */
export default function ServiceAddPage({ datastoreId, datasheetName, type: initialType }: ServiceAddPageProps) {
    const { t } = useTranslation("ServiceForm");
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [type, setType] = useState(initialType);

    const datasheetQuery = useQuery<DatasheetDetailed, ApiError>({
        queryKey: RQKeys.datastore_datasheet(datastoreId, datasheetName),
        queryFn: ({ signal }) => api.datasheet.get(datastoreId, datasheetName, { signal }),
        staleTime: 60000,
        retry: false,
    });
    // la fiche de métadonnées fournit les liens `metadata` de la configuration : sans elle, pas de publication
    const metadataQuery = useQuery(datasheetMetadataQueryOptions(datastoreId, datasheetName));

    const servicesTab = { to: "/tableau-de-bord/entrepots/$datastoreId/donnees/$datasheetName/nouvelle-vue", params: { datastoreId, datasheetName } } as const;

    const publishMutation = useMutation<Service, ApiError, ServiceFormOutput>({
        mutationFn: (values) => {
            const rasterType = rasterPyramidPublishType(type, isRasterPyramid(datasheetQuery.data, values.stored_data_id));
            if (rasterType !== undefined) {
                return api.pyramidRaster.publish(datastoreId, values.stored_data_id, rasterType, buildServiceFormData(type, values, true));
            }
            const publish = publishers[type];
            if (publish === undefined) throw new Error(`Type de flux sans route de publication : ${type}`);
            return publish(datastoreId, values.stored_data_id, buildServiceFormData(type, values));
        },
        // aussi après un échec : le flux peut exister si l’erreur survient après la création de l’offre
        onSettled: (_data, _error, values) => {
            void queryClient.invalidateQueries({ queryKey: RQKeys.datastore_datasheet_service_list(datastoreId, datasheetName) });
            void queryClient.invalidateQueries({ queryKey: RQKeys.datastore_datasheet(datastoreId, datasheetName) });
            // sinon un second flux au même nom passe le contrôle du formulaire
            void queryClient.invalidateQueries({
                queryKey: RQKeys.datastore_layernames_list(
                    datastoreId,
                    configurationTypeFor(type, isRasterPyramid(datasheetQuery.data, values.stored_data_id))
                ),
            });
        },
        onSuccess: () => navigate({ ...servicesTab, search: { activeTab: "services" } }),
    });

    const renderContent = () => {
        if (datasheetQuery.isPending || metadataQuery.isPending) {
            return <LoadingText as="p" message={t("loading")} withSpinnerIcon />;
        }
        if (datasheetQuery.isError) {
            return <Alert severity="error" title={t("load_error")} description={getApiErrorMessage(datasheetQuery.error)} small />;
        }
        if (metadataQuery.isError) {
            return metadataQuery.error.status === 404 ? (
                <Alert
                    severity="info"
                    title={t("metadata_missing.title")}
                    description={
                        <>
                            {t("metadata_missing.description")}{" "}
                            <Link {...servicesTab} search={{ activeTab: "description" }}>
                                {t("metadata_missing.link")}
                            </Link>
                        </>
                    }
                />
            ) : (
                <Alert severity="error" title={t("load_error")} description={getApiErrorMessage(metadataQuery.error)} small />
            );
        }
        return (
            <>
                {publishMutation.isError && (
                    <Alert
                        className={fr.cx("fr-mb-2w")}
                        severity="error"
                        title={t("error_title")}
                        description={getApiErrorMessage(publishMutation.error)}
                        small
                    />
                )}
                <ServiceForm
                    datastoreId={datastoreId}
                    datasheetName={datasheetName}
                    datasheet={datasheetQuery.data}
                    type={type}
                    onTypeChange={setType}
                    onSubmit={(values) => publishMutation.mutateAsync(values)}
                />
            </>
        );
    };

    return (
        <Main title={`${t("title")} - ${datasheetName}`} breadcrumbSeparator>
            <h1 className={fr.cx("fr-mb-1w")}>{t("title")}</h1>
            <p className={fr.cx("fr-text--sm")}>{t("mandatory_fields")}</p>
            {renderContent()}
            {publishMutation.isPending && (
                <Wait>
                    <LoadingText as="h6" message={t("publishing")} withSpinnerIcon />
                </Wait>
            )}
        </Main>
    );
}
