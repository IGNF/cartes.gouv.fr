import { fr } from "@codegouvfr/react-dsfr";
import { Tile } from "@codegouvfr/react-dsfr/Tile";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";

import api from "../../api";
import AppLayout from "../../components/Layout/AppLayout";
import BtnBackToHome from "../../components/Utils/BtnBackToHome";
import LoadingText from "../../components/Utils/LoadingText";
import { defaultNavItems } from "../../config/navItems";
import { routes } from "../../router/router";

const DatastoreTile = ({ datastore }) => {
    return (
        <div className={fr.cx("fr-col")}>
            <Tile
                title={datastore.name}
                grey
                imageUrl="//www.gouvernement.fr/sites/default/files/static_assets/placeholder.1x1.png"
                linkProps={routes.datastore_dashboard({ datastoreId: datastore._id }).link}
            />
        </div>
    );
};

DatastoreTile.propTypes = {
    datastore: PropTypes.object,
};

const DatastoreList = () => {
    const [datastores, setDatastores] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.user
            .getDatastoresList()
            .then((response) => setDatastores(response))
            .catch((error) => console.error(error))
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <AppLayout navItems={defaultNavItems}>
            <h1>Mes espaces de travail</h1>

            {isLoading ? (
                <LoadingText />
            ) : (
                <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                    {Object.entries(datastores).map(([id, datastore]) => (
                        <DatastoreTile key={id} datastore={datastore} />
                    ))}
                </div>
            )}

            <BtnBackToHome />
        </AppLayout>
    );
};

export default DatastoreList;
