import data from "./data";
import datastore from "./datastore";
import storedData from "./stored-data";
import upload from "./upload";
import user from "./user";
import wfs from "./wfs";

import epsg from "./epsg";

const api = {
    // Entrepot
    data,
    datastore,
    storedData,
    upload,
    user,
    wfs,

    // epsg.io
    epsg,
};
export default api;
