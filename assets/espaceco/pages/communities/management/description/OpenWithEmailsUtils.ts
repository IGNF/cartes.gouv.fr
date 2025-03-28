import { OpenWithEmailType } from "../../../../../@types/app_espaceco";

const openWithEmailToApi = (openWithEmail: OpenWithEmailType[]): Record<string, string[]> | null => {
    if (!openWithEmail.length) return null;

    return openWithEmail.reduce((accumulator, owe) => {
        const grids: string[] = [];
        owe.grids.reduce((acc, grid) => {
            acc.push(grid.name);
            return acc;
        }, grids);
        accumulator[owe.email] = grids;
        return accumulator;
    }, {});
};

export { openWithEmailToApi };
