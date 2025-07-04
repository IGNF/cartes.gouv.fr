import { StyleFormat } from "@/@types/app";
import UploadStyleFiles from "@/components/Utils/Geostyler/UploadStyleFiles";
import { useManageStyle } from "@/contexts/ManageStyleContext";
import { MapStyleProvider } from "@/contexts/mapStyle";
import { StyleParser } from "geostyler-style";
import { FC, useEffect } from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { getTranslation } from "../../../../../i18n/i18n";

type UploadLayerStylesProps = {
    form: UseFormReturn;
    format: StyleFormat;
    names: string[];
    parser?: StyleParser;
    parsers?: StyleParser[];
};

const { t } = getTranslation("Style");

const UploadLayerStyles: FC<UploadLayerStylesProps> = (props) => {
    const { form, format, names, parser, parsers } = props;
    const { control, watch } = form;
    const { setInitialValues } = useManageStyle();

    const styleFiles = watch("style_files");
    useEffect(() => {
        setInitialValues((initial) => {
            if (initial) {
                return { ...initial, currentStyle: Object.entries(styleFiles).map(([name, style]) => ({ name, style: style as string, format })) };
            }
        });
    }, [setInitialValues, styleFiles, format]);

    return (
        <>
            <p>{t("add_file", { format: format })}</p>
            <MapStyleProvider defaultTable={names[0]}>
                <Controller
                    name="style_files"
                    control={control}
                    render={({ field: { value, onChange }, formState: { errors } }) => (
                        <UploadStyleFiles
                            // @ts-expect-error ignore for now
                            errors={errors?.style_files}
                            onChange={onChange}
                            parser={parser}
                            parsers={parsers}
                            tables={names}
                            value={value}
                        />
                    )}
                />
            </MapStyleProvider>
        </>
    );
};

export default UploadLayerStyles;
