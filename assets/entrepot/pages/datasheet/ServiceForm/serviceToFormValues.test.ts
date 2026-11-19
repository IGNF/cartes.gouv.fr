import { describe, expect, it } from "vitest";

import { OfferingStatusEnum, OfferingTypeEnum, type Service, StoredDataTypeEnum, type VectorDb } from "@/@types/app";
import { markdownToText, serviceToFormValues } from "./serviceToFormValues";

type Fixture = {
    type?: OfferingTypeEnum;
    status?: OfferingStatusEnum;
    open?: boolean;
    typeInfos?: Record<string, unknown>;
    tags?: Record<string, string>;
    attribution?: { title: string; url: string };
    pyramidType?: StoredDataTypeEnum;
    access?: Service["access"];
};

function service({
    type = OfferingTypeEnum.WMSVECTOR,
    status = OfferingStatusEnum.PUBLISHED,
    open = true,
    typeInfos = {},
    tags = { datasheet_name: "fiche", theme: "farming, environment" },
    attribution,
    pyramidType,
    access = "public",
}: Fixture = {}): Service {
    return {
        _id: "offering-1",
        type,
        status,
        open,
        access,
        layer_name: "couche_wmsv",
        configuration: {
            _id: "configuration-1",
            name: "Ma couche",
            layer_name: "couche_wmsv",
            tags,
            attribution,
            pyramid: pyramidType ? { type: pyramidType } : undefined,
            type_infos: { used_data: [{ stored_data: "stored-data-1" }], ...typeInfos },
        },
    } as unknown as Service;
}

describe("serviceToFormValues", () => {
    it("lit un WMS vecteur publié depuis le nouveau formulaire", () => {
        const values = serviceToFormValues(service({ typeInfos: { abstract: "Description du flux" }, attribution: { title: "IGN", url: "https://ign.fr" } }));
        expect(values).toEqual({
            stored_data_id: "stored-data-1",
            title: "Ma couche",
            technical_name: "couche_wmsv",
            description: "Description du flux",
            thumbnail: undefined,
            themes: ["farming", "environment"],
            tables: [],
            access: "public",
            attribution: { enabled: true, title: "IGN", url: "https://ign.fr", logo: undefined },
        });
    });

    it("lit un WFS : pas de description du flux, chaque table a la sienne", () => {
        const values = serviceToFormValues(service({ type: OfferingTypeEnum.WFS, typeInfos: {} }));
        expect(values.description).toBe("");
        expect(values.tables).toEqual([]);
        expect(values.attribution.enabled).toBe(false);
    });

    it.each([
        ["TMS", StoredDataTypeEnum.ROK4PYRAMIDVECTOR],
        ["WMTS", StoredDataTypeEnum.ROK4PYRAMIDRASTER],
    ])("lit un %s", (_label, pyramidType) => {
        const values = serviceToFormValues(service({ type: OfferingTypeEnum.WMTSTMS, pyramidType, typeInfos: { abstract: "Pyramide" } }));
        expect(values.description).toBe("Pyramide");
        expect(values.stored_data_id).toBe("stored-data-1");
    });

    it("lit un flux des anciens formulaires : description encodée, thématiques en libellés", () => {
        const values = serviceToFormValues(
            service({
                type: OfferingTypeEnum.WMTSTMS,
                typeInfos: { abstract: JSON.stringify('Description "citée"') },
                tags: { datasheet_name: "fiche", theme: "Agriculture, Environnement" },
            })
        );
        expect(values.description).toBe('Description "citée"');
        expect(values.themes).toEqual(["farming", "environment"]);
        expect(values.thumbnail).toBeUndefined();
    });

    it("garde telle quelle une description entre guillemets qui n’est pas du JSON", () => {
        const values = serviceToFormValues(service({ typeInfos: { abstract: '"a\\q"' } }));
        expect(values.description).toBe('"a\\q"');
    });

    it("convertit en texte simple la description markdown des anciens formulaires seulement", () => {
        const markdown = "**Gras** et [lien](https://ign.fr)\nsuite\n\nSecond paragraphe";
        expect(serviceToFormValues(service({ typeInfos: { abstract: JSON.stringify(markdown) } })).description).toBe(
            "Gras et lien\nsuite\n\nSecond paragraphe"
        );
        expect(serviceToFormValues(service({ typeInfos: { abstract: markdown } })).description).toBe(markdown);
    });

    it("lit les libellés de thématiques qui contiennent « , » et garde un libellé inconnu", () => {
        const values = serviceToFormValues(service({ tags: { theme: "Biologie, faune et flore, Agriculture, Thème perdu" } }));
        expect(values.themes).toEqual(["biota", "farming", "Thème perdu"]);
    });

    it("lit un flux sans thématique", () => {
        expect(serviceToFormValues(service({ tags: {} })).themes).toEqual([]);
    });

    describe("accès", () => {
        it("lit l’accès calculé par le serveur", () => {
            expect(serviceToFormValues(service({ open: false, access: "restricted_visible" })).access).toBe("restricted_visible");
        });

        it("restreint quand l’accès est inconnu", () => {
            expect(serviceToFormValues(service({ open: false, access: null })).access).toBe("restricted");
        });
    });
});

