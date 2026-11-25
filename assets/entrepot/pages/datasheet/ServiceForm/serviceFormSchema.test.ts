// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";

import { ConfigurationTypeEnum, type DatasheetDetailed, type DatastoreEndpoint } from "@/@types/app";
import {
    availableServiceAccesses,
    buildServiceEditFormSchema,
    buildServiceFormSchema,
    configurationTypeFor,
    hasTables,
    isRasterPyramid,
    type ServiceAccess,
    serviceFormDefaultValues,
    type ServiceFormValues,
    type ServiceType,
} from "./serviceFormSchema";

// la clé sert de message : les tests vérifient quel message est posé, pas sa traduction
const t = ((key: string) => key) as Parameters<typeof buildServiceFormSchema>[0]["t"];

const schema = (availableAccesses: ServiceAccess[] = ["public", "restricted_visible", "restricted"], type: ServiceType = "wfs", rasterPyramid = false) =>
    buildServiceFormSchema({ t, type, rasterPyramid, existingLayerNames: ["SANDBOX_pris"], layerNamePrefix: "SANDBOX", availableAccesses });

const table = (overrides: Partial<ServiceFormValues["tables"][number]> = {}) => ({
    native_name: "communes",
    selected: true,
    title: "Communes",
    public_name: "communes",
    description: "Les communes",
    keywords: [],
    featureinfo_attributes: [],
    ...overrides,
});

const valid = (): ServiceFormValues => ({
    ...serviceFormDefaultValues,
    stored_data_id: "vectordb-1",
    title: "Mon flux",
    technical_name: "SANDBOX_mon_flux",
    themes: ["Hydrographie"],
    access: "public",
    tables: [table()],
});

