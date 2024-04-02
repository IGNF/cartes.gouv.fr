import contact from "./contact";
import catalogs from "./catalogs";
import datasheet from "./datasheet";
import datastore from "./datastore";
import storedData from "./stored-data";
import upload from "./upload";
import community from "./community";
import user from "./user";
import wfs from "./wfs";
import wmsVector from "./wms-vector";
import pyramid from "./pyramid";
import service from "./service";
import epsg from "./epsg";
import annexe from "./annexe";
import style from "./style";
import metadata from "./metadata";

const api = {
    contact,
    // Entrepot
    catalogs,
    datasheet,
    datastore,
    storedData,
    upload,
    community,
    user,
    wfs,
    wmsVector,
    pyramid,
    service,
    annexe,
    style,
    metadata,
    // epsg.io
    epsg,
};
export default api;
