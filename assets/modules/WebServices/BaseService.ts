import Layer from "ol/layer/Layer";

import { getTranslation } from "@/i18n";
import { Service } from "../../@types/app";

const { t: tCommon } = getTranslation("Common");

abstract class BaseService {
    readonly service: Service;

    constructor(service: Service) {
        this.service = service;
    }

    getAttribution(): string | undefined {
        if ("attribution" in this.service.configuration && this.service.configuration.attribution) {
            const attribution = this.service.configuration.attribution;
            const logo = attribution.logo ? `<img src="${attribution.logo}" /> ` : "";

            return `<a href="${attribution.url}" title="${attribution.title} - ${tCommon("new_window")}" target="_blank">${logo}${attribution.title}</a>`;
        }
        return undefined;
    }

    abstract getLayerNames(): string[];
    abstract getLayers(): Promise<Layer[]>;
}

export default BaseService;
