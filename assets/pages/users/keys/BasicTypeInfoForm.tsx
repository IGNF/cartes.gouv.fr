import Input from "@codegouvfr/react-dsfr/Input";
import { FC } from "react";
import { UseFormReturn } from "react-hook-form";
import { useTranslation } from "../../../i18n/i18n";

type BasicTypeInfoFormProps = {
    form: UseFormReturn;
};

const BasicTypeInfoForm: FC<BasicTypeInfoFormProps> = ({ form }) => {
    const { t } = useTranslation("AddAccessKey");

    const {
        register,
        formState: { errors },
    } = form;

    return (
        <div>
            <Input
                label={t("login")}
                // @ts-expect-error error
                state={errors.type_infos?.login ? "error" : "default"}
                // @ts-expect-error error
                stateRelatedMessage={errors.type_infos?.login?.message?.toString()}
                nativeInputProps={{ ...register("type_infos.login") }}
            />
            <Input
                label={t("password")}
                // @ts-expect-error error
                state={errors.type_infos?.password ? "error" : "default"}
                // @ts-expect-error error
                stateRelatedMessage={errors.type_infos?.password?.message?.toString()}
                nativeInputProps={{ ...register("type_infos.password") }}
            />
        </div>
    );
};

export default BasicTypeInfoForm;
