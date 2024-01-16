import { TestContext, ValidationError } from "yup";
import functions from "../functions";
import { Service, StyleFormat } from "../types/app";

class StyleValidator {
    readonly service: Service;
    readonly format: StyleFormat;

    constructor(service: Service, format: StyleFormat) {
        this.service = service;
        this.format = format;
    }

    async validate(files: FileList, ctx: TestContext): Promise<ValidationError | boolean> {
        const extension = this.format === "mapbox" ? "json" : this.format;

        const file = files[0];
        if (file !== undefined && functions.path.getFileExtension(file?.name)?.toLowerCase() !== extension) {
            return ctx.createError({ message: "unaccepted_extension" });
        }

        return true;
    }
}
export default StyleValidator;
