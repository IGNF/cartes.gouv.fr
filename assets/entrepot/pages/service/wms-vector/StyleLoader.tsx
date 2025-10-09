import { FC } from "react";
import { Controller, type UseFormReturn } from "react-hook-form";

import UploadStyleFiles from "@/components/Utils/Geostyler/UploadStyleFiles";
import { WmsVectorServiceFormValuesType } from "./WmsVectorServiceForm";

type UploadStyleFileProps = {
    tableNames: string[];
    form: UseFormReturn<WmsVectorServiceFormValuesType>;
};

const acceptedFileExtensions = ["sld"];

const StyleLoader: FC<UploadStyleFileProps> = (props) => {
    const { tableNames = [], form } = props;

    const { control } = form;

    return (
        <div>
            <Controller
                name={"style_files"}
                control={control}
                render={({ field: { value, onChange }, formState: { errors } }) => (
                    <UploadStyleFiles errors={errors} onChange={onChange} tables={tableNames} value={value} acceptedFileExtensions={acceptedFileExtensions} />
                )}
            />
        </div>
    );
};

export default StyleLoader;
