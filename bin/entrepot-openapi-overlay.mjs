#!/usr/bin/env node

// Surcouche appliquée au spec OpenAPI de l’Entrepôt avant génération des types.
// Chaque bloc corrige un défaut du spec amont : supprimer le bloc quand l’amont le corrige
// (le job CI « upstream-spec » signale le changement). Un bloc qui n’a plus rien à corriger fait échouer le script.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const fail = (message) => {
    throw new Error(message);
};

const [, , input, output] = process.argv;
if (!input || !output) fail("usage : node bin/entrepot-openapi-overlay.mjs <spec d’entrée> <spec de sortie>");
const spec = JSON.parse(readFileSync(input, "utf8"));
const schemas = spec.components.schemas;

// 1. Schémas sans aucune propriété ni type : le générateur les rend en `any`, ce qui efface le typage de tout
//    ce qui les intersecte (`ConfigurationDetailsContent` surtout). On les déclare `object`, comme avant.
//    `DocumentDetailsResponseDto` a perdu ses propriétés dans le spec (sa liste `required` les cite encore) :
//    on les rétablit à partir de `DocumentListResponseDto`.
if (schemas.DocumentDetailsResponseDto.properties) {
    fail("le spec amont a retrouvé les propriétés de DocumentDetailsResponseDto, supprimer cette partie du bloc 1");
}
schemas.DocumentDetailsResponseDto.properties = {
    ...schemas.DocumentListResponseDto.properties,
    description: { type: "string" },
    mime_type: { type: "string" },
    labels: { type: "array", items: { type: "string" } },
    public_url: { type: "string" },
};
let emptySchemas = 0;
for (const schema of Object.values(schemas)) {
    if (!["properties", "allOf", "oneOf", "anyOf", "enum", "items", "type", "additionalProperties"].some((k) => k in schema)) {
        schema.type = "object";
        emptySchemas++;
    }
}
if (emptySchemas === 0) fail("plus aucun schéma vide, supprimer le bloc 1");

// 2. `extra` absent du spec alors que l’API la renvoie et l’accepte (régression constatée le 06/11/2026).
const withExtra = [];
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
    if (schemas[name].properties.extra) withExtra.push(name);
    else schemas[name].properties.extra = { type: "object", additionalProperties: true };
}
if (withExtra.length > 0) {
    fail(
        `ces schémas portent déjà \`extra\` dans le spec amont, les retirer de la liste du bloc 2, ou supprimer le bloc s’il est vide : ${withExtra.join(", ")}`
    );
}

// 3. Champs toujours renvoyés par l’API mais sortis des listes `required` depuis la génération du 31/10/2025.
const alreadyRequired = [];
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
    if (required.has(field)) alreadyRequired.push(`${name}.${field}`);
    required.add(field);
    schemas[name].required = [...required].sort();
}
if (alreadyRequired.length > 0) {
    fail(
        `ces champs sont déjà dans \`required\` dans le spec amont, les retirer de la liste du bloc 3, ou supprimer le bloc s’il est vide : ${alreadyRequired.join(", ")}`
    );
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
    const enumValues = schemas[from].properties[prop].enum;
    if (enumValues === undefined) fail(`l’enum de ${from}.${prop} n’est plus déclaré en ligne, revoir le bloc 4`);
    const members = JSON.stringify(enumValues);
    schemas[name] = { type: "string", enum: JSON.parse(members) };
    let replaced = 0;
    for (const schema of Object.values(schemas)) {
        for (const [key, value] of Object.entries(schema.properties ?? {})) {
            if (JSON.stringify(value.enum) === members) {
                schema.properties[key] = { $ref: `#/components/schemas/${name}` };
                replaced++;
            }
        }
    }
    if (replaced === 0) fail(`aucune propriété remplacée par ${name}, revoir le bloc 4`);
}

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, JSON.stringify(spec));
