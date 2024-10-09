import SymfonyRouting from "../../modules/Routing";
import { jsonFetch } from "../../modules/jsonFetch";
import type { PyramidRaster } from "../../@types/app";

const add = (datastoreId: string, formData: FormData | object) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_pyramid_raster_add", { datastoreId });
    return jsonFetch<PyramidRaster>(
        url,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        },
        formData
    );
};

export default {
    add,
};
