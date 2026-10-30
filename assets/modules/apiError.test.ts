import { describe, expect, it, vi } from "vitest";

import { getApiErrorDescription, getApiErrorMessage, getApiErrorTitle } from "./apiError";

vi.mock("../i18n/i18n", () => ({
    getTranslation: () => ({ t: (key: string) => `t:${key}` }),
}));

describe("apiError", () => {
    it("traduit le titre selon le statut", () => {
        expect(getApiErrorTitle({ status: 404, title: "Not Found" })).toBe("t:not_found");
        expect(getApiErrorTitle({ status: 503, title: "Service Unavailable" })).toBe("t:unavailable");
        expect(getApiErrorTitle({ status: 507, title: "Insufficient Storage" })).toBe("t:server_error");
        expect(getApiErrorTitle({ status: 418, title: "I'm a teapot" })).toBe("t:default");
        expect(getApiErrorTitle(undefined)).toBe("t:default");
    });

    it("masque le texte de l'erreur quand il répète le libellé du statut", () => {
        expect(getApiErrorDescription({ status: 500, title: "Internal Server Error", detail: "Internal Server Error" })).toBeUndefined();
        expect(getApiErrorDescription({ status: 409, title: "Conflict", detail: "Nom déjà utilisé" })).toBe("Nom déjà utilisé");
    });

    it("se rabat sur le titre traduit quand l'erreur n'a pas de texte utile", () => {
        expect(getApiErrorMessage({ status: 500, title: "Internal Server Error", detail: "Internal Server Error" })).toBe("t:server_error");
        expect(getApiErrorMessage({ status: 409, title: "Conflict", detail: "Nom déjà utilisé" })).toBe("Nom déjà utilisé");
    });
});
