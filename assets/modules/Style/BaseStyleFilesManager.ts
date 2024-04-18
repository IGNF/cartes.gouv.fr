import { Service, StyleForm, StyleFormat } from "../../@types/app";

interface BaseStyleFilesManager {
    readonly service: Service;
    readonly inputFormat: StyleFormat;

    /** Prepare le donnees a envoyer au serveur */
    prepare(values: StyleForm, layersMapping: Record<string, string>): Promise<FormData>;
}

export default BaseStyleFilesManager;
