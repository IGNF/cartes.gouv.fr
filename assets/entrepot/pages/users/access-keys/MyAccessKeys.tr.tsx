import { fr } from "@codegouvfr/react-dsfr";
import { declareComponentKeys } from "i18nifty";

import { Translations } from "../../../../i18n/types";

const { i18n } = declareComponentKeys<"title" | { K: "explain"; R: JSX.Element } | "my_keys" | "permissions">()("MyAccessKeys");
export type I18n = typeof i18n;

export const MyAccessKeysFrTranslations: Translations<"fr">["MyAccessKeys"] = {
    title: "Mes clés d’accès",
    explain: (
        <>
            <p>{"Les données publiques sont par défaut disponibles sans création de clé d’accès."}</p>
            <span>Le cas échéant, cette section vous permet :</span>
            <ul className={fr.cx("fr-mb-2w")}>
                <li>{"De consulter les permissions d’accès aux services de diffusion qui vous ont été octroyées par le producteur de la donnée."}</li>
                <li>
                    {
                        "De créer les clés d’accès et d’exploiter dans vos outils (SIG, site internet, etc.) les permissions qui vous ont été accordées par le producteur de la donnée."
                    }
                </li>
            </ul>
        </>
    ),
    my_keys: "Mes clés",
    permissions: "Permissions",
};

export const MyAccessKeysEnTranslations: Translations<"en">["MyAccessKeys"] = {
    title: "My access keys",
    explain: undefined,
    my_keys: "My keys",
    permissions: "Permissions",
};
