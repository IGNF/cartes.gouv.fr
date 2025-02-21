import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { FC } from "react";
import { symToStr } from "tsafe/symToStr";
import Tile from "@codegouvfr/react-dsfr/Tile";

import { type Datasheet } from "../../../../@types/app";
import { useTranslation } from "../../../../i18n/i18n";
import { routes } from "../../../../router/router";

import "@/sass/pages/datasheetlist_thumbnail.scss";

import placeholder1x1 from "@/img/placeholder.1x1.png";

type DatasheetListItemProps = {
    datastoreId: string;
    datasheet: Datasheet;
};

const DatasheetListItem: FC<DatasheetListItemProps> = ({ datastoreId, datasheet }) => {
    const { t } = useTranslation("DatasheetList");

    return (
        <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
            <div className={fr.cx("fr-col")}>
                <Tile
                    title={datasheet.name}
                    imageUrl={datasheet?.thumbnail?.url ?? placeholder1x1}
                    imageSvg={false}
                    orientation="horizontal"
                    linkProps={routes.datastore_datasheet_view({ datastoreId, datasheetName: datasheet.name }).link}
                    enlargeLinkOrButton={true}
                    desc={
                        <Badge as="span" noIcon={true} severity="info" className={fr.cx("fr-badge--orange-terre-battue")}>
                            {datasheet?.nb_publications > 0 ? t("services_published", { nbServices: datasheet?.nb_publications }) : t("no_services_published")}
                        </Badge>
                    }
                    detail={<span className={fr.cx("fr-text--sm")}>{t("view")}</span>}
                />
            </div>
        </div>
    );
};

DatasheetListItem.displayName = symToStr({ DatasheetListItem });
export default DatasheetListItem;
