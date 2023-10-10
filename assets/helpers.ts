import { StoredDataDetailsRelationDto } from "./types/entrepot";

/**
 * Ne conserve que les tables geometriques
 * @param relation : StoredDataDetailsRelationDto
 */
const filterGeometricRelations = (relations: StoredDataDetailsRelationDto[], filter: boolean = false): StoredDataDetailsRelationDto[] => {
    return relations.filter((relation) => {
        const hasGeometry = (attributes) => {
            for (const type of Object.values(attributes)) {
                if (/^geometry\(/.test(type as string)) return true;
            }
            return false;
        };

        if ("type" in relation && relation.type !== "TABLE") return false;
        if (!filter) return true;
        return "attributes" in relation && hasGeometry(relation.attributes);
    });
};

export { filterGeometricRelations };
