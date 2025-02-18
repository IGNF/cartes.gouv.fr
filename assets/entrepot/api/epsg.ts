import { jsonFetch } from "../../modules/jsonFetch";

const getProjFromEpsg = (srid: string) => {
    const match = srid.match(/EPSG:(\d+)/);
    if (!match)
        return Promise.reject({
            message: `${srid} n'est pas une projection EPSG valide`,
        });

    return jsonFetch<{ [key: string]: string }>(`https://spatialreference.org/ref/epsg/${match[1]}/projjson.json`, undefined, undefined, false, false);
};

const epsg = {
    getProjFromEpsg,
};

export default epsg;
