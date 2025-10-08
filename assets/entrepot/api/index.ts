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
import pyramidRaster from "./pyramidRaster";
import service from "./service";
import epsg from "./epsg";
import annexe from "./annexe";
import style from "./style";
import metadata from "./metadata";
import processing from "./processing";
import statics from "./statics";
import geonetwork from "./geonetwork";
import alerts from "./alerts";

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
    pyramidRaster,
    service,
    annexe,
    style,
    metadata,
    processing,
    statics,
    alerts,
    // epsg.io
    epsg,
    geonetwork,
};
export default api;
