import metadata from "./metadata";
import sldStyle from "./sldStyle";
import SldStyleValidator from "./SldStyleValidator";
import QGisStyleValidator from "./QGisStyleValidator";
import MapboxStyleValidator from "./MapboxStyleValidator";
import { Service, StyleFormat } from "../types/app";

const getValidator = (service: Service, format: StyleFormat | undefined) => {
    if (service === undefined) {
        throw new Error("service is not defined");
    }
    if (format === undefined) {
        throw new Error("Format is not defined");
    }
    switch (format) {
        case "sld":
            return new SldStyleValidator(service, format);
        case "qml":
            return new QGisStyleValidator(service, format);
        case "mapbox":
            return new MapboxStyleValidator(service, format);
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
