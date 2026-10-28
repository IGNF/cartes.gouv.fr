import { describe, expect, it } from "vitest";

import { type DatastorePermission, OfferingStatusEnum, OfferingTypeEnum, type Service, StoredDataTypeEnum } from "@/@types/app";
import {
    EXPLORE_MAPS_CONFIGURATION_DELAY_MS,
    getExploreMapsAvailability,
    getExploreMapsLayerParam,
    getLayerBaseName,
    hasWmtsSibling,
    isPrivateServiceVisibleOnCartesGouv,
} from "./offering";

const CREATION = "2026-10-01T10:00:00+00:00";
const CREATION_MS = Date.parse(CREATION);

type ServiceFixture = Partial<Service> & {
    pyramidType?: StoredDataTypeEnum;
    /** donnée stockée diffusée (base vecteur ou pyramide) */
    storedDataId?: string;
    /** base vecteur moissonnée pour une pyramide raster */
    vectorDbId?: string;
};

function service(overrides: ServiceFixture = {}): Service {
    const { pyramidType, storedDataId, vectorDbId, ...rest } = overrides;
    return {
        _id: "offering-1",
        layer_name: "ma_couche",
        type: OfferingTypeEnum.WMSVECTOR,
        status: OfferingStatusEnum.PUBLISHED,
        open: true,
        creation: CREATION,
        configuration: {
            type_infos: { used_data: [{ stored_data: storedDataId ?? "stored-data-1" }] },
            pyramid: pyramidType ? { type: pyramidType, tags: { vectordb_id: vectorDbId } } : undefined,
        },
        ...rest,
    } as unknown as Service;
}

function permission(beneficiaryId: string, offeringIds: string[], endDate?: string): DatastorePermission {
    return { beneficiary: { _id: beneficiaryId }, offerings: offeringIds.map((_id) => ({ _id })), end_date: endDate } as unknown as DatastorePermission;
}

const NOW = Date.parse("2026-10-28T12:00:00+00:00");

describe("getLayerBaseName", () => {
    it("retire le suffixe _wms ou _wmts", () => {
        expect(getLayerBaseName("couche_wms")).toBe("couche");
        expect(getLayerBaseName("couche_WMTS")).toBe("couche");
        expect(getLayerBaseName("couche")).toBe("couche");
        expect(getLayerBaseName("couche_wms_v2")).toBe("couche_wms_v2");
    });
});

describe("hasWmtsSibling", () => {
    const wms = service({ _id: "wms", layer_name: "couche_wms", storedDataId: "vectordb-1" });
    const wmtsFixture: ServiceFixture = {
        _id: "wmts",
        layer_name: "couche_wmts",
        type: OfferingTypeEnum.WMTSTMS,
        pyramidType: StoredDataTypeEnum.ROK4PYRAMIDRASTER,
        storedDataId: "pyramid-1",
    };
    const wmts = service(wmtsFixture);
    const tms = service({
        _id: "tms",
        layer_name: "couche",
        type: OfferingTypeEnum.WMTSTMS,
        pyramidType: StoredDataTypeEnum.ROK4PYRAMIDVECTOR,
        storedDataId: "pyramid-v",
    });

    it("apparie un WMS et un WMTS de même nom au suffixe près", () => {
        expect(hasWmtsSibling(wms, [wms, wmts])).toBe(true);
    });

    it("apparie un WMS raster et un WMTS diffusant la même pyramide, quel que soit le nom", () => {
        const wmsRaster = service({ _id: "wmsr", layer_name: "ortho", type: OfferingTypeEnum.WMSRASTER, storedDataId: "pyramid-1" });
        const wmtsRenamed = service({ ...wmtsFixture, layer_name: "tuiles_ortho" });
        expect(hasWmtsSibling(wmsRaster, [wmsRaster, wmtsRenamed])).toBe(true);
    });

    it("apparie un WMS vecteur et un WMTS dont la pyramide a été moissonnée depuis sa base vecteur", () => {
        const wmtsHarvested = service({ ...wmtsFixture, layer_name: "autre_nom", vectorDbId: "vectordb-1" });
        const wmtsOther = service({ ...wmtsFixture, layer_name: "autre_nom", vectorDbId: "vectordb-2" });
        expect(hasWmtsSibling(wms, [wms, wmtsHarvested])).toBe(true);
        expect(hasWmtsSibling(wms, [wms, wmtsOther])).toBe(false);
    });

    it("ignore un TMS, un WMTS dépublié et le flux lui-même", () => {
        expect(hasWmtsSibling(wms, [wms, tms])).toBe(false);
        expect(hasWmtsSibling(wms, [wms, service({ ...wmtsFixture, status: OfferingStatusEnum.UNPUBLISHED })])).toBe(false);
        expect(hasWmtsSibling(wmts, [wmts])).toBe(false);
    });
});

