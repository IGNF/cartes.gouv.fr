import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import { FC } from "react";
import { symToStr } from "tsafe/symToStr";

import { type Datasheet } from "../../../../@types/app";
import { useTranslation } from "../../../../i18n/i18n";
import { routes } from "../../../../router/router";

import "../../../../sass/pages/datasheetlist.scss";

import placeholder1x1 from "../../../../img/placeholder.1x1.png";

type DatasheetListItemProps = {
    datastoreId: string;
    datasheet: Datasheet;
};

const DatasheetListItem: FC<DatasheetListItemProps> = ({ datastoreId, datasheet }) => {
    const { t } = useTranslation("DatasheetList");

    return (
        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-grid-row--center", "fr-my-1w", "fr-p-2v", "fr-card--grey")}>
            <div className={fr.cx("fr-col")}>
                <Button linkProps={routes.datastore_datasheet_view({ datastoreId, datasheetName: datasheet.name }).link} priority="tertiary no outline">
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                        <div className="frx-thumbnail-container">
                            <img src={datasheet?.thumbnail?.url ?? placeholder1x1} className={fr.cx("fr-mr-1v")} />
                        </div>
                        <strong className={fr.cx("fr-ml-2w")}>{datasheet.name}</strong>

                        {/* catégories thématiques */}
                        {/* TODO : désactivé pour le moment car les métadonnées sont pas encore faites */}
                        {/* {datasheet.categories?.map((category, i) => (
                            <Tag key={i} dismissible={false} className={fr.cx("fr-ml-2w")} small={true} pressed={false}>
                                {category}
                            </Tag>
                        ))} */}
                    </div>
                </Button>
            </div>
            {/* // TODO : désactivé car pour le moment on se sait pas ça correspond à la date de quoi */}
            {/* <div className={fr.cx("fr-col-2")}>{datasheet?.date ? formatDateFromISO(datasheet.date) : ""}</div> */}
            <div className={fr.cx("fr-col-2")}>
                <Badge noIcon={true} severity="info">
                    {datasheet?.nb_publications > 0 ? t("services_published", { nbServices: datasheet?.nb_publications }) : t("no_services_published")}
                </Badge>
            </div>
        </div>
    );
};

DatasheetListItem.displayName = symToStr({ DatasheetListItem });
export default DatasheetListItem;
