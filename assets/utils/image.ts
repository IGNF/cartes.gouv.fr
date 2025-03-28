export type ImageSize = {
    width: number;
    height: number;
};
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
