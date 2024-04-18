import { jsonFetch } from "../../modules/jsonFetch";

const getProjFromEpsg = (srid: string) => {
    const match = srid.match(/EPSG:(\d+)/);
    if (!match) throw new Error(`Projection ${srid} inconnue`);

    return jsonFetch<{ [key: string]: string }>(`https://epsg.io/${match[1]}.json`, undefined, undefined, false, false);
};

const epsg = {
    getProjFromEpsg,
};

export default epsg;
