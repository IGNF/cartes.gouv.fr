import { fr } from "@codegouvfr/react-dsfr";
import { FC } from "react";
import { symToStr } from "tsafe/symToStr";

import { DatasheetDetailed, Service } from "../../../../../@types/app";
import { useTranslation } from "../../../../../i18n";
import ServicesListItem from "./ServicesListItem";

type ServicesListTabProps = {
    datasheet: DatasheetDetailed;
    datastoreId: string;
    datasheet_services_list: Service[];
};
const ServicesListTab: FC<ServicesListTabProps> = ({ datastoreId, datasheet, datasheet_services_list }) => {
    const { t } = useTranslation("DatasheetView");

    if (!datasheet_services_list || datasheet_services_list.length === 0) {
        return (
            <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                <p>{t("services_tab.no_service")}</p>
            </div>
        );
    }

    return datasheet_services_list?.map((service) => (
        <ServicesListItem key={service._id} service={service} datasheetName={datasheet.name} datastoreId={datastoreId} />
    ));
};
ServicesListTab.displayName = symToStr({ ServicesListTab });

export default ServicesListTab;
