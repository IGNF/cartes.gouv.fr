import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { FC, memo } from "react";

import MenuList from "../../../../../components/Utils/MenuList";
import StoredDataStatusBadge from "../../../../../components/Utils/StoredDataStatusBadge";
import functions from "../../../../../functions";
import useToggle from "../../../../../hooks/useToggle";
import { routes } from "../../../../../router/router";
import { Pyramid, StoredDataStatusEnum } from "../../../../../types/app";
import PyramidDesc from "./PyramidDesc";

type PyramidListItemProps = {
    pyramid: Pyramid;
    datastoreId: string;
};
const PyramidListItem: FC<PyramidListItemProps> = ({ datastoreId, pyramid }) => {
    const [showDescription, toggleShowDescription] = useToggle(false);

    return (
        <div className={fr.cx("fr-p-2v", "fr-mt-2v")} style={{ backgroundColor: fr.colors.decisions.background.contrast.grey.default }}>
            <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                <div className={fr.cx("fr-col")}>
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                        <Button
                            iconId={showDescription ? "ri-subtract-fill" : "ri-add-fill"}
                            size="small"
                            title="Voir les données liées"
                            className={fr.cx("fr-mr-2v")}
                            priority="secondary"
                            onClick={toggleShowDescription}
                        />
                        {pyramid.name}
                    </div>
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
                            priority="secondary"
                            disabled={pyramid.status !== StoredDataStatusEnum.GENERATED}
                        >
                            Publier le service TMS
                        </Button>
                        <MenuList
                            menuOpenButtonProps={{
                                iconId: "fr-icon-menu-2-fill",
                                title: "Autres actions",
                                priority: "secondary",
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

            {showDescription && <PyramidDesc pyramid={pyramid} datastoreId={datastoreId} />}
        </div>
    );
};

export default memo(PyramidListItem);
