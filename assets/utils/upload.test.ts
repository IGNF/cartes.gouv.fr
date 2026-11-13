import { describe, expect, it } from "vitest";

import { type UploadIntegration } from "@/@types/app";
import { mapIgnfToEpsg, shouldAdvanceIntegration } from "./upload";

describe("mapIgnfToEpsg", () => {
    it("convertit un code IGNF connu", () => expect(mapIgnfToEpsg("IGNF:LAMB93")).toBe("EPSG:2154"));
    it("garde un code inconnu", () => expect(mapIgnfToEpsg("EPSG:4326")).toBe("EPSG:4326"));
    it("rejette une valeur vide ou non textuelle", () => {
        expect(mapIgnfToEpsg("")).toBeUndefined();
        expect(mapIgnfToEpsg("  ")).toBeUndefined();
        expect(mapIgnfToEpsg(42)).toBeUndefined();
    });
});

describe("shouldAdvanceIntegration", () => {
    const waiting: UploadIntegration = { steps: {}, status: "waiting", next_action: "send_files", vectordb_id: null, datasheet_name: "Fiche" };
    const idle: UploadIntegration = { ...waiting, status: "in_progress", next_action: null };

    it("envoie quand une action attend", () => expect(shouldAdvanceIntegration(waiting, undefined, false, false)).toBe(true));
    it("n’envoie rien sans action en attente ni sans état", () => {
        expect(shouldAdvanceIntegration(idle, undefined, false, false)).toBe(false);
        expect(shouldAdvanceIntegration(undefined, undefined, false, false)).toBe(false);
    });
    it("n’envoie pas pendant une action ni après une erreur", () => {
        expect(shouldAdvanceIntegration(waiting, undefined, true, false)).toBe(false);
        expect(shouldAdvanceIntegration(waiting, undefined, false, true)).toBe(false);
    });
    it("n’envoie pas pour une intégration en échec, même avec une action en attente", () =>
        expect(shouldAdvanceIntegration({ ...waiting, status: "failed", next_action: "delete_upload" }, undefined, false, false)).toBe(false));
    it("attend la lecture suivante quand l’état vient du dernier envoi", () => {
        expect(shouldAdvanceIntegration(waiting, waiting, false, false)).toBe(false);
        expect(shouldAdvanceIntegration({ ...waiting }, waiting, false, false)).toBe(true);
    });
});
