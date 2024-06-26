import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/Select";
import { RegisteredLinkProps } from "@codegouvfr/react-dsfr/link";
import { yupResolver } from "@hookform/resolvers/yup";
import { TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";
import { JSX, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";

import AppLayout from "../../../components/Layout/AppLayout";
import LoadingIcon from "../../../components/Utils/LoadingIcon";
import Wait from "../../../components/Utils/Wait";
import { ComponentKey, declareComponentKeys, useTranslation, type Translations } from "../../../i18n/i18n";
import SymfonyRouting from "../../../modules/Routing";
import { jsonFetch } from "../../../modules/jsonFetch";
import { routes } from "../../../router/router";
import { useAuthStore } from "../../../stores/AuthStore";
import { regex } from "../../../utils";

import "../../../sass/pages/nous_ecrire.scss";

const charRange = [10, 8000];

const schema = (t: TranslationFunction<"Contact", ComponentKey>) =>
    yup
        .object({
            email_contact: yup.string().matches(regex.email, t("form.email_contact_error")).required(t("form.email_contact_mandatory_error")),
            last_name: yup.string(),
            first_name: yup.string(),
            organization: yup.string(),
            importance: yup.number(),
            message: yup
                .string()
                .min(charRange[0], t("form.message_minlength_error", { min: charRange[0] }))
                .max(charRange[1], t("form.message_maxlength_error", { max: charRange[1] })),
        })
        .required();

const Contact = () => {
    const { t } = useTranslation({ Contact });
    const { user } = useAuthStore();

    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        getValues: getFormValues,
        watch,
    } = useForm({ resolver: yupResolver(schema(t)) });

    const message = watch("message") ?? "";

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
        <AppLayout documentTitle={t("title")}>
            <div className={fr.cx("fr-grid-row")}>
                <div className={fr.cx("fr-col-12", "fr-col-md-8")}>
                    <h1>{t("title")}</h1>
                    <p>{t("form.explanation", { docsLinkProps: routes.documentation().link })}</p>

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
                            defaultValue: user?.last_name ?? "",
                            readOnly: user?.last_name ? true : false,
                            autoComplete: "family-name",
                        }}
                    />
                    <Input
                        label={t("form.firstName")}
                        nativeInputProps={{
                            ...register("first_name"),
                            defaultValue: user?.first_name ?? "",
                            readOnly: user?.first_name ? true : false,
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
                        className={fr.cx("fr-mb-0")}
                        label={t("form.message")}
                        state={errors.message ? "error" : "default"}
                        stateRelatedMessage={errors?.message?.message}
                        textArea={true}
                        nativeTextAreaProps={{
                            ...register("message"),
                            onPaste: (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
                                e.clipboardData?.getData("text/plain").slice(0, charRange[1]);
                            },
                            maxLength: charRange[1],
                            rows: 8,
                            placeholder: t("form.message_placeholder"),
                        }}
                    />
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--right", "fr-mb-2w", "fr-mt-1w")}>
                        <p className={fr.cx("fr-m-0", "fr-text--xs")}>{t("remaining_characters", { num: charRange[1] - message.length })}</p>
                    </div>
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
                                        <LoadingIcon largeIcon={true} />
                                    </div>
                                    <div className={fr.cx("fr-col-10")}>
                                        <h6 className={fr.cx("fr-h6", "fr-m-0")}>{"Votre message est en cours d’envoi"}</h6>
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
    | { K: "form.message_minlength_error"; P: { min: number }; R: string }
    | { K: "form.message_maxlength_error"; P: { max: number }; R: string }
    | { K: "remaining_characters"; P: { num: number }; R: string }
    | "message_sent"
    | "send"
    | { K: "form.infos"; P: { personalDataLinkProps: RegisteredLinkProps }; R: JSX.Element }
>()({
    Contact,
});

export const contactFrTranslations: Translations<"fr">["Contact"] = {
    title: "Nous écrire",
    mandatory_fields: "Sauf mention contraire “(optionnel)” dans le label, tous les champs sont obligatoires.",
    "form.error_title": "Votre message n'a pas pu être envoyé",
    "form.explanation": ({ docsLinkProps }) => (
        <>
            {"Vous n’avez pas trouvé la réponse à votre question dans "}
            <a {...docsLinkProps}>{"l’aide en ligne"}</a>
            {" ? Vous souhaitez la configuration d’un espace de travail pour vos besoins ? Utilisez ce formulaire pour nous contacter."}
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
    "form.message_minlength_error": ({ min }) => `Veuillez saisir une demande d’au moins ${min} caractères.`,
    "form.message_maxlength_error": ({ max }) => `Votre demande ne peut contenir que ${max} caractères.`,
    remaining_characters: ({ num }) => `${num} caractères restants`,
    message_sent: "Votre message est en cours d’envoi",
    send: "Envoyer",
    "form.infos": ({ personalDataLinkProps }) => (
        <>
            {"Les informations recueillies à partir de ce formulaire sont nécessaires à la gestion de votre demande par les services de l’IGN concernés. "}
            <a {...personalDataLinkProps}>{"En savoir plus sur la gestion des données à caractère personnel"}</a>.
        </>
    ),
};

export const contactEnTranslations: Translations<"en">["Contact"] = {
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
    "form.message_minlength_error": ({ min }) => `Message must be at least ${min} characters.`,
    "form.message_maxlength_error": ({ max }) => `Message cannot exceed ${max} characters.`,
    remaining_characters: ({ num }) => `${num} characters remaining`,
    message_sent: "Your message is being sent",
    send: "Send",
    "form.infos": ({ personalDataLinkProps }) => (
        <>
            {"The information collected from this form is necessary to process your request by the appropriate services at IGN. "}
            <a {...personalDataLinkProps}>{"Learn more about how personal data is stored and used"}</a>.
        </>
    ),
};
