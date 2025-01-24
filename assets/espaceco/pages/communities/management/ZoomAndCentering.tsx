import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { containsCoordinate } from "ol/extent";
import { FC, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { CommunityFormMode, ZoomAndCenteringFormType } from "../../../../@types/app_espaceco";
import { CommunityResponseDTO } from "../../../../@types/espaceco";
import ZoomRange from "../../../../components/Utils/ZoomRange";
import olDefaults from "../../../../data/ol-defaults.json";
import { useTranslation } from "../../../../i18n/i18n";
import { getDefaultValues } from "../DefaultValues";
import { COMMUNITY_FORM_STEPS } from "../FormSteps";
import { ExtentDialog, ExtentDialogModal } from "./ZoomAndCentering/ExtentDialog";
import RMap from "./ZoomAndCentering/RMap";
import Search from "./ZoomAndCentering/Search";
import DisplayExtent from "./ZoomAndCentering/DisplayExtent";

type ZoomAndCenteringProps = {
    mode: CommunityFormMode;
    community: CommunityResponseDTO;
    onSubmit: (datas: FormData) => void;
};

const ZoomAndCentering: FC<ZoomAndCenteringProps> = ({ mode, community, onSubmit }) => {
    const { t: tCommon } = useTranslation("Common");
    const { t } = useTranslation("ManageCommunity");

    // Cohérence entre l'extent et la position
    const [consistent, setConsistent] = useState<boolean>(true);

    const form = useForm<ZoomAndCenteringFormType>({
        mode: "onSubmit",
        values: getDefaultValues(community, COMMUNITY_FORM_STEPS.ZOOM_AND_CENTERING) as ZoomAndCenteringFormType,
    });
    const { watch, getValues: getFormValues, setValue: setFormValue, handleSubmit } = form;

    const position = watch("position");
    const extent = watch("extent");

    useEffect(() => {
        if (position && extent) {
            setConsistent(containsCoordinate(extent, position));
        }
        return;
    }, [position, extent]);

    const onSubmitForm = () => {
        const { position, zoom, zoomMin, zoomMax, extent } = getFormValues();

        const datas = new FormData();
        datas.append("zoom", zoom.toString());
        datas.append("zoom_min", zoomMin.toString());
        datas.append("zoom_max", zoomMax.toString());
        datas.append("position", JSON.stringify(position));
        if (extent) {
            datas.append("extent", JSON.stringify(extent));
        }
        onSubmit(datas);
    };

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
                            priority={"secondary"}
                            onClick={() => {
                                ExtentDialogModal.open();
                            }}
                        >
                            {t("zoom.manage_extent")}
                        </Button>
                    </div>
                    {extent && <DisplayExtent extent={extent} onRemove={() => setFormValue("extent", null)} />}
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
            <div className={fr.cx("fr-grid-row", "fr-grid-row--right")}>
                <Button priority={mode === "creation" ? "secondary" : "primary"} onClick={handleSubmit(onSubmitForm)}>
                    {tCommon("save")}
                </Button>
                {mode === "creation" && (
                    <Button
                        priority="primary"
                        nativeButtonProps={{
                            type: "submit",
                        }}
                    >
                        {tCommon("continue")}
                    </Button>
                )}
            </div>
        </div>
    );
};

export default ZoomAndCentering;
