import { declareComponentKeys } from "i18nifty";
import { Translations } from "../../../../i18n/types";

const { i18n } = declareComponentKeys<
    | "my_account"
    | { K: "firstname"; P: { firstName: string }; R: JSX.Element }
    | { K: "lastname"; P: { lastName: string }; R: JSX.Element }
    | { K: "username"; P: { userName: string }; R: JSX.Element }
    | { K: "email"; P: { email: string }; R: JSX.Element }
    | { K: "registration_date"; P: { date: string }; R: JSX.Element }
    | "id"
    | "userid_copied"
    | "manage_my_account"
>()("Me");
export type I18n = typeof i18n;

export const MeFrTranslations: Translations<"fr">["Me"] = {
    my_account: "Mon compte",
    firstname: ({ firstName }) => (
        <>
            <strong>Prénom</strong>&nbsp;: {firstName}
        </>
    ),
    lastname: ({ lastName }) => (
        <>
            <strong>Nom</strong>&nbsp;: {lastName}
        </>
    ),
    username: ({ userName }) => (
        <>
            <strong>Pseudo</strong>&nbsp;: {userName}
        </>
    ),
    email: ({ email }) => (
        <>
            <strong>Courriel</strong>&nbsp;: {email}
        </>
    ),
    registration_date: ({ date }) => (
        <>
            <strong>Date d&apos;inscription</strong>&nbsp;: {date}
        </>
    ),
    id: "Identifiant utilisateur",
    userid_copied: "Identifiant utilisateur copié",
    manage_my_account: "Modifier mes informations",
};

export const MeEnTranslations: Translations<"en">["Me"] = {
    my_account: "My account",
    firstname: ({ firstName }) => (
        <>
            <strong>First name</strong>: {firstName}
        </>
    ),
    lastname: ({ lastName }) => (
        <>
            <strong>Name</strong>: {lastName}
        </>
    ),
    username: ({ userName }) => (
        <>
            <strong>Username</strong>&nbsp;: {userName}
        </>
    ),
    email: ({ email }) => (
        <>
            <strong>Email</strong>: {email}
        </>
    ),
    registration_date: ({ date }) => (
        <>
            <strong>Registration date</strong>: {date}
        </>
    ),
    id: "User Id",
    userid_copied: "User Id copied",
    manage_my_account: "Manage my account",
};
