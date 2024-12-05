import { declareComponentKeys } from "i18nifty";

import { Translations } from "../../../../i18n/types";

const { i18n } = declareComponentKeys<
    "add_user_title" | "user_id" | "rights_granted" | "id_mandatory" | "id_must_be_uuid" | { K: "already_member"; P: { userId: string }; R: string } | "running"
>()("AddMember");
export type I18n = typeof i18n;

export const AddMemberFrTranslations: Translations<"fr">["AddMember"] = {
    add_user_title: "Ajouter un utilisateur",
    user_id: "Identifiant de l’utilisateur",
    rights_granted: "Permissions accordées",
    id_mandatory: "L’identifiant est obligatoire",
    id_must_be_uuid: "L’Identifiant doit être un UUID",
    already_member: ({ userId }) => `l’utilisateur ${userId} est déjà membre de cet espace de travail`,
    running: "Ajout d’utilisateur en cours ...",
};

export const AddMemberEnTranslations: Translations<"en">["AddMember"] = {
    add_user_title: "Add user",
    user_id: "User identifier",
    rights_granted: "Rights granted",
    id_mandatory: "Identifier is mandatory",
    id_must_be_uuid: "Identifier must be an UUID",
    already_member: ({ userId }) => `User ${userId} is already a member of this community`,
    running: "Ajout d’utilisateur running ...",
};
