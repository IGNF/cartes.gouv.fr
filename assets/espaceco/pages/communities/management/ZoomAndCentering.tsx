import LoadingText from "@/components/Utils/LoadingText";
import Wait from "@/components/Utils/Wait";
import { useCommunityContext } from "@/espaceco/contexts/CommunityContext";
import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { containsCoordinate } from "ol/extent";
import { FC, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ZoomAndCenteringFormType } from "../../../../@types/app_espaceco";
import ZoomRange from "../../../../components/Utils/ZoomRange";
import { useTranslation } from "../../../../i18n/i18n";
import { getZoomAndCenteringDefaultValues } from "../DefaultValues";
import ActionButtonsCreation from "./ActionButtonsCreation";
import ActionButtonsEdition from "./ActionButtonsEdition";
import DisplayExtent from "./ZoomAndCentering/DisplayExtent";
import { ExtentDialog, ExtentDialogModal } from "./ZoomAndCentering/ExtentDialog";
import RMap from "./ZoomAndCentering/RMap";
import Search from "./ZoomAndCentering/Search";

const ZoomAndCentering: FC = () => {
    const { t: tCommon } = useTranslation("Common");
    const { t: tmc } = useTranslation("ManageCommunity");

    const context = useCommunityContext();

    const { mode, stepper, updateCommunity, isCommunityUpdating, isCommunityUpdatingError, updatingCommunityError } = context;
    const community = context.community!;

    // Cohérence entre l'extent et la position
    const [consistent, setConsistent] = useState<boolean>(true);

    const form = useForm<ZoomAndCenteringFormType>({
        mode: "onSubmit",
        values: getZoomAndCenteringDefaultValues(community),
    });
    const { watch, getValues: getFormValues, setValue: setFormValue, handleSubmit } = form;

    const position = watch("position");
    const extent = watch("extent");

    useEffect(() => {
        if (position.length && extent?.length) {
            setConsistent(containsCoordinate(extent, position));
        }
        return;
    }, [position, extent]);

    const onSubmitForm = (saveOnly: boolean) => {
        const values = getFormValues();

        const datas = {
            zoom: values.zoom,
            minZoom: values.minZoom,
            maxZoom: values.maxZoom,
            position: `POINT(${position[0]} ${position[1]})`,
        };

        datas["extent"] = values.extent && values.extent.length ? values.extent : null;

        updateCommunity(datas, () => {
            if (mode === "creation" && !saveOnly && !stepper?.isLastStep()) {
                stepper?.nextStep();
            }
        });
    };

    return (
        <div>
            {isCommunityUpdating && (
                <Wait>
                    <div className={fr.cx("fr-grid-row")}>
                        <LoadingText as="h6" message={tmc("updating")} withSpinnerIcon={true} />
                    </div>
                </Wait>
            )}
            {isCommunityUpdatingError && (
                <Alert className={fr.cx("fr-my-2v")} severity="error" closable title={tCommon("error")} description={updatingCommunityError?.message} />
            )}
            {consistent === false && (
                <Alert severity="warning" title={tCommon("warning")} description={tmc("zoom.consistant_error")} className={fr.cx("fr-my-2w")} />
            )}
            <h2>{tmc("zoom.tab.title")}</h2>
            <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                <div className={fr.cx("fr-col-5")}>
                    <Search
                        label={tmc("zoom.position")}
                        hintText={tmc("zoom.position_hint")}
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
                        label={tmc("zoom.zoom_range")}
                        hintText={tmc("zoom.zoom_range_hint")}
                        small={true}
                        min={0}
                        max={20}
                        values={[getFormValues("minZoom"), getFormValues("maxZoom")]}
                        onChange={(v) => {
                            const oldZoom = getFormValues("zoom");
                            setFormValue("minZoom", v[0]);
                            setFormValue("maxZoom", v[1]);
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
                            {tmc("zoom.manage_extent")}
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
            {mode === "creation" ? (
                <ActionButtonsCreation onSave={() => handleSubmit(() => onSubmitForm(true))()} onContinue={() => handleSubmit(() => onSubmitForm(false))()} />
            ) : (
                <ActionButtonsEdition onSave={() => handleSubmit(() => onSubmitForm(true))()} />
            )}
        </div>
    );
};

export default ZoomAndCentering;
