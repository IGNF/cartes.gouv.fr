import { getTranslation } from "@/i18n/i18n";

const { t: tCommon } = getTranslation("Common");

/** Nom d'affichage d'un entrepôt : libellé sandbox localisé, sinon le nom de la communauté */
export function datastoreLabel(name: string | undefined, isSandbox: boolean): string | undefined {
    return isSandbox ? tCommon("sandbox") : name;
}
