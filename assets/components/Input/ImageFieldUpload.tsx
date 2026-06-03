import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { Upload } from "@codegouvfr/react-dsfr/Upload";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { useHover } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { tss } from "tss-react";

import placeholder1x1 from "../../img/placeholder.1x1.png";

interface ImageFieldUploadProps {
    /** Nom du champ dans le formulaire parent */
    name: string;
    label: string;
    hintText?: string;
    /** Formats acceptés, ex : ".png, .jpg, .jpeg" */
    accept?: string;
    /** URL d'une image déjà enregistrée (mode édition) */
    existingUrl?: string;
}

const useStyles = tss.withName({ ImageFieldUpload }).create({
    thumbnailWrapper: {
        position: "relative",
        width: "120px",
        height: "120px",
        display: "inline-block",
    },
    img: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
    },
    imgTransparent: {
        opacity: 0.4,
        transition: "opacity 0.2s",
    },
    hoverOverlay: {
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: fr.spacing("1v"),
        backgroundColor: "rgba(0,0,0,0.08)",
    },
});

export default function ImageFieldUpload(props: ImageFieldUploadProps) {
    const { name, label, hintText, accept = ".png, .jpg, .jpeg", existingUrl } = props;
    const { classes } = useStyles();

    const {
        control,
        formState: { errors },
    } = useFormContext();

    const [previewUrl, setPreviewUrl] = useState<string>(existingUrl ?? "");
    const { hovered: isHovered, ref: wrapperRef } = useHover<HTMLDivElement>();

    const errorMsg = (errors[name] as { message?: string } | undefined)?.message;

    return (
        <div className={fr.cx("fr-input-group", !!errorMsg && "fr-input-group--error")}>
            <label className={fr.cx("fr-label")}>
                {label}
                {hintText && <span className={fr.cx("fr-hint-text")}>{hintText}</span>}
            </label>

            <Controller
                control={control}
                name={name}
                render={({ field: { onChange, value } }) => {
                    const file: File | undefined = (value as FileList | undefined)?.[0];

                    // eslint-disable-next-line react-hooks/rules-of-hooks
                    useEffect(() => {
                        if (file) {
                            const reader = new FileReader();
                            reader.onload = () => setPreviewUrl(reader.result as string);
                            reader.readAsDataURL(file);
                        }
                    }, [file]);

                    const showPreview = Boolean(previewUrl);

                    return (
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-mt-1w")}>
                            {/* Aperçu */}
                            <div className="fr-col-auto">
                                <div ref={wrapperRef} className={classes.thumbnailWrapper} aria-hidden="true">
                                    <img
                                        src={showPreview ? previewUrl : placeholder1x1}
                                        alt=""
                                        className={cx(classes.img, isHovered && showPreview ? classes.imgTransparent : "")}
                                    />
                                    {isHovered && showPreview && (
                                        <div className={classes.hoverOverlay}>
                                            <Button
                                                iconId="fr-icon-edit-line"
                                                priority="tertiary no outline"
                                                title="Modifier l'image"
                                                size="small"
                                                type="button"
                                                onClick={() => {
                                                    /* déclenché par le label Upload ci-dessous */
                                                }}
                                            />
                                            <Button
                                                iconId="fr-icon-delete-line"
                                                priority="tertiary no outline"
                                                title="Supprimer l'image"
                                                size="small"
                                                type="button"
                                                onClick={() => {
                                                    onChange(undefined);
                                                    setPreviewUrl("");
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Champ de sélection */}
                            {!showPreview && (
                                <div className={fr.cx("fr-col")}>
                                    <Upload
                                        hint={hintText}
                                        state={errorMsg ? "error" : "default"}
                                        stateRelatedMessage={errorMsg}
                                        nativeInputProps={{
                                            accept,
                                            onChange: (e) => onChange(e.target.files),
                                        }}
                                        className={fr.cx("fr-input-group")}
                                    />
                                </div>
                            )}
                        </div>
                    );
                }}
            />

            {errorMsg && <p className={fr.cx("fr-error-text")}>{errorMsg}</p>}
        </div>
    );
}
