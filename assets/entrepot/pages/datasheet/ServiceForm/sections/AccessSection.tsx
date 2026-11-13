import { fr } from "@codegouvfr/react-dsfr";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import Input from "@codegouvfr/react-dsfr/Input";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { useFormContext, useWatch } from "react-hook-form";

import ImageFieldUpload from "@/components/Input/ImageFieldUpload";
import { useTranslation } from "@/i18n";
import { SERVICE_ACCESSES, SERVICE_IMAGE_ACCEPT, SERVICE_IMAGE_MAX_SIZE_MB, type ServiceAccess, type ServiceFormValues } from "../serviceFormSchema";

type AccessSectionProps = {
    /** accès offerts par les endpoints de l’entrepôt pour ce type de flux */
    availableAccesses: readonly ServiceAccess[];
};

export default function AccessSection({ availableAccesses }: AccessSectionProps) {
    const { t } = useTranslation("ServiceForm");
    const {
        register,
        control,
        formState: { errors },
    } = useFormContext<ServiceFormValues>();
    const attributionEnabled = useWatch({ control, name: "attribution.enabled" });

    return (
        <div>
            <RadioButtons
                legend={t("access.legend")}
                state={errors.access ? "error" : "default"}
                stateRelatedMessage={errors.access?.message}
                options={SERVICE_ACCESSES.map((access) => ({
                    label: t(`access.${access}`),
                    hintText: t(`access.${access}.hint`),
                    nativeInputProps: { ...register("access"), value: access, disabled: !availableAccesses.includes(access) },
                }))}
            />

            <h3 className={fr.cx("fr-h6", "fr-mt-4w")}>{t("attribution.title")}</h3>
            <p>{t("attribution.explanation")}</p>

            <Checkbox options={[{ label: t("attribution.enabled"), nativeInputProps: register("attribution.enabled") }]} />

            {attributionEnabled && (
                <div className={fr.cx("fr-ml-4w")}>
                    <Input
                        label={t("attribution.text.label")}
                        state={errors.attribution?.title ? "error" : "default"}
                        stateRelatedMessage={errors.attribution?.title?.message}
                        nativeInputProps={register("attribution.title")}
                    />
                    <Input
                        label={t("attribution.url.label")}
                        hintText={t("attribution.url.hint")}
                        state={errors.attribution?.url ? "error" : "default"}
                        stateRelatedMessage={errors.attribution?.url?.message}
                        nativeInputProps={{ ...register("attribution.url"), type: "url" }}
                    />
                    <ImageFieldUpload
                        name="attribution.logo"
                        label={t("attribution.logo.label")}
                        hintText={t("image.hint", { max: SERVICE_IMAGE_MAX_SIZE_MB })}
                        modalTitle={t("attribution.logo.modal_title")}
                        accept={SERVICE_IMAGE_ACCEPT}
                        maxFileSizeMb={SERVICE_IMAGE_MAX_SIZE_MB}
                        crop={false}
                    />
                </div>
            )}
        </div>
    );
}
