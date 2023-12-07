import { TestContext, ValidationError } from "yup";
import functions from "../functions";

type FileFormat = "sld" | "qml" | "mapbox";

class StyleValidator {
    _format: FileFormat;

    constructor(format: FileFormat) {
        this._format = format;
    }

    async validate(layerName: string, files: FileList, ctx: TestContext): Promise<ValidationError | boolean> {
        const fmt = this._format === "mapbox" ? "json" : this._format;

        if (files instanceof FileList && files.length === 0) {
            return ctx.createError({ message: "no_file_provided" });
        }

        // const file = files?.[0] ?? undefined;
        const file = files[0];
        if (!(file instanceof File)) {
            return ctx.createError({ message: "file_missing_corrupted_or_reading_error" });
        }

        if (functions.path.getFileExtension(file.name)?.toLowerCase() !== fmt) {
            return ctx.createError({ message: "unaccepted_extension" });
        }

        return true;
    }
}
export { FileFormat, StyleValidator };
