import { OfferingTypeEnum, Service, StyleFormat } from "../../@types/app";
import TMSStyleFilesManager from "./TMSStyleFilesManager/TMSStyleFilesManager";
import WFSStyleFilesManager from "./WFSStyleFilesManager";

const getStyleFilesManager = (service: Service, inputFormat: StyleFormat) => {
    switch (service.type) {
        case OfferingTypeEnum.WFS: {
            return new WFSStyleFilesManager(service, inputFormat);
        }
        case OfferingTypeEnum.WMTSTMS: {
            return new TMSStyleFilesManager(service, inputFormat);
        }
        default:
            throw Error(`Service ${service.type} is not implemented`);
    }
};

export default getStyleFilesManager;
