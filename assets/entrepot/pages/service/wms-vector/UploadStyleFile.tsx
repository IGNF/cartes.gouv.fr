import { fr } from "@codegouvfr/react-dsfr";
import { Upload } from "@codegouvfr/react-dsfr/Upload";
import { FC, useEffect, useState } from "react";
import { StyleParser, type Style } from "geostyler-style";

import GeostylerEditor from "@/components/Utils/GeostylerEditor";
import { sldParser } from "@/utils/geostyler";
import { useTranslation } from "../../../../i18n/i18n";

type UploadStyleFileProps = {
    error?: string;
    onChange: (value?: string) => void;
    parser?: StyleParser<string>;
    table: string;
    value: string;
};

const UploadStyleFile: FC<UploadStyleFileProps> = (props) => {
    const { error, onChange, parser = sldParser, table, value } = props;
    const { t } = useTranslation("UploadStyleFile");
    const [gsStyle, setGsStyle] = useState<Style>({
        name: table,
        rules: [],
    });
    const [file, setFile] = useState<string>();

    useEffect(() => {
        if (value !== file) {
            convertContent(value);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    async function convertContent(content: string) {
        const result = await parser.readStyle(content);
        if (result.output) {
            setGsStyle(result.output);
            setFile(content);
        }
    }

    function convertFile(file: File): Promise<string> {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                if (typeof e.target?.result === "string") {
                    const content = e.target.result;
                    convertContent(content);
                    resolve(content);
                }
            };
            reader.readAsText(file);
        });
    }

    async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
        if (event.target.files?.[0]) {
            const content = await convertFile(event.target.files[0]);
            onChange(content);
        }
    }

    async function handleStyleChange(style: Style) {
        try {
            const convertedStyle = await parser.writeStyle(style);
            setGsStyle(style);
            setFile(convertedStyle.output);
            onChange(convertedStyle.output);
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
