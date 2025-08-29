import MapboxStyleParser from "geostyler-mapbox-parser";
import OlStyleParser from "geostyler-openlayers-parser";
import QGISStyleParser from "geostyler-qgis-parser";
import SldStyleParser from "geostyler-sld-parser";
import { StyleParser } from "geostyler-style";

import { CartesStyle, GeostylerStyles, StyleFormatEnum } from "@/@types/app";

export const sldParser = new SldStyleParser({
    builderOptions: {
        format: true,
    },
    locale: "fr",
    sldVersion: "1.0.0",
});
sldParser.title = "SLD 1.0.0";

export const qgisParser = new QGISStyleParser();
qgisParser.title = "QML (QGIS)";

export const mbParser = new MapboxStyleParser({
    pretty: true,
});

export const olParser = new OlStyleParser();

export function isCarteStyle(style: CartesStyle | GeostylerStyles): style is CartesStyle {
    return "name" in style && "layers" in style;
}

export function getParserForFormat(format: StyleFormatEnum): StyleParser {
    switch (format) {
        case StyleFormatEnum.Mapbox:
            return mbParser;
        case StyleFormatEnum.SLD:
            return sldParser;
        case StyleFormatEnum.QML:
            return qgisParser;
        default:
            throw new Error(`No parser available for format: ${format}`);
    }
}

export function getParsersForFormats(formats: StyleFormatEnum[]): StyleParser[] {
    return formats.map((format) => getParserForFormat(format));
}

export function getParserForExtension(extension: string | undefined): StyleParser {
    switch (extension?.toLowerCase()) {
        case "sld":
            return sldParser;
        case "json":
            return mbParser;
        case "qml":
            return qgisParser;
        default:
            throw new Error(`No parser available for extension: ${extension}`);
    }
}

export function getParsersForExtensions(fileExtensions: string[] = ["sld"]): StyleParser[] {
    return fileExtensions.map((ext) => getParserForExtension(ext));
}
