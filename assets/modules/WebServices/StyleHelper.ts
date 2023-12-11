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
        for (const uuid in values.style_files) {
            if (values.style_files[uuid].length) {
                numFiles++;
            }
        }
        return numFiles !== 0;
    }

    static format(values: AddStyleFormType, layersMapping: Record<string, string>): FormData {
        const formData = new FormData();

        formData.append("style_name", values.style_name);
        for (const [uuid, list] of Object.entries(values.style_files)) {
            if (!list.length) {
                continue;
            }
            if (uuid in layersMapping) {
                formData.append(`style_files[${layersMapping[uuid]}]`, list[0]);
            } else {
                formData.append("style_files", list[0]);
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
