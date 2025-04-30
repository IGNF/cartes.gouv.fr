import { FC } from "react";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { StyleParser } from "geostyler-style";

import UploadStyleFile from "./UploadStyleFile";
import { useMapStyle } from "@/contexts/mapStyle";

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

    return (
        <>
            <RadioButtons legend="Tables" name="radio" options={options} orientation="horizontal" state="default" stateRelatedMessage="State description" />
            <UploadStyleFile
                error={errors?.[selectedTable]?.message}
                onChange={handleChange}
                parser={parser}
                parsers={parsers}
                table={selectedTable}
                value={value?.[selectedTable]}
            />
        </>
    );
};

export default UploadStyleFiles;
