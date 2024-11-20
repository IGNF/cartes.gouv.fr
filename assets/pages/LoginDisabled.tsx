import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";

import AppLayout from "../components/Layout/AppLayout";
import { declareComponentKeys, Translations, useTranslation } from "../i18n/i18n";
import { routes } from "../router/router";

const LoginDisabled = () => {
    const { t } = useTranslation("LoginDisabled");

    return (
        <AppLayout documentTitle={t("title")}>
            <h1>{t("title")}</h1>

            <Alert severity="warning" description={t("description")} closable={false} small />

            <Button linkProps={routes.home().link} className={fr.cx("fr-mt-2v")}>
                {t("back_to_home")}
            </Button>
        </AppLayout>
    );
};

export default LoginDisabled;

export const { i18n } = declareComponentKeys<"title" | "description" | "back_to_home">()({
    LoginDisabled,
});

export const LoginDisabledFrTranslations: Translations<"fr">["LoginDisabled"] = {
    title: "Connexion momentanément désactivée",
    description:
        "L’accès à la partie connectée du site cartes.gouv.fr est temporairement indisponible en raison de travaux de maintenance de la Géoplateforme. Le reste du site reste accessible. Nous vous remercions de votre compréhension.",
    back_to_home: "Revenir à l’accueil",
};

export const LoginDisabledEnTranslations: Translations<"en">["LoginDisabled"] = {
    title: undefined,
    description: undefined,
    back_to_home: undefined,
};
