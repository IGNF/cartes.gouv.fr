import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import Card from "@codegouvfr/react-dsfr/Card";
import { FC } from "react";
import { symToStr } from "tsafe/symToStr";

import { type Datasheet } from "../../../../@types/app";
import { useTranslation } from "../../../../i18n/i18n";
import { routes } from "../../../../router/router";

import placeholder16x9 from "@/img/placeholder.16x9.png";

type DatasheetListItemProps = {
    datastoreId: string;
    datasheet: Datasheet;
};

const DatasheetListItem: FC<DatasheetListItemProps> = ({ datastoreId, datasheet }) => {
    const { t } = useTranslation("DatasheetList");

    return (
        <Card
            imageUrl={datasheet?.thumbnail?.url ?? placeholder16x9}
            imageAlt={"illustration"}
            horizontal={true}
            title={datasheet.name}
            start={
                <Badge as="span" noIcon={true} severity="info" className={fr.cx("fr-badge--purple-glycine")}>
                    {datasheet?.nb_publications > 0 ? t("services_published", { nbServices: datasheet?.nb_publications }) : t("no_services_published")}
                </Badge>
            }
            footer={
                <Button
                    linkProps={routes.datastore_datasheet_view({ datastoreId, datasheetName: datasheet.name }).link}
                    iconId="fr-icon-arrow-right-s-line"
                    iconPosition="right"
                >
                    Consulter
                </Button>
            }
            size="small"
        />
    );
};

DatasheetListItem.displayName = symToStr({ DatasheetListItem });
export default DatasheetListItem;
