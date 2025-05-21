// Pour des chaines non définies ou vides => null
export const setToNull = (value) => (value === undefined || value === "" ? null : value);

export const cloneFile = (original: File) =>
    new File([original], original.name, {
        type: original.type,
        lastModified: original.lastModified,
    });
