import { type CswMetadataTerritory } from "@/@types/app";
import { jsonFetch } from "../../modules/jsonFetch";
import { bboxFromGeoJsonString } from "../../utils/map";

/** Champs extrafields retournés par l'API de géocodage pour les POI administratifs */
type GeocodingExtrafields = {
    cleabs?: string;
};

/** Propriétés d'un feature POI administratif retourné par /geocodage/search */
type GeocodingFeatureProperties = {
    name?: string;
    toponym?: string;
    citycode?: string[];
    extrafields?: GeocodingExtrafields;
    /** Géométrie polygonale sérialisée en JSON (chaîne), présente si returntruegeometry=true */
    truegeometry?: string;
};

type GeocodingFeature = {
    properties: GeocodingFeatureProperties;
};

type GeocodingResponse = {
    features: GeocodingFeature[];
};

const BASE_URL = "https://data.geopf.fr/geocodage/search";

/**
 * Recherche des unités administratives (communes, départements, régions) via l'API de
 * géocodage Géoplateforme et les convertit en territoires `{ id, title, bbox }`.
 *
 * La bbox est dérivée du polygone retourné par `returntruegeometry=true` ; elle est vide
 * si la géométrie est absente ou non parsable.
 */
const searchAdminUnits = async (search: string, signal: AbortSignal): Promise<CswMetadataTerritory[]> => {
    const params = new URLSearchParams({
        q: search,
        index: "poi",
        category: "administratif",
        autocomplete: "1",
        returntruegeometry: "true",
        limit: "10",
    });

    const response = await jsonFetch<GeocodingResponse>(`${BASE_URL}?${params.toString()}`, { signal }, undefined, false, false);

    return response.features.map((feature): CswMetadataTerritory => {
        const p = feature.properties;

        // Identifiant stable BD TOPO ; fallback sur citycode si absent
        const id = p.extrafields?.cleabs ?? (p.citycode?.join("-") || "");

        // Libellé du territoire
        const title = p.toponym ?? p.name ?? id;

        // Bbox dérivée du polygone (best-effort)
        const bbox = p.truegeometry ? (bboxFromGeoJsonString(p.truegeometry) ?? []) : [];

        return { id, title, bbox };
    });
};

const geocoding = {
    searchAdminUnits,
};

export default geocoding;
