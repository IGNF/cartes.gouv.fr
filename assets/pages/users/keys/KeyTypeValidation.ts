import { TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";
import * as yup from "yup";
import { ComponentKey } from "../../../i18n/i18n";
import { UserKeyCreateDtoUserKeyInfoDtoTypeEnum } from "../../../types/entrepot";

const getSchema = (type: UserKeyCreateDtoUserKeyInfoDtoTypeEnum, t: TranslationFunction<"AddUserKey", ComponentKey>) => {
    // NOTE la clé de type header n'existe plus apparemment
    switch (type) {
        case UserKeyCreateDtoUserKeyInfoDtoTypeEnum.BASIC:
            return yup.object().shape({
                login: yup.string().required(t("login_required")),
                password: yup.string().required(t("password_required")),
            });
        case UserKeyCreateDtoUserKeyInfoDtoTypeEnum.HASH:
            return yup.object().shape({
                hash: yup.string().required(t("apikey_required")),
            });
        default:
            return yup.mixed().nullable().notRequired();
    }
};

export { getSchema };
