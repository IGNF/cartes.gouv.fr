import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import { useQuery } from "@tanstack/react-query";
import { FC } from "react";

import { OfferingStatusEnum, OfferingTypeEnum, type Service } from "../../../../@types/app";
import Main from "../../../../components/Layout/Main";
import LoadingText from "../../../../components/Utils/LoadingText";
import RQKeys from "../../../../modules/entrepot/RQKeys";
import { type CartesApiException } from "../../../../modules/jsonFetch";
import { routes } from "../../../../router/router";
import api from "../../../api";
import PrivateServiceExplanation from "./PrivateServiceExplanation";
import ServiceViewContent from "./ServiceViewContent";

import "../../../../sass/pages/service_view.scss";

type ServiceViewProps = {
    datastoreId: string;
    offeringId: string;
    datasheetName: string;
};

const ServiceView: FC<ServiceViewProps> = ({ datastoreId, offeringId, datasheetName }) => {
    const serviceQuery = useQuery<Service, CartesApiException>({
        queryKey: RQKeys.datastore_offering(datastoreId, offeringId),
        queryFn: ({ signal }) => api.service.getService(datastoreId, offeringId, { signal }),
        staleTime: 60000,
    });

    return (
        <Main title={`Visualisation données ${datasheetName ?? serviceQuery.data?.layer_name}`}>
            {serviceQuery.isLoading ? (
                <LoadingText />
            ) : serviceQuery.error ? (
                <Alert
                    severity="error"
                    closable={false}
                    title={serviceQuery.error.message}
                    description={<Button linkProps={routes.datasheet_list({ datastoreId }).link}>Retour à mes données</Button>}
                />
            ) : serviceQuery.data ? (
                <>
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-mb-4w")}>
                        <Button
                            iconId="fr-icon-arrow-left-s-line"
                            priority="tertiary no outline"
                            linkProps={routes.datastore_datasheet_view({ datastoreId, datasheetName, activeTab: "services" }).link}
                            title="Retour à la fiche de donnée"
                            size="large"
                        />
                        <h1 className={fr.cx("fr-m-0")}>{serviceQuery?.data?.layer_name}</h1>
                        {serviceQuery?.data?.type && (
                            <Badge noIcon={true} severity="info" className={fr.cx("fr-ml-2w")}>
                                {serviceQuery?.data?.type}
                            </Badge>
                        )}
                    </div>

                    {serviceQuery.data?.status === OfferingStatusEnum.UNSTABLE && (
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-mb-4w")}>
                            <Alert
                                severity="info"
                                closable={false}
                                title={"Flux instable"}
                                description={"Ce flux est considéré instable par l’API Entrepôt. Il est possible qu'il ne s'affiche pas correctement."}
                            />
                        </div>
                    )}

                    {serviceQuery.data?.type === OfferingTypeEnum.WMSVECTOR && serviceQuery.data?.status === OfferingStatusEnum.PUBLISHED && (
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-mb-4w")}>
                            <Button
                                linkProps={
                                    routes.datastore_pyramid_raster_generate({
                                        datastoreId,
                                        offeringId,
                                        datasheetName,
                                    }).link
                                }
                            >
                                Créer un service raster WMS/WMTS
                            </Button>
                        </div>
                    )}

                    {serviceQuery.data?.open === true ? (
                        <ServiceViewContent datastoreId={datastoreId} offeringId={offeringId} datasheetName={datasheetName} />
                    ) : (
                        <div className={fr.cx("fr-grid-row", "fr-mb-4w")}>
                            <div className={fr.cx("fr-col")}>
                                <PrivateServiceExplanation datastoreId={datastoreId} />
                            </div>
                        </div>
                    )}
                </>
            ) : null}
        </Main>
    );
};

export default ServiceView;
