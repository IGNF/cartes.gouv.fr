import { describe, expect, it } from "vitest";

import { buildDatasetAddSchema, buildUploadAddPayload, type DatasetAddFormValues } from "./datasetAddSchema";

// la clé sert de message : les tests vérifient quel message est posé, pas sa traduction
const t = ((key: string) => key) as Parameters<typeof buildDatasetAddSchema>[0]["t"];

const schema = (isKnownProjection: (srid: string) => boolean | Promise<boolean> = () => true) => buildDatasetAddSchema({ t, isKnownProjection });

const valid = (): DatasetAddFormValues => ({
    data_upload_path: "0f8e3c2a-1b2c-4d5e-8f90-123456789abc/donnee.gpkg",
    name: "ma_donnee",
    description: "Description",
    producer: "IGN",
    producer_short: " ign ",
    themes: ["Hydrographie"],
    production_date: new Date(2025, 5, 30, 23, 30),
    srid: "EPSG:2154",
    zone: "D001 Ain",
    email_notification: true,
});

const issueMessages = async (values: DatasetAddFormValues, isKnownProjection?: (srid: string) => boolean | Promise<boolean>) => {
    const result = await schema(isKnownProjection).safeParseAsync(values);
    // premier message par champ, comme le résolveur du formulaire
    const messages: Record<string, string> = {};
    for (const issue of result.error?.issues ?? []) {
        messages[issue.path.join(".")] ??= issue.message;
    }
    return messages;
};

describe("buildDatasetAddSchema", () => {
    it("accepte un formulaire complet et met l’acronyme en majuscules", async () => {
        const result = await schema().parseAsync(valid());
        expect(result.producer_short).toBe("IGN");
    });

    it("refuse une projection inconnue du registre EPSG", async () => {
        expect(await issueMessages({ ...valid(), srid: "EPSG:999999" }, () => false)).toEqual({ srid: "validation.srid.unknown" });
    });

    it("refuse des thématiques qui dépassent une valeur de tag", async () => {
        const themes = ["Thématique numéro un très longue", "Thématique numéro deux très longue", "Thématique numéro trois très longue"];
        expect(await issueMessages({ ...valid(), themes })).toEqual({ themes: "validation.themes.max" });
    });

    it("refuse une date future ou absente", async () => {
        expect(await issueMessages({ ...valid(), production_date: new Date(Date.now() + 86_400_000) })).toEqual({
            production_date: "validation.production_date.future",
        });
        expect(await issueMessages({ ...valid(), production_date: undefined as unknown as Date })).toEqual({
            production_date: "validation.production_date.required",
        });
    });

    it("signale les champs vides", async () => {
        const messages = await issueMessages({ ...valid(), data_upload_path: "", name: " ", description: "", producer: "", zone: "", themes: [] });
        expect(messages).toMatchObject({
            data_upload_path: "validation.file",
            name: "validation.name.required",
            description: "validation.description.required",
            producer: "validation.producer.required",
            zone: "validation.zone.required",
            themes: "validation.themes.required",
        });
    });
});

describe("buildUploadAddPayload", () => {
    it("envoie la date du jour local et omet l’acronyme vide", async () => {
        const values = await schema().parseAsync({ ...valid(), producer_short: "" });
        const payload = buildUploadAddPayload("Fiche", values);
        expect(payload.production_date).toBe("2025-06-30");
        expect(payload.producer_short).toBeUndefined();
        expect(payload.datasheet_name).toBe("Fiche");
    });
});
