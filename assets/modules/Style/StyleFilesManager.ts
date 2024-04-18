import { Service, StyleFormat } from "../../@types/app";
import { OfferingDetailResponseDtoTypeEnum } from "../../@types/entrepot";
import WFSStyleFilesManager from "./WFSStyleFilesManager";
import TMSStyleFilesManager from "./TMSStyleFilesManager";

const getStyleFilesManager = (service: Service, inputFormat: StyleFormat) => {
    switch (service.type) {
        case OfferingDetailResponseDtoTypeEnum.WFS: {
            return new WFSStyleFilesManager(service, inputFormat);
        }
        case OfferingDetailResponseDtoTypeEnum.WMTSTMS: {
            return new TMSStyleFilesManager(service, inputFormat);
        }
        default:
            throw Error(`Service ${service.type} is not implemented`);
    }
};

export default getStyleFilesManager;
