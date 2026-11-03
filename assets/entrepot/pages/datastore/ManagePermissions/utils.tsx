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

// Les dates deviennent des chaînes après le passage par JSON
type PermissionRequestBody = Omit<AddPermissionFormType | EditPermissionFormType, "end_date"> & { end_date?: string };

const createRequestBody = (formValues: AddPermissionFormType | EditPermissionFormType): object => {
    // Nettoyage => trim sur toutes les chaines
    const values = JSON.parse(
        JSON.stringify(formValues, (_, value: unknown) => {
            return typeof value === "string" ? value.trim() : value;
        })
    ) as PermissionRequestBody;

    if (values.end_date === undefined) {
        return values;
    }

    const date = new Date(values.end_date);
    date.setUTCHours(23, 59, 59, 0);
    values.end_date = date.toISOString();

    return values;
};

export default createRequestBody;
