import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import { Tabs, TabsProps } from "@codegouvfr/react-dsfr/Tabs";
import { useQuery } from "@tanstack/react-query";
import { FC, useEffect, useMemo, useState } from "react";

import { OfferingStatusEnum, OfferingTypeEnum, type Service, StoredDataTypeEnum, type TypeInfosWithBbox } from "../../../../@types/app";
import Main from "../../../../components/Layout/Main";
import LoadingText from "../../../../components/Utils/LoadingText";
import type { MapInitial } from "../../../../components/Utils/RMap";
import RMap from "../../../../components/Utils/RMap";
import getWebService from "../../../../modules/WebServices/WebServices";
import RQKeys from "../../../../modules/entrepot/RQKeys";
import { type CartesApiException } from "../../../../modules/jsonFetch";
import { routes, useRoute } from "../../../../router/router";
import api from "../../../api";
import DiffuseServiceTab from "./DiffuseServiceTab";
import ManageStylesTab from "./ManageStylesTab";
import PrivateServiceExplanation from "./PrivateServiceExplanation";

import "../../../../sass/pages/service_view.scss";

type ServiceViewProps = {
    datastoreId: string;
    offeringId: string;
    datasheetName: string;
};

const ServiceView: FC<ServiceViewProps> = ({ datastoreId, offeringId, datasheetName }) => {
    const route = useRoute();

    const serviceQuery = useQuery<Service, CartesApiException>({
        queryKey: RQKeys.datastore_offering(datastoreId, offeringId),
        queryFn: ({ signal }) => api.service.getService(datastoreId, offeringId, { signal }),
        staleTime: 60000,
    });

    const [initialValues, setInitialValues] = useState<MapInitial>();

    useEffect(() => {
        if (!serviceQuery.data || serviceQuery.data?.open === false) return;

        let initial: MapInitial = { type: serviceQuery.data.type, bbox: undefined, layers: [] };

        const infos = serviceQuery.data.configuration.type_infos as TypeInfosWithBbox;
        if (infos.bbox) {
            initial = { ...initial, bbox: infos.bbox };
        }

        const styles = serviceQuery.data.configuration.styles;
        const currentStyle = styles?.find((style) => style.current === true);
        initial = { ...initial, currentStyle: currentStyle };

        getWebService(serviceQuery.data)
            .getLayers()
            .then((layers) => {
                initial = { ...initial, layers: layers ?? [] };
                setInitialValues(initial);
            });
    }, [serviceQuery.data]);

    // ONGLETS
    const tabs: TabsProps["tabs"] = useMemo(() => {
        const canManageStyles =
            serviceQuery.data?.type === OfferingTypeEnum.WFS ||
            (serviceQuery.data?.type === OfferingTypeEnum.WMTSTMS && serviceQuery.data.configuration.pyramid?.type === StoredDataTypeEnum.ROK4PYRAMIDVECTOR);

        const _tabs: TabsProps["tabs"] = [
            {
                label: "Diffuser le service",
                content: <DiffuseServiceTab service={serviceQuery.data} />,
                isDefault: route.params["activeTab"] === "diffuse",
            },
        ];

        // Pas de gestion des styles pour les autres services
        if (canManageStyles) {
            _tabs.push({
                label: "Gérer les styles",
                content: <ManageStylesTab service={serviceQuery.data} offeringId={offeringId} datastoreId={datastoreId} datasheetName={datasheetName} />,
                isDefault: route.params["activeTab"] === "styles",
            });
        }

        return _tabs;
    }, [datasheetName, datastoreId, offeringId, serviceQuery.data, route.params]);

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
            ) : (
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
                        <div className={fr.cx("fr-grid-row", "fr-mb-4w")}>
                            <div className={fr.cx("fr-col-12", "fr-col-md-8")}>{initialValues && <RMap initial={initialValues} />}</div>
                            <div className={fr.cx("fr-col-12", "fr-col-md-4", "fr-p-1w", "fr-px-2w")}>
                                <Tabs tabs={tabs} />
                            </div>
                        </div>
                    ) : (
                        <div className={fr.cx("fr-grid-row", "fr-mb-4w")}>
                            <div className={fr.cx("fr-col")}>
                                <PrivateServiceExplanation datastoreId={datastoreId} />
                            </div>
                        </div>
                    )}
                </>
            )}
        </Main>
    );
};

export default ServiceView;
