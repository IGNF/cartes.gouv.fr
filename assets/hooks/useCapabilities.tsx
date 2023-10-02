import { useQuery } from "@tanstack/react-query";
import WMTSCapabilities from "ol/format/WMTSCapabilities";
import { type Options } from "ol/source/WMTS";

const useCapabilities = (key = "cartes") => {
    return useQuery<Options>({
        queryKey: ["gpp_get_cap", key],
        queryFn: async () => {
            const response = await fetch(`https://wxs.ign.fr/${key}/geoportail/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetCapabilities`);
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
        cacheTime: Infinity,
    });
};

export default useCapabilities;
