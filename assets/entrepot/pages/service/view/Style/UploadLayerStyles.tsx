import { fr } from "@codegouvfr/react-dsfr";
import { StyleParser } from "geostyler-style";
import BaseLayer from "ol/layer/Base";
import { FC, useEffect, useState } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import { GeostylerStyles, OfferingTypeEnum, Service, StyleFormatEnum, TypeInfosWithBbox } from "@/@types/app";
import UploadStyleFiles from "@/components/Utils/Geostyler/UploadStyleFiles";
import RMap from "@/components/Utils/RMap";
import { useStyleForm } from "@/contexts/StyleFormContext";
import TMSStyleTools from "@/modules/Style/TMSStyleFilesManager/TMSStyleTools";
import getWebService from "@/modules/WebServices/WebServices";
import { decodeKeys } from "@/utils";

type UploadLayerStylesProps = {
    service: Service;
    names: string[];
    parser?: StyleParser;
    parsers?: StyleParser[];
};

const tmsStyleTools = new TMSStyleTools();

let renderCounter = 0;

const UploadLayerStyles: FC<UploadLayerStylesProps> = (props) => {
    const { service, names } = props;
    const { control } = useFormContext();

    const { editMode, isMapbox, isTms, styleFormats } = useStyleForm();

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
    // TODO refactor
    useEffect(() => {
        let cancelled = false;
        async function computeCurrentStyle() {
            if (isTms) {
                if (isMapbox) {
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
                    const mbStyle = await tmsStyleTools.getMbStyleFromSLDQML(service, names, styleFiles ?? {}, styleFormats ?? {});
                    if (!cancelled) {
                        setCurrentStyle([
                            {
                                format: StyleFormatEnum.Mapbox,
                                style: JSON.stringify(mbStyle),
                            },
                        ]);
                    }
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

    return (
        <>
            {renderCounter++}

            {service !== undefined && (
                <>
                    <div className={fr.cx("fr-grid-row", "fr-mb-4v")}>
                        <h2 className={fr.cx("fr-m-0")}>Aperçu</h2>
                    </div>
                    <div className={fr.cx("fr-grid-row", "fr-mb-4v")}>
                        <RMap
                            layers={olLayers}
                            type={service.type}
                            currentStyle={currentStyle}
                            bbox={(service.configuration.type_infos as TypeInfosWithBbox).bbox}
                        />
                    </div>
                </>
            )}

            {service.type === OfferingTypeEnum.WMTSTMS ? (
                editMode ? (
                    <p>{"Ajouter un fichier mapbox pour votre service"}</p>
                ) : (
                    <p>{"Ajoutez un fichier mapbox pour votre service ou un fichier sld ou qml par couche"}</p>
                )
            ) : (
                <p>{"Ajoutez un fichier sld ou qml par couche présente dans votre service"}</p>
            )}

            <div className={fr.cx("fr-grid-row", "fr-mb-4v")}>
                <h2 className={fr.cx("fr-m-0")}>Couches</h2>
            </div>
            <Controller
                name="style_files"
                control={control}
                shouldUnregister={true}
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
        </>
    );
};

export default UploadLayerStyles;
