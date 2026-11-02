import Input from "@codegouvfr/react-dsfr/Input";
import { FC } from "react";
import { FieldErrors, UseFormReturn } from "react-hook-form";
import { useTranslation } from "../../../../i18n/i18n";
import { fr } from "@codegouvfr/react-dsfr";
import { KeyFormValuesType } from "../../../../@types/app";
import { BasicInfoDto } from "../../../../@types/entrepot";
import { fieldErrorMessage } from "../../../../utils";

type BasicTypeInfoFormProps = {
    form: UseFormReturn<KeyFormValuesType>;
};

const BasicTypeInfoForm: FC<BasicTypeInfoFormProps> = ({ form }) => {
    const { t } = useTranslation("UserKey");

    const {
        register,
        formState: { errors },
    } = form;
    const typeInfosErrors = errors.type_infos as FieldErrors<BasicInfoDto> | undefined;

    return (
        <div className={fr.cx("fr-mb-6v")}>
            <Input
                label={t("login")}
                state={typeInfosErrors?.login ? "error" : "default"}
                stateRelatedMessage={fieldErrorMessage(typeInfosErrors?.login)}
                nativeInputProps={{ ...register("type_infos.login") }}
            />
            <Input
                label={t("password")}
                state={typeInfosErrors?.password ? "error" : "default"}
                stateRelatedMessage={fieldErrorMessage(typeInfosErrors?.password)}
                // nativeInputProps={{ ...register("type_infos.password"), type: editMode ? "password" : "text" }}
                nativeInputProps={{ ...register("type_infos.password"), type: "password" }}
            />
        </div>
    );
};

export default BasicTypeInfoForm;
