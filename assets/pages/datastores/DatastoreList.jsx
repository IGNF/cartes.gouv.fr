import { fr } from "@codegouvfr/react-dsfr";
import { Tile } from "@codegouvfr/react-dsfr/Tile";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";

import api from "../../api";
import AppLayout from "../../components/Layout/AppLayout";
import BtnBackToHome from "../../components/Layout/BtnBackToHome";
import { defaultNavItems } from "../../config/navItems";

const DatastoreTile = ({ datastore }) => {
    return (
        <div className={fr.cx("fr-col")}>
            <Tile
                title={datastore.name}
                grey
                imageUrl="//www.gouvernement.fr/sites/default/files/static_assets/placeholder.1x1.png"
                linkProps={{
                    href: "#",
                }}
            />
        </div>
    );
};

DatastoreTile.propTypes = {
    datastore: PropTypes.object,
};

const DatastoreList = () => {
    const [datastores, setDatastores] = useState([]);

    useEffect(() => {
        api.user
            .getDatastoresList()
            .then((response) => {
                setDatastores(response);
                console.log(response);
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);

    return (
        <AppLayout navItems={defaultNavItems}>
            <h1>Mes espaces de travail</h1>

            <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                {Object.entries(datastores).map(([id, datastore]) => (
                    <DatastoreTile key={id} datastore={datastore} />
                ))}
            </div>

            <BtnBackToHome />
        </AppLayout>
    );
};

export default DatastoreList;
