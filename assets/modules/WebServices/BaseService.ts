import { Service } from "../../types/app";
import { LayerTypes } from "../../types/ol";

interface BaseService {
    readonly service: Service;
    getLayerNames: () => string[];
    getLayers: () => Promise<LayerTypes[]>;
}

export default BaseService;
