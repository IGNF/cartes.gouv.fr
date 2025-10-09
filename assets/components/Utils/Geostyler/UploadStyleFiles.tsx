import { fr } from "@codegouvfr/react-dsfr";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import ToggleSwitch from "@codegouvfr/react-dsfr/ToggleSwitch";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import type { StyleParser } from "geostyler-style";
import { useCallback, useEffect, useMemo, useRef, type FC } from "react";
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

    const onChangeRef = useRef(onChange);

    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    const handleChange = useCallback(
        (style?: string) => {
            if (currentTable !== undefined) {
                onChangeRef.current({ ...value, [encodeKey(currentTable)]: style });
            }
        },
        [currentTable, value]
    );

    const handleFormatChange = useCallback(
        (format: string) => {
            if (currentTable === undefined) return;
            const next = format as StyleFormatEnum;
            // éviter les mises à jour sans effet si le format est inchangé
            if (styleFormats[currentTable] === next) return;
            setFormat(currentTable, next);
        },
        [currentTable, setFormat, styleFormats]
    );

    const format: StyleFormat | undefined = styleFormats[currentTable];

    const parser: StyleParser | undefined = useMemo(() => {
        return format ? getParserForFormat(format as StyleFormatEnum) : undefined;
    }, [format]);

    const parsers: StyleParser[] = useMemo(() => getParsersForExtensions(acceptedFileExtensions), [acceptedFileExtensions]);

    const sortedTables = useMemo(() => [...tables].sort(), [tables]);

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

                            <p className={fr.cx("fr-my-2v", "fr-text--sm")}>
                                {isTms
                                    ? editMode
                                        ? "Ajouter un style mapbox pour votre service"
                                        : "Ajoutez un style mapbox pour votre service ou un style sld ou qml par couche"
                                    : "Ajoutez un style sld ou qml par couche présente dans votre service"}
                            </p>

                            <RadioButtons
                                legend=""
                                classes={{ inputGroup: cx(fr.cx("fr-radio-rich"), "frx-rb-style-layer") }}
                                options={sortedTables.map((table) => ({
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
