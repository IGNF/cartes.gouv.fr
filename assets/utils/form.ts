// Utilisée dans yup.transform sur une chaine . Si la valeur est undefined ou égale à ""
export const setToNull = (value) => (value === undefined || value === "" ? null : value);

export const cloneFile = (original: File) =>
    new File([original], original.name, {
        type: original.type,
        lastModified: original.lastModified,
    });
