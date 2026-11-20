import { describe, expect, it } from "vitest";

import { buildServiceEditFormData, buildServiceFormData, mapServiceViolationPaths } from "./buildServiceFormData";
import { serviceFormDefaultValues, type ServiceFormOutput } from "./serviceFormSchema";

const values: ServiceFormOutput = {
    ...serviceFormDefaultValues,
    stored_data_id: "vectordb-1",
    title: "Mon flux",
    technical_name: "SANDBOX_mon_flux",
    themes: ["Agriculture"],
    tables: [
        { native_name: "brouillon", selected: false, title: "", public_name: "brouillon", description: "", keywords: [] },
        {
            native_name: "communes",
            selected: true,
            title: "Communes",
            public_name: "communes",
            description: "Les communes",
            keywords: ["Unités administratives"],
        },
    ],
};

const payloadOf = (formData: FormData) => JSON.parse(formData.get("data") as string) as Record<string, unknown>;

describe("buildServiceFormData", () => {
    it("envoie le type de configuration et la donnée stockée", () => {
        expect(payloadOf(buildServiceFormData("wfs", values))).toMatchObject({ type: "WFS", stored_data_id: "vectordb-1", technical_name: "SANDBOX_mon_flux" });
        expect(payloadOf(buildServiceFormData("wms", values, true)).type).toBe("WMS-RASTER");
        expect(payloadOf(buildServiceFormData("tms", values)).type).toBe("WMTS-TMS");
    });

    it("n’envoie que les tables cochées et aucune attribution quand la case est décochée", () => {
        const payload = payloadOf(buildServiceFormData("wfs", values));
        expect(payload.tables).toEqual([
            { native_name: "communes", title: "Communes", public_name: "communes", description: "Les communes", keywords: ["Unités administratives"] },
        ]);
        expect(payload.attribution).toBeNull();
        expect(payload.access).toBe("public");
    });

    it("envoie l’attribution et les fichiers quand ils sont renseignés", () => {
        const thumbnail = new File(["x"], "vignette.png", { type: "image/png" });
        const logo = new File(["x"], "logo.png", { type: "image/png" });
        const formData = buildServiceFormData("wfs", { ...values, thumbnail, attribution: { enabled: true, title: "IGN", url: "https://www.ign.fr", logo } });
        expect(payloadOf(formData).attribution).toEqual({ title: "IGN", url: "https://www.ign.fr" });
        expect(formData.get("thumbnail")).toBe(thumbnail);
        expect(formData.get("attribution_logo")).toBe(logo);
    });

    it("ignore le logo quand l’attribution est décochée", () => {
        const formData = buildServiceFormData("wfs", { ...values, attribution: { enabled: false, title: "", url: "", logo: new File(["x"], "logo.png") } });
        expect(formData.get("attribution_logo")).toBeNull();
    });

    it("WMS vecteur : envoie la description, les noms des tables cochées et un fichier de style par table", () => {
        const style = new File(["<sld/>"], "communes.sld");
        const tables = values.tables.map((table) => ({ ...table, style: table.selected ? style : new File(["x"], "brouillon.sld") }));
        const formData = buildServiceFormData("wms", { ...values, description: "Les communes", tables });
        const payload = payloadOf(formData);
        expect(payload.description).toBe("Les communes");
        expect(payload.selected_tables).toEqual(["communes"]);
        expect(payload).not.toHaveProperty("tables");
        expect(formData.get("style_files[communes]")).toBe(style);
        expect(formData.get("style_files[brouillon]")).toBeNull();
    });

    it("WMS raster : envoie la description, ni tables ni fichiers de style", () => {
        const tables = values.tables.map((table) => ({ ...table, style: new File(["<sld/>"], "communes.sld") }));
        const formData = buildServiceFormData("wms", { ...values, description: "Orthophotographie", tables }, true);
        const payload = payloadOf(formData);
        expect(payload.description).toBe("Orthophotographie");
        expect(payload).not.toHaveProperty("selected_tables");
        expect(formData.get("style_files[communes]")).toBeNull();
    });

    it("WMTS : envoie la description, ni tables ni fichiers de style", () => {
        const tables = values.tables.map((table) => ({ ...table, style: new File(["<sld/>"], "communes.sld") }));
        const formData = buildServiceFormData("wmts", { ...values, description: "Orthophotographie", tables }, true);
        const payload = payloadOf(formData);
        expect(payload.description).toBe("Orthophotographie");
        expect(payload).not.toHaveProperty("tables");
        expect(payload).not.toHaveProperty("selected_tables");
        expect(formData.get("style_files[communes]")).toBeNull();
    });

    it("TMS : envoie la description, ni tables ni fichiers de style", () => {
        const formData = buildServiceFormData("tms", { ...values, description: "Hydrographie" });
        const payload = payloadOf(formData);
        expect(payload.description).toBe("Hydrographie");
        expect(payload).not.toHaveProperty("tables");
        expect(payload).not.toHaveProperty("selected_tables");
    });

    it("WFS : n’envoie pas de description du flux", () => {
        expect(payloadOf(buildServiceFormData("wfs", { ...values, description: "ignorée" }))).not.toHaveProperty("description");
    });
});

