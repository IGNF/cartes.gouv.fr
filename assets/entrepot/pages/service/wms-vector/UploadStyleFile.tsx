import { fr } from "@codegouvfr/react-dsfr";
import { Upload } from "@codegouvfr/react-dsfr/Upload";
import { FC, useEffect, useState } from "react";
import { type Style } from "geostyler-style";
import GeostylerEditor, { sld100Parser } from "@/components/Utils/GeostylerEditor";

import { useTranslation } from "../../../../i18n/i18n";

/**
 * Convertir en v1.0.0 si l'utilisateur a déposé un sld en v1.1.0
 */
// const getSld100 = async (originalFile: File): Promise<void> => {
//     const fileContent = await originalFile.text();

//     const sldParser = new SldStyleParser({ locale: "fr" });

//     const result = await sldParser.readStyle(fileContent);
//     if (sldParser.readingSldVersion === "1.1.0") {
//         sldParser.sldVersion = "1.0.0";
//         const convertedStyle = await sldParser.writeStyle(result.output!);
//         console.log(convertedStyle.output);

//         // const blob = new Blob([convertedStyle.output!]);
//         // const newFile = new File([blob], originalFile.name);
//         // return newFile;
//     } else {
//         // return originalFile;
//     }
// };

type UploadStyleFileProps = {
    error?: string;
    filename: string;
    onChange: (value: File) => void;
    table: string;
    value: File;
};

const UploadStyleFile: FC<UploadStyleFileProps> = (props) => {
    const { error, filename, onChange, table, value } = props;
    const { t } = useTranslation("UploadStyleFile");
    const [gsStyle, setGsStyle] = useState<Style>({
        name: table,
        rules: [],
    });
    const [file, setFile] = useState<File>();

    useEffect(() => {
        if (value !== file) {
            convertFile(value);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    function convertFile(file: File): Promise<File> {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                if (typeof e.target?.result === "string") {
                    const result = await sld100Parser.readStyle(e.target.result);
                    if (result.output) {
                        setGsStyle(result.output);
                        setFile(file);
                        resolve(file);
                    }
                }
            };
            reader.readAsText(file);
        });
    }

    async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
        if (event.target.files?.[0]) {
            const file = await convertFile(event.target.files[0]);
            onChange(file);
        }
    }

    async function handleStyleChange(style: Style) {
        try {
            const convertedStyle = await sld100Parser.writeStyle(style);
            const blob = new Blob([convertedStyle.output!]);
            const newFile = new File([blob], filename);
            setGsStyle(style);
            setFile(newFile);
            onChange(newFile);
        } catch (error) {
            console.error("Erreur lors de la conversion du style", error);
        }
    }

    return (
        <div>
            <Upload
                label={table}
                className={fr.cx("fr-input-group", "fr-mb-2w")}
                hint={t("file_input_hint")}
                state={error ? "error" : "default"}
                stateRelatedMessage={error}
                nativeInputProps={{
                    accept: ".sld",
                    onChange: handleUpload,
                }}
            />
            <GeostylerEditor onChange={handleStyleChange} value={gsStyle} />
        </div>
    );
};

export default UploadStyleFile;
