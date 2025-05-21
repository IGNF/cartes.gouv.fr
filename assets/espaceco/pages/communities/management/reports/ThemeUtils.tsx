import { AttributeDTO, AttributeType, ThemeDTO } from "../../../../../@types/espaceco";
import { KeyValuesForm } from "@/components/Input/KeyValueList";

export type AddOrEditAttributeFormType = {
    name: string;
    type: string;
    mandatory?: boolean;
    default?: string | null;
    help?: string | null;
    multiple?: boolean;
    values: KeyValuesForm;
};

const normalizeTheme = (theme: ThemeDTO): ThemeDTO => {
    const result = { ...theme };
    ["global", "help"].forEach((f) => {
        if (f in result && !result[f]) {
            delete result[f];
        }
    });
    return result;
};

type FormType = Omit<AddOrEditAttributeFormType, "values"> & { values: (string | null)[] };
const normalizeAttribute = (attribute: FormType): AttributeDTO => {
    const result: AttributeDTO = {
        name: attribute.name,
        type: attribute.type,
    };

    if (attribute.type === "list") {
        result.values = attribute.values;
    }
    if (attribute.default !== "") {
        result.default = attribute.default === "" ? null : attribute.default;
    }
    if (attribute.help) {
        result.help = attribute.help;
    }

    ["mandatory", "multiple"].forEach((f) => {
        if (attribute[f]) {
            result[f] = attribute[f];
        }
    });

    return result;
};

const formatAttributesForApi = (attributes: ThemeDTO[]): ThemeDTO[] => {
    return attributes.map((theme) => {
        if (!theme.database) return theme;

        const clone = { ...theme };
        clone["attributes"] = theme.autofilled_attributes;
        return clone;
    });
};

/* Recuperation de input type à partir de type */
const getInputType = (type?: AttributeType) => {
    return type === "date" ? "date" : "text";
};

export { normalizeTheme, normalizeAttribute, formatAttributesForApi, getInputType };
