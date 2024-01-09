import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { useQuery } from "@tanstack/react-query";
import { FC, memo, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { symToStr } from "tsafe/symToStr";

import api from "../../../../../api";
import MenuList from "../../../../../components/Utils/MenuList";
import StoredDataStatusBadge from "../../../../../components/Utils/StoredDataStatusBadge";
import functions from "../../../../../functions";
import RQKeys from "../../../../../modules/RQKeys";
import { routes } from "../../../../../router/router";
import { DatastoreEndpoint, StoredDataStatuses, VectorDb } from "../../../../../types/app";

type ServiceTypes = "tms" | "wfs" | "wms-vector" | "pre-paquet";

type VectorDbListItemProps = {
    vectorDb: VectorDb;
    datastoreId: string;
};
const VectorDbListItem: FC<VectorDbListItemProps> = ({ vectorDb, datastoreId }) => {
    const [serviceType, setServiceType] = useState<ServiceTypes>();

    const [technicalName, setTechnicalName] = useState<string>(vectorDb.name);
    const [technicalNameError, setTechnicalNameError] = useState<string>();

    const endpointsQuery = useQuery<DatastoreEndpoint[]>({
        queryKey: RQKeys.datastore_endpoints(datastoreId),
        queryFn: ({ signal }) => api.datastore.getEndpoints(datastoreId, {}, { signal }),
        retry: false,
        staleTime: 3600000,
    });

    const { wfsEndpoints, wmsVectorEndpoints, tmsEndpoints } = useMemo(() => {
        const wfsEndpoints = Array.isArray(endpointsQuery?.data)
            ? endpointsQuery?.data?.filter((endpoint) => endpoint.endpoint.type.toUpperCase() === "WFS")
            : [];
        const wmsVectorEndpoints = Array.isArray(endpointsQuery?.data)
            ? endpointsQuery?.data?.filter((endpoint) => endpoint.endpoint.type.toUpperCase() === "WMS-VECTOR")
            : [];
        const tmsEndpoints = Array.isArray(endpointsQuery?.data)
            ? endpointsQuery?.data?.filter((endpoint) => endpoint.endpoint.type.toUpperCase() === "WMTS-TMS")
            : [];

        return { wfsEndpoints, wmsVectorEndpoints, tmsEndpoints };
    }, [endpointsQuery.data]);

    const handleCreateService = () => {
        switch (serviceType) {
            case "wfs":
                routes.datastore_wfs_service_new({ datastoreId, vectorDbId: vectorDb._id }).push();
                break;

            case "wms-vector":
                routes.datastore_wms_vector_service_new({ datastoreId, vectorDbId: vectorDb._id }).push();
                break;

            case "tms":
                if (!technicalName) {
                    return;
                }
                routes.datastore_pyramid_vector_new({ datastoreId, vectorDbId: vectorDb._id, technicalName }).push();
                break;

            default:
                console.warn("Action non implémentée");
                break;
        }
    };

    const serviceTypeChoiceModal = useMemo(
        () =>
            createModal({
                id: `service-type-choice-modal-vectordb-${vectorDb._id}`,
                isOpenedByDefault: false,
            }),
        [vectorDb._id]
    );

    return (
        <>
            <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-mt-2v")}>
                <div className={fr.cx("fr-col")}>
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                        <Button iconId="ri-add-box-fill" title="Voir les données liées" className={fr.cx("fr-mr-2v")} />
                        {vectorDb.name}
                    </div>
                </div>

                <div className={fr.cx("fr-col")}>
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--right", "fr-grid-row--middle")}>
                        <p className={fr.cx("fr-m-auto", "fr-mr-2v")}>{vectorDb?.last_event?.date && functions.date.format(vectorDb?.last_event?.date)}</p>
                        <StoredDataStatusBadge status={vectorDb.status} />
                        <Button
                            onClick={() => {
                                serviceTypeChoiceModal.open();
                            }}
                            className={fr.cx("fr-mr-2v")}
                            priority="secondary"
                            disabled={vectorDb.status !== StoredDataStatuses.GENERATED}
                        >
                            Créer un service
                        </Button>
                        <MenuList
                            menuOpenButtonProps={{
                                title: "Autres actions",
                                priority: "secondary",
                            }}
                            items={[
                                {
                                    text: "Remplacer les données",
                                    iconId: "fr-icon-refresh-line",
                                    onClick: () => console.warn("Action non implémentée"),
                                    disabled: vectorDb.status !== StoredDataStatuses.GENERATED,
                                },
                                {
                                    text: "Voir les détails",
                                    iconId: "fr-icon-file-text-fill",
                                    linkProps: routes.datastore_stored_data_report({ datastoreId, storedDataId: vectorDb._id }).link,
                                },
                                {
                                    text: "Supprimer",
                                    iconId: "fr-icon-delete-line",
                                    onClick: () => console.warn("Action non implémentée"),
                                },
                            ]}
                        />
                    </div>
                </div>
            </div>

            {createPortal(
                <serviceTypeChoiceModal.Component
                    title="Définissez le service à créer"
                    buttons={[
                        {
                            children: "Annuler",
                            doClosesModal: true,
                            priority: "secondary",
                        },
                        {
                            children: "Continuer",
                            onClick: handleCreateService,
                            doClosesModal: true,
                            priority: "primary",
                        },
                    ]}
                    concealingBackdrop={false}
                >
                    <RadioButtons
                        options={[
                            {
                                label: "Tile Map Service (TMS)",
                                hintText: "Dans une première étape  vous allez créer une pyramide de tuiles vectorielles que vous devrez ensuite publier",
                                nativeInputProps: {
                                    checked: serviceType === "tms",
                                    onChange: () => setServiceType("tms"),
                                    disabled: tmsEndpoints?.length === 0,
                                },
                            },
                            {
                                label: "Web Feature Service (WFS)",
                                hintText: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Dolor, dolore unde! Autem eos nam fugiat!",
                                nativeInputProps: {
                                    checked: serviceType === "wfs",
                                    onChange: () => setServiceType("wfs"),
                                    disabled: wfsEndpoints?.length === 0,
                                },
                            },
                            {
                                label: "Web Map Service (WMS-Vecteur)",
                                hintText: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Dolor, dolore unde! Autem eos nam fugiat!",
                                nativeInputProps: {
                                    checked: serviceType === "wms-vector",
                                    onChange: () => setServiceType("wms-vector"),
                                    disabled: wmsVectorEndpoints?.length === 0,
                                },
                            },
                            {
                                label: "Fichier pré-paquets",
                                hintText: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Dolor, dolore unde! Autem eos nam fugiat!",
                                nativeInputProps: {
                                    checked: serviceType === "pre-paquet",
                                    onChange: () => setServiceType("pre-paquet"),
                                    disabled: true, // TODO : temporaire
                                },
                            },
                        ]}
                    />
                    {serviceType && serviceType === "tms" && (
                        <Input
                            label="Nom technique de la pyramide de tuiles vectorielles"
                            hintText="II s'agit du nom technique du service qui apparaitra dans votre espace de travail, il ne sera pas publié en ligne. Si vous le renommez, choisissez un nom explicite."
                            nativeInputProps={{
                                defaultValue: technicalName,
                                onChange: (e) => {
                                    setTechnicalName(e.currentTarget.value ?? undefined);
                                    setTechnicalNameError(e.currentTarget.value ? undefined : "Le nom technique est obligatoire");
                                },
                            }}
                            state={technicalNameError ? "error" : "default"}
                            stateRelatedMessage={technicalNameError ?? undefined}
                        />
                    )}
                </serviceTypeChoiceModal.Component>,
                document.body
            )}
        </>
    );
};

VectorDbListItem.displayName = symToStr({ VectorDbListItem });

export default memo(VectorDbListItem);
