import { TestContext, ValidationError } from "yup";

import { Service, StyleFormat } from "../@types/app";

class StyleValidator {
    readonly service: Service;
    readonly format: StyleFormat;

    constructor(service: Service, format: StyleFormat) {
        this.service = service;
        this.format = format;
    }
    async validate(value: string | undefined, ctx: TestContext): Promise<ValidationError | boolean> {
        if (typeof value !== "string" || !value) {
            return ctx.createError({ message: "no_file_provided" });
        }

        return true;
    }
}
export default StyleValidator;
