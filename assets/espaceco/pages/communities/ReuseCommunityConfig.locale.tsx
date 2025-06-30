import { declareComponentKeys } from "@/i18n/i18n";
import { Translations } from "@/i18n/types";

// traductions
const { i18n } = declareComponentKeys<"search_community_label" | "loading_community">()("ReuseCommunityConfig");
export type I18n = typeof i18n;

export const ReuseCommunityConfigFrTranslations: Translations<"fr">["ReuseCommunityConfig"] = {
    search_community_label: "Chercher le guichet dont vous voulez réutiliser la configuration",
    loading_community: "Recherche des informations détaillées de ce guichet",
};

export const ReuseCommunityConfigEnTranslations: Translations<"en">["ReuseCommunityConfig"] = {
    search_community_label: undefined,
    loading_community: undefined,
};
