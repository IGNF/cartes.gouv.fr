import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { FC } from "react";

import MenuList from "../../../../../components/Utils/MenuList";
import StoredDataStatusBadge from "../../../../../components/Utils/StoredDataStatusBadge";
import functions from "../../../../../functions";
import { routes } from "../../../../../router/router";
import { Pyramid, StoredDataStatuses } from "../../../../../types/app";

type PyramidListItemProps = {
    pyramid: Pyramid;
    datastoreId: string;
};
const PyramidListItem: FC<PyramidListItemProps> = ({ datastoreId, pyramid }) => {
    return (
        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-mt-2v")}>
            <div className={fr.cx("fr-col")}>
                <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>{pyramid.name}</div>
            </div>
            <div className={fr.cx("fr-col")}>
                <div className={fr.cx("fr-grid-row", "fr-grid-row--right", "fr-grid-row--middle")}>
                    <p className={fr.cx("fr-m-auto", "fr-mr-2v")}>{pyramid?.last_event?.date && functions.date.format(pyramid?.last_event?.date)}</p>
                    <StoredDataStatusBadge status={pyramid.status} />
                    <Button
                        onClick={() => {
                            routes.datastore_tms_vector_service_new({ datastoreId, pyramidId: pyramid._id }).push();
                        }}
                        className={fr.cx("fr-mr-2v")}
                        disabled={pyramid.status !== StoredDataStatuses.GENERATED}
                    >
                        Publier le service TMS
                    </Button>
                    <MenuList
                        menuOpenButtonProps={{
                            iconId: "fr-icon-menu-2-fill",
                            title: "Autres actions",
                        }}
                        // disabled={pyramid.status !== StoredDataStatuses.GENERATED}
                        items={[
                            {
                                text: "Voir les détails",
                                iconId: "fr-icon-file-text-fill",
                                linkProps: routes.datastore_stored_data_report({ datastoreId, storedDataId: pyramid._id }).link,
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
    );
};

export default PyramidListItem;
