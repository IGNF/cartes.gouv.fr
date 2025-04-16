import { FC, useState } from "react";
import { Controller, type UseFormReturn } from "react-hook-form";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";

import { type StoredDataRelation } from "../../../../@types/app";
import { useTranslation } from "../../../../i18n/i18n";
import { WmsVectorServiceFormValuesType } from "./WmsVectorServiceForm";
import UploadStyleFile from "./UploadStyleFile";

type UploadStyleFileProps = {
    tables: StoredDataRelation[];
    form: UseFormReturn<WmsVectorServiceFormValuesType>;
};

const UploadStyleFiles: FC<UploadStyleFileProps> = ({ tables = [], form }) => {
    const { t: tCommon } = useTranslation("Common");
    const { t } = useTranslation("UploadStyleFile");
    const [selectedTable, setSelectedTable] = useState(tables[0].name);
    const options = tables.map((table) => ({
        label: table.name,
        nativeInputProps: {
            value: table.name,
            checked: table.name === selectedTable,
            onChange: () => setSelectedTable(table.name),
        },
    }));

    const { control } = form;

    return (
        <div>
            <h3>{t("title")}</h3>

            <p>{tCommon("mandatory_fields")}</p>

            <RadioButtons legend="Tables" name="radio" options={options} orientation="horizontal" state="default" stateRelatedMessage="State description" />

            <Controller
                name={`style_files.${selectedTable}`}
                control={control}
                render={({ field: { value, onChange }, formState: { errors } }) => (
                    <UploadStyleFile
                        key={selectedTable}
                        error={errors?.style_files?.[selectedTable]?.message}
                        onChange={onChange}
                        table={selectedTable}
                        value={value}
                    />
                )}
            />
        </div>
    );
};

export default UploadStyleFiles;
