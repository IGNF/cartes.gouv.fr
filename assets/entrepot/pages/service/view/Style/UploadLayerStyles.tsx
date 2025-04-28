import { Dispatch, FC, SetStateAction, useEffect } from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { getTranslation } from "../../../../../i18n/i18n";
import UploadStyleFiles from "@/components/Utils/Geostyler/UploadStyleFiles";
import { MapStyleProvider } from "@/contexts/mapStyle";
import { StyleParser } from "geostyler-style";
import { MapInitial } from "@/components/Utils/RMap";
import { StyleFormat } from "@/@types/app";

type UploadLayerStylesProps = {
    form: UseFormReturn;
    format: StyleFormat;
    names: string[];
    parser?: StyleParser;
    setInitialValues: Dispatch<SetStateAction<MapInitial | undefined>>;
};

const { t } = getTranslation("Style");

const UploadLayerStyles: FC<UploadLayerStylesProps> = (props) => {
    const { form, format, names, parser, setInitialValues } = props;
    const { control, watch } = form;

    const styleFiles = watch("style_files");
    useEffect(() => {
        setInitialValues((initial) => {
            if (initial) {
                return { ...initial, currentStyle: Object.entries(styleFiles).map(([name, style]) => ({ name, style: style as string, format })) };
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setInitialValues, styleFiles]);

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
