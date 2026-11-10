import { describe, expect, it } from "vitest";

import { MetadataHierarchyLevel } from "@/@types/app";
import { buildMetadataFormData, buildMetadataSchema, mapMetadataToFormValues, type MetadataFormValues, withLockedFlags } from "./metadataSchema";

// la clé sert de message : les tests vérifient quel message est posé, pas sa traduction
const t = ((key: string) => key) as Parameters<typeof buildMetadataSchema>[0]["t"];

const schema = (overrides: Partial<Parameters<typeof buildMetadataSchema>[0]> = {}) =>
    buildMetadataSchema({ t, isEditMode: false, existingDatasheetNames: [], isFileIdentifierAvailable: async () => true, ...overrides });

const valid = (): MetadataFormValues => ({
    name: " Fiche ",
    description: "Description",
    themes: ["environment"],
    keywords_inspire: [],
    keywords_additional: [],
    file_identifier: "ign.fiche",
    producers: [{ organization_name: "Organisme", organization_email: "orga@example.test", role: "pointOfContact", address_postal_code: "" }],
    date_creation: new Date(2026, 0, 15, 0, 30),
    update_frequency: "monthly",
    territories: [{ id: "COMMUNE_TEST_1", title: "Commune test", bbox: [2.25, 48.8, 2.45, 48.9] }],
    scale: 25000,
    resolution: Number.NaN,
    resource_constraints: [
        {
            type: "legal",
            constraints: [
                { type: "useConstraints", locked: false, restriction_code: "license" },
                { type: "useLimitation", locked: true, url: "", description: "Licence" },
            ],
        },
    ],
    hierarchy_level: MetadataHierarchyLevel.Dataset,
    language: { code: "fre", language: "français" },
    charset: "utf8",
});

const issuePaths = async (values: MetadataFormValues, deps = {}) => {
    const result = await schema(deps).safeParseAsync(values);
    return result.success ? [] : result.error.issues.map((issue) => `${issue.path.join(".")} ${issue.message}`);
};

describe("buildMetadataSchema", () => {
    it("accepte une fiche complète, nettoie les espaces et ignore les champs facultatifs vides", async () => {
        const result = await schema().parseAsync(valid());

        expect(result.name).toBe("Fiche");
        expect(result.resolution).toBeUndefined();
        expect(result.producers[0].address_postal_code).toBeUndefined();
    });

    it("exige le point de contact en premier et des rôles uniques", async () => {
        const values = valid();
        values.producers = [
            { organization_name: "A", organization_email: "a@example.test", role: "author" },
            { organization_name: "B", organization_email: "b@example.test", role: "author" },
        ];

        expect(await issuePaths(values)).toEqual([
            "producers.0.role validation.producers.firstIsPointOfContact",
            "producers.1.role validation.producers.uniqueRoles",
        ]);
    });

    it("valide chaque sous-contrainte selon son type", async () => {
        const values = valid();
        values.resource_constraints = [
            {
                type: "legal",
                constraints: [
                    { type: "accessConstraints", locked: false, restriction_code: undefined as never },
                    { type: "useLimitation", locked: true, url: "pas une url", description: " " },
                ],
            },
        ];

        expect(await issuePaths(values)).toEqual([
            "resource_constraints.0.constraints.0.restriction_code validation.restrictionCode",
            "resource_constraints.0.constraints.1.url validation.url",
            "resource_constraints.0.constraints.1.description validation.constraintDescription",
        ]);
    });

    it("refuse une résolution négative et une échelle hors liste", async () => {
        const values = { ...valid(), resolution: -1, scale: 123 };

        expect(await issuePaths(values)).toEqual(["scale validation.scale", "resolution validation.resolution"]);
    });

    it("vérifie l’identifiant de fichier en création seulement", async () => {
        const isFileIdentifierAvailable = async () => false;

        expect(await issuePaths(valid(), { isFileIdentifierAvailable })).toEqual(["file_identifier validation.fileIdentifier.unique"]);
        expect(await issuePaths(valid(), { isFileIdentifierAvailable, isEditMode: true, fileIdentifierLocked: true })).toEqual([]);
        // fiche sans fiche de métadonnées : l’enregistrement la crée, l’identifiant saisi est vérifié
        expect(await issuePaths(valid(), { isFileIdentifierAvailable, isEditMode: true })).toEqual(["file_identifier validation.fileIdentifier.unique"]);
    });

    it("refuse un nom de fiche déjà pris en création", async () => {
        expect(await issuePaths(valid(), { existingDatasheetNames: ["Fiche"] })).toEqual(["name validation.name.unique"]);
    });
});

describe("buildMetadataFormData", () => {
    it("envoie une date locale, les copies du point de contact et aucun drapeau locked", async () => {
        const formData = buildMetadataFormData(await schema().parseAsync({ ...valid(), thumbnail: null }));
        const data = JSON.parse(formData.get("data") as string) as {
            date_creation: string;
            producers: { role: string }[];
            resource_constraints: { constraints: object[] }[];
        };

        expect(data.date_creation).toBe("2026-01-15");
        expect(data.producers.map((producer) => producer.role)).toEqual(["pointOfContact", "custodian", "contact"]);
        expect(data.resource_constraints[0].constraints).toEqual([
            { type: "useConstraints", restriction_code: "license" },
            { type: "useLimitation", description: "Licence" },
        ]);
        expect(formData.get("delete_thumbnail")).toBe("1");
        expect(formData.has("thumbnail")).toBe(false);
    });
});

describe("withLockedFlags et mapMetadataToFormValues", () => {
    it("recalcule les compagnes depuis l’ordre renvoyé par le serveur", () => {
        const condition = withLockedFlags({
            type: "legal",
            constraints: [
                { type: "accessConstraints", locked: false, restriction_code: "otherRestrictions" },
                { type: "otherConstraints", locked: false, limitation_code: "noLimitations" },
                { type: "useConstraints", locked: false, restriction_code: "license" },
                { type: "useLimitation", locked: false, description: "Licence" },
                { type: "useLimitation", locked: false, description: "Ajoutée à la main" },
            ],
        });

        expect(condition.constraints.map((sub) => sub.locked)).toEqual([false, true, false, true, false]);
    });

    it("lit la date de création en date locale et retire les valeurs nulles", () => {
        const values = mapMetadataToFormValues(
            {
                date_creation: "2026-01-15",
                resource_constraints: [{ type: "other", constraints: [{ type: "useLimitation", url: null, description: "Usage interne" }] }],
            },
            "Fiche"
        );

        expect(values.date_creation?.getDate()).toBe(15);
        expect(values.name).toBe("Fiche");
        expect(values.resource_constraints?.[0].constraints[0]).toEqual({ type: "useLimitation", url: "", description: "Usage interne", locked: true });
    });

    // valeurs initiales égales à celles du DOM : le formulaire n’est pas modifié dès son chargement
    it("lit les champs texte vides en chaîne vide et les nombres absents en undefined", () => {
        const values = mapMetadataToFormValues(
            {
                producers: [{ organization_name: "Organisme", organization_email: "orga@example.test", role: "pointOfContact", address_city: null }],
                scale: null as unknown as undefined,
            },
            "Fiche"
        );

        expect(values.producers?.[0]).toMatchObject({ address_number_and_streetname: "", address_postal_code: "", address_city: "" });
        expect(values.scale).toBeUndefined();
    });
});
