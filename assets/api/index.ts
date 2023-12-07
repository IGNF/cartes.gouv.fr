import contact from "./contact";
import catalogs from "./catalogs";
import datasheet from "./datasheet";
import datastore from "./datastore";
import storedData from "./stored-data";
import upload from "./upload";
import user from "./user";
import wfs from "./wfs";
import wmsVector from "./wms-vector";
import pyramid from "./pyramid";
import service from "./service";
import epsg from "./epsg";
import annexe from "./annexe";
import style from "./style";

const api = {
    contact,
    catalogs,
    // Entrepot
    datasheet,
    datastore,
    storedData,
    upload,
    user,
    wfs,
    wmsVector,
    pyramid,
    service,
    // epsg.io
    epsg,
    annexe,
    style,
};
export default api;
