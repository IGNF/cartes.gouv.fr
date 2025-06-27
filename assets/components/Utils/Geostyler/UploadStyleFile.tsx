import { fr } from "@codegouvfr/react-dsfr";
import { Upload } from "@codegouvfr/react-dsfr/Upload";
import { FC, useEffect, useState } from "react";
import { Style, StyleParser } from "geostyler-style";

import GeostylerEditor from "@/components/Utils/Geostyler/GeostylerEditor";
import { sldParser } from "@/utils/geostyler";
import { useTranslation } from "../../../i18n/i18n";
import { useMapStyle } from "@/contexts/mapStyle";
import Button from "@codegouvfr/react-dsfr/Button";
import { Divider } from "@mui/material";
import { ConfirmDialogModal, ConfirmDialog } from "../ConfirmDialog";

type UploadStyleFileProps = {
    error?: string;
    onChange: (value?: string) => void;
    parser?: StyleParser;
    parsers?: StyleParser[];
    value?: string;
};

const UploadStyleFile: FC<UploadStyleFileProps> = (props) => {
    const { error, onChange, parser = sldParser, parsers, value } = props;
    const { t: tCommon } = useTranslation("Common");
    const { t } = useTranslation("UploadStyleFile");

    const { selectedTable } = useMapStyle();

    const defaultStyle: Style = {
        name: selectedTable,
        rules: [],
    };

    const [gsStyle, setGsStyle] = useState<Style>();
    const [strStyle, setStrStyle] = useState<string>();

    useEffect(() => {
        if (value !== strStyle) {
            if (value) {
                convertContent(value);
            } else {
                setGsStyle(undefined);
                setStrStyle("");
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    useEffect(() => {
        if (error) {
            // setGsStyle(undefined);
            setStrStyle("");
        }
    }, [error]);

    async function propertyNamesToLowerCase(sldContent: string): Promise<string> {
        return sldContent.replace(/<(ogc:)?PropertyName>(.*?)<\/(ogc:)?PropertyName>/g, (_, p1, p2) => {
            return `<${p1 ?? ""}PropertyName>${p2.toLowerCase()}</${p1 ?? ""}PropertyName>`;
        });
    }

    async function convertContent(content: string): Promise<string> {
        const result = await parser.readStyle(content);

        if (result.output) {
            const style = { ...result.output, name: selectedTable };
            setGsStyle(style);

            const writeResult = await parser.writeStyle(style);
            setStrStyle(writeResult.output);
            return writeResult.output;
        }
        return content;
    }

    async function convertFile(file: File): Promise<string> {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                if (typeof e.target?.result === "string") {
                    const content = await propertyNamesToLowerCase(e.target.result);
                    const converted = await convertContent(content);
                    resolve(converted);
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
            const content = await propertyNamesToLowerCase(convertedStyle.output);
            setStrStyle(content);

            // On relit le style (PropertyName mis en minuscule)
            const result = await parser.readStyle(content);
            setGsStyle(result.output);

            onChange(content);
        } catch (error) {
            console.error("Erreur lors de la conversion du style", error);
        }
    }

    const handleCreate = () => {
        setGsStyle(defaultStyle);
        setStrStyle("");
    };

    const handleRemove = () => {
        onChange(undefined);
    };

    return gsStyle ? (
        <div>
            <div className={fr.cx("fr-grid-row", "fr-grid-row--right")}>
                <Button priority={"tertiary"} iconId="fr-icon-delete-line" disabled={gsStyle.rules.length === 0} onClick={ConfirmDialogModal.open}>
                    {t("remove_style")}
                </Button>
            </div>
            <GeostylerEditor defaultParser={parser} onChange={handleStyleChange} parsers={parsers} value={gsStyle} />
            <ConfirmDialog title={t("remove_style")} noTitle={tCommon("cancel")} yesTitle={tCommon("delete")} onConfirm={handleRemove}>
                {<p>{t("remove_style_confirm_message", { layer: selectedTable })}</p>}
            </ConfirmDialog>
        </div>
    ) : (
        <div className={fr.cx("fr-my-2w")}>
            <Upload
                label={t("file_input_title")}
                className={fr.cx("fr-input-group", "fr-mb-2w")}
                hint={t("file_input_hint")}
                nativeInputProps={{
                    accept: ".sld",
                    onChange: handleUpload,
                }}
            />
            <Divider>{t("or")}</Divider>
            <Button priority={"tertiary"} onClick={handleCreate}>
                {t("create_style")}
            </Button>
        </div>
    );
};

export default UploadStyleFile;
