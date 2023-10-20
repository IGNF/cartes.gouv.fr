import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/Select";
import { RegisteredLinkProps } from "@codegouvfr/react-dsfr/link";
import { yupResolver } from "@hookform/resolvers/yup";
import { JSX, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";

import AppLayout from "../../components/Layout/AppLayout";
import Wait from "../../components/Utils/Wait";
import { defaultNavItems } from "../../config/navItems";
import useUser from "../../hooks/useUser";
import { declareComponentKeys, getTranslation, useTranslation, type Translations } from "../../i18n";
import SymfonyRouting from "../../modules/Routing";
import { jsonFetch } from "../../modules/jsonFetch";
import { routes } from "../../router/router";
import { regex } from "../../utils";

import "../../sass/components/spinner.scss";
import "../../sass/pages/nous_ecrire.scss";

const { t } = getTranslation("Contact");
const schema = yup
    .object({
        email_contact: yup.string().matches(regex.email, t("form.email_contact_error")).required(t("form.email_contact_mandatory_error")),
        last_name: yup.string(),
        first_name: yup.string(),
        organization: yup.string(),
        importance: yup.number(),
        message: yup.string().min(10, t("form.message_minlength_error")),
    })
    .required();

const Contact = () => {
    const { t } = useTranslation({ Contact });
    const { user } = useUser();

    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        getValues: getFormValues,
    } = useForm({ resolver: yupResolver(schema) });

    const onSubmit = () => {
        setError(null);
        setIsSending(true);

        const url = SymfonyRouting.generate("cartesgouvfr_contact_contact_us");

        jsonFetch<{ success: boolean }>(url, { method: "POST" }, getFormValues())
            .then((response) => {
                console.log(response);
                if (response?.success === true) {
                    routes.contact_thanks().push();
                }
            })
            .catch((error) => {
                console.log(error);
                setError(error.error);
            })
            .finally(() => setIsSending(false));
    };

    return (
        <AppLayout navItems={defaultNavItems} documentTitle={t("title")}>
            <div className={fr.cx("fr-grid-row")}>
                <div className={fr.cx("fr-col-12", "fr-col-md-8")}>
                    <h1>{t("title")}</h1>
                    <p>{t("form.explanation", { docsLinkProps: routes.docs().link })}</p>

                    <p>{t("mandatory_fields")}</p>

                    {error && <Alert title={t("form.error_title")} closable description={error} severity="error" />}

                    <Input
                        label={t("form.email_contact")}
                        state={errors.email_contact ? "error" : "default"}
                        stateRelatedMessage={errors?.email_contact?.message}
                        hintText={t("form.email_contact_hint")}
                        nativeInputProps={{
                            ...register("email_contact"),
                            defaultValue: user?.email,
                            readOnly: user ? true : false,
                            autoComplete: "email",
                        }}
                    />
                    <Input
                        label={t("form.lastName")}
                        nativeInputProps={{
                            ...register("last_name"),
                            defaultValue: user?.lastName,
                            readOnly: user?.lastName ? true : false,
                            autoComplete: "family-name",
                        }}
                    />
                    <Input
                        label={t("form.firstName")}
                        nativeInputProps={{
                            ...register("first_name"),
                            defaultValue: user?.firstName,
                            readOnly: user?.firstName ? true : false,
                            autoComplete: "given-name",
                        }}
                    />
                    <Input
                        label={t("form.organization")}
                        nativeInputProps={{
                            ...register("organization"),
                            autoComplete: "organization",
                        }}
                    />
                    <Input
                        label={t("form.message")}
                        state={errors.message ? "error" : "default"}
                        stateRelatedMessage={errors?.message?.message}
                        textArea={true}
                        nativeTextAreaProps={{
                            ...register("message"),
                            rows: 8,
                            placeholder: t("form.message_placeholder"),
                        }}
                    />
                    <Select
                        label={"importance"}
                        className={"importance"}
                        nativeSelectProps={{
                            ...register("importance"),
                            defaultValue: "0",
                        }}
                    >
                        <option value="0">0</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                    </Select>

                    <p>{t("form.infos", { personalDataLinkProps: routes.personal_data().link })}</p>

                    <div className={fr.cx("fr-grid-row", "fr-grid-row--right")}>
                        <Button onClick={handleSubmit(onSubmit)}>{t("send")}</Button>
                    </div>

                    {isSending && (
                        <Wait>
                            <div className={fr.cx("fr-container")}>
                                <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                                    <div className={fr.cx("fr-col-2")}>
                                        <i className={fr.cx("fr-icon-refresh-line", "fr-icon--lg") + " icons-spin"} />
                                    </div>
                                    <div className={fr.cx("fr-col-10")}>
                                        <h6 className={fr.cx("fr-h6", "fr-m-0")}>{"Votre message est en cours d'envoi"}</h6>
                                    </div>
                                </div>
                            </div>
                        </Wait>
                    )}
                </div>
            </div>
        </AppLayout>
    );
};

