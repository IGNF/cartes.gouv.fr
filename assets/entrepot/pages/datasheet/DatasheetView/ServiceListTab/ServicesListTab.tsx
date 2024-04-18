import { fr } from "@codegouvfr/react-dsfr";
import { FC } from "react";
import { symToStr } from "tsafe/symToStr";

import Translator from "../../../../../modules/Translator";
import { DatasheetDetailed } from "../../../../../@types/app";
import ServicesListItem from "./ServicesListItem";

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
        <ServicesListItem key={service._id} service={service} datasheetName={datasheet.name} datastoreId={datastoreId} />
    ));
};
ServicesListTab.displayName = symToStr({ ServicesListTab });

export default ServicesListTab;
