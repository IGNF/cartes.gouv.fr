import { describe, expect, it } from "vitest";

import { buildServiceFormData, mapServiceViolationPaths } from "./buildServiceFormData";
import { serviceFormDefaultValues, type ServiceFormOutput } from "./serviceFormSchema";

const values: ServiceFormOutput = {
    ...serviceFormDefaultValues,
    stored_data_id: "vectordb-1",
    title: "Mon flux",
    technical_name: "SANDBOX.mon_flux",
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
});
