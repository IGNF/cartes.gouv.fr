import Button from "@codegouvfr/react-dsfr/Button";
import { useMemo } from "react";
import { Translations, declareComponentKeys, getTranslation, useTranslation } from "../../i18n/i18n";
import AppLayout from "../../components/Layout/AppLayout";
import { datastoreNavItems } from "../../config/datastoreNavItems";
import functions from "../../functions";
import SymfonyRouting from "../../modules/Routing";
import { useAuthStore } from "../../stores/AuthStore";

const Me = () => {
    const { t: tCommon } = getTranslation("Common");
    const { t } = useTranslation({ Me });
    const user = useAuthStore((state) => state.user);
    const navItems = useMemo(() => datastoreNavItems(), []);

    return (
        <AppLayout documentTitle={t("my_account")} navItems={navItems}>
            <h1>{t("my_account")}</h1>

            {user && (
                <>
                    <p>{t("firstname", { firstName: user.firstName })}</p>
                    <p>{t("lastname", { lastName: user.lastName })}</p>
                    <p>{t("email", { email: user.email })}</p>
                    <p>{t("registration_date", { date: functions.date.format(user.accountCreationDate) })}</p>
                    <p>{t("id", { id: user.id })}</p>
                </>
            )}

            <Button
                linkProps={{
                    href: SymfonyRouting.generate("cartesgouvfr_security_userinfo_edit"),
                    target: "_blank",
                    rel: "noreferrer",
                    title: t("manage_my_account") + " - " + tCommon("new_window"),
                }}
            >
                {t("manage_my_account")}
            </Button>
        </AppLayout>
    );
};

export default Me;

export const { i18n } = declareComponentKeys<
    | "my_account"
    | { K: "firstname"; P: { firstName: string }; R: JSX.Element }
    | { K: "lastname"; P: { lastName: string }; R: JSX.Element }
    | { K: "email"; P: { email: string }; R: JSX.Element }
    | { K: "registration_date"; P: { date: string }; R: JSX.Element }
    | { K: "id"; P: { id: string }; R: JSX.Element }
    | "manage_my_account"
>()({
    Me,
});

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
    email: ({ email }) => (
        <>
            <strong>Adresse email</strong>&nbsp;: {email}
        </>
    ),
    registration_date: ({ date }) => (
        <>
            <strong>Date d&apos;inscription</strong>&nbsp;: {date}
        </>
    ),
    id: ({ id }) => (
        <>
            <strong>Identifiant technique</strong>&nbsp;: {id}
        </>
    ),
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
    id: ({ id }) => (
        <>
            <strong>Technical Id</strong>: {id}
        </>
    ),
    manage_my_account: "Manage my account",
};
