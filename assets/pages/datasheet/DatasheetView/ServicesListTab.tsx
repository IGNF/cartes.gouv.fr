import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import { FC } from "react";

import functions from "../../../functions";
import Translator from "../../../modules/Translator";
import { routes } from "../../../router/router";
import { DatasheetDetailed } from "../../../types/app";

type ServicesListTabProps = {
    datasheet?: DatasheetDetailed;
    datastoreId: string;
};
const ServicesListTab: FC<ServicesListTabProps> = ({ datastoreId, datasheet }) => {
    if (!datasheet?.service_list || datasheet?.service_list.length === 0) {
        return (
            <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                <p>{Translator.trans("datasheet.view.services.no_service")}</p>
            </div>
        );
    }

    return datasheet?.service_list?.map((service) => (
        <div key={service._id} className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-mt-2v")}>
            <div className={fr.cx("fr-col")}>
                <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                    <Button iconId="ri-add-box-fill" title="Voir les données liées" className={fr.cx("fr-mr-2v")} />
                    {service.configuration.name}
                </div>
            </div>

            <div className={fr.cx("fr-col")}>
                <div className={fr.cx("fr-grid-row", "fr-grid-row--right", "fr-grid-row--middle")}>
                    <Badge>Web Feature Service</Badge>
                    <p className={fr.cx("fr-m-auto", "fr-mr-2v")}>
                        {service?.configuration?.last_event?.date && functions.date.format(service?.configuration?.last_event?.date)}
                    </p>
                    <i className={fr.cx("fr-mr-2v", service.open ? "fr-icon-lock-unlock-fill" : "fr-icon-lock-fill")} />

                    <Button
                        className={fr.cx("fr-mr-2v")}
                        linkProps={routes.datastore_service_view({ datastoreId, offeringId: service._id, datasheetName: datasheet.name }).link}
                    >
                        Visualiser
                    </Button>
                    <Button iconId="fr-icon-menu-2-fill" title="Autres actions" />
                </div>
            </div>
        </div>
    ));
};

export default ServicesListTab;
