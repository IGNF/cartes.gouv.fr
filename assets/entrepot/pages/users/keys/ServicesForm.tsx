import { fr } from "@codegouvfr/react-dsfr";
import Input from "@codegouvfr/react-dsfr/Input";
import { FC } from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { useTranslation } from "../../../../i18n/i18n";
import { KeyFormValuesType } from "../../../../@types/app";
import { PermissionWithOfferingsDetailsResponseDto } from "../../../../@types/entrepot";
import Accesses from "./Accesses";

type ServicesFormProps = {
    form: UseFormReturn<KeyFormValuesType>;
    permissions: PermissionWithOfferingsDetailsResponseDto[];
    visible: boolean;
};

const ServicesForm: FC<ServicesFormProps> = ({ form, permissions, visible }) => {
    const { t: tCommon } = useTranslation("Common");
    const { t } = useTranslation("UserKey");

    const {
        control,
        register,
        formState: { errors },
    } = form;

    return (
        <div className={fr.cx(!visible && "fr-hidden")}>
            <p>{tCommon("mandatory_fields")}</p>
            <Input
                label={t("key_name")}
                hintText={t("key_explain")}
                state={errors.name ? "error" : "default"}
                stateRelatedMessage={errors.name?.message?.toString()}
                nativeInputProps={{ ...register("name") }}
            />
            <Controller
                control={control}
                name="accesses"
                render={({ field: { value, onChange } }) => {
                    return (
                        <Accesses
                            permissions={permissions}
                            value={value}
                            label={t("services")}
                            state={errors.accesses ? "error" : "default"}
                            stateRelatedMessage={errors?.accesses?.message?.toString()}
                            onChange={onChange}
                        />
                    );
                }}
            />
        </div>
    );
};

export default ServicesForm;
