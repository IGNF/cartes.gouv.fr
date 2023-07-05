import data from "./data";
import datastore from "./datastore";
import epsg from "./epsg";
import storedData from "./stored-data";
import upload from "./upload";
import user from "./user";
import wfs from "./wfs";

const api = {
    user,
    datastore,
    epsg,
    upload,
    storedData,
    data,
    wfs,
};
export default api;
