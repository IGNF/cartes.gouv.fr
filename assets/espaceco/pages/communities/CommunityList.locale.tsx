import { declareComponentKeys } from "i18nifty";

import { CommunityListFilter, Role } from "../../../@types/app_espaceco";
import { Translations } from "../../../i18n/types";

// traductions
const { i18n } = declareComponentKeys<
    | "title"
    | "filters"
    | "open_community"
    | "all_public_communities"
    | "communities_as_member"
    | "pending_membership"
    | { K: "no_result"; P: { filter: CommunityListFilter }; R: string }
    | "community_creation"
    | "create_community"
    | "append_community"
    | { K: "role"; P: { role: Role }; R: string }
>()("EspaceCoCommunityList");
export type I18n = typeof i18n;

export const EspaceCoCommunityListFrTranslations: Translations<"fr">["EspaceCoCommunityList"] = {
    title: "Liste des guichets",
    filters: "Filtres",
    open_community: "Ouvrir",
    all_public_communities: "Tous les guichets publics",
    communities_as_member: "Guichets dont je suis membre",
    pending_membership: "Adhésions en cours",
    no_result: ({ filter }) =>
        filter === "listed"
            ? "Aucun guichet public"
            : filter === "iam_member"
              ? "Vous n'êtes membre d’aucun guichet"
              : filter === "affiliation"
                ? "Aucune affiliation en cours"
                : "[TODO]",
    community_creation: "Création du guichet en cours ...",
    create_community: "Création d'un guichet",
    append_community: "Reprendre la configuration de ce guichet",
    role: ({ role }) =>
        ({
            member: "Membre",
            admin: "Gestionnaire",
            pending: "En attente",
            invited: "Invité",
        })[role],
};

export const EspaceCoCommunityListEnTranslations: Translations<"en">["EspaceCoCommunityList"] = {
    title: "List of communities",
    filters: "Filters",
    open_community: "Access",
    all_public_communities: undefined,
    communities_as_member: undefined,
    pending_membership: undefined,
    no_result: ({ filter }) => `[TODO] ${filter}`,
    community_creation: undefined,
    create_community: undefined,
    append_community: undefined,
    role: ({ role }) =>
        ({
            member: "Member",
            admin: "Manager",
            pending: "Pending",
            invited: "Invited",
        })[role],
};
