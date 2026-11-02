import * as yup from "yup";
import { getTranslation } from "../../../../../i18n/i18n";
import { isInt, isFloat, isDate } from "validator";

const { t } = getTranslation("Theme");

// Pas de unknown[] ici : un tableau a aussi une propriété values, ce qui fausserait le test « in »
type ListValues = { values: { value: unknown }[] } | { map: <U>(callback: (value: unknown) => U) => U[] };

class AttributeValidations {
    #context: yup.TestContext<yup.AnyObject>;

    constructor(context: yup.TestContext<yup.AnyObject>) {
        this.#context = context;
    }

    validateValue = (value?: string | null) => {
        if (value === undefined || value === null) return true;

        const { type } = this.#context.parent as { type?: string };

        const v = value.trim();

        switch (type) {
            case "text":
                return true;
            case "integer":
                return this.#validateInteger(v);
            case "double":
                return this.#validateFloat(v);
            case "checkbox": {
                if (!["0", "1"].includes(v)) {
                    return this.#context.createError({ message: t("dialog.add_attribute.value.not_a_valid_checkbox") });
                }
                return true;
            }
            case "list":
                return this.#validateInList(v);
            case "date":
                return this.#validateDate(v);
        }
    };

    #validateInteger = (value: string): yup.ValidationError | boolean => {
        if (!value) return true;
        if (!isInt(value, { allow_leading_zeroes: false })) {
            return this.#context.createError({ message: t("dialog.add_attribute.value.not_a_valid_integer") });
        }
        return true;
    };

    #validateFloat = (value: string): yup.ValidationError | boolean => {
        if (!value) return true;
        if (!isFloat(value)) {
            return this.#context.createError({ message: t("dialog.add_attribute.value.not_a_valid_double") });
        }
        return true;
    };

    #validateDate = (value: string): yup.ValidationError | boolean => {
        if (!value) return true;
        if (!isDate(value)) {
            return this.#context.createError({ message: t("dialog.add_attribute.value.not_a_valid_date") });
        }
        return true;
    };

    #validateInList = (value: string): yup.ValidationError | boolean => {
        const { values: v } = this.#context.parent as { values?: unknown };

        if (Array.isArray(v)) {
            if (!v.includes(value)) {
                return this.#context.createError({ message: t("dialog.add_attribute.value_not_in_list_error") });
            }
        } else if (typeof v === "object") {
            const lv = v as ListValues;
            const list = "values" in lv ? lv.values.map(({ value }) => value || null) : lv.map((value) => value || null);
            if (!list.includes(value)) {
                return this.#context.createError({ message: t("dialog.add_attribute.value_not_in_list_error") });
            }
            return true;
        }

        return true;
    };
}

export { AttributeValidations };
