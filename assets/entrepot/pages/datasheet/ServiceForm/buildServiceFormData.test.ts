import { describe, expect, it } from "vitest";

import { buildServiceFormData } from "./buildServiceFormData";
import { defaultServiceFormValues, type ServiceFormValues } from "./serviceFormSchema";

const values: ServiceFormValues = {
    ...defaultServiceFormValues,
    stored_data_id: "vectordb-1",
    title: "Mon flux",
    technical_name: "SANDBOX.mon_flux",
    themes: ["Agriculture"],
    tables: [
        {
            native_name: "communes",
            selected: true,
            title: "Communes",
            public_name: "communes",
            description: "Les communes",
            keywords: ["Unités administratives"],
        },
        { native_name: "brouillon", selected: false, title: "", public_name: "brouillon", description: "", keywords: [] },
    ],
};

const payloadOf = (formData: FormData) => JSON.parse(formData.get("data") as string);

describe("buildServiceFormData", () => {
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
        const formData = buildServiceFormData("wfs", {
            ...values,
            thumbnail,
            attribution_enabled: true,
            attribution_title: "IGN",
            attribution_url: "https://www.ign.fr",
            attribution_logo: logo,
        });
        expect(payloadOf(formData).attribution).toEqual({ title: "IGN", url: "https://www.ign.fr" });
        expect(formData.get("thumbnail")).toBe(thumbnail);
        expect(formData.get("attribution_logo")).toBe(logo);
    });

    it("ignore le logo quand l’attribution est décochée et les tables hors WFS", () => {
        const formData = buildServiceFormData("wms", { ...values, attribution_logo: new File(["x"], "logo.png") });
        expect(formData.get("attribution_logo")).toBeNull();
        expect(payloadOf(formData).tables).toBeUndefined();
    });

    it("envoie en WMS les tables cochées et leur fichier de style sous le nom de la table", () => {
        const style = new File(["<sld/>"], "routes.sld");
        const formData = buildServiceFormData("wms", {
            ...values,
            tables: [
                { ...values.tables[0], native_name: "mes routes.v2", style },
                { ...values.tables[1], style: new File(["x"], "ignore.sld") },
            ],
        });
        expect(payloadOf(formData).selected_tables).toEqual(["mes routes.v2"]);
        expect(formData.get("style_files[mes routes.v2]")).toBe(style);
        expect(formData.get("style_files[brouillon]")).toBeNull();
    });
});
