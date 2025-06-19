import { StyleParser } from "geostyler-style";
import { CSSProperties, FC } from "react";

import { useMapStyle } from "@/contexts/mapStyle";
import { fr } from "@codegouvfr/react-dsfr";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import UploadStyleFile from "./UploadStyleFile";
import { useTranslation } from "@/i18n";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";

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

    const options = tables.map((table) => ({
        label: table,
        nativeInputProps: {
            value: table,
            checked: table === selectedTable,
            onChange: () => setSelectedTable(table),
        },
    }));

    function handleChange(style?: string) {
        onChange({ ...value, [selectedTable]: style });
    }

    const customStyle: CSSProperties = {
        backgroundColor: fr.colors.decisions.background.contrast.grey.default,
    };

    return (
        <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
            <div className={fr.cx("fr-col-3")}>
                <div className={fr.cx("fr-h6", "fr-p-1v")} style={customStyle}>
                    <i className={cx(fr.cx("fr-mr-1v"), "ri-stack-line")} />
                    {t("layers")}
                </div>
                <RadioButtons options={options} small />
            </div>
            <div className={fr.cx("fr-col-9")}>
                <div className={fr.cx("fr-h6", "fr-p-1v")} style={customStyle}>
                    <i className={cx(fr.cx("fr-mr-1v"), "fr-icon-eye-line")} />
                    {t("style_overview")}
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
