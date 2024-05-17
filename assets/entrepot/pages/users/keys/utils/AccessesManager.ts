import { AccessCreateDto } from "../../../../../@types/entrepot";

const getIndex = (accesses: AccessCreateDto[], permissionId: string) => {
    return accesses.findIndex((access) => access.permission === permissionId);
};

const add = (accesses: AccessCreateDto[], permissionId: string, offeringId: string) => {
    const result = [...accesses];

    const index = getIndex(accesses, permissionId);
    index === -1 ? result.push({ permission: permissionId, offerings: [offeringId] }) : result[index].offerings.push(offeringId);
    return result;
};

const remove = (accesses: AccessCreateDto[], permissionId: string, offeringId: string) => {
    const result = [...accesses];

    const index = getIndex(accesses, permissionId);
    if (index === -1) return result;

    result[index].offerings = result[index].offerings.filter((offering) => offering !== offeringId);
    if (result[index].offerings.length === 0) {
        result.splice(index, 1);
    }

    return result;
};

export const getNewAccesses = (previousAccesses: AccessCreateDto[], permissionId: string, offeringId: string, checked: boolean): AccessCreateDto[] => {
    return checked ? add(previousAccesses, permissionId, offeringId) : remove(previousAccesses, permissionId, offeringId);
};
