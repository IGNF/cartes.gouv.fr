type PermissionFormType = {
    licence: string;
    end_date?: Date;
    offerings: string[];
};

export type AddPermissionFormType = PermissionFormType & {
    type: string;
    beneficiaries: string[];
    only_oauth: boolean;
};

export type EditPermissionFormType = PermissionFormType;

const createRequestBody = (formValues: AddPermissionFormType | EditPermissionFormType): object => {
    // Nettoyage => trim sur toutes les chaines
    const values = JSON.parse(
        JSON.stringify(formValues, (_, value) => {
            return typeof value === "string" ? value.trim() : value;
        })
    );

    if (!("end_date" in values)) {
        return values;
    }

    const date = new Date(values.end_date);
    date.setUTCHours(23, 59, 59, 0);
    values.end_date = date.toISOString();

    return values;
};

export default createRequestBody;
