import { fr } from "@codegouvfr/react-dsfr";
import { StyleParser } from "geostyler-style";
import { AnyLayer, Sources as MbSources, Style as MbStyle } from "mapbox-gl";
import { FC, useEffect, useState } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import { GeostylerStyles, OfferingTypeEnum, Service, StyleFormatEnum, TypeInfosWithBbox } from "@/@types/app";
import UploadStyleFiles from "@/components/Utils/Geostyler/UploadStyleFiles";
import RMap from "@/components/Utils/RMap";
import { useStyleForm } from "@/contexts/StyleFormContext";
import getWebService from "@/modules/WebServices/WebServices";
import { decodeKey, encodeKey } from "@/utils";
import { getParserForFormat, mbParser } from "@/utils/geostyler";
import BaseLayer from "ol/layer/Base";

type UploadLayerStylesProps = {
    service: Service;
    names: string[];
    parser?: StyleParser;
    parsers?: StyleParser[];
};

async function getMbStyleFromSLDQML(
    service: Service,
    layerNames: string[],
    styleFiles: Record<string, string>,
    styleFormats: Record<string, StyleFormatEnum>
): Promise<MbStyle> {
    function getEmptyStyle(): MbStyle {
        if (!service.tms_metadata) {
            throw new Error("Service does not have TMS metadata for Mapbox style conversion.");
        }

        const sources: MbSources = {
            [service.tms_metadata.name]: {
                type: "vector",
                tiles: service.tms_metadata.tiles,
                minzoom: service.tms_metadata.minzoom,
                maxzoom: service.tms_metadata.maxzoom,
            },
        };

        return {
            version: 8,
            sources: sources,
            layers: [],
            name: service.tms_metadata.name,
        };
    }

    const toMapboxLayers = async (layerName: string, styleString: string): Promise<AnyLayer[]> => {
        const parser = getParserForFormat(styleFormats[layerName]);
        console.log(parser.title, styleFormats[layerName]);

        const { output } = await parser.readStyle(styleString);
        if (!output) throw new Error("Error parsing style");

        const { output: mbStyle } = await mbParser.writeStyle(output);
        if (!mbStyle?.layers) throw new Error("Error writing Mapbox style");

        return mbStyle.layers.map((layer) => ({
            ...layer,
            source: service.tms_metadata!.name,
            "source-layer": layerName,
        }));
    };

    const style = getEmptyStyle();

    style.layers = [];

    const layersArrays = await Promise.all(
        layerNames.map(async (name) => {
            const styleStr = styleFiles?.[encodeKey(name)];
            if (styleStr) {
                return await toMapboxLayers(name, styleStr);
            }
            return [];
        })
    );

    style.layers = layersArrays.flat();

    console.log("style.layers", style.layers);

    return style;
}

let renderCounter = 0;

const UploadLayerStyles: FC<UploadLayerStylesProps> = (props) => {
    const { service, names } = props;
    const { control, watch } = useFormContext();

    const { editMode, isMapbox, isTms, styleFormats, currentTable } = useStyleForm();

    const [olLayers, setOlLayers] = useState<BaseLayer[]>([]);

    useEffect(() => {
        if (!service) return;
        getWebService(service).getLayers().then(setOlLayers);
    }, [service]);

    const styleFiles = useWatch({
        name: "style_files",
        control,
    });

    const [currentStyle, setCurrentStyle] = useState<GeostylerStyles>([]);
    useEffect(() => {
        let cancelled = false;
        async function computeCurrentStyle() {
            console.log("computeCurrentStyle", styleFormats[currentTable]);

            if (isTms && !isMapbox) {
                if (isMapbox) {
                    if (!cancelled) {
                        setCurrentStyle([
                            {
                                // name: "mapbox",
                                format: StyleFormatEnum.Mapbox,
                                style: styleFiles?.["mapbox"],
                            },
                        ]);
                    }
                } else {
                    const mbStyle = await getMbStyleFromSLDQML(service, names, styleFiles ?? {}, styleFormats ?? {});
                    if (!cancelled) {
                        setCurrentStyle([
                            {
                                // name: "mapbox",
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
                            name: decodeKey(name),
                            style: style as string,
                            format: styleFormats[currentTable],
                        }))
                    );
                }
            }
        }
        computeCurrentStyle();
        return () => {
            cancelled = true;
        };
    }, [isTms, isMapbox, service, names, styleFiles, styleFormats, currentTable]);

    return (
        <>
            {renderCounter++}

            {service !== undefined && currentStyle.length > 0 && (
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
            <pre>
                <code>
                    {JSON.stringify(
                        Object.entries(watch("style_files") ?? {}).reduce(
                            (acc, [key, value]) => ({
                                ...acc,
                                [decodeKey(key)]: value,
                            }),
                            {}
                        ),
                        null,
                        4
                    )}

                    {/* {JSON.stringify(currentStyle, null, 4).replace(/\\(.)/g, "$1")} */}
                </code>
            </pre>
        </>
    );
};

export default UploadLayerStyles;
