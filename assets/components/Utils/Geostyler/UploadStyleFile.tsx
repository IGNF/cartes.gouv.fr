import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { Upload } from "@codegouvfr/react-dsfr/Upload";
import { Divider } from "@mui/material";
import { type Style as GsStyle, ReadStyleResult, StyleParser } from "geostyler-style";
import { FC, lazy, Suspense, useEffect, useState } from "react";

import { StyleFormatEnum } from "@/@types/app";
import { useStyleForm } from "@/contexts/StyleFormContext";
import { useTranslation } from "@/i18n";
import { getFileExtension } from "@/utils";
import { getParserForExtension, sldParser } from "@/utils/geostyler";
import ConfirmDialog, { ConfirmDialogModal } from "../ConfirmDialog";
import LoadingIcon from "../LoadingIcon";

const GeostylerEditor = lazy(() => import("./GeostylerEditor"));

type UploadStyleFileProps = {
    onChange: (value?: string) => void;
    onFormatChange?: (format: string) => void;
    parser?: StyleParser;
    parsers?: StyleParser[];
    value?: string;
    acceptedFileExtensions?: string[];
};

function propertyNamesToLowerCase(sldContent: string) {
    return sldContent.replace(/<(ogc:)?PropertyName>(.*?)<\/(ogc:)?PropertyName>/g, (_, p1, p2) => {
        return `<${p1 ?? ""}PropertyName>${p2.toLowerCase()}</${p1 ?? ""}PropertyName>`;
    });
}

function getDefaultStyle(currentTable: string): GsStyle {
    return {
        name: currentTable,
        rules: [
            {
                name: `rule_${Math.floor(Math.random() * 10000)
                    .toString()
                    .padStart(4, "0")}`,
                symbolizers: [
                    {
                        kind: "Mark",
                        wellKnownName: "circle",
                        color: "#0E1058",
                    },
                ],
            },
        ],
    };
}

const UploadStyleFile: FC<UploadStyleFileProps> = (props) => {
    const { onChange, onFormatChange, parser = sldParser, parsers, value, acceptedFileExtensions = ["sld"] } = props;
    const { t: tCommon } = useTranslation("Common");
    const { t } = useTranslation("UploadStyleFile");

    const { currentTable, styleFormats } = useStyleForm();

    // état interne au composant
    const [gsStyle, setGsStyle] = useState<GsStyle>();
    const [strStyle, setStrStyle] = useState<string>();

    const [uploadError, setUploadError] = useState<string | undefined>(undefined);

    useEffect(() => {
        onChange(strStyle);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [strStyle]);

    async function handleValueChange(value: string | undefined) {
        if (value !== strStyle) {
            if (value) {
                const readResult = await parser.readStyle(styleFormats[currentTable] === StyleFormatEnum.Mapbox ? JSON.parse(value) : value);

                if (readResult.output) {
                    const style = { ...readResult.output, name: currentTable };
                    setGsStyle(style);
                    const writeResult = await parser.writeStyle(style);
                    setStrStyle(styleFormats[currentTable] === StyleFormatEnum.Mapbox ? JSON.stringify(writeResult.output) : writeResult.output);
                }
            } else {
                setGsStyle(undefined);
                setStrStyle("");
            }
        }
    }

    useEffect(() => {
        handleValueChange(value);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, parser]);

    async function readFileContent(file: File): Promise<string> {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                if (typeof e.target?.result === "string") {
                    resolve(e.target.result);
                }
            };
            reader.readAsText(file);
        });
    }

    async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
        setUploadError(undefined);

        if (event.target.files?.[0]) {
            // lecture du contenu du fichier
            const file = event.target.files[0];
            const extension = getFileExtension(file.name)?.toLowerCase() ?? "";
            if (!acceptedFileExtensions.includes(extension)) {
                setUploadError("Extension de fichier non supportée : " + extension);
                return;
            }

            let content = await readFileContent(file);
            content = propertyNamesToLowerCase(content);

            const parser = getParserForExtension(extension);
            let gsStyleResult: ReadStyleResult | undefined;

            if (extension === "json") {
                onFormatChange?.("mapbox");
                gsStyleResult = await parser.readStyle(JSON.parse(content));
            } else {
                onFormatChange?.(extension);
                gsStyleResult = await parser.readStyle(content);
            }

            let gsStyle = gsStyleResult.output;
            if (gsStyle) {
                gsStyle = { ...gsStyle, name: currentTable };
                setGsStyle(gsStyle);

                content = (await parser.writeStyle(gsStyle)).output;
                setStrStyle(extension === "json" ? JSON.stringify(content) : content);
            } else {
                setUploadError("Lecture du fichier de style échouée : " + gsStyleResult.errors?.join(", "));
            }
        }
    }

    async function handleStyleChange(style: GsStyle) {
        const content = (await parser.writeStyle(style)).output;
        setStrStyle(styleFormats[currentTable] === StyleFormatEnum.Mapbox ? JSON.stringify(content) : content);
        setGsStyle(style);
    }

    const handleCreateEmptyStyle = () => {
        const defaultStyle = getDefaultStyle(currentTable);

        setGsStyle(defaultStyle);
        parser
            .writeStyle(defaultStyle)
            .then((result) => (typeof result.output === "object" ? JSON.stringify(result.output) : result.output))
            .then((content) => setStrStyle(content));

        setUploadError(undefined);
    };

    const handleRemoveStyle = () => {
        setGsStyle(undefined);
        setStrStyle(undefined);
        setUploadError(undefined);
    };

    return (
        <>
            {uploadError && (
                <Alert severity="error" title={"Erreur de chargement de style"} description={uploadError} onClose={() => setUploadError(undefined)} />
            )}
            {gsStyle ? (
                <div>
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--right")}>
                        <Button priority={"tertiary"} iconId="fr-icon-delete-line" onClick={ConfirmDialogModal.open}>
                            {t("remove_style")}
                        </Button>
                    </div>
                    <Suspense fallback={<LoadingIcon />}>
                        <GeostylerEditor defaultParser={parser} onChange={handleStyleChange} parsers={parsers} value={gsStyle} />
                    </Suspense>
                    <ConfirmDialog title={t("remove_style")} noTitle={tCommon("cancel")} yesTitle={tCommon("delete")} onConfirm={handleRemoveStyle}>
                        {<p>{t("remove_style_confirm_message", { layer: currentTable })}</p>}
                    </ConfirmDialog>
                </div>
            ) : (
                <div className={fr.cx("fr-my-2w")}>
                    <Upload
                        label={t("file_input_title")}
                        className={fr.cx("fr-input-group", "fr-mb-2w")}
                        hint={t("file_input_hint", { acceptedFileExtensions })}
                        nativeInputProps={{
                            accept: acceptedFileExtensions.map((ext) => "." + ext).join(","),
                            onChange: handleUpload,
                        }}
                    />
                    <Divider>{t("or")}</Divider>
                    <Button priority={"tertiary"} onClick={handleCreateEmptyStyle}>
                        {t("create_style")}
                    </Button>
                </div>
            )}
        </>
    );
};

export default UploadStyleFile;
