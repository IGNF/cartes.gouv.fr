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
import { declareComponentKeys, useTranslation } from "../../i18n";
import { type Translations } from "../../i18n/types";
import SymfonyRouting from "../../modules/Routing";
import Translator from "../../modules/Translator";
import { jsonFetch } from "../../modules/jsonFetch";
import { routes } from "../../router/router";
import { regex } from "../../utils";

import "../../sass/components/spinner.scss";
import "../../sass/pages/nous_ecrire.scss";

const schema = yup
    .object({
        email_contact: yup
            .string()
            .matches(regex.email, Translator.trans("contact.form.email_contact_error"))
            .required(Translator.trans("contact.form.email_contact_mandatory_error")),
        last_name: yup.string(),
        first_name: yup.string(),
        organization: yup.string(),
        importance: yup.number(),
        message: yup.string().min(10, Translator.trans("contact.form.message_minlength_error")),
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

    const explanation = { __html: Translator.trans("contact.form.explain", { href: routes.docs().href }) };
    const infos = { __html: Translator.trans("contact.form.infos", { href: routes.personal_data().href }) };

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
                    <p>{t("explanation", { linkProps: routes.docs().link })}</p>

                    <p>{t("mandatory_fields")}</p>

                    {error && <Alert title={Translator.trans("contact.form.error_title")} closable description={error} severity="error" />}

                    <Input
                        label={Translator.trans("contact.form.email_contact")}
                        state={errors.email_contact ? "error" : "default"}
                        stateRelatedMessage={errors?.email_contact?.message}
                        hintText="Format attendu : nom@domaine.fr"
                        nativeInputProps={{
                            ...register("email_contact"),
                            defaultValue: user?.email,
                            readOnly: user ? true : false,
                            autoComplete: "email",
                        }}
                    />
                    <Input
                        label={Translator.trans("contact.form.lastName")}
                        nativeInputProps={{
                            ...register("last_name"),
                            defaultValue: user?.lastName,
                            readOnly: user?.lastName ? true : false,
                            autoComplete: "family-name",
                        }}
                    />
                    <Input
                        label={Translator.trans("contact.form.firstName")}
                        nativeInputProps={{
                            ...register("first_name"),
                            defaultValue: user?.firstName,
                            readOnly: user?.firstName ? true : false,
                            autoComplete: "given-name",
                        }}
                    />
                    <Input
                        label={Translator.trans("contact.form.organization")}
                        nativeInputProps={{
                            ...register("organization"),
                            autoComplete: "organization",
                        }}
                    />
                    <Input
                        label={Translator.trans("contact.form.message")}
                        state={errors.message ? "error" : "default"}
                        stateRelatedMessage={errors?.message?.message}
                        textArea={true}
                        nativeTextAreaProps={{
                            ...register("message"),
                            rows: 8,
                            placeholder: Translator.trans("contact.form.message_placeholder"),
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

                    <p dangerouslySetInnerHTML={infos} />

                    <div className={fr.cx("fr-grid-row", "fr-grid-row--right")}>
                        <Button onClick={handleSubmit(onSubmit)}>{Translator.trans("send")}</Button>
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
export const { i18n } = declareComponentKeys<"title" | "mandatory_fields" | { K: "explanation"; P: { linkProps: RegisteredLinkProps }; R: JSX.Element }>()({
    Contact,
});

export const frTranslations: Translations<"fr">["Contact"] = {
    title: "Nous écrire",
    mandatory_fields: "Sauf mention contraire “(optionnel)” dans le label, tous les champs sont obligatoires.",
    explanation: ({ linkProps }) => (
        <>
            {"Vous n'avez pas trouvé la réponse à votre question dans "}
            <a {...linkProps}>{"l'aide en ligne"}</a>
            {" ? Vous souhaitez la configuration d'un espace de travail pour vos besoins ? Utilisez ce formulaire pour nous contacter."}
        </>
    ),
};

export const enTranslations: Translations<"en">["Contact"] = {
    title: "Contact us",
    mandatory_fields: "All fields are mandatory unless label contains the word “optional”",
    explanation: ({ linkProps }) => (
        <>
            {"You did not find the answer to your question in "}
            <a {...linkProps}>{"our documentation"}</a>
            {"? Do you want to configure a workspace for your needs? Use this form to contact us."}
        </>
    ),
};
