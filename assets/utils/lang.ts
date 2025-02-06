// Langues iso639-2
// https://github.com/haliaeetus/iso-639/blob/master/data/iso_639-2.json
import langs from "@/data/iso_639-2.json";

export type LanguageType = {
    language: string;
    code: string;
};
export const getLanguages = (): LanguageType[] => {
    const languages: LanguageType[] = [];
    for (const def of Object.values(langs)) {
        const code = def["639-2"];
        if (code !== "und") {
            // Cas special pour le francais, le geocatalogue ne connait que "fre"
            languages.push({ language: def.fr[0], code: code === "fra" ? "fre" : code });
        }
    }

    // Supression des doublons
    const nodoubles = [...new Map(languages.map((item) => [item["code"], item])).values()];
    return nodoubles;
};
