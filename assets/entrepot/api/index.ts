import contact from "./contact";
import catalogs from "./catalogs";
import datasheet from "./datasheet";
import datasheetDocument from "./datasheetDocument";
import datastore from "./datastore";
import storedData from "./stored-data";
import upload from "./upload";
import community from "./community";
import user from "./user";
import wfs from "./wfs";
import wmsVector from "./wms-vector";
import pyramidVector from "./pyramidVector";
import service from "./service";
import epsg from "./epsg";
import annexe from "./annexe";
import style from "./style";
import metadata from "./metadata";
import statics from "./statics";
import geonetwork from "./geonetwork";

const api = {
    contact,
    // Entrepot
    catalogs,
    datasheet,
    datasheetDocument,
    datastore,
    storedData,
    upload,
    community,
    user,
    wfs,
    wmsVector,
    pyramidVector,
    service,
    annexe,
    style,
    metadata,
    statics,
    // epsg.io
    epsg,
    geonetwork,
};
export default api;
