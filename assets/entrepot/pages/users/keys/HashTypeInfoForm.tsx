import { FC } from "react";
import { useTranslation } from "../../../../i18n/i18n";
import Input from "@codegouvfr/react-dsfr/Input";
import { UseFormReturn } from "react-hook-form";
import { fr } from "@codegouvfr/react-dsfr";
import { KeyFormValuesType } from "../../../../@types/app";

type HashTypeInfoFormProps = {
    form: UseFormReturn<KeyFormValuesType>;
};

const HashTypeInfoForm: FC<HashTypeInfoFormProps> = ({ form }) => {
    const { t } = useTranslation("UserKey");

    const {
        register,
        formState: { errors },
    } = form;

    return (
        <div className={fr.cx("fr-mb-6v")}>
            <Input
                label={t("apikey")}
                // @ts-expect-error error
                state={errors?.type_infos?.hash ? "error" : "default"}
                // @ts-expect-error error
                stateRelatedMessage={errors?.type_infos?.hash?.message?.toString()}
                nativeInputProps={{ ...register("type_infos.hash") }}
            />
        </div>
    );
};

export default HashTypeInfoForm;
