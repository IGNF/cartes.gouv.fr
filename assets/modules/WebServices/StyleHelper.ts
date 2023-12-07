type AddStyleFormType = {
    style_name: string;
    style_files: Record<string, FileList>;
};

// Tag pour les styles
type StyleLayer = {
    name?: string;
    annexe_id: string;
};

type StyleType = {
    name: string;
    current?: boolean;
    layers: StyleLayer[];
};

class StyleHelper {
    // On verifie qu'il y a au moins un fichier de style a ajouter
    static check(values: AddStyleFormType): boolean {
        let numFiles = 0;
        for (const layer in values.style_files) {
            if (values.style_files[layer].length) {
                numFiles++;
            }
        }
        return numFiles !== 0;
    }

    static format(values: AddStyleFormType): FormData {
        const formData = new FormData();

        formData.append("style_name", values.style_name);
        for (const [layer, list] of Object.entries(values.style_files)) {
            if (list.length) {
                formData.append(`style_files[${layer}]`, list[0]);
            }
        }
        return formData;
    }

    /**
     * Retourne le style courant s'il existe
     * @param StyleType[] styles
     * @returns
     */
    static getCurrentStyle(styles: StyleType[]): StyleType | undefined {
        let style;
        for (const s of styles) {
            if (s?.current === true) {
                style = s;
                break;
            }
        }
        return style;
    }
}

export { StyleType, AddStyleFormType, StyleHelper };