describe("isPrivateServiceVisibleOnCartesGouv", () => {
    const privateService = service({ open: false });

    it("exige un flux privé et une permission pour la communauté cartes.gouv.fr sur ce flux", () => {
        expect(isPrivateServiceVisibleOnCartesGouv(privateService, [permission("cartes", ["offering-1"])], "cartes", NOW)).toBe(true);
        expect(isPrivateServiceVisibleOnCartesGouv(privateService, [permission("autre", ["offering-1"])], "cartes", NOW)).toBe(false);
        expect(isPrivateServiceVisibleOnCartesGouv(privateService, [permission("cartes", ["offering-2"])], "cartes", NOW)).toBe(false);
        expect(isPrivateServiceVisibleOnCartesGouv(service({ open: true }), [permission("cartes", ["offering-1"])], "cartes", NOW)).toBe(false);
        expect(isPrivateServiceVisibleOnCartesGouv(privateService, undefined, "cartes", NOW)).toBe(false);
        expect(isPrivateServiceVisibleOnCartesGouv(privateService, [permission("cartes", ["offering-1"])], null, NOW)).toBe(false);
    });

    it("ignore une permission expirée, accepte une permission sans date de fin ou en cours", () => {
        expect(isPrivateServiceVisibleOnCartesGouv(privateService, [permission("cartes", ["offering-1"], "2026-10-28T11:59:00+00:00")], "cartes", NOW)).toBe(
            false
        );
        expect(isPrivateServiceVisibleOnCartesGouv(privateService, [permission("cartes", ["offering-1"], "2026-10-28T12:01:00+00:00")], "cartes", NOW)).toBe(
            true
        );
    });
});

describe("getExploreMapsLayerParam", () => {
    it("construit le paramètre de couche selon le protocole", () => {
        expect(getExploreMapsLayerParam(service())).toBe("ma_couche$GEOPORTAIL:OGC:WMS(1;1;0)");
        expect(getExploreMapsLayerParam(service({ type: OfferingTypeEnum.WMSRASTER }))).toBe("ma_couche$GEOPORTAIL:OGC:WMS(1;1;0)");
        expect(getExploreMapsLayerParam(service({ type: OfferingTypeEnum.WMTSTMS, pyramidType: StoredDataTypeEnum.ROK4PYRAMIDRASTER }))).toBe(
            "ma_couche$GEOPORTAIL:OGC:WMTS(1;1;0)"
        );
        expect(getExploreMapsLayerParam(service({ type: OfferingTypeEnum.WMTSTMS, pyramidType: StoredDataTypeEnum.ROK4PYRAMIDVECTOR }))).toBe(
            "ma_couche$GEOPORTAIL:OGC:TMS(1;1;0)"
        );
        expect(getExploreMapsLayerParam(service({ type: OfferingTypeEnum.WFS }))).toBeUndefined();
    });
});

describe("getExploreMapsAvailability", () => {
    const later = CREATION_MS + EXPLORE_MAPS_CONFIGURATION_DELAY_MS + 1;
    const sooner = CREATION_MS + EXPLORE_MAPS_CONFIGURATION_DELAY_MS - 1;

    it("est en attente pendant le délai de configuration puis disponible", () => {
        const wms = service();
        expect(getExploreMapsAvailability({ service: wms, services: [wms], visibleOnCartesGouv: false, now: sooner })).toBe("pending");
        expect(getExploreMapsAvailability({ service: wms, services: [wms], visibleOnCartesGouv: false, now: later })).toBe("available");
    });

    it("est indisponible pour un WFS, un flux dépublié, un WMS doublé d’un WMTS et un flux totalement privé", () => {
        expect(getExploreMapsAvailability({ service: service({ type: OfferingTypeEnum.WFS }), services: [], visibleOnCartesGouv: false, now: later })).toBe(
            "unavailable"
        );
        expect(
            getExploreMapsAvailability({ service: service({ status: OfferingStatusEnum.UNPUBLISHED }), services: [], visibleOnCartesGouv: false, now: later })
        ).toBe("unavailable");
        const wms = service({ _id: "wms", layer_name: "couche_wms" });
        const wmts = service({ _id: "wmts", layer_name: "couche_wmts", type: OfferingTypeEnum.WMTSTMS, pyramidType: StoredDataTypeEnum.ROK4PYRAMIDRASTER });
        expect(getExploreMapsAvailability({ service: wms, services: [wms, wmts], visibleOnCartesGouv: false, now: later })).toBe("unavailable");
        expect(getExploreMapsAvailability({ service: wmts, services: [wms, wmts], visibleOnCartesGouv: false, now: later })).toBe("available");
        expect(getExploreMapsAvailability({ service: service({ open: false }), services: [], visibleOnCartesGouv: false, now: later })).toBe("unavailable");
    });

    it("est disponible pour un flux privé visible sur cartes.gouv.fr", () => {
        expect(getExploreMapsAvailability({ service: service({ open: false }), services: [], visibleOnCartesGouv: true, now: later })).toBe("available");
    });
});
