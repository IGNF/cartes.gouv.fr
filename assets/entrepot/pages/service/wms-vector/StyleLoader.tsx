import { FC, useEffect } from "react";
import { Controller, type UseFormReturn } from "react-hook-form";

import { StaticFileListResponseDto } from "@/@types/entrepot";
import api from "@/entrepot/api";
import RQKeys from "@/modules/entrepot/RQKeys";
import { useQuery } from "@tanstack/react-query";
import { type StoredDataRelation } from "../../../../@types/app";
import { WmsVectorServiceFormValuesType } from "./WmsVectorServiceForm";
import UploadStyleFiles from "@/components/Utils/Geostyler/UploadStyleFiles";
import { useMapStyle } from "@/contexts/mapStyle";
import { sldParser } from "@/utils/geostyler";

type UploadStyleFileProps = {
    configId?: string;
    datastoreId: string;
    files?: StaticFileListResponseDto[];
    tables: StoredDataRelation[];
    typeConfig: string;
    form: UseFormReturn<WmsVectorServiceFormValuesType>;
};

const StyleLoader: FC<UploadStyleFileProps> = (props) => {
    const { configId, datastoreId, files, tables = [], typeConfig, form } = props;
    const { editMode, selectedTable } = useMapStyle();
    const tableNames = tables.map((table) => table.name);
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
        if (data) {
            const formData = getValues("style_files");
            setValue("style_files", { ...formData, [selectedTable]: data });
        }
    }, [data, filename, getValues, selectedTable, setValue]);

    return (
        <div>
            <Controller
                name="style_files"
                control={control}
                render={({ field: { value, onChange }, formState: { errors } }) => (
                    <UploadStyleFiles errors={errors?.style_files} onChange={onChange} parsers={[sldParser]} tables={tableNames} value={value} />
                )}
            />
        </div>
    );
};

export default StyleLoader;
