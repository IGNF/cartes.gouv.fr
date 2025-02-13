export const getFileExtension = (filename: string) => {
    if (!filename) return "";
    return filename.split(".").pop()?.toLowerCase();
};

export const getArrayRange = (start: number, stop: number, step: number = 1): number[] =>
    Array.from({ length: (stop - start) / step + 1 }, (_, index) => start + index * step);

const rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
const reEscapeChar = /\\(\\)?/g;
export function stringToPath(string) {
    const result: string[] = [];
    if (string.charCodeAt(0) === 46 /* . */) {
        result.push("");
    }
    string.replace(rePropName, (match, number, quote, subString) => {
        result.push(quote ? subString.replace(reEscapeChar, "$1") : number || match);
    });
    return result;
}

export function get(object: object, path: string): unknown | undefined {
    const pathArray = stringToPath(path);
    const length = pathArray.length;
    let index = 0;
    let result: unknown | undefined = object;
    while (result !== undefined && result !== null && index < length) {
        result = result?.[pathArray[index++]];
    }
    return index && index === length ? result : undefined;
}
