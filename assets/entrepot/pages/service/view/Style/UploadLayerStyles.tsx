import { fr } from "@codegouvfr/react-dsfr";
import BaseLayer from "ol/layer/Base";
import { FC, useEffect, useState } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import { GeostylerStyles, Service, StyleFormatEnum } from "@/@types/app";
import UploadStyleFiles from "@/components/Utils/Geostyler/UploadStyleFiles";
import RMap from "@/components/Utils/RMap";
import { useStyleForm } from "@/contexts/StyleFormContext";
import TMSStyleTools, { MbStyleParseError } from "@/modules/Style/TMSStyleFilesManager/TMSStyleTools";
import getWebService from "@/modules/WebServices/WebServices";
import { decodeKeys, encodeKey } from "@/utils";
import { StyleAddModifyFormType } from "./StyleAddModifyForm";
import Accordion from "@codegouvfr/react-dsfr/Accordion";

type UploadLayerStylesProps = {
    service: Service;
    names: string[];
};

const tmsStyleTools = new TMSStyleTools();

const UploadLayerStyles: FC<UploadLayerStylesProps> = (props) => {
    const { names, service } = props;
    const { control, setValue: setFormValue, setError: setFormError } = useFormContext<StyleAddModifyFormType>();

    const { isMapbox, isTms, styleFormats } = useStyleForm();

    const [olLayers, setOlLayers] = useState<BaseLayer[]>([]);

    useEffect(() => {
        if (!service) return;
        getWebService(service).getLayers().then(setOlLayers);
    }, [service]);

    const styleFiles = useWatch({
        name: "style_files",
        control,
        compute: (value) => decodeKeys(value),
    });

    const [currentStyle, setCurrentStyle] = useState<GeostylerStyles>([]);
    useEffect(() => {
        let cancelled = false;
        async function computeCurrentStyle() {
            if (isTms) {
                if (!cancelled && styleFiles?.["mapbox"]) {
                    const mbStyle = tmsStyleTools.buildMbStyle(service, styleFiles?.["mapbox"]);
                    setCurrentStyle([
                        {
                            format: StyleFormatEnum.Mapbox,
                            style: JSON.stringify(mbStyle),
                        },
                    ]);
                }
            } else {
                if (!cancelled) {
                    setCurrentStyle(
                        Object.entries(styleFiles ?? {}).map(([name, style]) => ({
                            name: name,
                            style: style as string,
                            format: styleFormats[name],
                        }))
                    );
                }
            }
        }
        computeCurrentStyle();
        return () => {
            cancelled = true;
        };
    }, [isTms, isMapbox, service, names, styleFiles, styleFormats]);

    useEffect(() => {
        if (!isTms || isMapbox) {
            return;
        }

        const decodedStyleFiles: Record<string, string> = Object.entries(styleFiles ?? {}).reduce(
            (acc, [k, v]) => {
                if (v !== undefined) {
                    acc[k] = v;
                }
                return acc;
            },
            {} as Record<string, string>
        );

        delete decodedStyleFiles["mapbox"];

        const computeMbStyleFromSLDQML = async () => {
            try {
                const mbStyle = await tmsStyleTools.getMbStyleFromSLDQML(service, names, decodedStyleFiles, styleFormats ?? {});
                const newMbStyleString = JSON.stringify(mbStyle);
                const currentMbStyle = styleFiles?.["mapbox"];
                if (currentMbStyle !== newMbStyleString) {
                    setFormValue(`style_files.${encodeKey("mapbox")}`, newMbStyleString, { shouldValidate: true });
                }
            } catch (error) {
                if (error instanceof MbStyleParseError) {
                    setFormError(`style_files.${encodeKey(error.layerName ?? "mapbox")}`, { message: error.message });
                } else if (error instanceof Error) {
                    setFormError(`style_files.${encodeKey("mapbox")}`, { message: error.message });
                }
            }
        };
        computeMbStyleFromSLDQML();
    }, [isTms, isMapbox, service, names, styleFormats, styleFiles, setFormValue, setFormError]);

    return (
        <>
            {service !== undefined && (
                <>
                    <div className={fr.cx("fr-grid-row", "fr-mt-10v")}>
                        <h2 className={fr.cx("fr-mb-4v")}>Aperçu</h2>
                    </div>
                    <div className={fr.cx("fr-grid-row", "fr-mb-4v")}>
                        {"bbox" in service.configuration.type_infos && service.configuration.type_infos.bbox !== undefined && (
                            <RMap layers={olLayers} type={service.type} currentStyle={currentStyle} bbox={service.configuration.type_infos.bbox} />
                        )}
                    </div>
                </>
            )}

            <div className={fr.cx("fr-grid-row", "fr-mt-10v")}>
                <h2 className={fr.cx("fr-mb-4v")}>Couches</h2>
            </div>
            <Controller
                name="style_files"
                control={control}
                shouldUnregister={false}
                render={({ field: { value, onChange }, formState: { errors } }) => (
                    <UploadStyleFiles
                        errors={errors}
                        onChange={onChange}
                        tables={names}
                        value={value}
                        acceptedFileExtensions={isMapbox ? ["json"] : ["sld", "qml"]}
                    />
                )}
            />

            <Accordion label="Mapbox">
                <pre>
                    <code style={{ whiteSpace: "pre" }} className={fr.cx("fr-text--sm")}>
                        {JSON.stringify(JSON.parse(styleFiles?.["mapbox"] ?? "{}"), null, 4)}
                    </code>
                </pre>
            </Accordion>
        </>
    );
};

export default UploadLayerStyles;
