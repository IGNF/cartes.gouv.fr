import { fr } from "@codegouvfr/react-dsfr";
import { AlertProps } from "@codegouvfr/react-dsfr/Alert";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { useQuery } from "@tanstack/react-query";
import { FC, useState } from "react";
import { createPortal } from "react-dom";

import api from "../../../../api";
import MenuList from "../../../../components/Utils/MenuList";
import functions from "../../../../functions";
import RQKeys from "../../../../modules/RQKeys";
import { routes } from "../../../../router/router";
import { DatastoreEndpoint, StoredDataStatuses, type VectorDb } from "../../../../types/app";

type ServiceTypes = "tms" | "wfs" | "wms-vector" | "pre-paquet";

type VectorDbListProps = {
    datastoreId: string;
    vectorDbList: VectorDb[] | undefined;
};

const serviceTypeChoiceModal = createModal({
    id: "service-type-choice-modal",
    isOpenedByDefault: false,
});

const getVectorDbBadge = (status) => {
    let severity: AlertProps.Severity = "info";
    let text = "";
    switch (status) {
        case StoredDataStatuses.GENERATED:
            severity = "success";
            text = "Prêt";
            break;

        case StoredDataStatuses.CREATED:
        case StoredDataStatuses.GENERATING:
            severity = "warning";
            text = "En cours de génération";
            break;

        case StoredDataStatuses.MODIFYING:
            severity = "warning";
            text = "En cours de modification";
            break;

        case StoredDataStatuses.UNSTABLE:
            severity = "error";
            text = "Echoué";
            break;

        case StoredDataStatuses.DELETED:
            severity = "info";
            text = "Supprimé";
            break;

        default:
            break;
    }

    return (
        <Badge noIcon={true} severity={severity} className={fr.cx("fr-mr-2v")}>
            {text}
        </Badge>
    );
};

const VectorDbList: FC<VectorDbListProps> = ({ datastoreId, vectorDbList }) => {
    const [serviceType, setServiceType] = useState<ServiceTypes>();
    const [selectedStoredDataId, setSelectedStoredDataId] = useState<string>();

    const endpointsQuery = useQuery<DatastoreEndpoint[]>({
        queryKey: RQKeys.datastore_endpoints(datastoreId),
        queryFn: ({ signal }) => api.datastore.getEndpoints(datastoreId, {}, { signal }),
        retry: false,
        staleTime: 3600000,
    });

    const wfsEndpoints = Array.isArray(endpointsQuery?.data) ? endpointsQuery?.data?.filter((endpoint) => endpoint.endpoint.type.toUpperCase() === "WFS") : [];
    const wmsVectorEndpoints = Array.isArray(endpointsQuery?.data)
        ? endpointsQuery?.data?.filter((endpoint) => endpoint.endpoint.type.toUpperCase() === "WMS-VECTOR")
        : [];

    const handleCreateService = () => {
        if (!selectedStoredDataId) {
            console.warn("Aucune stored_data sélectionnée");
            return;
        }

        switch (serviceType) {
            case "wfs":
                routes.datastore_wfs_service_new({ datastoreId, vectorDbId: selectedStoredDataId }).push();
                break;

            case "wms-vector":
                routes.datastore_wms_vector_service_new({ datastoreId, vectorDbId: selectedStoredDataId }).push();
                break;

            default:
                console.warn("Action non implémentée");
                break;
        }
    };

    return (
        <>
            <div className={fr.cx("fr-grid-row")}>
                <h5>
                    <i className={fr.cx("fr-icon-database-fill")} />
                    &nbsp;Bases de données vecteur ({vectorDbList?.length})
                </h5>
            </div>

            {vectorDbList?.map((el) => (
                <div key={el._id} className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-mt-2v")}>
                    <div className={fr.cx("fr-col")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <Button iconId="ri-add-box-fill" title="Voir les données liées" className={fr.cx("fr-mr-2v")} />
                            {el.name}
                        </div>
                    </div>

                    <div className={fr.cx("fr-col")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--right", "fr-grid-row--middle")}>
                            <p className={fr.cx("fr-m-auto", "fr-mr-2v")}>{el?.last_event?.date && functions.date.format(el?.last_event?.date)}</p>
                            {getVectorDbBadge(el.status)}
                            <Button
                                onClick={() => {
                                    setSelectedStoredDataId(el._id);
                                    serviceTypeChoiceModal.open();
                                }}
                                className={fr.cx("fr-mr-2v")}
                                disabled={el.status !== StoredDataStatuses.GENERATED}
                            >
                                Créer un service
                            </Button>
                            <MenuList
                                menuOpenButtonProps={{
                                    iconId: "fr-icon-menu-2-fill",
                                    title: "Autres actions",
                                }}
                                disabled={el.status !== StoredDataStatuses.GENERATED}
                                items={[
                                    {
                                        text: "Remplacer les données",
                                        iconId: "fr-icon-refresh-line",
                                        onClick: () => console.warn("Action non implémentée"),
                                    },
                                    {
                                        text: "Voir les détails",
                                        iconId: "fr-icon-file-text-fill",
                                        onClick: () => console.warn("Action non implémentée"),
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
            ))}

            <>
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
                                        disabled: true, // TODO : temporaire
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
                                nativeInputProps={{ placeholder: "[TODO] Nom technique par défaut" }}
                            />
                        )}
                    </serviceTypeChoiceModal.Component>,
                    document.body
                )}
            </>
        </>
    );
};

export default VectorDbList;
