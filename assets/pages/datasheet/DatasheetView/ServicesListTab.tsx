import { fr } from "@codegouvfr/react-dsfr";
import { FC } from "react";
import Button from "@codegouvfr/react-dsfr/Button";
import Badge from "@codegouvfr/react-dsfr/Badge";

import { DatasheetDetailed } from "../../../types/app";
import functions from "../../../functions";
import Translator from "../../../modules/Translator";

type ServicesListTabProps = {
    datasheet?: DatasheetDetailed;
};
const ServicesListTab: FC<ServicesListTabProps> = ({ datasheet }) => {
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

                    <Button className={fr.cx("fr-mr-2v")}>Visualiser</Button>
                    <Button iconId="fr-icon-menu-2-fill" title="Autres actions" />
                </div>
            </div>
        </div>
    ));
};

export default ServicesListTab;
