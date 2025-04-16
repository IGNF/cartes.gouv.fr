import { FC, useEffect, useState } from "react";
import { Controller, type UseFormReturn } from "react-hook-form";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";

import { type StoredDataRelation } from "../../../../@types/app";
import { useTranslation } from "../../../../i18n/i18n";
import { WmsVectorServiceFormValuesType } from "./WmsVectorServiceForm";
import UploadStyleFile from "./UploadStyleFile";
import { StaticFileListResponseDto } from "@/@types/entrepot";
import { useQuery } from "@tanstack/react-query";
import RQKeys from "@/modules/entrepot/RQKeys";
import api from "@/entrepot/api";

type UploadStyleFileProps = {
    configId?: string;
    datastoreId: string;
    editMode: boolean;
    files?: StaticFileListResponseDto[];
    tables: StoredDataRelation[];
    typeConfig: string;
    form: UseFormReturn<WmsVectorServiceFormValuesType>;
};

const UploadStyleFiles: FC<UploadStyleFileProps> = (props) => {
    const { configId, datastoreId, editMode, files, tables = [], typeConfig, form } = props;
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
    const { control, getValues, setValue } = form;
    const filename = `config_${configId}_style_${typeConfig}_${selectedTable}`;
    const fileId = files?.find((file) => file.name === filename)?._id;

    const { data } = useQuery({
        queryKey: RQKeys.datastore_statics_download(datastoreId, fileId ?? ""),
        queryFn: () => api.statics.download(datastoreId, fileId!),
        enabled: Boolean(fileId && editMode),
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        const formValue = getValues(`style_files.${selectedTable}`);
        if (data && !formValue) {
            // TODO: remove the usage of blob and files to directly use the string
            const blob = new Blob([data]);
            const file = new File([blob], filename);
            setValue(`style_files.${selectedTable}`, file);
        }
    }, [data, filename, getValues, selectedTable, setValue]);

    return (
        <div>
            <h3>{t("title")}</h3>

            <p>{tCommon("mandatory_fields")}</p>

            <RadioButtons legend="Tables" name="radio" options={options} orientation="horizontal" state="default" stateRelatedMessage="State description" />

            <Controller
                key={selectedTable}
                name={`style_files.${selectedTable}`}
                control={control}
                render={({ field: { value, onChange }, formState: { errors } }) => (
                    <UploadStyleFile
                        error={errors?.style_files?.[selectedTable]?.message}
                        filename={filename}
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
