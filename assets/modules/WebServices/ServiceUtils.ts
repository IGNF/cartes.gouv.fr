import { OfferingDetailResponseDto, OfferingDetailResponseDtoTypeEnum } from "../../types/entrepot";

type VectorLayerType = {
    id: string;
};
class ServiceUtils {
    static getRequestInfo(url: string): Record<string, string> {
        const _url = new URL(url);
        const params = Object.fromEntries(_url.searchParams);
        return { ...params, base_url: `${_url.origin}${_url.pathname}` };
    }

    static async getLayerNames(offering: OfferingDetailResponseDto | undefined): Promise<string[]> {
        if (offering === undefined) return [];

        switch (offering.type) {
            case OfferingDetailResponseDtoTypeEnum.WFS:
                return ServiceUtils.#_getWFSLayerNames(offering);
            case OfferingDetailResponseDtoTypeEnum.WMTSTMS:
                return ServiceUtils.#_getTMSLayerNames(offering);
            default:
                return [];
        }
    }

    static async #_getWFSLayerNames(offering: OfferingDetailResponseDto): Promise<string[]> {
        const layers: string[] = [];
        offering.urls.forEach((endpointUrl) => {
            const info = ServiceUtils.getRequestInfo(endpointUrl.url);
            layers.push(info.typeNames);
        });
        return layers;
    }

    static async #_getTMSLayerNames(offering: OfferingDetailResponseDto): Promise<string[]> {
        // On ne conserve que l'URL du TMS
        const tmsUrl = offering.urls.filter((endpointUrl) => {
            return endpointUrl.type === "TMS";
        });

        const url = tmsUrl?.[0].url;
        const response = await fetch(`${url}/metadata.json`);

        if (!response.ok) throw Error(`Impossible d'accéder à l'URL ${url}/metadata.json.`);
        const metadatas = await response.json();

        const layers: string[] = [];
        const vectorLayers = metadatas["vector_layers"] as VectorLayerType[];
        vectorLayers.forEach((layer) => {
            layers.push(layer.id);
        });

        return layers;
    }
}

export default ServiceUtils;
