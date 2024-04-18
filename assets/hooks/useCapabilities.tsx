import { useQuery } from "@tanstack/react-query";
import WMTSCapabilities from "ol/format/WMTSCapabilities";
import { Capabilities } from "../@types/ol";

const useCapabilities = (key: string = "cartes") => {
    return useQuery<Capabilities>({
        queryKey: ["gpp_get_cap", key],
        queryFn: async () => {
            const response = await fetch("https://data.geopf.fr/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetCapabilities");
            if (!response.ok) {
                throw new Error(`Bad response from server : ${response.status}`);
            }
            const text = await response.text();

            const format = new WMTSCapabilities();
            const capabilities = format.read(text);
            if (!capabilities) {
                throw new Error("Reading capabilities failed");
            }

            return capabilities;
        },
        staleTime: Infinity,
    });
};

export default useCapabilities;
