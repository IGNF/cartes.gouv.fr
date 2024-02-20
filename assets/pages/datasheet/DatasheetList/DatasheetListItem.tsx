import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import { FC } from "react";
import { symToStr } from "tsafe/symToStr";

import { routes } from "../../../router/router";
import { type Datasheet } from "../../../types/app";

import "../../../sass/pages/datasheetlist.scss";

type DatasheetListItemProps = {
    datastoreId: string;
    datasheet: Datasheet;
};

const defaultImgUrl = "//www.gouvernement.fr/sites/default/files/static_assets/placeholder.1x1.png";

const DatasheetListItem: FC<DatasheetListItemProps> = ({ datastoreId, datasheet }) => {
    return (
        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-grid-row--center", "fr-my-1w", "fr-p-2v", "fr-card--grey")}>
            <div className={fr.cx("fr-col")}>
                <Button linkProps={routes.datastore_datasheet_view({ datastoreId, datasheetName: datasheet.name }).link} priority="tertiary no outline">
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                        <div className="frx-thumbnail-container">
                            <img src={datasheet?.thumbnail?.url ?? defaultImgUrl} className={fr.cx("fr-mr-1v")} />
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
            {/* <div className={fr.cx("fr-col-2")}>{datasheet?.date ? functions.date.format(datasheet.date) : ""}</div> */}
            <div className={fr.cx("fr-col-2")}>
                <Badge noIcon={true} severity="info">
                    {datasheet?.nb_publications > 0 ? `Publié (${datasheet?.nb_publications})` : "Non Publié"}
                </Badge>
            </div>
        </div>
    );
};

DatasheetListItem.displayName = symToStr({ DataListItem: DatasheetListItem });
export default DatasheetListItem;
