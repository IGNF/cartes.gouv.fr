#!/usr/bin/env node

// Surcouche appliquée au spec OpenAPI de l’Entrepôt avant génération des types.
// Chaque bloc corrige un défaut du spec amont : supprimer le bloc quand l’amont le corrige
// (le job CI « upstream-spec » signale le changement).
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const [, , input, output] = process.argv;
const spec = JSON.parse(readFileSync(input, "utf8"));
const schemas = spec.components.schemas;

// 1. Schémas sans aucune propriété ni type : le générateur les rend en `any`, ce qui efface le typage de tout
//    ce qui les intersecte (`ConfigurationDetailsContent` surtout). On les déclare `object`, comme avant.
//    `DocumentDetailsResponseDto` a perdu ses propriétés dans le spec (sa liste `required` les cite encore) :
//    on les rétablit à partir de `DocumentListResponseDto`.
schemas.DocumentDetailsResponseDto.properties = {
    ...schemas.DocumentListResponseDto.properties,
    description: { type: "string" },
    mime_type: { type: "string" },
    labels: { type: "array", items: { type: "string" } },
    public_url: { type: "string" },
};
for (const schema of Object.values(schemas)) {
    if (!["properties", "allOf", "oneOf", "anyOf", "enum", "items", "type", "additionalProperties"].some((k) => k in schema)) {
        schema.type = "object";
    }
}

// 2. `extra` absent du spec alors que l’API la renvoie et l’accepte (régression constatée le 06/11/2026).
for (const name of [
    "AnnexExtendedDetailResponseDto",
    "AnnexStandardDetailResponseDto",
    "AnnexUpdateDto",
    "ConfigurationExtendedDetailResponseDto",
    "ConfigurationPartialUpdateDto",
    "ConfigurationStandardDetailResponseDto",
    "DocumentDetailsResponseDto",
    "DocumentUpdateDto",
    "MetadataExtendedResponseDto",
    "MetadataStandardResponseDto",
    "MetadataUpdateDto",
    "OfferingCatalogResponseDto",
    "OfferingExtendedDetailResponseDto",
    "OfferingExtendedListResponseDto",
    "OfferingStandardDetailResponseDto",
    "OfferingStandardListResponseDto",
    "OfferingUpdateDto",
    "OrganizationDetailResponseDto",
    "OrganizationUpdateDto",
    "StaticFileExtendedDetailResponseDto",
    "StaticFileStandardDetailResponseDto",
    "StaticFileUpdateDto",
    "StoredDataPrivateDetailResponseDto",
    "StoredDataSharedDetailResponseDto",
    "StoredDataUpdateDto",
    "UploadPrivateDetailResponseDto",
    "UploadUpdateDto",
]) {
    schemas[name].properties.extra ??= { type: "object", additionalProperties: true };
}

// 3. Champs toujours renvoyés par l’API mais sortis des listes `required` depuis la génération du 31/10/2025.
for (const [name, field] of [
    ["AccessDetailResponseDto", "permission"],
    ["AccessDetailWithKeyResponseDto", "permission"],
    ["DocumentListResponseDto", "name"],
    ["DocumentListResponseDto", "size"],
    ["EndpointDetailResponseDto", "urls"],
    ["EntryDto", "links"],
    ["FeedDto", "links"],
    ["OfferingCatalogResponseDto", "urls"],
    ["OfferingExtendedDetailResponseDto", "urls"],
    ["OfferingExtendedListResponseDto", "urls"],
    ["OfferingStandardDetailResponseDto", "urls"],
    ["OfferingStandardListResponseDto", "urls"],
    ["PermissionExtendedListResponseDto", "offerings"],
    ["PermissionStandardListResponseDto", "offerings"],
    ["PermissionWithOfferingsDetailsResponseDto", "offerings"],
    ["PermissionWithOfferingsResponseDto", "offerings"],
    ["ProcessingStandardDetailResponseDto", "required_checks"],
    ["StorageDetailResponseDto", "labels"],
    ["StorageListResponseDto", "labels"],
]) {
    const required = new Set(schemas[name].required ?? []);
    required.add(field);
    schemas[name].required = [...required].sort();
}

// 4. Enums déclarés en ligne et répétés dans chaque schéma : le générateur en fait des enums TypeScript
//    distincts, donc incompatibles entre eux. On remonte en composant partagé les ensembles qui entrent en conflit.
//    `ConfigurationType` sert aussi au `type` des offres et des permissions (mêmes membres en amont) : `app.ts`
//    l’expose comme `ConfigurationTypeEnum` et `OfferingTypeEnum`.
for (const [name, from, prop] of [
    ["ConfigurationStatus", "ConfigurationStandardDetailResponseDto", "status"],
    ["ConfigurationType", "ConfigurationStandardDetailResponseDto", "type"],
    ["OfferingStatus", "OfferingStandardDetailResponseDto", "status"],
]) {
    const members = JSON.stringify(schemas[from].properties[prop].enum);
    schemas[name] = { type: "string", enum: JSON.parse(members) };
    for (const schema of Object.values(schemas)) {
        for (const [key, value] of Object.entries(schema.properties ?? {})) {
            if (JSON.stringify(value.enum) === members) schema.properties[key] = { $ref: `#/components/schemas/${name}` };
        }
    }
}

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, JSON.stringify(spec));