describe("mapServiceViolationPaths", () => {
    it("ramène les tables envoyées à leur index dans le formulaire et le fichier logo à son champ", () => {
        const error = mapServiceViolationPaths(
            {
                status: 422,
                title: "Validation Failed",
                violations: [
                    { propertyPath: "tables[0].public_name", title: "invalide" },
                    { propertyPath: "technical_name", title: "invalide" },
                    { propertyPath: "attribution_logo", title: "invalide" },
                ],
            },
            values.tables
        );
        expect(error.violations?.map((violation) => violation.propertyPath)).toEqual(["tables[1].public_name", "technical_name", "attribution.logo"]);
    });

    it("ramène le fichier de style d’une table à son champ et la liste des tables cochées aux tables", () => {
        const error = mapServiceViolationPaths(
            {
                status: 422,
                title: "Validation Failed",
                violations: [
                    { propertyPath: "style_files[communes]", title: "invalide" },
                    { propertyPath: "selected_tables", title: "invalide" },
                ],
            },
            values.tables
        );
        expect(error.violations?.map((violation) => violation.propertyPath)).toEqual(["tables[1].style", "tables"]);
    });
});

describe("buildServiceEditFormData", () => {
    const { stored_data_id: _storedDataId, technical_name: _technicalName, ...editValues } = values;

    it("envoie le même contenu que la publication, sans nom technique, avec les retraits d’images", () => {
        const payload = payloadOf(buildServiceEditFormData("wfs", editValues));
        expect(payload).not.toHaveProperty("technical_name");
        expect(payload.tables).toEqual([
            { native_name: "communes", title: "Communes", public_name: "communes", description: "Les communes", keywords: ["Unités administratives"] },
        ]);
        expect(payload.remove_thumbnail).toBe(false);
        expect(payload.remove_attribution_logo).toBe(false);
    });

    it("demande le retrait de la vignette et du logo passés à null", () => {
        const payload = payloadOf(
            buildServiceEditFormData(
                "wms",
                { ...editValues, description: "Ortho", thumbnail: null, attribution: { enabled: true, title: "IGN", url: "https://www.ign.fr", logo: null } },
                true
            )
        );
        expect(payload.remove_thumbnail).toBe(true);
        expect(payload.remove_attribution_logo).toBe(true);
        expect(payload.description).toBe("Ortho");
        expect(payload).not.toHaveProperty("tables");
    });

    it("WMS vecteur : noms des tables cochées, fichiers de style des seules tables qui en ont un nouveau", () => {
        const style = new File(["<sld/>"], "routes.sld");
        const tables = [
            { ...editValues.tables[1], saved_style_id: "static-communes" },
            { ...editValues.tables[1], native_name: "routes", style },
        ];
        const formData = buildServiceEditFormData("wms", { ...editValues, description: "Réseau", tables });
        expect(payloadOf(formData).selected_tables).toEqual(["communes", "routes"]);
        expect(formData.get("style_files[communes]")).toBeNull();
        expect(formData.get("style_files[routes]")).toBe(style);
    });
});
