import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { Upload } from "@codegouvfr/react-dsfr/Upload";
import { useHover } from "@mantine/hooks";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { tss } from "tss-react";

import { useTranslation } from "@/i18n/i18n";
import { acceptToInputAttribute, fileToDataUrl, type ImageSize, validateImageFile } from "@/utils";
import ImageCropModal, { getImageErrorMessage, useImageCropModal } from "./ImageCropModal/ImageCropModal";

import placeholder1x1 from "../../img/placeholder.1x1.png";

interface ImageFieldUploadProps {
    /** Nom du champ dans le formulaire parent ; la valeur du champ est le File recadré */
    name: string;
    label: string;
    hintText?: string;
    /** Titre de la modale de recadrage, ex : « Ajouter une vignette » */
    modalTitle: string;
    /** Extensions acceptées, sans point (ex : ["jpg", "jpeg", "png"]) */
    accept?: string[];
    /** Ratio largeur/hauteur du recadrage */
    aspect?: number;
    maxFileSizeMo?: number;
    minResolution?: ImageSize;
    /** URL d’une image déjà enregistrée (mode édition) */
    existingUrl?: string;
    /** false : le fichier choisi est pris tel quel après validation, sans modale de recadrage (ex : logo) */
    crop?: boolean;
}

// undefined : inchangé, null : image existante supprimée, File : nouvelle image
type ImageFieldValue = File | null | undefined;

export default function ImageFieldUpload(props: ImageFieldUploadProps) {
    const {
        name,
        label,
        hintText,
        modalTitle,
        accept = ["jpg", "jpeg", "png"],
        aspect = 1,
        maxFileSizeMo = 2,
        minResolution,
        existingUrl,
        crop = true,
    } = props;
    const { classes, cx } = useStyles();
    const { t } = useTranslation("ImageFieldUpload");
    const { t: tCropModal } = useTranslation("ImageCropModal");

    const { control } = useFormContext<Record<string, ImageFieldValue>>();
    const value = useWatch({ control, name });

    const cropModal = useImageCropModal();
    // state et non ref : la modale doit recevoir le nouveau fichier dès le rendu qui suit la sélection
    const [pendingImage, setPendingImage] = useState<File | string | undefined>(undefined);
    // fichier original conservé pour ré-éditer sans perte de qualité
    const originalFileRef = useRef<File | undefined>(undefined);

    const { hovered: isHovered, ref: wrapperRef } = useHover<HTMLDivElement>();

    // erreur de validation du fichier pris sans recadrage
    const [fileError, setFileError] = useState<string | undefined>(undefined);

    // aperçu du File : l’état n’est écrit qu’à la fin de la lecture asynchrone
    const [preview, setPreview] = useState<{ file: File; url: string }>();
    useEffect(() => {
        if (!(value instanceof File)) {
            return;
        }
        let cancelled = false;
        fileToDataUrl(value)
            .then((url) => {
                if (!cancelled) {
                    setPreview({ file: value, url });
                }
            })
            .catch(() => {
                // aperçu laissé sur l’illustration par défaut
            });
        return () => {
            cancelled = true;
        };
    }, [value]);

    const showPreview = value instanceof File || (value === undefined && Boolean(existingUrl));
    const previewUrl = value instanceof File ? (preview?.file === value ? preview.url : undefined) : showPreview ? existingUrl : undefined;

    const handleFilePicked = (e: ChangeEvent<HTMLInputElement>, onChange: (file: File) => void) => {
        const file = e.target.files?.[0];
        // réinitialisation de l’input natif : la valeur du formulaire est le File recadré produit par la modale
        e.target.value = "";
        if (!file) {
            return;
        }
        if (!crop) {
            void validateImageFile(file, { accept, maxFileSizeMo, minResolution }).then((errors) => {
                setFileError(errors.length > 0 ? getImageErrorMessage(tCropModal, errors[0]) : undefined);
                if (errors.length === 0) {
                    onChange(file);
                }
            });
            return;
        }
        originalFileRef.current = file;
        setPendingImage(file);
        cropModal.open();
    };

    const handleEdit = () => {
        // toujours le fichier original ou l’URL serveur, jamais le recadrage déjà produit
        setPendingImage(originalFileRef.current ?? existingUrl);
        cropModal.open();
    };

    return (
        <Controller
            control={control}
            name={name}
            render={({ field: { onChange }, fieldState: { error } }) => {
                const errorMsg = error?.message ?? fileError;

                return (
                    <div className={fr.cx("fr-input-group", !!errorMsg && "fr-input-group--error")}>
                        <label className={fr.cx("fr-label")}>
                            {label}
                            {hintText && <span className={fr.cx("fr-hint-text")}>{hintText}</span>}
                        </label>

                        <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-mt-1w")}>
                            <div className="fr-col-auto">
                                <div ref={wrapperRef} className={classes.thumbnailWrapper} aria-hidden="true">
                                    <img
                                        src={previewUrl ?? placeholder1x1}
                                        alt=""
                                        className={cx(classes.img, isHovered && showPreview && classes.imgTransparent)}
                                    />
                                    {isHovered && showPreview && (
                                        <div className={classes.hoverOverlay}>
                                            {crop && (
                                                <Button
                                                    iconId="fr-icon-edit-line"
                                                    priority="tertiary no outline"
                                                    title={t("edit")}
                                                    size="small"
                                                    type="button"
                                                    onClick={handleEdit}
                                                />
                                            )}
                                            <Button
                                                iconId="fr-icon-delete-line"
                                                priority="tertiary no outline"
                                                title={t("delete")}
                                                size="small"
                                                type="button"
                                                onClick={() => {
                                                    onChange(null);
                                                    originalFileRef.current = undefined;
                                                    setPendingImage(undefined);
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* la modale de recadrage prend le relais dès qu’un fichier est choisi */}
                            {!showPreview && (
                                <div className={fr.cx("fr-col")}>
                                    <Upload
                                        hint={hintText}
                                        state={errorMsg ? "error" : "default"}
                                        stateRelatedMessage={errorMsg}
                                        nativeInputProps={{
                                            accept: acceptToInputAttribute(accept),
                                            onChange: (e) => handleFilePicked(e, onChange),
                                        }}
                                        className={fr.cx("fr-input-group")}
                                    />
                                </div>
                            )}
                        </div>

                        {errorMsg && <p className={fr.cx("fr-error-text")}>{errorMsg}</p>}

                        <ImageCropModal
                            modal={cropModal}
                            title={modalTitle}
                            aspect={aspect}
                            accept={accept}
                            maxFileSizeMo={maxFileSizeMo}
                            minResolution={minResolution}
                            initialImage={pendingImage}
                            onSave={(file) => onChange(file)}
                        />
                    </div>
                );
            }}
        />
    );
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