// validation SLD asynchrone : safeParseAsync, comme le résolveur du formulaire
const issueMessages = async (values: ServiceFormValues, availableAccesses?: ServiceAccess[], type?: ServiceType, rasterPyramid?: boolean) => {
    const result = await schema(availableAccesses, type, rasterPyramid).safeParseAsync(values);
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

    it("refuse plus de 10 tables cochées, sans compter les décochées", async () => {
        const tables = (count: number, selected = true) =>
            Array.from({ length: count }, (_, i) => table({ native_name: `t${i}`, public_name: `t${i}`, selected }));
        expect(await issueMessages({ ...valid(), tables: [...tables(10), ...tables(5, false)] })).toEqual({});
        expect(await issueMessages({ ...valid(), tables: tables(11) })).toEqual({ tables: "validation.tables.max" });
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

    it("exige un domaine de premier niveau dans l’URL d’attribution, comme le serveur", async () => {
        const withUrl = (url: string) => issueMessages({ ...valid(), attribution: { enabled: true, title: "IGN", url } });
        expect(await withUrl("http://localhost")).toEqual({ "attribution.url": "validation.attribution.url.invalid" });
        expect(await withUrl("https://www.ign.fr/licence")).toEqual({});
    });

    it("refuse un nom technique déjà pris ou sans le préfixe de l’entrepôt", async () => {
        expect(await issueMessages({ ...valid(), technical_name: "SANDBOX_pris" })).toEqual({ technical_name: "validation.technical_name.taken" });
        expect(await issueMessages({ ...valid(), technical_name: "mon_flux" })).toEqual({ technical_name: "validation.technical_name.prefix" });
        expect(await issueMessages({ ...valid(), technical_name: "SANDBOX.mon_flux" })).toEqual({ technical_name: "validation.technical_name.prefix" });
        expect(await issueMessages({ ...valid(), technical_name: "sandbox_mon_flux" })).toEqual({ technical_name: "validation.technical_name.prefix" });
        expect(await issueMessages({ ...valid(), technical_name: "SANDBOX_" })).toEqual({ technical_name: "validation.technical_name.prefix_only" });
    });

    it("refuse un accès que l’entrepôt n’offre pas", async () => {
        expect(await issueMessages(valid(), ["restricted_visible", "restricted"])).toEqual({ access: "validation.access.unavailable" });
    });

    it("exige un accès, ou signale qu’aucun n’est disponible", async () => {
        const { access: _access, ...withoutAccess } = valid();
        expect(await issueMessages(withoutAccess as ServiceFormValues)).toEqual({ access: "validation.access.required" });
        expect(await issueMessages({ ...valid(), access: null } as unknown as ServiceFormValues)).toEqual({ access: "validation.access.required" });
        expect(await issueMessages(withoutAccess as ServiceFormValues, [])).toEqual({ access: "validation.access.unavailable" });
    });

    it("signale les champs vides du formulaire initial", async () => {
        expect(Object.keys(await issueMessages(serviceFormDefaultValues as ServiceFormValues)).sort()).toEqual([
            "access",
            "stored_data_id",
            "tables",
            "technical_name",
            "themes",
            "title",
        ]);
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

        it("exige un attribut d’infobulle par table cochée quand les infobulles sont activées", async () => {
            const enabled = (overrides: Partial<ServiceFormValues["tables"][number]> = {}): ServiceFormValues => ({
                ...wms(overrides),
                featureinfo: { enabled: true, format: "list" },
            });
            expect(await issueMessages(enabled(), undefined, "wms")).toEqual({
                "tables.0.featureinfo_attributes": "validation.featureinfo.attributes.required",
            });
            expect(await issueMessages(enabled({ featureinfo_attributes: ["nom"] }), undefined, "wms")).toEqual({});
            expect(await issueMessages(enabled({ featureinfo_unavailable: true }), undefined, "wms")).toEqual({});
            expect(await issueMessages(enabled({ selected: false }), undefined, "wms")).toEqual({ tables: "validation.tables.required" });
            expect(await issueMessages({ ...valid(), featureinfo: { enabled: true, format: "list" } })).toEqual({});
        });

        it("exige la description du flux, sans limite de longueur", async () => {
            expect(await issueMessages(wms({}, " "), undefined, "wms")).toEqual({ description: "validation.description.required" });
            expect(await issueMessages(wms({}, "a".repeat(1000)), undefined, "wms")).toEqual({});
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

        it("signale un fichier illisible sans garder l’échec", async () => {
            const style = new File([sld()], "communes.sld");
            vi.spyOn(style, "text").mockRejectedValueOnce(new DOMException("modifié sur le disque", "NotReadableError"));
            expect(await issueMessages(wms({ style }), undefined, "wms")).toEqual({ "tables.0.style": "validation.table.style.unreadable" });
            expect(await issueMessages(wms({ style }), undefined, "wms")).toEqual({});
        });
    });

    describe("WMS raster", () => {
        const wmsr = (description = "Orthophotographie"): ServiceFormValues => ({ ...valid(), stored_data_id: "pyramid-1", description, tables: [] });

        it("n’exige aucune table", async () => {
            expect(await issueMessages(wmsr(), undefined, "wms", true)).toEqual({});
        });

        it("exige la description du flux", async () => {
            expect(await issueMessages(wmsr(" "), undefined, "wms", true)).toEqual({ description: "validation.description.required" });
        });

        it("demande un jeu de données sans préciser vecteur", async () => {
            expect(await issueMessages({ ...wmsr(), stored_data_id: "" }, undefined, "wms", true)).toEqual({
                stored_data_id: "validation.stored_data.required_wms",
            });
        });
    });

    describe("WMTS", () => {
        const wmts = (description = "Orthophotographie"): ServiceFormValues => ({ ...valid(), stored_data_id: "pyramid-1", description, tables: [] });

        it("n’exige aucune table mais la description du flux", async () => {
            expect(await issueMessages(wmts(), undefined, "wmts", true)).toEqual({});
            expect(await issueMessages(wmts(" "), undefined, "wmts", true)).toEqual({ description: "validation.description.required" });
        });

        it("demande une pyramide raster", async () => {
            expect(await issueMessages({ ...wmts(), stored_data_id: "" }, undefined, "wmts", true)).toEqual({
                stored_data_id: "validation.stored_data.required_wmts",
            });
        });
    });

    describe("TMS", () => {
        const tms = (description = "Hydrographie"): ServiceFormValues => ({ ...valid(), stored_data_id: "pyramid-1", description, tables: [] });

        it("n’exige aucune table mais la description du flux", async () => {
            expect(await issueMessages(tms(), undefined, "tms")).toEqual({});
            expect(await issueMessages(tms(" "), undefined, "tms")).toEqual({ description: "validation.description.required" });
        });

        it("demande une pyramide vecteur", async () => {
            expect(await issueMessages({ ...tms(), stored_data_id: "" }, undefined, "tms")).toEqual({
                stored_data_id: "validation.stored_data.required_tms",
            });
        });
    });
});

describe("hasTables", () => {
    it("propose des tables en WFS et en WMS sur une base vecteur seulement", () => {
        expect(hasTables("wfs", false)).toBe(true);
        expect(hasTables("wms", false)).toBe(true);
        expect(hasTables("wms", true)).toBe(false);
        expect(hasTables("wmts", true)).toBe(false);
        expect(hasTables("tms", false)).toBe(false);
    });
});

describe("isRasterPyramid", () => {
    const datasheet = { pyramid_raster_list: [{ _id: "pyramid-1" }] } as DatasheetDetailed;

    it("reconnaît une pyramide raster de la fiche, rien d’autre", () => {
        expect(isRasterPyramid(datasheet, "pyramid-1")).toBe(true);
        expect(isRasterPyramid(datasheet, "vectordb-1")).toBe(false);
        expect(isRasterPyramid(datasheet, "")).toBe(false);
        expect(isRasterPyramid(undefined, "pyramid-1")).toBe(false);
    });
});

describe("configurationTypeFor", () => {
    it("donne WMS-RASTER seulement pour un flux WMS sur une pyramide raster", () => {
        expect(configurationTypeFor("wms", true)).toBe(ConfigurationTypeEnum.WMSRASTER);
        expect(configurationTypeFor("wms", false)).toBe(ConfigurationTypeEnum.WMSVECTOR);
        expect(configurationTypeFor("wfs", true)).toBe(ConfigurationTypeEnum.WFS);
        expect(configurationTypeFor("wmts", true)).toBe(ConfigurationTypeEnum.WMTSTMS);
    });
});

describe("buildServiceEditFormSchema", () => {
    const editIssues = async (tables: ServiceFormValues["tables"], type: ServiceType = "wfs", featureinfo = valid().featureinfo) => {
        const { stored_data_id: _storedDataId, technical_name: _technicalName, ...values } = valid();
        const result = await buildServiceEditFormSchema({
            t,
            type,
            availableAccesses: ["public"],
            savedTablePublicNames: { communes: "Communes_2020" },
        }).safeParseAsync({ ...values, description: "Les communes", tables, featureinfo });
        return (result.error?.issues ?? []).map((issue) => `${issue.path.join(".")}: ${issue.message}`);
    };

    it("ne contrôle ni la donnée stockée ni le nom technique du flux", async () => {
        expect(await editIssues([table()])).toEqual([]);
    });

    it("accepte un nom technique de table vide ou déjà enregistré hors de la règle des minuscules", async () => {
        expect(await editIssues([table({ public_name: "" })])).toEqual([]);
        expect(await editIssues([table({ public_name: "Communes_2020" })])).toEqual([]);
        expect(await editIssues([table({ public_name: "Communes_2021" })])).toEqual(["tables.0.public_name: validation.table.public_name.chars"]);
    });

    it("n’applique pas le plafond de tables en WFS", async () => {
        expect(await editIssues(Array.from({ length: 11 }, (_, index) => table({ native_name: `table_${index}`, public_name: `table_${index}` })))).toEqual([]);
    });

    describe("WMS vecteur", () => {
        it("exige un attribut d’infobulle par table cochée quand les infobulles sont activées", async () => {
            const enabled = { enabled: true, format: "table" } as const;
            expect(await editIssues([table({ saved_style_id: "static-communes" })], "wms", enabled)).toEqual([
                "tables.0.featureinfo_attributes: validation.featureinfo.attributes.required",
            ]);
            expect(await editIssues([table({ saved_style_id: "static-communes", featureinfo_attributes: ["nom"] })], "wms", enabled)).toEqual([]);
        });

        it("garde le style enregistré sans nouveau fichier, en exige un pour une table sans style", async () => {
            expect(await editIssues([table({ saved_style_id: "static-communes" })], "wms")).toEqual([]);
            expect(await editIssues([table({ native_name: "routes" })], "wms")).toEqual(["tables.0.style: validation.table.style.required"]);
        });

        it("contrôle un nouveau fichier même quand un style est enregistré", async () => {
            expect(await editIssues([table({ saved_style_id: "static-communes", style: new File(["x"], "communes.qml") })], "wms")).toEqual([
                "tables.0.style: validation.table.style.extension",
            ]);
        });

        it("applique le plafond de tables", async () => {
            const tables = Array.from({ length: 11 }, (_, index) => table({ native_name: `table_${index}`, saved_style_id: `static-${index}` }));
            expect(await editIssues(tables, "wms")).toEqual(["tables: validation.tables.max"]);
        });
    });
});

describe("availableServiceAccesses", () => {
    const endpoint = (type: string, open: boolean) => ({ endpoint: { type, open } }) as unknown as DatastoreEndpoint;

    it("propose les accès des endpoints du type, tous tant qu’ils ne sont pas lus", () => {
        expect(availableServiceAccesses(undefined, ConfigurationTypeEnum.WFS)).toEqual(["public", "restricted_visible", "restricted"]);
        expect(availableServiceAccesses([endpoint("WFS", true), endpoint("WMTS-TMS", false)], ConfigurationTypeEnum.WFS)).toEqual(["public"]);
        expect(availableServiceAccesses([endpoint("wfs", false)], ConfigurationTypeEnum.WFS)).toEqual(["restricted_visible", "restricted"]);
    });
});
