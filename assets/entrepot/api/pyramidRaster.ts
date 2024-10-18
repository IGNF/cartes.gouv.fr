import type { PyramidRaster, Service } from "../../@types/app";
import SymfonyRouting from "../../modules/Routing";
import { jsonFetch } from "../../modules/jsonFetch";

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

const publishWmsRaster = (datastoreId: string, pyramidId: string, formData: FormData | object) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_pyramid_raster_wms_raster_add", { datastoreId, pyramidId });
    return jsonFetch<Service>(
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

const editWmsRaster = (datastoreId: string, pyramidId: string, offeringId: string, formData: FormData | object) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_pyramid_raster_wms_raster_edit", { datastoreId, pyramidId, offeringId });
    return jsonFetch<Service>(
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
    publishWmsRaster,
    editWmsRaster,
};
