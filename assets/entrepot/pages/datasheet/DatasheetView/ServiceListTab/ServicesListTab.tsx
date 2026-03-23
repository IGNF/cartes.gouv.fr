import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { UseQueryResult } from "@tanstack/react-query";
import { FC } from "react";
import { symToStr } from "tsafe/symToStr";

import LoadingText from "@/components/Utils/LoadingText";
import { CartesApiException } from "@/modules/jsonFetch";
import { DatasheetDetailed, Service } from "../../../../../@types/app";
import { useTranslation } from "../../../../../i18n";
import ServicesListItem from "./ServicesListItem";

type ServicesListTabProps = {
    datasheet: DatasheetDetailed;
    datastoreId: string;
    servicesListQuery: UseQueryResult<Service[], CartesApiException>;
};
const ServicesListTab: FC<ServicesListTabProps> = ({ datastoreId, datasheet, servicesListQuery }) => {
    const { t } = useTranslation("DatasheetView");

    if (servicesListQuery.isLoading) {
        return <LoadingText as="p" withSpinnerIcon />;
    }

    if (servicesListQuery.isError) {
        return <Alert severity="error" title={t("services_tab.query.error")} description={servicesListQuery.error.message} small />;
    }

    const servicesList = servicesListQuery.data ?? [];

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
