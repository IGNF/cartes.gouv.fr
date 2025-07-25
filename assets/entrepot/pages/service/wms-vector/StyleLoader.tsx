import { FC } from "react";
import { Controller, type UseFormReturn } from "react-hook-form";

import UploadStyleFiles from "@/components/Utils/Geostyler/UploadStyleFiles";
import { sldParser } from "@/utils/geostyler";
import { WmsVectorServiceFormValuesType } from "./WmsVectorServiceForm";

type UploadStyleFileProps = {
    tableNames: string[];
    form: UseFormReturn<WmsVectorServiceFormValuesType>;
};

const StyleLoader: FC<UploadStyleFileProps> = (props) => {
    const { tableNames = [], form } = props;

    const { control } = form;

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
