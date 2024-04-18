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
        case OfferingDetailResponseDtoTypeEnum.WMSVECTOR: {
            return new WMSVectorService(service);
        }
        default:
            throw Error(`Service ${service.type} is not implemented`);
    }
};

export default getWebService;
