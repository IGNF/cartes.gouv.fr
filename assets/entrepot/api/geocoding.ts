import GeoJSON from "ol/format/GeoJSON";

import { type CswMetadataTerritory } from "@/@types/app";
import { jsonFetch } from "@/modules/jsonFetch";

/** Champs complémentaires (extrafields) des POI administratifs */
type GeocodingExtrafields = {
    cleabs?: string;
};

/** Propriétés d’un objet renvoyé par /geocodage/search : champs POI avec index=poi, champs BAN avec index=address */
type GeocodingFeatureProperties = {
    // --- POI administratif (index=poi) ---
    /** Tableau pour les POI (ex. ["Lyon"]), chaîne pour la BAN */
    name?: string | string[];
    toponym?: string;
    citycode?: string[];
    extrafields?: GeocodingExtrafields;
    /** Géométrie polygonale sérialisée en JSON (chaîne), présente si returntruegeometry=true */
    truegeometry?: string;
    // --- Base Adresse Nationale (index=address) ---
    /** Libellé complet de l'adresse, ex. « 6 Rue de la Paix 75002 Paris » */
    label?: string;
    /** Numéro de voirie, ex. « 6 » */
    housenumber?: string;
    /** Nom de la voie seule, ex. « Rue de la Paix » */
    street?: string;
    /** Code postal */
    postcode?: string;
    /** Commune */
    city?: string;
};

type GeocodingFeature = {
    properties: GeocodingFeatureProperties;
};

type GeocodingResponse = {
    features: GeocodingFeature[];
};

/** Territoire issu de la recherche d'unités administratives, enrichi du code INSEE (affichage uniquement, non persisté) */
export type AdminUnitTerritory = CswMetadataTerritory & {
    insee?: string;
};

/** Adresse BAN retournée par searchAddresses, déjà décomposée en champs formulaire */
export type GeocodingAddress = {
    /** Libellé complet affiché dans la liste de suggestions */
    label: string;
    /** Numéro de voirie (peut être vide) */
    number: string;
    /** Nom de la voie */
    street: string;
    /** Code postal */
    postalCode: string;
    /** Commune */
    city: string;
};

const BASE_URL = "https://data.geopf.fr/geocodage/search";

/** Bbox [minLon, minLat, maxLon, maxLat] d’une géométrie GeoJSON sérialisée (EPSG:4326), undefined si illisible ou vide */
export const bboxFromGeoJsonString = (geometry: string): number[] | undefined => {
    try {
        const parsed: unknown = JSON.parse(geometry);
        const extent = new GeoJSON().readGeometry(parsed)?.getExtent();
        // l’emprise d’une géométrie vide vaut [Infinity, Infinity, -Infinity, -Infinity]
        return extent?.length === 4 && extent.every(Number.isFinite) ? extent : undefined;
    } catch {
        return undefined;
    }
};

const firstName = (name?: string | string[]): string | undefined => (Array.isArray(name) ? name[0] : name);

/** Communes, départements et régions ; les résultats sans identifiant ou sans emprise lisible sont écartés (le DTO les refuserait) */
const searchAdminUnits = async (search: string, signal: AbortSignal): Promise<AdminUnitTerritory[]> => {
    const params = new URLSearchParams({
        q: search,
        index: "poi",
        category: "administratif",
        autocomplete: "1",
        returntruegeometry: "true",
        limit: "10",
    });

    const response = await jsonFetch<GeocodingResponse>(`${BASE_URL}?${params.toString()}`, { signal }, undefined, false, false);

    return response.features.flatMap((feature): AdminUnitTerritory[] => {
        const p = feature.properties;

        // identifiant BD TOPO, à défaut le code commune
        const id = p.extrafields?.cleabs ?? (p.citycode?.join("-") || "");
        const bbox = p.truegeometry ? bboxFromGeoJsonString(p.truegeometry) : undefined;
        if (id === "" || bbox === undefined) {
            return [];
        }

        // code INSEE (absent pour les EPCI), pour distinguer les homonymes dans la liste
        return [{ id, title: p.toponym ?? firstName(p.name) ?? id, bbox, insee: p.citycode?.[0] }];
    });
};

/** Adresses de la Base Adresse Nationale, par le même point d’accès /geocodage/search que searchAdminUnits */
const searchAddresses = async (search: string, signal: AbortSignal): Promise<GeocodingAddress[]> => {
    const params = new URLSearchParams({
        q: search,
        index: "address",
        autocomplete: "1",
        limit: "10",
    });

    const response = await jsonFetch<GeocodingResponse>(`${BASE_URL}?${params.toString()}`, { signal }, undefined, false, false);

    return response.features.map((feature): GeocodingAddress => {
        const p = feature.properties;

        // Pour les résultats de type « adresse », housenumber + street couvrent le cas nominal.
        // Pour les résultats de type « voie » (sans housenumber), name contient déjà « n° + voie ».
        const street = p.street ?? firstName(p.name) ?? "";

        return {
            label: p.label ?? street,
            number: p.housenumber ?? "",
            street,
            postalCode: p.postcode ?? "",
            city: p.city ?? "",
        };
    });
};

const geocoding = {
    searchAdminUnits,
    searchAddresses,
};

export default geocoding;
