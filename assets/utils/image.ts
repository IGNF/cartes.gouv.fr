import type { Area } from "react-easy-crop";

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

// L’URL objet est révoquée avant que la promesse se termine
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

/** Rejette la promesse si le fichier n’est pas une image décodable */
export const getImageSize = async (image: File): Promise<ImageSize> => {
    const img = await loadImage(image);
    return { width: img.naturalWidth, height: img.naturalHeight };
};

// URL data plutôt qu’URL objet : rien à révoquer, compatible avec le double montage du StrictMode
export const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => (typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Lecture du fichier impossible")));
        reader.onerror = () => reject(reader.error ?? new Error("Lecture du fichier impossible"));
        reader.readAsDataURL(file);
    });
};

/** Convertit une liste d’extensions en valeur d’attribut accept d’un input file (".jpg, .jpeg, .png") */
export const acceptToInputAttribute = (accept: string[]): string => accept.map((ext) => `.${ext}`).join(", ");

/** Retourne des codes d’erreur (sans i18n) à traduire par le composant appelant */
export const validateImageFile = async (file: File, constraints: ImageFileConstraints): Promise<ImageFileValidationError[]> => {
    const { accept, maxFileSizeMo, minResolution } = constraints;
    const errors: ImageFileValidationError[] = [];

    if (file.size / (1024 * 1024) > maxFileSizeMo) {
        errors.push({ code: "file_too_large", maxFileSizeMo });
    }

    const extension = file.name.includes(".") ? (file.name.split(".").pop() ?? "").toLowerCase() : "";
    // le type mime peut être vide selon le navigateur/OS : on ne le vérifie que s’il est renseigné
    if (!extension || !accept.includes(extension) || (file.type !== "" && !file.type.startsWith("image/"))) {
        errors.push({ code: "invalid_format", accept });
        return errors;
    }

    let size: ImageSize;
    try {
        size = await getImageSize(file);
    } catch {
        errors.push({ code: "not_decodable" });
        return errors;
    }
    if (size.width === 0 || size.height === 0) {
        errors.push({ code: "not_decodable" });
        return errors;
    }

    if (minResolution && (size.width < minResolution.width || size.height < minResolution.height)) {
        errors.push({ code: "resolution_too_low", min: minResolution, actual: size });
    }

    return errors;
};

const MIME_TO_EXTENSION: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
};

const buildCroppedFileName = (originalName: string, mime: string): string => {
    const dot = originalName.lastIndexOf(".");
    const base = dot > 0 ? originalName.slice(0, dot) : originalName;
    return `${base}.${MIME_TO_EXTENSION[mime] ?? "png"}`;
};

/**
 * Recadre une image via canvas (SVG rasterisé en PNG) et retourne un nouveau File.
 *
 * @param area zone de recadrage en pixels naturels de l’image (croppedAreaPixels de react-easy-crop)
 * @param options.maxFileSizeMo si fourni, lève une erreur `{ code: "file_too_large" }` si le fichier produit dépasse cette taille
 * @param options.outputSize taille cible (l’image n’est jamais agrandie)
 */
export const cropImageToFile = async (source: File, area: Area, options?: { outputSize?: ImageSize; maxFileSizeMo?: number }): Promise<File> => {
    const img = await loadImage(source);

    // jamais d’agrandissement : la sortie est bornée par la zone de recadrage
    const targetWidth = Math.round(Math.min(area.width, options?.outputSize?.width ?? area.width));
    const targetHeight = Math.round(targetWidth * (area.height / area.width));

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
        throw new Error("Canvas 2D non disponible");
    }
    ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, targetWidth, targetHeight);

    // jpeg conservé en jpeg, tout le reste (png, svg rasterisé...) exporté en png
    const mime = source.type === "image/jpeg" ? "image/jpeg" : "image/png";

    const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Échec de l’export canvas"))), mime, 0.92);
    });

    const croppedFile = new File([blob], buildCroppedFileName(source.name, mime), { type: mime });

    // le ré-encodage PNG peut dépasser la limite d’origine
    const maxFileSizeMo = options?.maxFileSizeMo;
    if (maxFileSizeMo !== undefined && croppedFile.size / (1024 * 1024) > maxFileSizeMo) {
        throw Object.assign(new Error("Fichier trop volumineux après recadrage"), { code: "file_too_large", maxFileSizeMo });
    }

    return croppedFile;
};

/** Échoue si la ressource est inaccessible ou bloquée par CORS */
export const urlToImageFile = async (url: string): Promise<File> => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Téléchargement de l’image impossible : ${url}`);
    }
    const blob = await response.blob();
    const name = new URL(url, window.location.origin).pathname.split("/").pop() || "image";
    return new File([blob], name, { type: blob.type || "image/png" });
};
