// @vitest-environment jsdom
import { describe, expect, it } from "vitest";

import { buildServiceFormSchema, type ServiceAccess, serviceFormDefaultValues, type ServiceFormValues, type ServiceType } from "./serviceFormSchema";

// la clé sert de message : les tests vérifient quel message est posé, pas sa traduction
const t = ((key: string) => key) as Parameters<typeof buildServiceFormSchema>[0]["t"];

const schema = (availableAccesses: ServiceAccess[] = ["public", "restricted_visible", "restricted"], type: ServiceType = "wfs") =>
    buildServiceFormSchema({ t, type, existingLayerNames: ["SANDBOX.pris"], layerNamePrefix: "SANDBOX", availableAccesses });

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

// validation SLD asynchrone : safeParseAsync, comme le résolveur du formulaire
const issueMessages = async (values: ServiceFormValues, availableAccesses?: ServiceAccess[], type?: ServiceType) => {
    const result = await schema(availableAccesses, type).safeParseAsync(values);
    // premier message par champ, comme le résolveur du formulaire
    const messages: Record<string, string> = {};
    for (const issue of result.error?.issues ?? []) {
        messages[issue.path.join(".")] ??= issue.message;
    }
    return messages;
};

describe("buildServiceFormSchema", () => {
    it("accepte un formulaire complet", async () => {
        expect(await issueMessages(valid())).toEqual({});
    });

    it("exige au moins une table cochée", async () => {
        expect(await issueMessages({ ...valid(), tables: [table({ selected: false })] })).toEqual({ tables: "validation.tables.required" });
    });

    it("ne valide pas les champs d’une table décochée", async () => {
        const tables = [table(), table({ native_name: "brouillon", selected: false, title: "", public_name: "Pas Valide", description: "" })];
        expect(await issueMessages({ ...valid(), tables })).toEqual({});
    });

    it("valide les champs d’une table cochée", async () => {
        expect(await issueMessages({ ...valid(), tables: [table({ title: " ", public_name: "Majuscules", description: "" })] })).toEqual({
            "tables.0.title": "validation.table.title.required",
            "tables.0.public_name": "validation.table.public_name.chars",
            "tables.0.description": "validation.table.description.required",
        });
    });

    it("exige le texte et une URL valide quand l’attribution est cochée, rien sinon", async () => {
        expect(await issueMessages({ ...valid(), attribution: { enabled: false, title: "", url: "pas une url" } })).toEqual({});
        expect(await issueMessages({ ...valid(), attribution: { enabled: true, title: "", url: "pas une url" } })).toEqual({
            "attribution.title": "validation.attribution.text.required",
            "attribution.url": "validation.attribution.url.invalid",
        });
    });

    it("refuse un nom technique déjà pris ou sans le préfixe de l’entrepôt", async () => {
        expect(await issueMessages({ ...valid(), technical_name: "SANDBOX.pris" })).toEqual({ technical_name: "validation.technical_name.taken" });
        expect(await issueMessages({ ...valid(), technical_name: "mon_flux" })).toEqual({ technical_name: "validation.technical_name.prefix" });
        expect(await issueMessages({ ...valid(), technical_name: "SANDBOX." })).toEqual({ technical_name: "validation.technical_name.prefix_only" });
    });

    it("refuse un accès que l’entrepôt n’offre pas", async () => {
        expect(await issueMessages(valid(), ["restricted_visible", "restricted"])).toEqual({ access: "validation.access.unavailable" });
    });

    it("signale les champs vides du formulaire initial", async () => {
        expect(Object.keys(await issueMessages(serviceFormDefaultValues)).sort()).toEqual(["stored_data_id", "tables", "technical_name", "themes", "title"]);
    });

    describe("WMS vecteur", () => {
        const sld = (name = "communes") =>
            `<StyledLayerDescriptor version="1.0.0" xmlns="http://www.opengis.net/sld"><NamedLayer><Name>${name}</Name><UserStyle><FeatureTypeStyle><Rule><PointSymbolizer/></Rule></FeatureTypeStyle></UserStyle></NamedLayer></StyledLayerDescriptor>`;
        const wms = (overrides: Partial<ServiceFormValues["tables"][number]> = {}, description = "Les communes"): ServiceFormValues => ({
            ...valid(),
            description,
            // champs WFS vides : non contrôlés en WMS
            tables: [table({ title: "", public_name: "", description: "", style: new File([sld()], "communes.sld"), ...overrides })],
        });

        it("accepte un SLD conforme sans contrôler les champs WFS des tables", async () => {
            expect(await issueMessages(wms(), undefined, "wms")).toEqual({});
        });

        it("exige la description du flux, 300 caractères au plus", async () => {
            expect(await issueMessages(wms({}, " "), undefined, "wms")).toEqual({ description: "validation.description.required" });
            expect(await issueMessages(wms({}, "a".repeat(301)), undefined, "wms")).toEqual({ description: "validation.description.max" });
        });

        it("exige un fichier .sld conforme par table cochée", async () => {
            expect(await issueMessages(wms({ style: undefined }), undefined, "wms")).toEqual({ "tables.0.style": "validation.table.style.required" });
            expect(await issueMessages(wms({ style: new File([sld()], "communes.qml") }), undefined, "wms")).toEqual({
                "tables.0.style": "validation.table.style.extension",
            });
            expect(await issueMessages(wms({ style: new File([sld("routes")], "Communes.SLD") }), undefined, "wms")).toEqual({
                "tables.0.style": "validation.table.style.layer_name",
            });
            expect(await issueMessages(wms({ selected: false, style: undefined }), undefined, "wms")).toEqual({ tables: "validation.tables.required" });
        });
    });
});
