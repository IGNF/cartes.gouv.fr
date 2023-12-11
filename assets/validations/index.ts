import metadata from "./metadata";
import sldStyle from "./sldStyle";
import { FileFormat } from "./StyleValidator";
import SldStyleValidator from "./SldStyleValidator";
import QGisStyleValidator from "./QGisStyleValidator";
import MapboxStyleValidator from "./MapboxStyleValidator";

const getValidator = (format: FileFormat) => {
    switch (format) {
        case "sld":
            return new SldStyleValidator(format);
        case "qml":
            return new QGisStyleValidator(format);
        case "mapbox":
            return new MapboxStyleValidator(format);
        default:
            throw new Error("Not implemented yet");
    }
};

const validations = {
    metadata,
    sldStyle,
    getValidator,
};

export default validations;
