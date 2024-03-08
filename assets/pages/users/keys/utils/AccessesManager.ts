import { AccessCreateDto } from "../../../../types/entrepot";

export default class AccessesManager {
    private _accesses: AccessCreateDto[];

    constructor(accesses: AccessCreateDto[]) {
        this._accesses = accesses;
    }

    get() {
        return this._accesses;
    }

    change(permissionId: string, offeringId: string, checked: boolean): AccessCreateDto[] {
        return checked ? this.add(permissionId, offeringId) : this.remove(permissionId, offeringId);
    }

    /**
     * Ajout d'une offering a une permission
     * @param permissionId
     * @param offeringId
     * @returns
     */
    private add(permissionId: string, offeringId: string): AccessCreateDto[] {
        const index = this.getIndex(permissionId);
        index === -1 ? this._accesses.push({ permission: permissionId, offerings: [offeringId] }) : this._accesses[index].offerings.push(offeringId);
        return this._accesses;
    }

    /**
     * Suppression d'une offering a une permission
     * @param permissionId
     * @param offeringId
     * @returns
     */
    private remove(permissionId: string, offeringId: string): AccessCreateDto[] {
        const index = this.getIndex(permissionId);
        if (index === -1) return this._accesses;

        this._accesses[index].offerings = this._accesses[index].offerings.filter((offering) => offering !== offeringId);
        if (this._accesses[index].offerings.length === 0) {
            this._accesses.splice(index, 1);
        }
        return this._accesses;
    }

    private getIndex(permissionId: string) {
        return this._accesses.findIndex((access) => access.permission === permissionId);
    }
}
