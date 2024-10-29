// Utilisée dans yup.transform sur une chaine . Si la valeur est undefined ou égale à ""
export const setToNull = (value) => (value === undefined || value === "" ? null : value);
