import { Service, StyleForm, StyleFormat } from "../../types/app";
import BaseStyleFilesManager from "./BaseStyleFilesManager";

export default class WFSStyleFilesManager implements BaseStyleFilesManager {
    readonly service: Service;
    readonly inputFormat: StyleFormat; /* Ne sert a rien ici */

    constructor(service: Service, inputFormat: StyleFormat) {
        this.service = service;
        this.inputFormat = inputFormat;
    }

    async prepare(values: StyleForm, layersMapping: Record<string, string>): Promise<FormData> {
        const formData = new FormData();

        formData.append("style_name", values.style_name);
        for (const [uuid, files] of Object.entries(values.style_files)) {
            if (0 !== files.length) {
                formData.append(`style_files[${layersMapping[uuid]}]`, files[0]);
            }
        }
        return formData;
    }
}
