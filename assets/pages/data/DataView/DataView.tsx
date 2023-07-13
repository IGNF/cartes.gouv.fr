import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import { ButtonsGroup } from "@codegouvfr/react-dsfr/ButtonsGroup";
import { Tabs } from "@codegouvfr/react-dsfr/Tabs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, useEffect } from "react";

import api from "../../../api";
import AppLayout from "../../../components/Layout/AppLayout";
import LoadingText from "../../../components/Utils/LoadingText";
import { datastoreNavItems } from "../../../config/datastoreNavItems";
import reactQueryKeys from "../../../modules/reactQueryKeys";
import { routes } from "../../../router/router";
import { type DataDetailed } from "../../../types";
import DatasetListTab from "./DatasetListTab/DatasetListTab";

type DataViewProps = {
    datastoreId: string;
    dataName: string;
};
const DataView: FC<DataViewProps> = ({ datastoreId, dataName }) => {
    const navItems = datastoreNavItems(datastoreId);

    const queryClient = useQueryClient();

    const dataQuery = useQuery<DataDetailed>([reactQueryKeys.datastore_data(datastoreId, dataName)], () => api.data.get(datastoreId, dataName), {
        refetchInterval: 20000,
    });

    useEffect(() => {
        return () => {
            queryClient.cancelQueries({ queryKey: [reactQueryKeys.datastore_data(datastoreId, dataName)] });
        };
    }, [dataName, datastoreId, queryClient]);

    return (
        <AppLayout navItems={navItems}>
            {dataQuery.isLoading ? (
                <LoadingText />
            ) : (
                <>
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--left", "fr-grid-row--middle", "fr-mb-4w")}>
                        <Button
                            iconId="fr-icon-arrow-left-s-line"
                            priority="tertiary no outline"
                            linkProps={routes.datastore_data_list({ datastoreId }).link}
                            title="Retour à la liste de mes données"
                        />
                        {dataName}
                        <Badge noIcon={true} severity="info" className={fr.cx("fr-ml-2w")}>
                            {dataQuery?.data?.nb_publications && dataQuery?.data?.nb_publications > 0 ? "Publié" : "Non Publié"}
                        </Badge>
                    </div>

                    <div className={fr.cx("fr-grid-row", "fr-mb-4w")}>
                        <div className={fr.cx("fr-col-2")}>
                            <img src="//www.gouvernement.fr/sites/default/files/static_assets/placeholder.1x1.png" width="128px" />
                        </div>
                        <div className={fr.cx("fr-col")}>
                            <p>
                                <strong>Création de la fiche de données : </strong>13 Mar. 2023
                            </p>
                            <p>
                                <strong>Mise à jour : </strong>17 Mar. 2023
                            </p>
                        </div>
                        <div className={fr.cx("fr-col-3")}>
                            <ButtonsGroup
                                buttons={[
                                    {
                                        children: "Supprimer la donnée",
                                        linkProps: {
                                            href: "#",
                                        },
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
                                    { label: "Métadonnées (0)", content: <p>...liste de métadonnées...</p> },
                                    {
                                        label: `Jeux de données (${dataQuery?.data?.vector_db_list?.length})`,
                                        isDefault: true,
                                        content: <DatasetListTab datastoreId={datastoreId} data={dataQuery?.data} />,
                                    },
                                    { label: "Services (0)", content: <p>...liste de services...</p> },
                                ]}
                            />
                        </div>
                    </div>
                </>
            )}
        </AppLayout>
    );
};

export default DataView;
