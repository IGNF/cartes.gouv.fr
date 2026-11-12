import { describe, expect, it } from "vitest";

import { buildServiceFormSchema, type ServiceAccess, serviceFormDefaultValues, type ServiceFormValues } from "./serviceFormSchema";

// la clé sert de message : les tests vérifient quel message est posé, pas sa traduction
const t = ((key: string) => key) as Parameters<typeof buildServiceFormSchema>[0]["t"];

const schema = (availableAccesses: ServiceAccess[] = ["public", "restricted_visible", "restricted"]) =>
    buildServiceFormSchema({ t, type: "wfs", existingLayerNames: ["SANDBOX.pris"], layerNamePrefix: "SANDBOX", availableAccesses });

const table = (overrides: Partial<ServiceFormValues["tables"][number]> = {}) => ({
    native_name: "communes",
    selected: true,
    title: "Communes",
    public_name: "communes",
    description: "Les communes",
    keywords: [],
    ...overrides,
});

const valid = (): ServiceFormValues => ({
    ...serviceFormDefaultValues,
    stored_data_id: "vectordb-1",
    title: "Mon flux",
    technical_name: "SANDBOX.mon_flux",
    themes: ["Hydrographie"],
    tables: [table()],
});

const issueMessages = (values: ServiceFormValues, availableAccesses?: ServiceAccess[]) => {
    const result = schema(availableAccesses).safeParse(values);
    // premier message par champ, comme le résolveur du formulaire
    const messages: Record<string, string> = {};
    for (const issue of result.error?.issues ?? []) {
        messages[issue.path.join(".")] ??= issue.message;
    }
    return messages;
};

describe("buildServiceFormSchema", () => {
    it("accepte un formulaire complet", () => {
        expect(issueMessages(valid())).toEqual({});
    });

    it("exige au moins une table cochée", () => {
        expect(issueMessages({ ...valid(), tables: [table({ selected: false })] })).toEqual({ tables: "validation.tables.required" });
    });

    it("ne valide pas les champs d’une table décochée", () => {
        const tables = [table(), table({ native_name: "brouillon", selected: false, title: "", public_name: "Pas Valide", description: "" })];
        expect(issueMessages({ ...valid(), tables })).toEqual({});
    });

    it("valide les champs d’une table cochée", () => {
        expect(issueMessages({ ...valid(), tables: [table({ title: " ", public_name: "Majuscules", description: "" })] })).toEqual({
            "tables.0.title": "validation.table.title.required",
            "tables.0.public_name": "validation.table.public_name.chars",
            "tables.0.description": "validation.table.description.required",
        });
    });

    it("exige le texte et une URL valide quand l’attribution est cochée, rien sinon", () => {
        expect(issueMessages({ ...valid(), attribution: { enabled: false, title: "", url: "pas une url" } })).toEqual({});
        expect(issueMessages({ ...valid(), attribution: { enabled: true, title: "", url: "pas une url" } })).toEqual({
            "attribution.title": "validation.attribution.text.required",
            "attribution.url": "validation.attribution.url.invalid",
        });
    });

    it("refuse un nom technique déjà pris ou sans le préfixe de l’entrepôt", () => {
        expect(issueMessages({ ...valid(), technical_name: "SANDBOX.pris" })).toEqual({ technical_name: "validation.technical_name.taken" });
        expect(issueMessages({ ...valid(), technical_name: "mon_flux" })).toEqual({ technical_name: "validation.technical_name.prefix" });
        expect(issueMessages({ ...valid(), technical_name: "SANDBOX." })).toEqual({ technical_name: "validation.technical_name.prefix_only" });
    });

    it("refuse un accès que l’entrepôt n’offre pas", () => {
        expect(issueMessages(valid(), ["restricted_visible", "restricted"])).toEqual({ access: "validation.access.unavailable" });
    });

    it("signale les champs vides du formulaire initial", () => {
        expect(Object.keys(issueMessages(serviceFormDefaultValues)).sort()).toEqual(["stored_data_id", "tables", "technical_name", "themes", "title"]);
    });
});
