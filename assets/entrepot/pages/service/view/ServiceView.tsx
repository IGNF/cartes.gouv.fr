import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import { FC } from "react";

import { OfferingStatusEnum, OfferingTypeEnum } from "../../../../@types/app";
import Main from "../../../../components/Layout/Main";
import LoadingText from "../../../../components/Utils/LoadingText";
import useServiceQuery from "@/entrepot/hooks/queries/useServiceQuery";
import PrivateServiceExplanation from "./PrivateServiceExplanation";
import ServiceViewContent from "./ServiceViewContent";

type ServiceViewProps = {
    datastoreId: string;
    offeringId: string;
    datasheetName: string;
};

const ServiceView: FC<ServiceViewProps> = ({ datastoreId, offeringId, datasheetName }) => {
    const serviceQuery = useServiceQuery(datastoreId, offeringId);

    return (
        <Main title={`Visualisation données ${datasheetName ?? serviceQuery.data?.layer_name}`}>
            {serviceQuery.isLoading ? (
                <LoadingText />
            ) : serviceQuery.error ? (
                <Alert
                    severity="error"
                    closable={false}
                    title={serviceQuery.error.message}
                    description={
                        <Button linkProps={{ to: "/tableau-de-bord/entrepots/$datastoreId/donnees", params: { datastoreId } }}>Retour à mes données</Button>
                    }
                />
            ) : serviceQuery.data ? (
                <>
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-mb-4w")}>
                        <Button
                            iconId="fr-icon-arrow-left-s-line"
                            priority="tertiary no outline"
                            linkProps={{
                                to: "/tableau-de-bord/entrepots/$datastoreId/donnees/$datasheetName",
                                params: { datastoreId, datasheetName },
                                search: { activeTab: "services" },
                            }}
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
                                linkProps={{
                                    to: "/tableau-de-bord/entrepots/$datastoreId/pyramide-raster/ajout",
                                    params: { datastoreId },
                                    search: { offeringId, datasheetName },
                                }}
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
