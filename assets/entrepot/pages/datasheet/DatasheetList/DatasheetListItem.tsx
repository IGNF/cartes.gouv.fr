import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Card from "@codegouvfr/react-dsfr/Card";
import { FC } from "react";
import { symToStr } from "tsafe/symToStr";

import { type Datasheet } from "../../../../@types/app";
import { useTranslation } from "../../../../i18n/i18n";
import { routes } from "../../../../router/router";

import "@/sass/pages/datasheetlist_thumbnail.scss";

import placeholder16x9 from "@/img/placeholder.16x9.png";
// import placeholder1x1 from "@/img/placeholder.1x1.png";

type DatasheetListItemProps = {
    datastoreId: string;
    datasheet: Datasheet;
};

const DatasheetListItem: FC<DatasheetListItemProps> = ({ datastoreId, datasheet }) => {
    const { t } = useTranslation("DatasheetList");

    return (
        <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
            <div className={fr.cx("fr-col")}>
                <Card
                    background
                    border
                    imageUrl={datasheet?.thumbnail?.url ?? placeholder16x9}
                    imageAlt="Vignette de la fiche de donnée"
                    // imageComponent={
                    //     <div
                    //         // className="frx-thumbnail-container"
                    //         style={{
                    //             display: "flex",
                    //             // alignItems: "center",
                    //             // justifyContent: "center",
                    //             // alignContent: "center",
                    //             // justifyItems: "center",
                    //             // textAlign: "center",
                    //             width: "100%",
                    //             height: "100%",
                    //         }}
                    //     >
                    //         <img
                    //             src={datasheet?.thumbnail?.url ?? placeholder1x1}
                    //             className={fr.cx("fr-mr-1v")}
                    //             style={{
                    //                 // height: "100%",
                    //                 maxWidth: "100%",
                    //                 width: "50%",
                    //             }}
                    //         />
                    //     </div>
                    // }
                    linkProps={routes.datastore_datasheet_view({ datastoreId, datasheetName: datasheet.name }).link}
                    size="small"
                    title={datasheet.name}
                    titleAs="h3"
                    desc={
                        <Badge as="span" noIcon={true} severity="info" className={fr.cx("fr-badge--orange-terre-battue")}>
                            {datasheet?.nb_publications > 0 ? t("services_published", { nbServices: datasheet?.nb_publications }) : t("no_services_published")}
                        </Badge>
                    }
                    footer={<span className={fr.cx("fr-text--sm")}>Consulter</span>}
                    horizontal={true}
                    enlargeLink
                />
            </div>
        </div>
    );
};

DatasheetListItem.displayName = symToStr({ DatasheetListItem });
export default DatasheetListItem;
