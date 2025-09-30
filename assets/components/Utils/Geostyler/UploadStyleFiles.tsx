import { fr } from "@codegouvfr/react-dsfr";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import ToggleSwitch from "@codegouvfr/react-dsfr/ToggleSwitch";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import type { StyleParser } from "geostyler-style";
import { type FC } from "react";
import { useFormContext, type FieldErrors } from "react-hook-form";

import type { StyleFormat } from "@/@types/app";
import { StyleFormatEnum } from "@/@types/app";
import Panels from "@/components/Layout/Panels";
import { useStyleForm } from "@/contexts/StyleFormContext";
import { useTranslation } from "@/i18n";
import { encodeKey } from "@/utils";
import { getParserForFormat, getParsersForExtensions } from "@/utils/geostyler";
import UploadStyleFile from "./UploadStyleFile";

import "@/sass/components/upload-style-files.css";

type UploadStyleFileProps = {
    errors?: FieldErrors;
    onChange: (value?: Record<string, string | undefined>) => void;
    tables: string[];
    value?: Record<string, string>;
    acceptedFileExtensions?: string[];
};

const UploadStyleFiles: FC<UploadStyleFileProps> = (props) => {
    const { errors, onChange, tables = [], value, acceptedFileExtensions } = props;

    const {
        editMode,
        isMapbox,
        setIsMapbox,
        isTms,

        currentTable,
        setCurrentTable,
        setFormat,
        styleFormats,
    } = useStyleForm();

    const { resetField } = useFormContext();

    const { t } = useTranslation("UploadStyleFile");

    function handleChange(style?: string) {
        if (currentTable !== undefined) {
            onChange({ ...value, [encodeKey(currentTable)]: style });
        }
    }

    function handleFormatChange(format: string) {
        if (currentTable !== undefined) {
            setFormat(currentTable, format as StyleFormatEnum);
        }
    }

    const format: StyleFormat | undefined = styleFormats[currentTable];
    let parser: StyleParser | undefined;
    if (format) {
        parser = getParserForFormat(format as StyleFormatEnum);
    }
    const parsers: StyleParser[] = getParsersForExtensions(acceptedFileExtensions);

    return (
        <Panels
            panels={[
                {
                    title: t("layers"),
                    titleAs: "h3",
                    iconId: "ri-stack-line",
                    children: (
                        <>
                            {editMode === false && isTms === true && (
                                <ToggleSwitch
                                    label={"Utiliser des fichiers sld ou qml par couche"}
                                    checked={!isMapbox}
                                    onChange={(checked) => {
                                        setIsMapbox(!checked);
                                        resetField("style_files");
                                    }}
                                />
                            )}
                            <RadioButtons
                                legend=""
                                classes={{ inputGroup: cx(fr.cx("fr-radio-rich"), "frx-rb-style-layer") }}
                                options={tables.sort().map((table) => ({
                                    label: table,
                                    hintText: errors?.style_files?.[encodeKey(table)]?.message ? (
                                        <span className={fr.cx("fr-error-text", "fr-mt-1v")}>{errors?.style_files?.[encodeKey(table)]?.message}</span>
                                    ) : null,
                                    nativeInputProps: {
                                        value: table,
                                        checked: table === currentTable,
                                        onChange: () => setCurrentTable(table),
                                    },
                                }))}
                                disabled={isTms && isMapbox}
                                state={errors?.style_files?.message ? "error" : undefined}
                                stateRelatedMessage={typeof errors?.style_files?.message === "string" && errors?.style_files?.message}
                            />
                        </>
                    ),
                    className: fr.cx("fr-col-md-3"),
                },
                {
                    title: t("style_overview"),
                    titleAs: "h3",
                    iconId: "ri-palette-line",
                    children: (
                        <UploadStyleFile
                            onChange={handleChange}
                            onFormatChange={handleFormatChange}
                            parser={parser}
                            parsers={parsers}
                            value={value?.[encodeKey(currentTable)]}
                            acceptedFileExtensions={acceptedFileExtensions}
                        />
                    ),
                    className: fr.cx("fr-col-md-9"),
                },
            ]}
        />
    );
};

export default UploadStyleFiles;
