import { FC } from "react";
import { Pyramid, StoredDataStatuses } from "../../../../types/app";
import { fr } from "@codegouvfr/react-dsfr";
import MenuList from "../../../../components/Utils/MenuList";
import StoredDataStatusBadge from "../../../../components/Utils/StoredDataStatusBadge";
import functions from "../../../../functions";
import Button from "@codegouvfr/react-dsfr/Button";
import { routes } from "../../../../router/router";

type PyramidListProps = {
    datastoreId: string;
    pyramidList: Pyramid[] | undefined;
};

const PyramidList: FC<PyramidListProps> = ({ datastoreId, pyramidList }) => {
    return (
        <>
            <div className={fr.cx("fr-grid-row")}>
                <h5>
                    <i className={"ri-stack-line"} />
                    &nbsp;Pyramides de tuiles vectorielles ({pyramidList?.length})
                </h5>
            </div>
            {pyramidList?.map((el) => (
                <div key={el._id} className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-mt-2v")}>
                    <div className={fr.cx("fr-col")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>{el.name}</div>
                    </div>
                    <div className={fr.cx("fr-col")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--right", "fr-grid-row--middle")}>
                            <p className={fr.cx("fr-m-auto", "fr-mr-2v")}>{el?.last_event?.date && functions.date.format(el?.last_event?.date)}</p>
                            <StoredDataStatusBadge status={el.status} />
                            <Button
                                onClick={() => {
                                    routes.datastore_tms_vector_service_new({ datastoreId, pyramidId: el._id }).push();
                                }}
                                className={fr.cx("fr-mr-2v")}
                                disabled={el.status !== StoredDataStatuses.GENERATED}
                            >
                                Publier le service TMS
                            </Button>
                            <MenuList
                                menuOpenButtonProps={{
                                    iconId: "fr-icon-menu-2-fill",
                                    title: "Autres actions",
                                }}
                                // disabled={el.status !== StoredDataStatuses.GENERATED}
                                items={[
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
        </>
    );
};

export default PyramidList;
