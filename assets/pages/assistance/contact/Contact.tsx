import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/Select";
import { yupResolver } from "@hookform/resolvers/yup";
import { TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";

import LoadingIcon from "../../../components/Utils/LoadingIcon";
import Wait from "../../../components/Utils/Wait";
import { useTranslation } from "../../../i18n/i18n";
import { ComponentKey } from "../../../i18n/types";
import SymfonyRouting from "../../../modules/Routing";
import { jsonFetch } from "../../../modules/jsonFetch";
import { routes } from "../../../router/router";
import { useAuthStore } from "../../../stores/AuthStore";
import { regex } from "../../../utils";
import Main from "../../../components/Layout/Main";
import { useAlertStore } from "../../../stores/AlertStore";
import { useAlert } from "../../../hooks/useAlert";

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
    const alert = useAlertStore(({ alerts }) => alerts.find((alert) => alert.visibility.homepage));
    const alertProps = useAlert(alert);

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
                if (response?.success === true) {
                    routes.contact_confirmation().push();
                }
            })
            .catch((error) => {
                console.log(error);
                setError(error.error);
            })
            .finally(() => setIsSending(false));
    };

    return (
        <Main title={t("title")} infoBannerMsg={alertProps?.title}>
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
        </Main>
    );
};

export default Contact;
