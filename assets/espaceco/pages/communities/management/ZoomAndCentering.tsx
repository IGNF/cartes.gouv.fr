import { FC } from "react";
import { CommunityResponseDTO } from "../../../../@types/espaceco";
import WKT from "ol/format/WKT";
import { fr } from "@codegouvfr/react-dsfr";
import Input from "@codegouvfr/react-dsfr/Input";
import { useTranslation } from "../../../../i18n/i18n";
import Search from "./Search";

type ZoomAndCenteringProps = {
    community: CommunityResponseDTO;
};

const ZoomAndCentering: FC<ZoomAndCenteringProps> = ({ community }) => {
    let point;
    if (community.position) {
        const feature = new WKT().readFeature(community.position, {
            dataProjection: "EPSG:4326",
        });
        point = feature.getGeometry().getCoordinates();
    }
    console.log(point);

    return (
        <div className={fr.cx("fr-grid-row")}>
            <div className={fr.cx("fr-col-5")}>
                <Search
                    filter={{
                        type: "PositionOfInterest,StreetAddress",
                        maximumResponses: 10,
                    }}
                />{" "}
            </div>
            <div className={fr.cx("fr-col-7")}></div>
        </div>
    );
};

export default ZoomAndCentering;
