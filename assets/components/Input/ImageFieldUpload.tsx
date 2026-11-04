import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { Upload } from "@codegouvfr/react-dsfr/Upload";
import { useHover } from "@mantine/hooks";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { tss } from "tss-react";

import { acceptToInputAttribute, type ImageFileValidationError, type ImageSize, validateImageFile } from "@/utils";
import ImageCropModal, { useImageCropModal } from "./ImageCropModal/ImageCropModal";

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
    /** URL d'une image déjà enregistrée (mode édition) */
    existingUrl?: string;
    /** false : le fichier choisi est pris tel quel après validation, sans modale de recadrage (ex : logo) */
    crop?: boolean;
}

const imageErrorMessage = (error: ImageFileValidationError): string => {
    switch (error.code) {
        case "file_too_large":
            return `Le fichier dépasse ${error.maxFileSizeMo} Mo`;
        case "invalid_format":
            return `Formats acceptés : ${error.accept.join(", ")}`;
        case "not_decodable":
            return "Le fichier n’est pas une image lisible";
        case "resolution_too_low":
            return `Résolution minimale : ${error.min.width} × ${error.min.height} px`;
    }
};

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

    const { control } = useFormContext();
    // La valeur du champ est tri-state : undefined (inchangé), null (existant supprimé), File (nouveau recadrage)
    const value = useWatch({ control, name }) as File | null | undefined;

    const cropModal = useImageCropModal();
    // Image envoyée à la modale (fichier original plein format, jamais le recadrage déjà produit).
    // Impérativement un state : muter un ref ne re-rend pas, la modale s'ouvrirait alors sur l'initialImage du rendu précédent (vide à la première sélection).
    const [pendingImage, setPendingImage] = useState<File | string | undefined>(undefined);
    /** Fichier original conservé pour ré-éditer sans perte de qualité */
    const originalFileRef = useRef<File | undefined>(undefined);

    const { hovered: isHovered, ref: wrapperRef } = useHover<HTMLDivElement>();

    // erreur de validation du fichier pris sans recadrage
    const [fileError, setFileError] = useState<string | undefined>(undefined);

    // aperçu du File recadré via URL objet (révoquée au remplacement / démontage)
    const [objectUrl, setObjectUrl] = useState<string | undefined>(undefined);
    useEffect(() => {
        if (value instanceof File) {
            const url = URL.createObjectURL(value);
            setObjectUrl(url);
            return () => {
                URL.revokeObjectURL(url);
                setObjectUrl(undefined);
            };
        } else {
            setObjectUrl(undefined);
        }
    }, [value]);

    // value === null → existant supprimé ; value === undefined → aucun fichier choisi (montre existingUrl)
    const previewUrl = value instanceof File ? objectUrl : value === null ? undefined : existingUrl;
    const showPreview = Boolean(previewUrl);

    const handleFilePicked = (e: ChangeEvent<HTMLInputElement>, onChange: (file: File) => void) => {
        const file = e.target.files?.[0];
        // réinitialisation de l'input natif : la valeur du formulaire est le File recadré produit par la modale
        e.target.value = "";
        if (!file) {
            return;
        }
        if (!crop) {
            validateImageFile(file, { accept, maxFileSizeMo, minResolution }).then((errors) => {
                setFileError(errors.length > 0 ? imageErrorMessage(errors[0]) : undefined);
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
        // On ré-ouvre toujours sur le fichier original (avant recadrage) ou sur l'URL serveur ;
        // jamais sur la valeur du formulaire qui est le recadrage déjà produit.
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
                            {/* Aperçu */}
                            <div className="fr-col-auto">
                                <div ref={wrapperRef} className={classes.thumbnailWrapper} aria-hidden="true">
                                    <img
                                        src={showPreview ? previewUrl : placeholder1x1}
                                        alt=""
                                        className={cx(classes.img, isHovered && showPreview && classes.imgTransparent)}
                                    />
                                    {isHovered && showPreview && (
                                        <div className={classes.hoverOverlay}>
                                            {crop && (
                                                <Button
                                                    iconId="fr-icon-edit-line"
                                                    priority="tertiary no outline"
                                                    title="Modifier l’image"
                                                    size="small"
                                                    type="button"
                                                    onClick={handleEdit}
                                                />
                                            )}
                                            <Button
                                                iconId="fr-icon-delete-line"
                                                priority="tertiary no outline"
                                                title="Supprimer l’image"
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

                            {/* Champ de sélection : la modale de recadrage prend le relais dès qu'un fichier est choisi */}
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
                            onSave={(file) => {
                                onChange(file);
                            }}
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
