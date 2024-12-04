import { fr } from "@codegouvfr/react-dsfr";
import { FC } from "react";
import { symToStr } from "tsafe/symToStr";

import Translator from "../../../../../modules/Translator";
import { DatasheetDetailed, Service } from "../../../../../@types/app";
import ServicesListItem from "./ServicesListItem";

type ServicesListTabProps = {
    datasheet: DatasheetDetailed;
    datastoreId: string;
    datasheet_services_list: Service[];
};
const ServicesListTab: FC<ServicesListTabProps> = ({ datastoreId, datasheet, datasheet_services_list }) => {
    if (!datasheet_services_list || datasheet_services_list.length === 0) {
        return (
            <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                <p>{Translator.trans("datasheet.view.services.no_service")}</p>
            </div>
        );
    }

    return datasheet_services_list?.map((service) => (
        <ServicesListItem key={service._id} service={service} datasheetName={datasheet.name} datastoreId={datastoreId} />
    ));
};
ServicesListTab.displayName = symToStr({ ServicesListTab });

export default ServicesListTab;
