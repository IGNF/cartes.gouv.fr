import { fr } from "@codegouvfr/react-dsfr";
import { Tile } from "@codegouvfr/react-dsfr/Tile";

import AppLayout from "../../components/Layout/AppLayout";
import LoadingText from "../../components/Utils/LoadingText";
import { datastoreNavItems } from "../../config/datastoreNavItems";
import useDatastoreList from "../../hooks/useDatastoreList";
import Translator from "../../modules/Translator";
import { routes } from "../../router/router";
import { useAuthStore } from "../../stores/AuthStore";
import { useMutation } from "@tanstack/react-query";
import { CartesApiException } from "../../modules/jsonFetch";
import api from "../../api";

const DashboardPro = () => {
    const datastoreListQuery = useDatastoreList();
    const navItems = datastoreNavItems();
    const { user } = useAuthStore();

    const { mutate } = useMutation<undefined, CartesApiException>({
        mutationFn: () => {
            return api.user.addToSandbox();
        },
    });

    const handleClick = (datastoreId) => {
        mutate(undefined, { onSuccess: () => routes.datasheet_list({ datastoreId: datastoreId }).push() });
    };

    return (
        <AppLayout navItems={navItems} documentTitle="Tableau de bord professionnel">
            {datastoreListQuery.isLoading ? (
                <LoadingText />
            ) : (
                <>
                    <h1>Bienvenue {user?.first_name ?? user?.user_name}</h1>

                    <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                        {datastoreListQuery.data?.map((datastore) => {
                            const link = { ...routes.datasheet_list({ datastoreId: datastore._id }).link, onClick: () => handleClick(datastore._id) };
                            return (
                                <div key={datastore._id} className={fr.cx("fr-col-12", "fr-col-sm-6", "fr-col-md-4", "fr-col-lg-3")}>
                                    <Tile linkProps={link} grey={true} title={datastore.name} />
                                </div>
                            );
                        })}
                        <div className={fr.cx("fr-col-12", "fr-col-sm-6", "fr-col-md-4", "fr-col-lg-3")}>
                            <Tile linkProps={routes.datastore_create_request().link} grey={true} title={Translator.trans("datastore_creation_request.title")} />
                        </div>
                        <div className={fr.cx("fr-col-12", "fr-col-sm-6", "fr-col-md-4", "fr-col-lg-3")}>
                            <Tile linkProps={routes.join_community().link} grey={true} title={Translator.trans("communities_list.title")} />
                        </div>
                    </div>
                </>
            )}
        </AppLayout>
    );
};

export default DashboardPro;
