import { createControl } from "react-dsfr-tiptap/dialog";
import { ReactNode } from "react";

type KeywordProps = {
    label: string;
    title: string;
};

const EmailPlannerKeywords: Record<string, KeywordProps> = {
    id: {
        label: "Identifiant",
        title: "Insérer l'identifiant du signalement",
    },
    comment: {
        label: "Commentaire",
        title: "Insérer le commentaire du signalement",
    },
    status: {
        label: "Statut",
        title: "Insérer le statut du signalement",
    },
    openingDate: {
        label: "Date de création",
        title: "Insérer la date de création du signalement",
    },
    updatingDate: {
        label: "Date de modification",
        title: "Insérer la date de modification du signalement",
    },
    closingDate: {
        label: "Date de validation",
        title: "Insérer la date de validation du signalement",
    },
    group: {
        label: "Identifiant du guichet",
        title: "Insérer l'identifiant du guichet",
    },
    author: {
        label: "Auteur",
        title: "Insérer l'identifiant de l'auteur du signalement",
    },
    validator: {
        label: "Validateur",
        title: "Insérer l'identifiant du validateur du signalement",
    },
    departement: {
        label: "Département",
        title: "Insérer le numéro de département",
    },
};

const EmailPlannerControls: (() => ReactNode)[] = Array.from(Object.keys(EmailPlannerKeywords), (keyword) => {
    return createControl({
        buttonProps: { children: EmailPlannerKeywords[keyword].label, title: EmailPlannerKeywords[keyword].title },
        operation: { name: "insertContent", attributes: `_${keyword}_` },
    });
});

export default EmailPlannerControls;
