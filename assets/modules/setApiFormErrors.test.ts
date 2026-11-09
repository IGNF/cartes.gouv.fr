import { describe, expect, it, vi } from "vitest";

import { setApiFormErrors } from "./setApiFormErrors";

// apiError importe l’i18n, qui exige un navigateur
vi.mock("../i18n/i18n", () => ({ getTranslation: () => ({ t: (key: string) => key }) }));

const apiError = (violations: { propertyPath: string; title: string }[]) => ({ status: 422, title: "Unprocessable Content", violations });

describe("setApiFormErrors", () => {
    it("convertit les chemins Symfony et garde le premier message par champ", () => {
        const setError = vi.fn();

        const applied = setApiFormErrors(
            apiError([
                { propertyPath: "producers[0].email", title: "E-mail invalide." },
                { propertyPath: "producers[0].email", title: "Second message." },
                { propertyPath: "title", title: "Obligatoire." },
                { propertyPath: "a[0].b[1].c", title: "Imbriqué." },
            ]),
            setError
        );

        expect(applied).toBe(true);
        expect(setError.mock.calls).toEqual([
            ["producers.0.email", { type: "server", message: "E-mail invalide." }],
            ["title", { type: "server", message: "Obligatoire." }],
            ["a.0.b.1.c", { type: "server", message: "Imbriqué." }],
        ]);
    });

    it("ignore une erreur sans violation rattachée à un champ", () => {
        const setError = vi.fn();

        expect(setApiFormErrors(apiError([{ propertyPath: "", title: "Erreur globale." }]), setError)).toBe(false);
        expect(setApiFormErrors({ status: 500, title: "Internal Server Error" }, setError)).toBe(false);
        expect(setApiFormErrors(new Error("réseau"), setError)).toBe(false);
        expect(setError).not.toHaveBeenCalled();
    });
});
