import type { Area } from "react-easy-crop";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type ImageSize = {
    width: number;
    height: number;
};

export type ImageFileValidationError =
    | { code: "file_too_large"; maxFileSizeMo: number }
    | { code: "invalid_format"; accept: string[] }
    | { code: "not_decodable" }
    | { code: "resolution_too_low"; min: ImageSize; actual: ImageSize };

export interface ImageFileConstraints {
    /** Extensions acceptées, sans point (ex : ["jpg", "jpeg", "png", "svg"]) */
    accept: string[];
    /** Taille maximale en Mo */
    maxFileSizeMo: number;
    /** Résolution minimale en pixels */
    minResolution?: ImageSize;
}

// ─────────────────────────────────────────────────────────────────────────────
// Chargement d'image
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Charge un fichier image dans un élément <img> via une URL objet temporaire.
 * L'URL est révoquée avant la résolution ou le rejet de la promesse.
 */
const loadImage = (file: File): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error(`Image non décodable : ${file.name}`));
        };
        img.src = url;
    });
};

/**
 * Mesure la taille naturelle d'un fichier image.
 * Retourne null si le fichier n'est pas décodable ou si les dimensions sont nulles.
 */
const measureImage = async (file: File): Promise<ImageSize | null> => {
    return new Promise((resolve) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img.naturalWidth > 0 && img.naturalHeight > 0 ? { width: img.naturalWidth, height: img.naturalHeight } : null);
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve(null);
        };
        img.src = url;
    });
};

/**
 * Retourne les dimensions naturelles d'une image à partir d'un File.
 * Compatible avec espaceco/CommunityLogo (utilise FileReader en interne).
 * @deprecated Préférer measureImage pour les nouveaux usages.
 */
export const getImageSize = async (image: File): Promise<ImageSize> => {
    return new Promise((resolve, reject) => {
        try {
            const fileReader = new FileReader();
            fileReader.onload = () => {
                const img = new Image();
                img.onload = () => {
                    resolve({ width: img.width, height: img.height });
                };
                if (typeof fileReader.result === "string") {
                    img.src = fileReader.result;
                }
            };
            fileReader.readAsDataURL(image);
        } catch (e) {
            reject(e);
        }
    });
};

// ─────────────────────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────────────────────

/** Convertit une liste d'extensions en valeur d'attribut accept d'un input file (".jpg, .jpeg, .png") */
export const acceptToInputAttribute = (accept: string[]): string => accept.map((ext) => `.${ext}`).join(", ");

/**
 * Valide un fichier image : taille, format, décodabilité et résolution minimale.
 * Retourne des codes d'erreur (sans i18n) à traduire par le composant appelant.
 */
export const validateImageFile = async (file: File, constraints: ImageFileConstraints): Promise<ImageFileValidationError[]> => {
    const { accept, maxFileSizeMo, minResolution } = constraints;
    const errors: ImageFileValidationError[] = [];

    if (file.size / (1024 * 1024) > maxFileSizeMo) {
        errors.push({ code: "file_too_large", maxFileSizeMo });
    }

    const extension = file.name.includes(".") ? file.name.split(".").pop()!.toLowerCase() : "";
    // le type mime peut être vide selon le navigateur/OS : on ne le vérifie que s'il est renseigné
    if (!extension || !accept.includes(extension) || (file.type !== "" && !file.type.startsWith("image/"))) {
        errors.push({ code: "invalid_format", accept });
        return errors; // inutile de tenter de décoder un format refusé
    }

    const size = await measureImage(file);
    if (size === null) {
        errors.push({ code: "not_decodable" });
        return errors;
    }

    if (minResolution && (size.width < minResolution.width || size.height < minResolution.height)) {
        errors.push({ code: "resolution_too_low", min: minResolution, actual: size });
    }

    return errors;
};

// ─────────────────────────────────────────────────────────────────────────────
// Transformation / recadrage
// ─────────────────────────────────────────────────────────────────────────────

/** Correspondance MIME → extension pour le nom du fichier de sortie */
const MIME_TO_EXTENSION: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
};

/** Construit le nom du fichier recadré : base du nom d'origine + extension normalisée au type de sortie */
const buildCroppedFileName = (originalName: string, mime: string): string => {
    const dot = originalName.lastIndexOf(".");
    const base = dot > 0 ? originalName.slice(0, dot) : originalName;
    return `${base}.${MIME_TO_EXTENSION[mime] ?? "png"}`;
};

/**
 * Recadre une image via canvas et retourne un nouveau File.
 *
 * @param area zone de crop en pixels naturels de l'image (croppedAreaPixels de react-easy-crop)
 * @param maxFileSizeMo si fourni, une erreur est levée si le fichier produit dépasse cette taille
 * @param outputSize taille cible optionnelle (l'image n'est jamais agrandie)
 */
const cropRasterToFile = async (source: File, area: Area, maxFileSizeMo?: number, outputSize?: ImageSize): Promise<File> => {
    const img = await loadImage(source);

    // jamais d'upscale : la sortie est bornée par la zone de crop
    const targetWidth = Math.round(Math.min(area.width, outputSize?.width ?? area.width));
    const targetHeight = Math.round(targetWidth * (area.height / area.width));

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
        throw new Error("Canvas 2D non disponible");
    }
    ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, targetWidth, targetHeight);

    // jpeg conservé en jpeg, tout le reste (png, svg rasterisé…) exporté en png
    const mime = source.type === "image/jpeg" ? "image/jpeg" : "image/png";

    const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Échec de l'export canvas"))), mime, 0.92);
    });

    const croppedFile = new File([blob], buildCroppedFileName(source.name, mime), { type: mime });

    // vérification a posteriori : le ré-encodage PNG peut dépasser la limite d'origine
    if (maxFileSizeMo !== undefined && croppedFile.size / (1024 * 1024) > maxFileSizeMo) {
        throw Object.assign(new Error("Fichier trop volumineux après recadrage"), { code: "file_too_large", maxFileSizeMo });
    }

    return croppedFile;
};

/** Recadre une image (SVG rasterisé en PNG par le canvas) et retourne un nouveau File. Voir cropRasterToFile. */
export const cropImageToFile = async (source: File, area: Area, options?: { outputSize?: ImageSize; maxFileSizeMo?: number }): Promise<File> => {
    return cropRasterToFile(source, area, options?.maxFileSizeMo, options?.outputSize);
};

/** Télécharge une image depuis une URL et la convertit en File (échoue si la ressource est inaccessible ou bloquée par CORS) */
export const urlToImageFile = async (url: string): Promise<File> => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Téléchargement de l'image impossible : ${url}`);
    }
    const blob = await response.blob();
    const pathSegment = new URL(url, window.location.origin).pathname.split("/").pop() ?? "";
    const name = pathSegment || "image";
    return new File([blob], name, { type: blob.type || "image/png" });
};
