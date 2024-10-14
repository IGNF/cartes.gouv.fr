import WFSService from "./WFSService";
import WMSVectorService from "./WMSVectorService";
import TMSService from "./TMSService";
import { OfferingDetailResponseDtoTypeEnum } from "../../@types/entrepot";
import { type Service } from "../../@types/app";

const getWebService = (service: Service) => {
    switch (service.type) {
        case OfferingDetailResponseDtoTypeEnum.WFS: {
            return new WFSService(service);
        }
        case OfferingDetailResponseDtoTypeEnum.WMTSTMS: {
            return new TMSService(service);
        }
        case OfferingDetailResponseDtoTypeEnum.WMSVECTOR:
        case OfferingDetailResponseDtoTypeEnum.WMSRASTER: {
            return new WMSVectorService(service);
        }
        default:
            throw Error(`L'affichage du flux du type ${service.type} n'est pas encore implémenté`);
    }
};

export default getWebService;
