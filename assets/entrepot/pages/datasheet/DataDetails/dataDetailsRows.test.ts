import { describe, expect, it } from "vitest";

import { type DataDetailsUpload, type StoredDataDetails } from "@/@types/app";
import { descriptionRows, productionDate, storedDataDetailsData } from "./dataDetailsRows";

const storedData = (fields: Partial<StoredDataDetails["stored_data"]>) =>
    ({ _id: "id-1", name: "donnee", status: "GENERATED", tags: {}, ...fields }) as StoredDataDetails["stored_data"];

const fieldsOf = (rows: ReturnType<typeof descriptionRows>) => rows.map(([field]) => field);

describe("descriptionRows", () => {
    it("base vecteur : nom, poids et identifiant", () => {
        const rows = descriptionRows(storedDataDetailsData(storedData({ type: "VECTOR-DB" as never, size: 11632640 })));

        expect(rows).toEqual([
            ["technical_name", "donnee"],
            ["size", "12 MB"],
            ["id", "id-1"],
        ]);
    });

    it("pyramide vecteur : grille et niveaux triés numériquement", () => {
        const data = storedDataDetailsData(storedData({ type: "ROK4-PYRAMID-VECTOR" as never, type_infos: { tms: "PM", levels: ["10", "6", "9"] } }));

        expect(data.kind).toBe("pyramid_vector");
        expect(descriptionRows(data).slice(3)).toEqual([
            ["tms", "PM"],
            ["levels", "6, 9, 10"],
        ]);
    });

    it("pyramide raster : informations des canaux en plus", () => {
        const data = storedDataDetailsData(
            storedData({
                type: "ROK4-PYRAMID-RASTER" as never,
                type_infos: {
                    tms: "PM",
                    levels: ["1"],
                    channels_format: "UINT8" as never,
                    channels_number: 4,
                    compression: "PNG" as never,
                    nodata_value: "255,255,255,0",
                },
            })
        );

        expect(fieldsOf(descriptionRows(data))).toEqual([
            "technical_name",
            "size",
            "id",
            "tms",
            "levels",
            "channels_format",
            "channels_number",
            "compression",
            "nodata_value",
        ]);
        expect(descriptionRows(data).at(-1)).toEqual(["nodata_value", "255,255,255,0"]);
    });

    it("livraison : projection en plus", () => {
        const upload = { _id: "up-1", name: "livraison", size: 29323264, srs: "EPSG:2154", tags: {} } as unknown as DataDetailsUpload;

        expect(fieldsOf(descriptionRows({ kind: "upload", data: upload }))).toEqual(["technical_name", "size", "id", "srs"]);
    });

    it("poids absent ou nul : valeur absente", () => {
        expect(descriptionRows(storedDataDetailsData(storedData({ type: "VECTOR-DB" as never })))[1]).toEqual(["size", undefined]);
        expect(descriptionRows(storedDataDetailsData(storedData({ type: "VECTOR-DB" as never, size: null as never })))[1]).toEqual(["size", undefined]);
    });
});

describe("productionDate", () => {
    it("date saisie, sinon année de production", () => {
        expect(productionDate({ date: "2026-11-13", production_year: "2026" })).toBe("2026-11-13");
        expect(productionDate({ production_year: "2026" })).toBe("2026");
        expect(productionDate({})).toBeUndefined();
    });
});
