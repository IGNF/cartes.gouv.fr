export const getFileExtension = (filename: string) => {
    if (!filename) return "";
    return filename.split(".").pop()?.toLowerCase();
};

export const getArrayRange = (start: number, stop: number, step: number = 1): number[] =>
    Array.from({ length: (stop - start) / step + 1 }, (_, index) => start + index * step);
