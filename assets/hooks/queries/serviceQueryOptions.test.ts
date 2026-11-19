import { afterEach, describe, expect, it, vi } from "vitest";

import { OfferingTypeEnum, type Service, StoredDataTypeEnum } from "@/@types/app";
import api from "@/entrepot/api";
import { keepKnownServiceFields, readTmsMetadata, serviceQueryOptions } from "./serviceQueryOptions";

// le vrai module api lit le DOM au chargement (env.ts)
vi.mock("@/entrepot/api", () => ({ default: { service: { getService: vi.fn() } } }));

const TMS_URL = "https://data.geopf.fr/tms/1.0.0/couche";
const METADATA = { name: "couche", tiles: [`${TMS_URL}/{z}/{x}/{y}.pbf`] };

function tms(open = true): Service {
    return {
        _id: "offering-1",
        type: OfferingTypeEnum.WMTSTMS,
        open,
        urls: [
            { type: "WMTS", url: "https://data.geopf.fr/wmts?layer=couche" },
            { type: "TMS", url: TMS_URL },
        ],
        configuration: { pyramid: { type: StoredDataTypeEnum.ROK4PYRAMIDVECTOR } },
    } as unknown as Service;
}

const signal = () => new AbortController().signal;

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("readTmsMetadata", () => {
    it("lit metadata.json d’un TMS ouvert", async () => {
        const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(METADATA)));
        vi.stubGlobal("fetch", fetchMock);

        expect(await readTmsMetadata(tms(), signal())).toEqual(METADATA);
        expect(fetchMock).toHaveBeenCalledWith(`${TMS_URL}/metadata.json`, expect.anything());
    });

    it("ne lit rien pour un WMTS raster", async () => {
        const fetchMock = vi.fn();
        vi.stubGlobal("fetch", fetchMock);
        const wmts = { ...tms(), configuration: { pyramid: { type: StoredDataTypeEnum.ROK4PYRAMIDRASTER } } } as unknown as Service;

        expect(await readTmsMetadata(wmts, signal())).toBeUndefined();
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("abandonne la lecture après 5 s", async () => {
        const expired = AbortSignal.abort(new DOMException("délai dépassé", "TimeoutError"));
        const timeout = vi.spyOn(AbortSignal, "timeout").mockReturnValue(expired);
        vi.stubGlobal("fetch", (_url: string, init: RequestInit) => (init.signal?.aborted ? Promise.reject(init.signal.reason) : new Promise(() => {})));

        expect(await readTmsMetadata(tms(), signal())).toBeUndefined();
        expect(timeout).toHaveBeenCalledWith(5000);
        timeout.mockRestore();
    });

    it("ne lit rien pour un TMS privé", async () => {
        const fetchMock = vi.fn();
        vi.stubGlobal("fetch", fetchMock);

        expect(await readTmsMetadata(tms(false), signal())).toBeUndefined();
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("ignore un échec de lecture", async () => {
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
        expect(await readTmsMetadata(tms(), signal())).toBeUndefined();

        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 404 })));
        expect(await readTmsMetadata(tms(), signal())).toBeUndefined();
    });
});

describe("keepKnownServiceFields", () => {
    it("garde l’accès et les métadonnées TMS déjà lus quand la relecture ne les a pas", () => {
        const known = { ...tms(), access: "restricted_visible", tms_metadata: METADATA } as Service;
        const refetched = { ...tms(), access: null, title: "nouveau" } as unknown as Service;

        expect(keepKnownServiceFields(known, refetched)).toMatchObject({ access: "restricted_visible", tms_metadata: METADATA, title: "nouveau" });
    });

    it("prend l’accès relu quand il est connu", () => {
        const known = { ...tms(), access: "restricted_visible" } as Service;
        expect(keepKnownServiceFields(known, { ...tms(), access: "restricted" } as Service).access).toBe("restricted");
    });
});

describe("serviceQueryOptions", () => {
    it("attache les métadonnées TMS au flux", async () => {
        vi.mocked(api.service.getService).mockResolvedValue(tms());
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(METADATA))));

        const queryFn = serviceQueryOptions("datastore-1", "offering-1").queryFn as (context: { signal: AbortSignal }) => Promise<Service>;

        expect((await queryFn({ signal: signal() })).tms_metadata).toEqual(METADATA);
    });
});
