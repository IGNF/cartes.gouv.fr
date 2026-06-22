import { type CswMetadataTerritory } from "@/@types/app";
import { jsonFetch } from "../../modules/jsonFetch";
import { bboxFromGeoJsonString } from "../../utils/map";

/** Champs extrafields retournés par l'API de géocodage pour les POI administratifs */
type GeocodingExtrafields = {
    cleabs?: string;
};

/**
 * Propriétés d'un feature retourné par /geocodage/search.
 * Les champs POI (toponym, citycode, extrafields, truegeometry) sont présents avec index=poi.
 * Les champs BAN (label, housenumber, street, name, postcode, city) sont présents avec index=address.
 */
type GeocodingFeatureProperties = {
    // --- POI administratif (index=poi) ---
    name?: string;
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
    /** Nom complet incluant le numéro (présent quand housenumber est absent) */
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

/**
 * Recherche des adresses précises (à la plaque de rue) via la Base Adresse Nationale (BAN)
 * intégrée à l'API de géocodage Géoplateforme.
 *
 * On utilise le même endpoint /geocodage/search qu'en mode POI (index=poi) plutôt que
 * /geocodage/completion, afin de rester cohérent avec searchAdminUnits et de bénéficier
 * de la même structure de réponse GeoJSON.
 */
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
        const street = p.street ?? p.name ?? "";

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
