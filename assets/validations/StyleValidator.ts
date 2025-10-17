import { TestContext, ValidationError } from "yup";

import { Service, StyleFormat } from "../@types/app";

class StyleValidator {
    readonly service: Service;
    readonly format: StyleFormat;

    constructor(service: Service, format: StyleFormat) {
        this.service = service;
        this.format = format;
    }

    async validate(_value: string | undefined, _ctx: TestContext): Promise<ValidationError | boolean> {
        return true;
    }
}
export default StyleValidator;
