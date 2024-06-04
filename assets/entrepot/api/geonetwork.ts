import { GeonetworkMetadataResponse } from "../../@types/app";
import SymfonyRouting from "../../modules/Routing";
import { jsonFetch } from "../../modules/jsonFetch";

const getMetadataInfos = (fileIdentifier: string, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_geonetwork_metadata_get_infos", { fileIdentifier });
    return jsonFetch<GeonetworkMetadataResponse>(url, {
        ...otherOptions,
    });
};

const geonetwork = {
    getMetadataInfos,
};

export default geonetwork;
