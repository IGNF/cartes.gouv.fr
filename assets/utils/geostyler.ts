import { CartesStyle, GeostylerStyles } from "@/@types/app";
import MapboxStyleParser from "geostyler-mapbox-parser";
import QGISStyleParser from "geostyler-qgis-parser";
import SldStyleParser from "geostyler-sld-parser";

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

export function isCarteStyle(style: CartesStyle | GeostylerStyles): style is CartesStyle {
    return "name" in style && "layers" in style;
}
