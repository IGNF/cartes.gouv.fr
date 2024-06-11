import { declareComponentKeys } from "i18nifty";
import { Translations } from "../../../i18n/i18n";
import { CommunityListFilter } from "../../../@types/app_espaceco";

// traductions
export const { i18n } = declareComponentKeys<
    | "title"
    | "filters"
    | "all_public_communities"
    | "communities_as_member"
    | "pending_membership"
    | { K: "no_result"; P: { filter: CommunityListFilter }; R: string }
    | "search_placeholder"
    | "no_options"
    | "loading"
    | "show_details"
>()("EspaceCoCommunities");

export const EspaceCoCommunitiesFrTranslations: Translations<"fr">["EspaceCoCommunities"] = {
    title: "Liste des guichets",
    filters: "Filtres",
    all_public_communities: "Tous les guichets publics",
    communities_as_member: "Guichets dont je suis membre",
    pending_membership: "Adhésions en cours",
    no_result: ({ filter }) =>
        filter === "public"
            ? "Aucun guichet public"
            : filter === "iam_member"
              ? "Vous n'êtes membre d’aucun guichet"
              : filter === "affiliation"
                ? "Aucune affiliation en cours"
                : "[TODO]",
    search_placeholder: "Recherche d’un guichet par son nom",
    no_options: "Aucun guichet",
    loading: "Recherche en cours ...",
    show_details: "Afficher les détails",
};

export const EspaceCoCommunitiesEnTranslations: Translations<"en">["EspaceCoCommunities"] = {
    title: "List of communities",
    filters: "Filters",
    all_public_communities: undefined,
    communities_as_member: undefined,
    pending_membership: undefined,
    no_result: ({ filter }) => `[TODO] ${filter}`,
    search_placeholder: undefined,
    no_options: undefined,
    loading: undefined,
    show_details: undefined,
};
