import data from "./data";
import datastore from "./datastore";
import epsg from "./epsg";
import storedData from "./stored-data";
import upload from "./upload";
import user from "./user";

const api = {
    user,
    datastore,
    epsg,
    upload,
    storedData,
    data,
};
export default api;
