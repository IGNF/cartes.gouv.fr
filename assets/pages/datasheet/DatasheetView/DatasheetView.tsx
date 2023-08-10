import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import { ButtonsGroup } from "@codegouvfr/react-dsfr/ButtonsGroup";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { Tabs } from "@codegouvfr/react-dsfr/Tabs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { symToStr } from "tsafe/symToStr";

import api from "../../../api";
import AppLayout from "../../../components/Layout/AppLayout";
import LoadingText from "../../../components/Utils/LoadingText";
import Wait from "../../../components/Utils/Wait";
import { dashboardProNavItems } from "../../../config/dashboardProNavItems";
import RCKeys from "../../../modules/RCKeys";
import { type CartesApiException } from "../../../modules/jsonFetch";
import { routes, useRoute } from "../../../router/router";
import { type DatasheetDetailed } from "../../../types/app";
import DatasetListTab from "./DatasetListTab/DatasetListTab";
import ServicesListTab from "./ServicesListTab";

import "../../../sass/components/spinner.scss";

const deleteDataConfirmModal = createModal({
    id: "delete-data-confirm-modal",
    isOpenedByDefault: false,
});

type DatasheetViewProps = {
    datastoreId: string;
    datasheetName: string;
};
const DatasheetView: FC<DatasheetViewProps> = ({ datastoreId, datasheetName }) => {
    const navItems = dashboardProNavItems;
    const route = useRoute();

    const abortController = new AbortController();
    const queryClient = useQueryClient();

    const datasheetQuery = useQuery<DatasheetDetailed, CartesApiException>({
        queryKey: RCKeys.datastore_datasheet(datastoreId, datasheetName),
        queryFn: () => api.datasheet.get(datastoreId, datasheetName, { signal: abortController?.signal }),
        refetchInterval: 20000,
        retry: false,
    });

    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    useEffect(() => {
        return () => {
            queryClient.cancelQueries({ queryKey: [...RCKeys.datastore_datasheet(datastoreId, datasheetName)] });
        };
    }, [datasheetName, datastoreId, queryClient]);

    const handleDeleteData = () => {
        setIsDeleting(true);
        api.datasheet
            .remove(datastoreId, datasheetName)
            .then(() => {
                routes.datasheet_list().push();
            })
            .catch((error) => {
                console.error(error);
            })
            .finally(() => {
                setIsDeleting(false);
            });
    };

    return (
        <AppLayout navItems={navItems}>
            {datasheetQuery.isLoading ? (
                <LoadingText />
            ) : datasheetQuery.error ? (
                <Alert
                    severity="error"
                    closable={false}
                    title={datasheetQuery.error.message}
                    description={<Button linkProps={routes.datasheet_list().link}>Retour à mes données</Button>}
                />
            ) : (
                <>
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-mb-4w")}>
                        <Button
                            iconId="fr-icon-arrow-left-s-line"
                            priority="tertiary no outline"
                            linkProps={routes.datasheet_list().link}
                            title="Retour à la liste de mes données"
                        />
                        {datasheetName}
                        <Badge noIcon={true} severity="info" className={fr.cx("fr-ml-2w")}>
                            {datasheetQuery?.data?.nb_publications && datasheetQuery?.data?.nb_publications > 0 ? "Publié" : "Non Publié"}
                        </Badge>
                    </div>

                    <div className={fr.cx("fr-grid-row", "fr-mb-4w")}>
                        <div className={fr.cx("fr-col-2")}>
                            <img src="//www.gouvernement.fr/sites/default/files/static_assets/placeholder.1x1.png" width="128px" />
                        </div>
                        <div className={fr.cx("fr-col")}>
                            <p className={fr.cx("fr-mb-2v")}>
                                <strong>Création de la fiche de données : </strong>13 Mar. 2023
                            </p>
                            <p className={fr.cx("fr-mb-2v")}>
                                <strong>Mise à jour : </strong>17 Mar. 2023
                            </p>
                        </div>
                        <div className={fr.cx("fr-col-3")}>
                            <ButtonsGroup
                                buttons={[
                                    {
                                        children: "Supprimer la donnée",
                                        onClick: () => deleteDataConfirmModal.open(),
                                        iconId: "fr-icon-delete-fill",
                                    },
                                    {
                                        children: "Bouton à définir",
                                        linkProps: {
                                            href: "#",
                                        },
                                    },
                                ]}
                            />
                        </div>
                    </div>

                    <div className={fr.cx("fr-grid-row")}>
                        <div className={fr.cx("fr-col")}>
                            <Tabs
                                tabs={[
                                    {
                                        label: "Métadonnées (0)",
                                        isDefault: route.params["activeTab"] === "metadata",
                                        content: <p>...liste de métadonnées...</p>,
                                    },
                                    {
                                        label: `Jeux de données (${datasheetQuery?.data?.vector_db_list?.length || 0})`,
                                        isDefault: route.params["activeTab"] === "dataset",
                                        content: <DatasetListTab datastoreId={datastoreId} datasheet={datasheetQuery?.data} />,
                                    },
                                    {
                                        label: `Services (${datasheetQuery?.data?.service_list?.length || 0})`,
                                        isDefault: route.params["activeTab"] === "services",
                                        content: <ServicesListTab datastoreId={datastoreId} datasheet={datasheetQuery?.data} />,
                                    },
                                ]}
                            />
                        </div>
                    </div>
                </>
            )}

            {isDeleting && (
                <Wait>
                    <div className={fr.cx("fr-container")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <i className={fr.cx("fr-icon-refresh-line", "fr-icon--lg", "fr-mr-2v") + " icons-spin"} />
                            <h6 className={fr.cx("fr-m-0")}>En cours de suppression</h6>
                        </div>
                    </div>
                </Wait>
            )}

            <>
                {createPortal(
                    <deleteDataConfirmModal.Component
                        title={`Êtes-vous sûr de supprimer la fiche de données ${datasheetName} ?`}
                        buttons={[
                            {
                                children: "Non, annuler",
                                doClosesModal: true,
                                priority: "secondary",
                            },
                            {
                                children: "Oui, supprimer",
                                onClick: handleDeleteData,
                                doClosesModal: true,
                                priority: "primary",
                            },
                        ]}
                    >
                        <strong>Les éléments suivants seront supprimés :</strong>
                        <ul>
                            {datasheetQuery?.data?.vector_db_list?.length && datasheetQuery?.data?.vector_db_list.length > 0 ? (
                                <li> {datasheetQuery?.data?.vector_db_list.length} base(s) de données</li>
                            ) : null}
                            {datasheetQuery?.data?.service_list?.length && datasheetQuery?.data?.service_list.length > 0 ? (
                                <li> {datasheetQuery?.data?.service_list.length} service(s) publié(s)</li>
                            ) : null}
                            {datasheetQuery?.data?.upload_list?.length && datasheetQuery?.data?.upload_list.length > 0 ? (
                                <li> {datasheetQuery?.data?.upload_list.length} livraison(s)</li>
                            ) : null}

                            {/* TODO : pyramides tuiles vectorielles, raster, métadonnées etc... */}
                        </ul>
                    </deleteDataConfirmModal.Component>,
                    document.body
                )}
            </>
        </AppLayout>
    );
};

DatasheetView.displayName = symToStr({ DatasheetView });

export default DatasheetView;
