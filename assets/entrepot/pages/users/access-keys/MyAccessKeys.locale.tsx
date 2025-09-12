import { fr } from "@codegouvfr/react-dsfr";
import { declareComponentKeys } from "i18nifty";

import { Translations } from "../../../../i18n/types";

const { i18n } = declareComponentKeys<
    | "title"
    | "my_access_keys"
    | "add_access_keys"
    | "my_permissions"
    | { K: "explain_my_keys"; R: JSX.Element }
    | { K: "explain_my_permissions"; R: JSX.Element }
    | "burger_menu"
>()("MyAccessKeys");
export type I18n = typeof i18n;

export const MyAccessKeysFrTranslations: Translations<"fr">["MyAccessKeys"] = {
    title: "Clés d’accès",
    my_access_keys: "Mes clés d’accès",
    add_access_keys: "Créer une clé d’accès",
    my_permissions: "Mes permissions",
    explain_my_keys: (
        <>
            <p>{"Les données publiques sont par défaut disponibles sans création de clé d'accès."}</p>
            <p className={fr.cx("fr-mb-6v")}>
                {
                    "Sur cette page vous pouvez créer des clés d'accès et les utiliser dans vos outils (SIG, site internet, etc.) pour exploiter les permissions qui vous ont été accordées par les producteurs de données."
                }
            </p>
        </>
    ),
    explain_my_permissions: (
        <>
            <p>{"Sur cette page vous pouvez consulter les permissions qui vous ont été octroyées par les producteurs de données."}</p>
            <p className={fr.cx("fr-mb-6v")}>
                {
                    "Chaque permission ne vous permet d'accéder qu'aux services listés et a une date d'expiration. Vous ne pouvez pas modifier vos permissions, c'est le producteur de la donnée uniquement qui peut la modifier, ajouter de nouveaux services ou prolonger sa durée de validité."
                }
            </p>
        </>
    ),
    burger_menu: "Dans cette rubrique",
};

export const MyAccessKeysEnTranslations: Translations<"en">["MyAccessKeys"] = {
    title: "Access keys",
    my_access_keys: "My keys",
    add_access_keys: "Create access key",
    my_permissions: "My permissions",
    explain_my_keys: undefined,
    explain_my_permissions: undefined,
    burger_menu: "In this section",
};
