import { declareComponentKeys } from "i18nifty";
import { Translations } from "../../../../i18n/types";

const { i18n } = declareComponentKeys<
    | { K: "community_members"; P: { communityName: string }; R: string }
    | { K: "already_member"; P: { userId: string }; R: string }
    | "rights"
    | "name"
    | "me"
    | "supervisor"
    | "add_user"
    | "remove_user"
    | "confirm_remove"
    | { K: "add_remove_right_title"; P: { right: string }; R: string }
    | "no_necessary_rights"
>()("CommunityMembers");
export type I18n = typeof i18n;

export const CommunityMembersFrTranslations: Translations<"fr">["CommunityMembers"] = {
    community_members: ({ communityName }) => `Membres de ${communityName}`,
    already_member: ({ userId }) => `l’utilisateur ${userId} est déjà membre de cet espace de travail`,
    rights: "Permissions du compte",
    name: "Nom",
    me: "moi",
    supervisor: "superviseur",
    add_user: "Ajouter un utilisateur",
    remove_user: "Supprimer cet utilisateur",
    confirm_remove: "Êtes-vous sûr de vouloir supprimer cet utilisateur ?",
    add_remove_right_title: ({ right }) => `Ajouter/supprimer le droit ${right}`,
    no_necessary_rights: "Vous n'avez pas les droits nécessaires pour visualiser les membres de cet espace de travail.",
};

export const CommunityMembersEnTranslations: Translations<"en">["CommunityMembers"] = {
    community_members: ({ communityName }) => `Members of ${communityName}`,
    already_member: ({ userId }) => `User ${userId} is already a member of this community`,
    rights: "User rights",
    name: "Name",
    me: "me",
    supervisor: "supervisor",
    add_user: "Add user",
    remove_user: "Remove this user",
    confirm_remove: "Are you sure you want to delete this user ?",
    add_remove_right_title: ({ right }) => `Add/remove right ${right} to user`,
    no_necessary_rights: "You do not have the necessary rights to view and modify the users of this community.",
};
