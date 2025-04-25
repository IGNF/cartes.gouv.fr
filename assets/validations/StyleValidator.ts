import { TestContext, ValidationError } from "yup";

import { Service, StyleFormat } from "../@types/app";

class StyleValidator {
    readonly service: Service;
    readonly format: StyleFormat;

    constructor(service: Service, format: StyleFormat) {
        this.service = service;
        this.format = format;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async validate(value: string | undefined, ctx: TestContext): Promise<ValidationError | boolean> {
        // const extension = this.format === "mapbox" ? "json" : this.format;

        // const file = files[0];
        // if (file !== undefined && getFileExtension(file?.name)?.toLowerCase() !== extension) {
        //     return ctx.createError({ message: "unaccepted_extension" });
        // }

        if (typeof value !== "string" || !value) {
            return ctx.createError({ message: "no_file_provided" });
        }

        return true;
    }
}
export default StyleValidator;
