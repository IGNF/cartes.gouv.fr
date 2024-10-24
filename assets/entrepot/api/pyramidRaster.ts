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

const publishWmsRasterWmts = (datastoreId: string, pyramidId: string, type: string, formData: FormData | object) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_pyramid_raster_wms_raster_wmts_add", { datastoreId, pyramidId, type });
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

const editWmsRasterWmts = (datastoreId: string, pyramidId: string, offeringId: string, type: string, formData: FormData | object) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_pyramid_raster_wms_raster_wmts_edit", { datastoreId, pyramidId, offeringId, type });
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
    publishWmsRasterWmts,
    editWmsRasterWmts: editWmsRasterWmts,
};
