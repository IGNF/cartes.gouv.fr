import { Service } from "../../@types/app";
// import BaseLayer from "ol/layer/Base";
import Layer from "ol/layer/Layer";
abstract class BaseService {
    readonly service: Service;

    constructor(service: Service) {
        this.service = service;
    }

    getAttribution(): string | undefined {
        if ("attribution" in this.service.configuration && this.service.configuration.attribution) {
            const attribution = this.service.configuration.attribution;
            return `<a href=${attribution.url}>${attribution.title}</a>`;
        }
        return undefined;
    }

    abstract getLayerNames(): string[];
    abstract getLayers(): Promise<Layer[]>;
}

export default BaseService;
