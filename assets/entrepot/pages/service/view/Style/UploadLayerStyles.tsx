import { fr } from "@codegouvfr/react-dsfr";
import { Upload } from "@codegouvfr/react-dsfr/Upload";
import { FC } from "react";
import { UseFormReturn } from "react-hook-form";
import { getTranslation } from "../../../../../i18n/i18n";

type UploadLayerStylesProps = {
    form: UseFormReturn;
    format: "mapbox" | "sld" | "qml";
    layers: Record<string, string>;
};

const { t } = getTranslation("Style");

const UploadLayerStyles: FC<UploadLayerStylesProps> = ({ form, format, layers }) => {
    const {
        register,
        formState: { errors },
    } = form;

    return (
        <>
            <p>{t("add_file", { format: format })}</p>
            {format === "qml" && (
                <>
                    <div className="fr-alert fr-alert--warning">
                        <p>{t("qml_message")}</p>
                    </div>
                    <br />
                </>
            )}
            {Object.keys(layers).map((uid) => {
                return (
                    <div key={uid} className={fr.cx("fr-grid-row", "fr-mb-3w")}>
                        <Upload
                            className={fr.cx("fr-input-group")}
                            label={layers[uid]}
                            hint={t("select_file", { format: format })}
                            state={errors?.style_files?.[uid]?.message ? "error" : "default"}
                            stateRelatedMessage={errors?.style_files?.[uid]?.message}
                            nativeInputProps={{
                                ...register(`style_files.${uid}`),
                                accept: `.${format}`,
                            }}
                        />
                    </div>
                );
            })}
        </>
    );
};

export default UploadLayerStyles;
