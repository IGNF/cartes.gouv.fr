import { declareComponentKeys } from "i18nifty";
import { Translations } from "../../../../i18n/types";

const { i18n } = declareComponentKeys<
    | { K: "already_member"; P: { userId: string }; R: string }
    | "rights"
    | "name"
    | "me"
    | "supervisor"
    | "add_member"
    | "remove_member"
    | "confirm_remove"
    | "remove_column"
    | { K: "add_remove_right_title"; P: { right: string }; R: string }
>()("CommunityMembers");
export type I18n = typeof i18n;

export const CommunityMembersFrTranslations: Translations<"fr">["CommunityMembers"] = {
    already_member: ({ userId }) => `L'utilisateur ${userId} est déjà membre de cet espace de travail`,
    rights: "Permissions du compte",
    name: "Nom",
    me: "moi",
    supervisor: "superviseur",
    add_member: "Ajouter un membre",
    remove_member: "Supprimer ce membre",
    confirm_remove: "Êtes-vous sûr de vouloir supprimer ce membre ?",
    remove_column: "Supprimer",
    add_remove_right_title: ({ right }) => `Ajouter/supprimer le droit ${right}`,
};

export const CommunityMembersEnTranslations: Translations<"en">["CommunityMembers"] = {
    already_member: ({ userId }) => `User ${userId} is already a member of this community`,
    rights: "User rights",
    name: "Name",
    me: "me",
    supervisor: "supervisor",
    add_member: "Add member",
    remove_member: "Remove this member",
    confirm_remove: "Are you sure you want to delete this member?",
    remove_column: "Remove",
    add_remove_right_title: ({ right }) => `Add/remove right ${right} to member`,
};
