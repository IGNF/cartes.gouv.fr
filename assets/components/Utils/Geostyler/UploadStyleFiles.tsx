import { fr } from "@codegouvfr/react-dsfr";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { StyleParser } from "geostyler-style";
import { CSSProperties, FC } from "react";

import { useMapStyle } from "@/contexts/mapStyle";
import { useTranslation } from "@/i18n";
import UploadStyleFile from "./UploadStyleFile";

import "@/sass/components/upload-style-files.css";

type UploadStyleFileProps = {
    errors?: Record<string, { message?: string } | undefined>;
    onChange: (value: Record<string, string | undefined>) => void;
    parser?: StyleParser;
    parsers?: StyleParser[];
    tables: string[];
    value?: Record<string, string>;
};

const UploadStyleFiles: FC<UploadStyleFileProps> = (props) => {
    const { errors, onChange, parser, parsers, tables = [], value } = props;
    const { selectedTable, setSelectedTable } = useMapStyle();

    const { t } = useTranslation("UploadStyleFile");

    function handleChange(style?: string) {
        onChange({ ...value, [selectedTable]: style });
    }

    const customStyle: CSSProperties = {
        backgroundColor: fr.colors.decisions.background.contrast.grey.default,
    };

    return (
        <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
            <div className={fr.cx("fr-col-3")}>
                <div className={fr.cx("fr-grid-row", "fr-text--lg", "fr-p-2v", "fr-mb-6v")} style={customStyle}>
                    <i className={cx(fr.cx("fr-mr-1v"), "ri-stack-line")} />
                    <h3 className={fr.cx("fr-text--lg", "fr-m-0")}>{t("layers")}</h3>
                </div>

                <RadioButtons
                    classes={{ inputGroup: cx(fr.cx("fr-radio-rich"), "frx-rb-style-layer") }}
                    options={tables.sort().map((table) => ({
                        label: table,
                        hintText: errors?.[table]?.message ? <span className={fr.cx("fr-error-text", "fr-mt-1v")}>{errors?.[table]?.message}</span> : null,
                        nativeInputProps: {
                            value: table,
                            checked: table === selectedTable,
                            onChange: () => setSelectedTable(table),
                        },
                    }))}
                />
            </div>
            <div className={fr.cx("fr-col-9")}>
                <div className={fr.cx("fr-grid-row", "fr-text--lg", "fr-p-2v", "fr-mb-6v")} style={customStyle}>
                    <i className={cx(fr.cx("fr-mr-1v"), "ri-palette-line")} />
                    <h3 className={fr.cx("fr-text--lg", "fr-m-0")}>{t("style_overview")}</h3>
                </div>

                <UploadStyleFile
                    error={errors?.[selectedTable]?.message}
                    onChange={handleChange}
                    parser={parser}
                    parsers={parsers}
                    value={value?.[selectedTable]}
                />
            </div>
        </div>
    );
};

export default UploadStyleFiles;
