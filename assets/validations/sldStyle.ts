import { TestContext } from "yup";
import SldStyleParser from "geostyler-sld-parser";

import functions from "../functions";

const test = async (tableName: string, value: FileList, ctx: TestContext) => {
    if (value instanceof FileList && value.length === 0) {
        return ctx.createError({ message: `Veuillez fournir un fichier de style pour la table ${tableName}` });
    }

    const file = value?.[0] ?? undefined;

    // TODO : retravailler la validation du SLD, et éventuellement déplacer la fonction de validation ailleurs
    if (file instanceof File) {
        if (functions.path.getFileExtension(file.name)?.toLowerCase() !== "sld") {
            return ctx.createError({
                message: `L'extension du fichier de style ${file.name} n'est pas correcte. Seule l'extension sld est acceptée.`,
            });
        }

        const styleString = await file.text();
        const sldParser = new SldStyleParser();
        const result = await sldParser.readStyle(styleString);

        if (result?.warnings || result?.unsupportedProperties || result?.errors) {
            return ctx.createError({ message: JSON.stringify(result) });
        }

        if (!result?.output || result?.output?.name === "") {
            return ctx.createError({
                message: `Le fichier de style de la table ${tableName} est invalide. Le champ [name] est invalide`,
            });
        }
    } else {
        return ctx.createError({ message: `Le fichier de style de la table ${tableName} est invalide` });
    }

    return true;
};

const sldStyle = {
    test,
};

export default sldStyle;
