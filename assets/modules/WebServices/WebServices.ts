import { OfferingTypeEnum, StoredDataTypeEnum, type Service } from "../../@types/app";
import TMSService from "./TMSService";
import WFSService from "./WFSService";
import WMSService from "./WMSService";
import WMTSService from "./WMTSService";

const getWebService = (service: Service) => {
    switch (service.type) {
        case OfferingTypeEnum.WFS: {
            return new WFSService(service);
        }
        case OfferingTypeEnum.WMTSTMS: {
            switch (service.configuration.pyramid?.type) {
                case StoredDataTypeEnum.ROK4PYRAMIDRASTER:
                    return new WMTSService(service);
                case StoredDataTypeEnum.ROK4PYRAMIDVECTOR:
                    return new TMSService(service);
                default:
                    throw Error(`L'affichage du flux du type ${service.type} n'est pas encore implémenté`);
            }
        }
        case OfferingTypeEnum.WMSVECTOR:
        case OfferingTypeEnum.WMSRASTER: {
            return new WMSService(service);
        }
        default:
            throw Error(`L'affichage du flux du type ${service.type} n'est pas encore implémenté`);
    }
};

export default getWebService;
