import Input from "@codegouvfr/react-dsfr/Input";
import { FC } from "react";
import { UseFormReturn } from "react-hook-form";
import { useTranslation } from "../../../../i18n/i18n";
import { fr } from "@codegouvfr/react-dsfr";
import { KeyFormValuesType } from "../../../../@types/app";

type BasicTypeInfoFormProps = {
    editMode: boolean;
    form: UseFormReturn<KeyFormValuesType>;
};

const BasicTypeInfoForm: FC<BasicTypeInfoFormProps> = ({ editMode, form }) => {
    const { t } = useTranslation("UserKey");

    const {
        register,
        formState: { errors },
    } = form;

    return (
        <div className={fr.cx("fr-mb-6v")}>
            <Input
                label={t("login")}
                // @ts-expect-error error
                state={errors.type_infos?.login ? "error" : "default"}
                // @ts-expect-error error
                stateRelatedMessage={errors.type_infos?.login?.message?.toString()}
                nativeInputProps={{ ...register("type_infos.login") }}
                disabled={editMode}
            />
            {editMode === false && (
                <Input
                    label={t("password")}
                    // @ts-expect-error error
                    state={errors.type_infos?.password ? "error" : "default"}
                    // @ts-expect-error error
                    stateRelatedMessage={errors.type_infos?.password?.message?.toString()}
                    // nativeInputProps={{ ...register("type_infos.password"), type: editMode ? "password" : "text" }}
                    nativeInputProps={{ ...register("type_infos.password"), type: "password" }}
                />
            )}
        </div>
    );
};

export default BasicTypeInfoForm;
