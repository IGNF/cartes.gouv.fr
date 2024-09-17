import * as yup from "yup";
import { getTranslation } from "../../../../../i18n/i18n";
import { isInt, isFloat, isDate } from "validator";

const { t } = getTranslation("Theme");

class AttributeValidations {
    #context: yup.TestContext<yup.AnyObject>;

    constructor(context: yup.TestContext<yup.AnyObject>) {
        this.#context = context;
    }

    validateValue = (value: string | undefined) => {
        if (value === undefined) return true;

        const {
            parent: { type },
        } = this.#context;

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
        const {
            parent: { values },
        } = this.#context;

        const list: string[] = values ? values.split("|") : [];
        if (!list.includes(value)) {
            return this.#context.createError({ message: t("dialog.add_attribute.value_not_in_list_error") });
        }
        return true;
    };
}

const validateList = (value: string | undefined, context: yup.TestContext<yup.AnyObject>): yup.ValidationError | boolean => {
    const {
        parent: { type },
    } = context;

    if (type !== "list") {
        return true;
    }

    const list: string[] = value ? value.split("|") : [];
    if (!list.length) {
        return context.createError({ message: t("dialog.add_attribute.type_list_not_empty_error") });
    }
    const duplicates = list.filter((item, index) => list.indexOf(item) !== index);
    if (duplicates.length) {
        return context.createError({ message: t("dialog.add_attribute.list_duplicates_error") });
    }
    return true;
};

export { AttributeValidations, validateList };
