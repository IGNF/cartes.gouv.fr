import isIPRange from "validator/lib/isIPRange";
import * as yup from "yup";
import { getTranslation } from "../../../../i18n/i18n";
import { UserKeyInfoDtoTypeEnum } from "../../../../@types/app";

const { t } = getTranslation("UserKey");

const getIpSchema = () => {
    return yup
        .array()
        .of(yup.string())
        .test({
            name: "is-ip",
            test: (values, context) => {
                if (!values || (Array.isArray(values) && values.length === 0)) return true;

                const errors: string[] = [];
                values.forEach((value) => {
                    if (value && !isIPRange(value)) {
                        errors.push(t("ip_error", { ip: value }));
                    }
                });
                if (errors.length) {
                    const message = errors.join(", ");
                    return context.createError({ message: message });
                }

                return true;
            },
        });
};

const getSecuritySchema = (type: UserKeyInfoDtoTypeEnum) => {
    switch (type) {
        case UserKeyInfoDtoTypeEnum.BASIC:
            return yup.object().shape({
                login: yup.string().required(t("login_required")),
                password: yup.string().required(t("password_required")),
            });
        case UserKeyInfoDtoTypeEnum.HASH:
            return yup.object().shape({
                hash: yup
                    .string()
                    .required(t("apikey_required"))
                    .matches(/^[a-zA-Z0-9_\-.]+$/, t("apikey_error"))
                    .min(4, t("apikey_min_error"))
                    .max(64, t("apikey_max_error")),
            });
        default:
            return yup.mixed().nullable().notRequired();
    }
};

const getServicesSchema = (editMode: boolean, keyName: string, keyNames: string[]) => {
    return yup.object().shape({
        name: yup
            .string()
            .required(t("name_required"))
            .test("is-unique", t("name_exists"), (name) => {
                if (keyNames.includes(name)) {
                    return editMode && name === keyName;
                }
                return true;
            }),
        type: yup.string(),
        accesses: yup
            .array()
            .of(
                yup.object().shape({
                    permission: yup.string(),
                    offerings: yup.array().of(yup.string()),
                })
            )
            .min(1, t("accesses_required"))
            .required(t("accesses_required")),
    });
};

const getSecurityOptionsSchema = (editMode: boolean, keyType: UserKeyInfoDtoTypeEnum) => {
    return editMode
        ? yup.object().shape({
              ip_list_name: yup.string(),
              ip_list_addresses: getIpSchema(),
              user_agent: yup.string(), // TODO Validation
              referer: yup.string(), // TODO Validation
          })
        : yup.object().shape({
              type: yup.string(),
              type_infos: yup.lazy(() => {
                  return getSecuritySchema(keyType);
              }),
              ip_list_name: yup.string(),
              ip_list_addresses: getIpSchema(),
              user_agent: yup.string(), // TODO Validation
              referer: yup.string(), // TODO Validation
          });
};

export { getIpSchema, getSecurityOptionsSchema, getSecuritySchema, getServicesSchema };
