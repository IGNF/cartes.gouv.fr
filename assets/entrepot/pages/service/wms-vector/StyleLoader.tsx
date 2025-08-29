import { FC } from "react";
import { Controller, type UseFormReturn } from "react-hook-form";

import UploadStyleFiles from "@/components/Utils/Geostyler/UploadStyleFiles";
import { decodeKey } from "@/utils";
import { WmsVectorServiceFormValuesType } from "./WmsVectorServiceForm";

type UploadStyleFileProps = {
    tableNames: string[];
    form: UseFormReturn<WmsVectorServiceFormValuesType>;
};

const acceptedFileExtensions = ["sld"];

const StyleLoader: FC<UploadStyleFileProps> = (props) => {
    const { tableNames = [], form } = props;

    const { control, watch } = form;

    return (
        <div>
            <Controller
                name={"style_files"}
                control={control}
                render={({ field: { value, onChange }, formState: { errors } }) => (
                    <UploadStyleFiles
                        errors={errors}
                        onChange={onChange}
                        // parsers={[sldParser]}
                        // parser={sldParser}
                        tables={tableNames}
                        value={value}
                        acceptedFileExtensions={acceptedFileExtensions}
                    />
                )}
            />

            {/* <pre>
                <code>{JSON.stringify(watch("style_files"), null, 4)}</code>
            </pre> */}

            <pre>
                <code>
                    {JSON.stringify(
                        Object.entries(watch("style_files") ?? {}).reduce(
                            (acc, [key, value]) => ({
                                ...acc,
                                [decodeKey(key)]: value,
                            }),
                            {}
                        ),
                        null,
                        4
                    )}
                </code>
            </pre>
        </div>
    );
};

export default StyleLoader;
