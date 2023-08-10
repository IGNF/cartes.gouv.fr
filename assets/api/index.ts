import datasheet from "./datasheet";
import datastore from "./datastore";
import storedData from "./stored-data";
import upload from "./upload";
import user from "./user";
import wfs from "./wfs";
import service from "./service";

import epsg from "./epsg";

const api = {
    // Entrepot
    datasheet,
    datastore,
    storedData,
    upload,
    user,
    wfs,
    service,

    // epsg.io
    epsg,
};
export default api;
