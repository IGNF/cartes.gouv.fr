import { describe, expect, it, vi } from "vitest";

import { type DataDetailsUpload, type StoredDataDetails } from "@/@types/app";
import { storedDataRefetchInterval, uploadRefetchInterval } from "./dataDetailsQueryOptions";

// le client API touche au DOM au chargement : seules les règles de relecture sont testées
vi.mock("@/entrepot/api", () => ({ default: {} }));

const storedData = (status: string) => ({ stored_data: { status } }) as unknown as StoredDataDetails;
const upload = (status: string) => ({ status }) as unknown as DataDetailsUpload;

describe("storedDataRefetchInterval", () => {
    it("relit tant que la donnée n’a pas un statut final", () => {
        expect(storedDataRefetchInterval(storedData("GENERATING"))).toBe(30000);
        expect(storedDataRefetchInterval(storedData("GENERATED"))).toBe(false);
        expect(storedDataRefetchInterval(storedData("UNSTABLE"))).toBe(false);
    });

    it("ne relit pas après une erreur au premier chargement", () => {
        expect(storedDataRefetchInterval(undefined)).toBe(false);
    });
});

describe("uploadRefetchInterval", () => {
    it("relit seulement une livraison en cours de traitement", () => {
        expect(uploadRefetchInterval(upload("CHECKING"))).toBe(30000);
        expect(uploadRefetchInterval(upload("OPEN"))).toBe(false);
        expect(uploadRefetchInterval(upload("CLOSED"))).toBe(false);
        expect(uploadRefetchInterval(undefined)).toBe(false);
    });
});
