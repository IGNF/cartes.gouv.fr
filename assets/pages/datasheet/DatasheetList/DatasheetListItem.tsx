import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import Tag from "@codegouvfr/react-dsfr/Tag";
import { FC } from "react";
import { symToStr } from "tsafe/symToStr";

import functions from "../../../functions";
import { routes } from "../../../router/router";
import { type Datasheet } from "../../../types/app";

type DatasheetListItemProps = {
    datastoreId: string;
    datasheet: Datasheet;
};

const DatasheetListItem: FC<DatasheetListItemProps> = ({ datastoreId, datasheet }) => {
    return (
        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-grid-row--center", "fr-my-1w", "fr-p-2v", "fr-card--grey")}>
            <div className={fr.cx("fr-col")}>
                <Button linkProps={routes.datastore_datasheet_view({ datastoreId, datasheetName: datasheet.name }).link} priority="tertiary no outline">
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                        <img src="//www.gouvernement.fr/sites/default/files/static_assets/placeholder.1x1.png" width={"64px"} className={fr.cx("fr-mr-1v")} />
                        <strong className={fr.cx("fr-ml-2w")}>{datasheet.name}</strong>
                        {datasheet.categories?.map((category, i) => (
                            <Tag key={i} dismissible={false} className={fr.cx("fr-ml-2w")} small={true} pressed={false}>
                                {category}
                            </Tag>
                        ))}
                    </div>
                </Button>
            </div>
            <div className={fr.cx("fr-col-2")}>{datasheet?.date ? functions.date.format(datasheet.date) : ""}</div>
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