import { isUUID } from "validator";
import * as yup from "yup";
import { PermissionCreateDtoTypeEnum } from "../../../types/entrepot";
import { ComponentKey } from "../../../i18n/i18n";
import { TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";

const types: string[] = Object.values(PermissionCreateDtoTypeEnum);

const uuidTest = (t: TranslationFunction<"DatastorePermissions", ComponentKey>) => ({
    name: "is-uuid",
    test: (values, context) => {
        if (!values || (Array.isArray(values) && values.length === 0)) return true;

        const errors: string[] = [];
        values.forEach((value) => {
            if (value && !isUUID(value)) {
                errors.push(t("validation.uuid_error", { value: value }));
            }
        });
        if (errors.length) {
            const message = errors.join(", ");
            return context.createError({ message: message });
        }

        return true;
    },
});

const getSchema = (t: TranslationFunction<"DatastorePermissions", ComponentKey>) =>
    yup.object({
        licence: yup.string().required(t("validation.licence_required")),
        end_date: yup.date(),
        offerings: yup.array(yup.string().required()).min(1, t("validation.min_offerings")).test(uuidTest(t)).required(),
    });

const getAddSchema = (t: TranslationFunction<"DatastorePermissions", ComponentKey>) => {
    const schema = getSchema(t);
    return schema.concat(
        yup.object({
            type: yup.string().oneOf(types).required(t("validation.type_required")),
            beneficiaries: yup.array().of(yup.string().required()).min(1, t("validation.min_beneficiaries")).test(uuidTest(t)).required(),
            only_oauth: yup.boolean().required(),
        })
    );
};

const getEditSchema = (t: TranslationFunction<"DatastorePermissions", ComponentKey>) => getSchema(t);

export { getAddSchema, getEditSchema };
