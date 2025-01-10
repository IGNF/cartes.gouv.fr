import { Role } from "../../../../@types/app_espaceco";
import { declareComponentKeys } from "../../../../i18n/i18n";
import { Translations } from "../../../../i18n/types";

const { i18n } = declareComponentKeys<
    | "fetch_members_failed"
    | "fetch_affiliate_members_failed"
    | "update_role_failed"
    | "update_grids_failed"
    | "add_members_failed"
    | "remove_member_failed"
    | "back_to_list"
    | "loading_members"
    | "loading_membership_requests"
    | { K: "membership_requests"; P: { count: number }; R: string }
    | "adding_members"
    | "username_header"
    | "name_header"
    | "status_header"
    | "grids_header"
    | { K: "role"; P: { role: Role }; R: string }
    | "date_header"
    | "updating_role"
    | "updating_grids"
    | { K: "removing_action"; P: { action: "remove" | "reject" | undefined }; R: string }
    | "confirm_remove"
    | "accept"
    | "accept_title"
    | "reject"
    | "reject_title"
    | "remove_title"
    | "manage_grids"
    | "invite"
>()("EscoCommunityMembers");
export type I18n = typeof i18n;

export const EscoCommunityMembersFrTranslations: Translations<"fr">["EscoCommunityMembers"] = {
    fetch_members_failed: "La récupération des membres du guichet a échoué",
    fetch_affiliate_members_failed: "La récupération des demandes d'affiliation pour ce guichet a échoué",
    update_role_failed: "La mise à jour du rôle de ce membre a échoué",
    update_grids_failed: "La mise à jour des emprises de ce membre a échoué",
    add_members_failed: "L'ajout de nouveaux membres a échoué",
    remove_member_failed: "La suppression d'un membre a échoué",
    back_to_list: "Retour à la liste des guichets",
    loading_members: "Chargement des membres du guichet ...",
    loading_membership_requests: "Chargement des demandes d’affiliation ...",
    membership_requests: ({ count }) => `Demandes d’affiliation (${count})`,
    adding_members: "Ajout de nouveaux membres en cours ...",
    username_header: "Nom de l'utilisateur",
    name_header: "Nom, prénom",
    status_header: "Statut",
    grids_header: "Emprises individuelles",
    role: ({ role }) => {
        switch (role) {
            case "admin":
                return "Gestionnaire";
            case "member":
                return "Membre";
            case "pending":
                return "En attente de demande d'affiliation";
            case "invited":
                return "Invité";
        }
    },
    date_header: "Date de la demande",
    updating_role: "Mise à jour du rôle de l'utilisateur en cours ...",
    updating_grids: "Mise à jour des emprises de l'utilisateur en cours ...",
    removing_action: ({ action }) => {
        switch (action) {
            case "remove":
                return "Suppression de l'utilisateur en cours ...";
            case "reject":
                return "Rejet de la demande d'affiliation en cours ...";
            default:
                return "";
        }
    },
    confirm_remove: "Êtes-vous sûr de vouloir supprimer cet utilisateur ?",
    accept: "Accepter",
    accept_title: "Accepter la demande",
    reject: "Rejeter",
    reject_title: "Rejeter la demande",
    remove_title: "Supprimer l'utilisateur",
    manage_grids: "Gérer",
    invite: "Inviter des membres",
};

export const EscoCommunityMembersEnTranslations: Translations<"en">["EscoCommunityMembers"] = {
    fetch_members_failed: undefined,
    fetch_affiliate_members_failed: undefined,
    update_role_failed: undefined,
    update_grids_failed: undefined,
    add_members_failed: undefined,
    remove_member_failed: undefined,
    back_to_list: undefined,
    loading_members: undefined,
    loading_membership_requests: undefined,
    membership_requests: ({ count }) => `Membership requests (${count})`,
    adding_members: "Adding new members ...",
    username_header: "username",
    name_header: undefined,
    status_header: "Status",
    grids_header: undefined,
    role: ({ role }) => `${role}`,
    date_header: undefined,
    updating_role: undefined,
    updating_grids: undefined,
    removing_action: ({ action }) => `${action}`,
    confirm_remove: undefined,
    accept: undefined,
    accept_title: undefined,
    reject: undefined,
    reject_title: undefined,
    remove_title: undefined,
    manage_grids: "Manage",
    invite: undefined,
};
