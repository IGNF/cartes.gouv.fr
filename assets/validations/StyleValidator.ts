import { TestContext, ValidationError } from "yup";
import functions from "../functions";

type FileFormat = "sld" | "qml" | "mapbox";

class StyleValidator {
    _format: string;

    constructor(format: FileFormat) {
        this._format = format === "mapbox" ? "json" : format;
    }

    async validate(layerName: string | undefined, files: FileList, ctx: TestContext): Promise<ValidationError | boolean> {
        const file = files[0];
        if (file !== undefined && functions.path.getFileExtension(file?.name)?.toLowerCase() !== this._format) {
            return ctx.createError({ message: "unaccepted_extension" });
        }

        return true;
    }
}
export { FileFormat, StyleValidator };
