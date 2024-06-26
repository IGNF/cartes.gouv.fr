import { AccessCreateDto, AccessDetailsResponseDto } from "../../../../../@types/entrepot";

export default class AccessesTransformer {
    static transformToArray(accesses: AccessDetailsResponseDto[]): AccessCreateDto[] {
        const map = this.toMap(accesses);
        return Array.from(map, ([k, v]) => ({ permission: k, offerings: v }));
    }

    static transformToObject(accesses: AccessCreateDto[]): Record<string, string[]> {
        const result: Record<string, string[]> = {};
        accesses.forEach((access) => (result[access.permission] = access.offerings));
        return result;
    }

    private static toMap(accesses: AccessDetailsResponseDto[]): Map<string, string[]> {
        const map = new Map();
        accesses.forEach((access) => {
            const collection = map.get(access.permission._id);
            collection === undefined
                ? map.set(access.permission._id, [access.offering._id])
                : map.set(access.permission._id, [...collection, ...[access.offering._id]]);
        });
        return map;
    }
}
