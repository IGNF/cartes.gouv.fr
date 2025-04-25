import { FC } from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { getTranslation } from "../../../../../i18n/i18n";
import UploadStyleFiles from "@/components/Utils/Geostyler/UploadStyleFiles";
import { MapStyleProvider } from "@/contexts/mapStyle";
import { StyleParser } from "geostyler-style";

type UploadLayerStylesProps = {
    form: UseFormReturn;
    format: "mapbox" | "sld" | "qml";
    names: string[];
    parser?: StyleParser;
};

const { t } = getTranslation("Style");

const UploadLayerStyles: FC<UploadLayerStylesProps> = ({ form, format, names, parser }) => {
    const { control } = form;

    return (
        <>
            <p>{t("add_file", { format: format })}</p>
            {/* {Object.keys(layers).map((uid) => {
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
                                // onChange: onUpload,
                            }}
                        />
                    </div>
                );
            })} */}
            <MapStyleProvider defaultTable={names[0]}>
                <Controller
                    name="style_files"
                    control={control}
                    render={({ field: { value, onChange }, formState: { errors } }) => (
                        // @ts-expect-error ignore for now
                        <UploadStyleFiles errors={errors?.style_files} onChange={onChange} parser={parser} tables={names} value={value} />
                    )}
                />
            </MapStyleProvider>
        </>
    );
};

export default UploadLayerStyles;
