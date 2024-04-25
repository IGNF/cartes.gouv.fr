import { StoredDataDetailsRelationDto } from "./@types/entrepot";

/**
 * Ne conserve que les tables geometriques
 * @param relation : StoredDataDetailsRelationDto
 */
const filterGeometricRelations = (relations: StoredDataDetailsRelationDto[], filter: boolean = false): StoredDataDetailsRelationDto[] => {
    const filtered = relations.filter((relation) => {
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

    return filtered.sort((r1, r2) => {
        return r1.name === r2.name ? 0 : r1.name < r2.name ? -1 : 1;
    });
};

export { filterGeometricRelations };
