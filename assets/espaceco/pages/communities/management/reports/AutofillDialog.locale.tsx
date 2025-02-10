import { declareComponentKeys } from "../../../../../i18n/i18n";
import { Translations } from "../../../../../i18n/types";

// traductions
const { i18n } = declareComponentKeys<
    | { K: "title"; P: { table: string }; R: string }
    | "explain"
    | "attribute"
    | "attribute_hint"
    | "fill_value"
    | "fill_value_hint"
    | "keywords"
    | "configured_attributes"
>()("AutofillDialog");
export type I18n = typeof i18n;

export const AutofillDialogFrTranslations: Translations<"fr">["AutofillDialog"] = {
    title: ({ table }) => `Paramétrage du remplissage automatique pour [${table}]`,
    explain:
        "Ce thème de signalement est lié à une table de données. Vous pouvez donc vous servir des signalements concernant ce thème pour créer, modifier ou supprimer des objets dans la table en un seul clic. Les attributs remplis par l'auteur du signalement seront alors utilisés. En plus de cela, vous pouvez configurer ici le remplissage automatique de certains attributs de l'objet de la table à partir d'informations du signalement qui aura servi à sa création ou sa modification.",
    attribute: "Attribut de la table",
    attribute_hint: "Veuillez sélectionner l'attribut de la table à remplir automatiquement avec des informations du signalement.",
    fill_value: "Valeur de remplissage",
    fill_value_hint: "Cliquez sur les mots clés ci-dessous pour configurer quelles informations du signalement utiliser dans le remplissage automatique.",
    keywords: "Mots clés",
    configured_attributes: "Attributs configurés",
};

export const AutofillDialogEnTranslations: Translations<"en">["AutofillDialog"] = {
    title: ({ table }) => `${table}`,
    explain: undefined,
    attribute: "Table attribute",
    attribute_hint: undefined,
    fill_value: undefined,
    fill_value_hint: undefined,
    keywords: "Keywords",
    configured_attributes: "Configured attributes",
};
