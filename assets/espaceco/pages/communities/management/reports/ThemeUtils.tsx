import { ThemeDTO } from "../../../../../@types/espaceco";

const normalizeTheme = (theme: ThemeDTO) => {
    const result = { ...theme };
    ["global", "help"].forEach((f) => {
        if (f in result && !result[f]) {
            delete result[f];
        }
    });
    return result;
};

export default normalizeTheme;
