import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { containsCoordinate, Extent } from "ol/extent";
import WKT from "ol/format/WKT";
import { FC, useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { CommunityResponseDTO } from "../../../../@types/espaceco";
import ZoomRange from "../../../../components/Utils/ZoomRange";
import olDefaults from "../../../../data/ol-defaults.json";
import { useTranslation } from "../../../../i18n/i18n";
import { ExtentDialog, ExtentDialogModal } from "./ZoomAndCentering/ExtentDialog";
import RMap from "./ZoomAndCentering/RMap";
import Search from "./ZoomAndCentering/Search";
import { Point } from "ol/geom";

type ZoomAndCenteringProps = {
    community: CommunityResponseDTO;
};

export type ZoomAndCenteringFormType = {
    position: number[];
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

    const getValues = useCallback(() => {
        let p;
        if (community.position) {
            const feature = new WKT().readFeature(community.position, {
                dataProjection: "EPSG:4326",
            });
            p = feature.getGeometry() ? (feature.getGeometry() as Point).getCoordinates() : olDefaults.center;
        } else p = olDefaults.center;

        return {
            position: p,
            zoom: community.zoom ?? olDefaults.zoom,
            zoomMin: community.zoom_min ?? olDefaults.zoom_levels.TOP,
            zoomMax: community.zoom_max ?? olDefaults.zoom_levels.BOTTOM,
            extent: community.extent,
        };
    }, [community]);

    const form = useForm<ZoomAndCenteringFormType>({
        mode: "onSubmit",
        values: getValues(),
    });
    const { watch, getValues: getFormValues, setValue: setFormValue } = form;
    console.log(watch());

    const position = watch("position");
    const extent = watch("extent");

    useEffect(() => {
        if (position && extent) {
            setConsistent(containsCoordinate(extent, position));
        }
        return;
    }, [position, extent]);

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
                                setFormValue("position", newPosition);
                            }
                        }}
                    />
                    <ZoomRange
                        label={t("zoom.zoom_range")}
                        hintText={t("zoom.zoom_range_hint")}
                        small={true}
                        min={olDefaults.zoom_levels.TOP}
                        max={olDefaults.zoom_levels.BOTTOM}
                        values={[getFormValues("zoomMin"), getFormValues("zoomMax")]}
                        onChange={(v) => {
                            const oldZoom = getFormValues("zoom");
                            setFormValue("zoomMin", v[0]);
                            setFormValue("zoomMax", v[1]);
                            setFormValue("zoom", oldZoom < v[1] ? oldZoom : v[1]);
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
                        form={form}
                        onPositionChanged={(position) => setFormValue("position", position)}
                        onZoomChanged={(zoom) => setFormValue("zoom", zoom)}
                    />
                </div>
                <ExtentDialog
                    onCancel={() => ExtentDialogModal.close()}
                    onApply={(e) => {
                        setFormValue("extent", e);
                        ExtentDialogModal.close();
                    }}
                />
            </div>
        </div>
    );
};

export default ZoomAndCentering;
