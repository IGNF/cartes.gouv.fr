import { FC } from "react";
import { useTranslation } from "../../../i18n/i18n";
import Input from "@codegouvfr/react-dsfr/Input";
import { UseFormReturn } from "react-hook-form";

type HashTypeInfoFormProps = {
    form: UseFormReturn;
};

const HashTypeInfoForm: FC<HashTypeInfoFormProps> = ({ form }) => {
    const { t } = useTranslation("AddAccessKey");

    const {
        register,
        formState: { errors },
    } = form;

    return (
        <div>
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
