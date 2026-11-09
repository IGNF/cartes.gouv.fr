import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import Range from "@codegouvfr/react-dsfr/Range";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { Upload } from "@codegouvfr/react-dsfr/Upload";
import { ChangeEvent, ReactNode, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { tss } from "tss-react";
import { TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";

import { useLang, useTranslation } from "@/i18n/i18n";
import { ComponentKey } from "@/i18n/types";
import {
    acceptToInputAttribute,
    cropImageToFile,
    fileToDataUrl,
    urlToImageFile,
    validateImageFile,
    type ImageFileValidationError,
    type ImageSize,
} from "@/utils";

import placeholder1x1 from "@/img/placeholder.1x1.png";

/** Largeur du cadre de recadrage (cf. maquette Figma) */
const CROP_VIEWPORT_WIDTH = 212;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const RANGE_STEP = 0.01;
const ZOOM_BUTTON_STEP = 0.25;

export type ImageCropModalInstance = ReturnType<typeof createModal>;

/** Crée une instance de modale à id unique et stable, utilisable plusieurs fois sur une même page */
export function useImageCropModal(): ImageCropModalInstance {
    // useId() React 19 contient des caractères « » invalides dans un sélecteur CSS (le JS DSFR construit des sélecteurs depuis l’id)
    const reactId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
    return useMemo(() => createModal({ id: `image-crop-${reactId}`, isOpenedByDefault: false }), [reactId]);
}

export const getImageErrorMessage = (t: TranslationFunction<"ImageCropModal", ComponentKey>, error: ImageFileValidationError): string => {
    switch (error.code) {
        case "file_too_large":
            return t("error.fileTooLarge", { maxSizeMb: error.maxFileSizeMb });
        case "invalid_format":
            return t("error.invalidFormat");
        case "resolution_too_low":
            return t("error.resolutionTooLow", { width: error.min.width, height: error.min.height });
        case "not_decodable":
            return t("error.notDecodable");
    }
};

type ImageSource = { file?: File; url: string };

const sourceFromInitialImage = (initialImage?: File | string): ImageSource | undefined =>
    typeof initialImage === "string" ? { url: initialImage } : undefined;

interface ImageCropModalProps {
    /** Instance créée par le parent via useImageCropModal() ; le parent déclenche modal.open() */
    modal: ImageCropModalInstance;
    title: ReactNode;
    /** Ratio largeur/hauteur du cadre de recadrage */
    aspect?: number;
    /** Extensions acceptées, sans point */
    accept?: string[];
    maxFileSizeMb?: number;
    minResolution?: ImageSize;
    /**
     * Image préchargée à l’ouverture : File (sélection dans le champ parent, ré-édition)
     * ou URL (image déjà enregistrée). Le parent doit changer la référence pour recharger.
     */
    initialImage?: File | string;
    /** Reçoit le fichier recadré et le fichier source effectivement recadré */
    onSave: (file: File, sourceFile: File) => void;
}

export default function ImageCropModal(props: ImageCropModalProps) {
    const { modal, title, aspect = 1, accept = ["jpg", "jpeg", "png"], maxFileSizeMb = 2, minResolution, initialImage, onSave } = props;
    const { classes } = useStyles();
    const { t } = useTranslation("ImageCropModal");
    const { t: tCommon } = useTranslation("Common");
    const { lang } = useLang();

    const [source, setSource] = useState<ImageSource | undefined>(() => sourceFromInitialImage(initialImage));
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(MIN_ZOOM);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area>();
    const [validationErrors, setValidationErrors] = useState<ImageFileValidationError[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const replaceSource = useCallback((newSource?: ImageSource) => {
        setSource(newSource);
        setCrop({ x: 0, y: 0 });
        setZoom(MIN_ZOOM);
        setCroppedAreaPixels(undefined);
    }, []);

    // nouvelle image fournie par le parent : réinitialisation pendant le rendu, sans effet
    const [prevInitialImage, setPrevInitialImage] = useState(initialImage);
    if (initialImage !== prevInitialImage) {
        setPrevInitialImage(initialImage);
        replaceSource(sourceFromInitialImage(initialImage));
        setValidationErrors([]);
    }

    // contraintes lues à l’appel : un littéral inline du parent ne doit pas relancer le chargement
    const constraintsRef = useRef({ accept, maxFileSizeMb, minResolution });
    useEffect(() => {
        constraintsRef.current = { accept, maxFileSizeMb, minResolution };
    });

    // seul le dernier chargement lancé écrit l’état
    const loadIdRef = useRef(0);
    const loadFile = useCallback(
        async (file: File) => {
            const loadId = ++loadIdRef.current;
            let errors = await validateImageFile(file, constraintsRef.current);
            let url: string | undefined;
            if (errors.length === 0) {
                try {
                    url = await fileToDataUrl(file);
                } catch {
                    errors = [{ code: "not_decodable" }];
                }
            }
            if (loadId !== loadIdRef.current) {
                return;
            }
            setValidationErrors(errors);
            if (url !== undefined) {
                replaceSource({ file, url });
            }
        },
        [replaceSource]
    );

    // fichier fourni par le parent : validation asynchrone, l’état n’est écrit qu’à la résolution
    useEffect(() => {
        if (initialImage instanceof File) {
            void loadFile(initialImage);
        } else {
            // invalide un chargement encore en cours pour l’image précédente
            loadIdRef.current += 1;
        }
    }, [initialImage, loadFile]);

    // les erreurs de validation ne survivent pas à une fermeture de la modale
    useIsModalOpen(modal, {
        onConceal: () => setValidationErrors([]),
    });

    const handleFilePicked = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            void loadFile(file);
        }
    };

    const handleSave = async () => {
        if (!source || !croppedAreaPixels || isSaving) {
            return;
        }
        setIsSaving(true);
        try {
            // source connue uniquement par URL (mode édition) : téléchargement préalable
            const sourceFile = source.file ?? (await urlToImageFile(source.url));
            const cropped = await cropImageToFile(sourceFile, croppedAreaPixels, { maxFileSizeMb });
            onSave(cropped, sourceFile);
            modal.close();
        } catch (err) {
            const isTooLarge = err instanceof Error && "code" in err && err.code === "file_too_large";
            setValidationErrors([isTooLarge ? { code: "file_too_large", maxFileSizeMb } : { code: "not_decodable" }]);
        } finally {
            setIsSaving(false);
        }
    };

    const formatsList = new Intl.ListFormat(lang, { style: "long", type: "conjunction" }).format(accept);
    const canSave = source !== undefined && croppedAreaPixels !== undefined && validationErrors.length === 0 && !isSaving;

    return createPortal(
        <modal.Component
            title={title}
            titleAs="h4"
            size="medium"
            buttons={[
                {
                    children: tCommon("cancel"),
                    priority: "secondary",
                    doClosesModal: true,
                    nativeButtonProps: { type: "button" },
                },
                {
                    children: t("save"),
                    priority: "primary",
                    doClosesModal: false,
                    disabled: !canSave,
                    onClick: () => void handleSave(),
                    nativeButtonProps: { type: "button" },
                },
            ]}
            concealingBackdrop={false}
        >
            <div className={classes.columns}>
                <div className={classes.cropColumn}>
                    <div className={classes.cropContainer} style={{ height: CROP_VIEWPORT_WIDTH / aspect }} aria-hidden="true">
                        {source ? (
                            <Cropper
                                image={source.url}
                                crop={crop}
                                zoom={zoom}
                                minZoom={MIN_ZOOM}
                                maxZoom={MAX_ZOOM}
                                aspect={aspect}
                                objectFit="cover"
                                showGrid={false}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={(_area, areaPixels) => setCroppedAreaPixels(areaPixels)}
                            />
                        ) : (
                            <img src={placeholder1x1} alt="" className={classes.placeholderImg} />
                        )}
                    </div>
                    <div className={classes.zoomRow}>
                        <Button
                            iconId="fr-icon-subtract-line"
                            priority="tertiary no outline"
                            size="small"
                            type="button"
                            title={t("zoom.out")}
                            disabled={!source || zoom <= MIN_ZOOM}
                            onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_BUTTON_STEP))}
                        />
                        <Range
                            classes={{
                                label: fr.cx("fr-sr-only"),
                                output: fr.cx("fr-sr-only"),
                                rangeWrapper: classes.rangeWrapper,
                            }}
                            label={t("zoom.label")}
                            small
                            step={RANGE_STEP}
                            hideMinMax
                            min={MIN_ZOOM}
                            max={MAX_ZOOM}
                            disabled={!source}
                            nativeInputProps={{
                                value: zoom,
                                onChange: (e) => setZoom(Number(e.target.value)),
                            }}
                        />
                        <Button
                            iconId="fr-icon-add-line"
                            priority="tertiary no outline"
                            size="small"
                            type="button"
                            title={t("zoom.in")}
                            disabled={!source || zoom >= MAX_ZOOM}
                            onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_BUTTON_STEP))}
                        />
                    </div>
                    <p className={cx(fr.cx("fr-text--xs", "fr-mt-1v", "fr-mb-0"), classes.dragHint)}>{t("dragHint")}</p>
                </div>

                <div className={classes.uploadColumn}>
                    <Upload
                        label={t("addFile")}
                        hint={t("fileHint", { formats: formatsList, maxSizeMb: maxFileSizeMb })}
                        state={validationErrors.length > 0 ? "error" : "default"}
                        stateRelatedMessage={validationErrors.length > 0 ? getImageErrorMessage(t, validationErrors[0]) : undefined}
                        nativeInputProps={{
                            accept: acceptToInputAttribute(accept),
                            onChange: handleFilePicked,
                        }}
                    />
                </div>
            </div>
        </modal.Component>,
        document.body
    );
}

const useStyles = tss.withName("ImageCropModal").create({
    columns: {
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-start",
        gap: fr.spacing("4w"),
    },
    cropColumn: {
        width: `${CROP_VIEWPORT_WIDTH}px`,
        flexShrink: 0,
    },
    uploadColumn: {
        flex: "1 1 240px",
        minWidth: 0,
    },
    cropContainer: {
        position: "relative",
        width: "100%",
        backgroundColor: fr.colors.decisions.background.alt.grey.default,
    },
    placeholderImg: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
    },
    zoomRow: {
        display: "flex",
        alignItems: "center",
        gap: fr.spacing("1v"),
        width: "100%",
        marginTop: fr.spacing("4v"),
    },
    dragHint: {
        textAlign: "center",
        color: fr.colors.decisions.text.mention.grey.default,
    },
    rangeWrapper: {
        ["&::before, &::after"]: {
            backgroundImage: "none !important",
            top: "0.25rem !important",
        },
    },
});
