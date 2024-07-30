import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { Coordinate } from "ol/coordinate";
import { containsCoordinate, Extent } from "ol/extent";
import WKT from "ol/format/WKT";
import { toLonLat } from "ol/proj";
import { FC, useEffect, useState } from "react";
import { CommunityResponseDTO } from "../../../../@types/espaceco";
import ZoomRange from "../../../../components/Utils/ZoomRange";
import olDefaults from "../../../../data/ol-defaults.json";
import { useTranslation } from "../../../../i18n/i18n";
import { ExtentDialog, ExtentDialogModal } from "./ZoomAndCentering/ExtentDialog";
import RMap from "./ZoomAndCentering/RMap";
import Search from "./ZoomAndCentering/Search";

type ZoomAndCenteringProps = {
    community: CommunityResponseDTO;
};

type formType = {
    position: Coordinate | null;
    zoom: number;
    zoomMin: number;
    zoomMax: number;
    extent?: Extent | null;
};

const ZoomAndCentering: FC<ZoomAndCenteringProps> = ({ community }) => {
    const { t: tCommon } = useTranslation("Common");
    const { t } = useTranslation("ManageCommunity");

    // Cohérence entre l'extent et la position
    const [consistent, setConsistent] = useState<boolean>(true);

    const [values, setValues] = useState<formType>(() => {
        let p = null;
        if (community.position) {
            const feature = new WKT().readFeature(community.position, {
                dataProjection: "EPSG:4326",
            });
            p = feature.getGeometry().getCoordinates();
        }

        const zoomMin = community.zoom_min ?? olDefaults.zoom_levels.TOP;
        const zoomMax = community.zoom_max ?? olDefaults.zoom_levels.BOTTOM;

        return {
            position: p,
            extent: community.extent,
            zoomMin: zoomMin,
            zoomMax: zoomMax,
            zoom: zoomMax,
        };
    });

    useEffect(() => {
        if (values.extent && values.position) {
            setConsistent(containsCoordinate(values.extent, values.position));
        }
        return;
    }, [values]);

    return (
        <div>
            {consistent === false && (
                <Alert severity="warning" title={tCommon("warning")} description={t("zoom.consistant_error")} className={fr.cx("fr-my-2w")} />
            )}
            <h2>{t("zoom.tab.title")}</h2>
            <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                <div className={fr.cx("fr-col-5")}>
                    <Search
                        label={t("zoom.position")}
                        hintText={t("zoom.position_hint")}
                        filter={{
                            type: "StreetAddress",
                            maximumResponses: 10,
                        }}
                        onChange={(newPosition) => {
                            if (newPosition) {
                                setValues({ ...values, position: newPosition });
                            }
                        }}
                    />
                    <ZoomRange
                        label={t("zoom.zoom_range")}
                        hintText={t("zoom.zoom_range_hint")}
                        small={true}
                        min={olDefaults.zoom_levels.TOP}
                        max={olDefaults.zoom_levels.BOTTOM}
                        values={[values.zoomMin, values.zoomMax]}
                        onChange={(v) => {
                            const { zoom } = values;
                            setValues({ ...values, zoomMin: v[0], zoomMax: v[1], zoom: zoom < v[1] ? zoom : v[1] });
                        }}
                    />
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--center")}>
                        <Button
                            className={fr.cx("fr-my-1v")}
                            priority={"tertiary no outline"}
                            onClick={() => {
                                ExtentDialogModal.open();
                            }}
                        >
                            {t("zoom.manage_extent")}
                        </Button>
                    </div>
                </div>
                <div className={fr.cx("fr-col-7")}>
                    <RMap
                        position={values.position}
                        zoom={values.zoom}
                        zoomMin={values.zoomMin}
                        zoomMax={values.zoomMax}
                        onMove={(center, zoom) => {
                            const v = {
                                position: toLonLat(center),
                            };
                            if (zoom) {
                                v["zoom"] = zoom;
                            }
                            setValues({ ...values, ...v });
                        }}
                    />
                </div>
                <ExtentDialog
                    onCancel={() => ExtentDialogModal.close()}
                    onApply={(e) => {
                        setValues({ ...values, extent: e });
                        ExtentDialogModal.close();
                    }}
                />
            </div>
        </div>
    );
};

export default ZoomAndCentering;
