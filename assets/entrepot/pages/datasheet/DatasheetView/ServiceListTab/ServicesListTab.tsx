import { fr } from "@codegouvfr/react-dsfr";
import { UseQueryResult } from "@tanstack/react-query";
import { FC } from "react";
import { symToStr } from "tsafe/symToStr";

import LoadingText from "@/components/Utils/LoadingText";
import { DatasheetDetailed, Service } from "../../../../../@types/app";
import { useTranslation } from "../../../../../i18n";
import ServicesListItem from "./ServicesListItem";

type ServicesListTabProps = {
    datasheet: DatasheetDetailed;
    datastoreId: string;
    services_list_query: UseQueryResult<Service[]>;
};
const ServicesListTab: FC<ServicesListTabProps> = ({ datastoreId, datasheet, services_list_query }) => {
    const { t } = useTranslation("DatasheetView");

    if (services_list_query.isLoading) {
        return <LoadingText as="p" withSpinnerIcon />;
    }

    const servicesList = services_list_query.data ?? [];

    if (!servicesList || servicesList.length === 0) {
        return (
            <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                <p>{t("services_tab.no_service")}</p>
            </div>
        );
    }

    return servicesList?.map((service) => <ServicesListItem key={service._id} service={service} datasheetName={datasheet.name} datastoreId={datastoreId} />);
};
ServicesListTab.displayName = symToStr({ ServicesListTab });

export default ServicesListTab;
