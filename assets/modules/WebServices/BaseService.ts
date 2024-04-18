import { Service } from "../../@types/app";
import { LayerTypes } from "../../@types/ol";
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
    abstract getLayers(): Promise<LayerTypes[]>;
}

export default BaseService;