describe("markdownToText", () => {
    it("garde le texte des listes et des blocs de code", () => {
        expect(markdownToText("- un\n- deux\n\n```\ncode\n```")).toBe("un\n\ndeux\n\ncode");
    });
});

describe("serviceToFormValues, tables WFS", () => {
    const geometric = (name: string) => ({ name, attributes: { geom: "geometry(Point)" }, type: "TABLE", primary_key: [] });
    const vectorDb = { type_infos: { relations: [geometric("communes"), geometric("routes")] } } as unknown as VectorDb;
    const wfs = service({
        type: OfferingTypeEnum.WFS,
        typeInfos: {
            used_data: [
                {
                    stored_data: "vectordb-1",
                    relations: [
                        { native_name: "communes", title: "Communes", abstract: "Les communes", keywords: ["admin"] },
                        { native_name: "disparue", public_name: "disparue", title: "Disparue", abstract: "Table supprimée" },
                    ],
                },
            ],
        },
    });

    it("propose toutes les tables de la base, coche les enregistrées et garde une table disparue non cochable", () => {
        expect(serviceToFormValues(wfs, vectorDb).tables).toEqual([
            { native_name: "communes", selected: true, title: "Communes", public_name: "", description: "Les communes", keywords: ["admin"], style: undefined },
            { native_name: "routes", selected: false, title: "routes", public_name: "routes", description: "", keywords: [], style: undefined },
            {
                native_name: "disparue",
                selected: false,
                missing: true,
                title: "Disparue",
                public_name: "disparue",
                description: "Table supprimée",
                keywords: [],
                style: undefined,
            },
        ]);
    });

    it("ne propose aucune table sans la base", () => {
        expect(serviceToFormValues(wfs).tables).toEqual([]);
    });
});

describe("serviceToFormValues, tables WMS vecteur", () => {
    const geometric = (name: string) => ({ name, attributes: { geom: "geometry(Point)" }, type: "TABLE", primary_key: [] });
    const vectorDb = { type_infos: { relations: [geometric("communes"), geometric("routes")] } } as unknown as VectorDb;
    const wmsv = service({
        typeInfos: {
            used_data: [
                {
                    stored_data: "vectordb-1",
                    relations: [
                        { name: "communes", style: "static-communes" },
                        { name: "disparue", style: "static-disparue" },
                    ],
                },
            ],
        },
    });
    const row = (native_name: string) => ({ native_name, title: native_name, public_name: native_name, description: "", keywords: [], style: undefined });

    it("lit les tables par leur nom avec leur style enregistré, garde une table disparue non cochable", () => {
        expect(serviceToFormValues(wmsv, vectorDb).tables).toEqual([
            { ...row("communes"), selected: true, saved_style_id: "static-communes" },
            { ...row("routes"), selected: false },
            { ...row("disparue"), selected: false, missing: true, saved_style_id: "static-disparue" },
        ]);
    });
});
