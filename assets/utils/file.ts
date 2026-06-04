export async function readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("Impossible de lire le fichier sélectionné"));
        reader.onabort = () => reject(new Error("Lecture du fichier annulée"));
        reader.onload = (e) => {
            if (typeof e.target?.result === "string") {
                resolve(e.target.result);
            } else {
                reject(new Error("Format de fichier non supporté"));
            }
        };
        reader.readAsText(file);
    });
}