export default Contact;

// traductions
export const { i18n } = declareComponentKeys<
    | "title"
    | "mandatory_fields"
    | "form.error_title"
    | { K: "form.explanation"; P: { docsLinkProps: RegisteredLinkProps }; R: JSX.Element }
    | "form.email_contact"
    | "form.email_contact_hint"
    | "form.email_contact_mandatory_error"
    | "form.email_contact_error"
    | "form.lastName"
    | "form.firstName"
    | "form.organization"
    | "form.message"
    | "form.message_placeholder"
    | "form.message_minlength_error"
    | "send"
    | { K: "form.infos"; P: { personalDataLinkProps: RegisteredLinkProps }; R: JSX.Element }
>()({
    Contact,
});

export const frTranslations: Translations<"fr">["Contact"] = {
    title: "Nous écrire",
    mandatory_fields: "Sauf mention contraire “(optionnel)” dans le label, tous les champs sont obligatoires.",
    "form.error_title": "Votre message n'a pas pu être envoyé",
    "form.explanation": ({ docsLinkProps }) => (
        <>
            {"Vous n'avez pas trouvé la réponse à votre question dans "}
            <a {...docsLinkProps}>{"l'aide en ligne"}</a>
            {" ? Vous souhaitez la configuration d'un espace de travail pour vos besoins ? Utilisez ce formulaire pour nous contacter."}
        </>
    ),
    "form.email_contact": "Votre email",
    "form.email_contact_hint": "Format attendu : nom@domaine.fr",
    "form.email_contact_mandatory_error": "Veuillez saisir une adresse email",
    "form.email_contact_error": "Veuillez saisir une adresse email valide",
    "form.lastName": "Votre nom (optionnel)",
    "form.firstName": "Votre prénom (optionnel)",
    "form.organization": "Votre organisme (optionnel)",
    "form.message": "Votre demande",
    "form.message_placeholder": "Décrivez votre demande en quelques lignes",
    "form.message_minlength_error": "Veuillez saisir une demande d'au moins 10 caractères.",
    send: "Envoyer",
    "form.infos": ({ personalDataLinkProps }) => (
        <>
            {"Les informations recueillies à partir de ce formulaire sont nécessaires à la gestion de votre demande par les services de l'IGN concernés. "}
            <a {...personalDataLinkProps}>{"En savoir plus sur la gestion des données à caractère personnel."}</a>
        </>
    ),
};

export const enTranslations: Translations<"en">["Contact"] = {
    title: "Contact us",
    mandatory_fields: "All fields are mandatory unless label states “optional”",
    "form.error_title": "Your message could not be sent",
    "form.explanation": ({ docsLinkProps }) => (
        <>
            {"You did not find the answer to your question in "}
            <a {...docsLinkProps}>{"our documentation"}</a>
            {"? Do you want to configure a workspace for your needs? Use this form to contact us."}
        </>
    ),
    "form.email_contact": "Email",
    "form.email_contact_hint": "Expected format: name@domain.fr",
    "form.email_contact_mandatory_error": "Enter an email address",
    "form.email_contact_error": "Enter a valid email address",
    "form.lastName": "Last name (optional)",
    "form.firstName": "First name (optional)",
    "form.organization": "Organization (optional)",
    "form.message": "Message",
    "form.message_placeholder": "Describe your request in a few lines",
    "form.message_minlength_error": "Message must be at least 10 caractères.",
    send: "Send",
    "form.infos": ({ personalDataLinkProps }) => (
        <>
            {"The information collected from this form is necessary to process your request by the appropriate services at IGN. "}
            <a {...personalDataLinkProps}>{"Learn more about how personal data is stored and used."}</a>
        </>
    ),
};
