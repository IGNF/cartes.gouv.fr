import { declareComponentKeys } from "i18nifty";
import { Translations } from "../../../i18n/types";

const { i18n } = declareComponentKeys<
    | "title"
    | "share_with"
    | "share_with_all_public"
    | "share_with_all_public_hint_text"
    | "share_with_your_community"
    | "share_with_your_community_hint_text"
    | "share_with_value_change_warning_title"
    | "share_with_value_change_warning_desc_restricted_to_public"
    | "share_with_value_change_warning_desc_public_to_restricted"
>()("AccessRestrictions");
export type I18n = typeof i18n;

export const AccessRestrictionsFrTranslations: Translations<"fr">["AccessRestrictions"] = {
    title: "Restrictions d’accès",
    share_with: "A quel public souhaitez-vous que ce service soit accessible ?",
    share_with_all_public: "Tout public",
    share_with_all_public_hint_text: "Le service sera accessible à tout utilisateur sans restriction.",
    share_with_your_community: "Restreint",
    share_with_your_community_hint_text:
        "Vous devrez accorder une permission aux communautés et/ou utilisateurs souhaités pour leur autoriser l’accès. Ils devront par la suite configurer une clé à partir de cette permission pour accéder au service. Une permission va être créée automatiquement votre propre communauté.",
    share_with_value_change_warning_title: "Changement de restrictions d’accès",
    share_with_value_change_warning_desc_restricted_to_public:
        // eslint-disable-next-line quotes
        'Vous êtes sur le point de modifier les restrictions d\'accès de "Restreint" à "Tout public". Le service changera d\'adresse et les permissions que vous aviez configurées seront supprimées définitivement car elles ne seront plus nécessaires.',
    share_with_value_change_warning_desc_public_to_restricted:
        // eslint-disable-next-line quotes
        'Vous êtes sur le point de modifier les restrictions d\'accès de "Tout public" à "Restreint". Le service changera d\'adresse.',
};

export const AccessRestrictionsEnTranslations: Translations<"en">["AccessRestrictions"] = {
    title: undefined,
    share_with: undefined,
    share_with_all_public: undefined,
    share_with_all_public_hint_text: undefined,
    share_with_your_community: undefined,
    share_with_your_community_hint_text: undefined,
    share_with_value_change_warning_title: undefined,
    share_with_value_change_warning_desc_restricted_to_public: undefined,
    share_with_value_change_warning_desc_public_to_restricted: undefined,
};
