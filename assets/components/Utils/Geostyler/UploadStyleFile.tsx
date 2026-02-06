import { fr } from "@codegouvfr/react-dsfr";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { Upload } from "@codegouvfr/react-dsfr/Upload";
import { Divider } from "@mui/material";
import { type Style as GsStyle, ReadStyleResult, Rule, StyleParser } from "geostyler-style";
import { FC, lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { tss } from "tss-react";

import { StyleFormatEnum } from "@/@types/app";
import { useStyleForm } from "@/contexts/StyleFormContext";
import { useTranslation } from "@/i18n";
import TMSStyleTools from "@/modules/Style/TMSStyleFilesManager/TMSStyleTools";
import { encodeKey, getFileExtension, readFileContent } from "@/utils";
import { getDefaultStyle, getParserForExtension, mbParser, propertyNamesToLowerCase, sldParser } from "@/utils/geostyler";
import ConfirmDialog, { ConfirmDialogModal } from "../ConfirmDialog";
import LoadingText from "../LoadingText";
import useStylesHandler from "./useStylesHandler";

const GeostylerEditor = lazy(() => import("./GeostylerEditor"));

type UploadStyleFileProps = {
    onChange: (value?: string) => void;
    onFormatChange?: (format: string) => void;
    parser?: StyleParser;
    parsers?: StyleParser[];
    value?: string;
    acceptedFileExtensions?: string[];
};

const tmsStyleTools = new TMSStyleTools();

const UploadStyleFile: FC<UploadStyleFileProps> = (props) => {
    const { onChange, onFormatChange, parser = sldParser, parsers, value, acceptedFileExtensions = ["sld"] } = props;
    const { t: tCommon } = useTranslation("Common");
    const { t } = useTranslation("UploadStyleFile");

    const { currentTable, styleFormats, service, isMapbox } = useStyleForm();
    const {
        formState: { errors },
        setError,
        trigger,
    } = useFormContext();

    const {
        gsStyle,
        setGsStyle,
        strStyle,
        readStyleResult,
        setReadStyleResult,
        writeStyleResult,
        // setWriteStyleResult
    } = useStylesHandler({
        parser,
        format: styleFormats[currentTable] ?? StyleFormatEnum.SLD,
        initialStrStyle: value,
        setError: (error) => {
            setError(`style_files.${encodeKey(currentTable)}`, { message: error });
        },
    });

    const [uploadError, setUploadError] = useState<string | undefined>(undefined);

    const onChangeRef = useRef(onChange);
    const triggerRef = useRef(trigger);

    useEffect(() => {
        onChangeRef.current = onChange;
        triggerRef.current = trigger;
    }, [trigger, onChange]);

    // notifier le parent uniquement lorsque le style sérialisé change réellement
    const encodedFieldName = useMemo(() => (currentTable ? `style_files.${encodeKey(currentTable)}` : undefined), [currentTable]);
    const lastSentRef = useRef<string | undefined>(undefined);

    useEffect(() => {
        if (!encodedFieldName) return;
        if (lastSentRef.current !== strStyle) {
            lastSentRef.current = strStyle;
            onChangeRef.current(strStyle);
            triggerRef.current(encodedFieldName);
        }
    }, [strStyle, encodedFieldName]);

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

            const targetFormat: StyleFormatEnum = extension === "json" ? StyleFormatEnum.Mapbox : (extension as StyleFormatEnum);
            onFormatChange?.(targetFormat);

            const gsStyleResult: ReadStyleResult | undefined = await parser.readStyle(extension === "json" ? JSON.parse(content) : content);
            setReadStyleResult(gsStyleResult);

            // debug
            if (gsStyleResult.unsupportedProperties) console.warn("unsupported", gsStyleResult.unsupportedProperties);
            if (gsStyleResult.warnings) console.warn("warnings", gsStyleResult.warnings);
            if (gsStyleResult.errors) console.error("errors", gsStyleResult.errors);

            let gsStyle = gsStyleResult.output;
            if (gsStyle) {
                const validRules: Rule[] = gsStyle.rules?.filter((rule) => rule.symbolizers && rule.symbolizers.length > 0) ?? [];
                gsStyle = { ...gsStyle, name: currentTable, rules: validRules };

                try {
                    const currentStr = strStyle;
                    const writeRes = await parser.writeStyle(gsStyle);
                    // setWriteStyleResult(writeRes);
                    const newStr = typeof writeRes.output === "object" ? JSON.stringify(writeRes.output) : (writeRes.output as string);

                    // mettre à jour uniquement si le style a changé
                    if (currentStr !== newStr) {
                        setGsStyle(gsStyle);
                    }
                } catch {
                    setGsStyle(gsStyle);
                }
            } else {
                setUploadError("Lecture du fichier de style échouée : " + gsStyleResult.errors?.join(", "));
            }
        }
    }

    const handleCreateEmptyStyle = useCallback(async () => {
        let defaultStyle = getDefaultStyle(currentTable);

        if (service && isMapbox) {
            const writeResult = await mbParser.writeStyle(defaultStyle);
            // setWriteStyleResult(writeResult);
            const output = writeResult.output;
            if (output) {
                const finalMbStyle = tmsStyleTools.buildMbStyle(service, output);
                const readResult = await mbParser.readStyle(finalMbStyle);
                defaultStyle = readResult.output as GsStyle;
                setReadStyleResult(readResult);
            }
        }

        setGsStyle(defaultStyle);
        setUploadError(undefined);
    }, [currentTable, setGsStyle, setReadStyleResult, isMapbox, service]);

    const handleRemoveStyle = () => {
        setGsStyle(undefined);
        setUploadError(undefined);
    };

    const acceptAttr = useMemo(() => acceptedFileExtensions.map((ext) => "." + ext).join(","), [acceptedFileExtensions]);

    const { classes, cx } = useStyles();

    return (
        <>
            {uploadError && (
                <Alert severity="error" title={"Erreur de chargement de style"} description={uploadError} onClose={() => setUploadError(undefined)} />
            )}
            {errors?.["style_files"]?.[encodeKey(currentTable)]?.message && (
                <Alert severity="error" small description={errors?.["style_files"]?.[encodeKey(currentTable)]?.message} />
            )}

            <Accordion label="Read Style Result">
                {readStyleResult?.errors && (
                    <>
                        Erreurs :
                        <pre>
                            <code style={{ whiteSpace: "pre" }} className={fr.cx("fr-text--sm")}>
                                {JSON.stringify(readStyleResult?.errors, null, 4)}
                            </code>
                        </pre>
                    </>
                )}
                {readStyleResult?.warnings && (
                    <>
                        Avertissements :
                        <pre>
                            <code style={{ whiteSpace: "pre" }} className={fr.cx("fr-text--sm")}>
                                {JSON.stringify(readStyleResult?.warnings, null, 4)}
                            </code>
                        </pre>
                    </>
                )}
                {readStyleResult?.unsupportedProperties && (
                    <>
                        Propriétés non supportées :
                        <pre>
                            <code style={{ whiteSpace: "pre" }} className={fr.cx("fr-text--sm")}>
                                {JSON.stringify(readStyleResult?.unsupportedProperties, null, 4)}
                            </code>
                        </pre>
                    </>
                )}
            </Accordion>
            <Accordion label="Write Style Result">
                {writeStyleResult?.errors && (
                    <>
                        Erreurs :
                        <pre>
                            <code style={{ whiteSpace: "pre" }} className={fr.cx("fr-text--sm")}>
                                {JSON.stringify(writeStyleResult?.errors, null, 4)}
                            </code>
                        </pre>
                    </>
                )}
                {writeStyleResult?.warnings && (
                    <>
                        Avertissements :
                        <pre>
                            <code style={{ whiteSpace: "pre" }} className={fr.cx("fr-text--sm")}>
                                {JSON.stringify(writeStyleResult?.warnings, null, 4)}
                            </code>
                        </pre>
                    </>
                )}
                {writeStyleResult?.unsupportedProperties && (
                    <>
                        Propriétés non supportées :
                        <pre>
                            <code style={{ whiteSpace: "pre" }} className={fr.cx("fr-text--sm")}>
                                {JSON.stringify(writeStyleResult?.unsupportedProperties, null, 4)}
                            </code>
                        </pre>
                    </>
                )}
            </Accordion>
            {gsStyle ? (
                <div>
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--right")}>
                        <Button priority={"tertiary"} iconId="fr-icon-delete-line" onClick={ConfirmDialogModal.open}>
                            {t("remove_style")}
                        </Button>
                    </div>
                    <Suspense fallback={<LoadingText as="p" withSpinnerIcon={true} />}>
                        <GeostylerEditor defaultParser={parser} onChange={setGsStyle} parsers={parsers} value={gsStyle} />
                    </Suspense>
                    <ConfirmDialog title={t("remove_style")} noTitle={tCommon("cancel")} yesTitle={tCommon("delete")} onConfirm={handleRemoveStyle}>
                        {<p>{t("remove_style_confirm_message", { layer: currentTable })}</p>}
                    </ConfirmDialog>
                </div>
            ) : (
                <div className={cx(fr.cx("fr-col-12", "fr-col-sm-6", "fr-py-2v"), classes.uploadContainer)}>
                    <Upload
                        label={t("file_input_title")}
                        className={cx(fr.cx("fr-input-group", "fr-mb-2w"), classes.upload)}
                        hint={t("file_input_hint", { acceptedFileExtensions })}
                        nativeInputProps={{
                            accept: acceptAttr,
                            onChange: handleUpload,
                        }}
                    />
                    <div className={classes.divider}>
                        <Divider>{t("or")}</Divider>
                    </div>

                    <Button priority={"secondary"} onClick={handleCreateEmptyStyle} className={classes.btnCreateStyle}>
                        {t("create_style")}
                    </Button>
                </div>
            )}
        </>
    );
};

export default UploadStyleFile;

const useStyles = tss.withName({ UploadStyleFile }).create({
    uploadContainer: {
        // width: "100%",
        // height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: fr.spacing("4v"),
        margin: "auto",
    },
    upload: {
        height: "100%",
        width: "100%",
        border: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
        padding: `${fr.spacing("2v")} ${fr.spacing("4v")}`,
    },
    divider: {
        width: "100%",
    },
    btnCreateStyle: {
        width: "100%",
        justifyContent: "center",
    },
});
