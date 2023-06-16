import { jsonFetch } from "../modules/jsonFetch";

const getProjFromEpsg = (srid) => {
    const match = srid.match(/EPSG:(\d+)/);
    if (!match) return;

    return jsonFetch(`https://epsg.io/${match[1]}.json`, {}, false, false);
};

export default {
    getProjFromEpsg,
};
