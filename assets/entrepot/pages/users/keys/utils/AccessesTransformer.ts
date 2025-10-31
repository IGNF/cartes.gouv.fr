import { AccessCreateDto, AccessDetailResponseDto } from "../../../../../@types/entrepot";

export default class AccessesTransformer {
    static transformToArray(accesses: AccessDetailResponseDto[]): AccessCreateDto[] {
        const map = this.toMap(accesses);
        return Array.from(map, ([k, v]) => ({ permission: k, offerings: v }));
    }

    static transformToObject(accesses: AccessCreateDto[]): Record<string, string[]> {
        const result: Record<string, string[]> = {};
        accesses.forEach((access) => {
            result[access.permission] = access.offerings;
        });
        return result;
    }

    private static toMap(accesses: AccessDetailResponseDto[]): Map<string, string[]> {
        const map = new Map();
        accesses.forEach((access) => {
            const collection = map.get(access.permission._id) as string[] | undefined;
            if (collection === undefined) {
                map.set(access.permission._id, [access.offering._id]);
            } else {
                map.set(access.permission._id, [...collection, access.offering._id]);
            }
        });
        return map;
    }
}
