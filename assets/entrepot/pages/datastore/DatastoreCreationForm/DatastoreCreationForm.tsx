import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { yupResolver } from "@hookform/resolvers/yup";
import { FC, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";

import Wait from "../../../../components/Utils/Wait";
import { useTranslation } from "../../../../i18n";
import SymfonyRouting from "../../../../modules/Routing";
import { jsonFetch } from "../../../../modules/jsonFetch";
import { routes } from "../../../../router/router";
import { removeDiacritics } from "../../../../utils";
import Main from "../../../../components/Layout/Main";

const DatastoreCreationForm: FC = () => {
    const { t } = useTranslation("DatastoreCreationForm");
    const { t: tCommon } = useTranslation("Common");

    const schema = yup
        .object({
            name: yup.string().required(t("form.name_error")).min(10, t("form.name_minlength_error")),
            technical_name: yup.string().required(),
            information: yup.string(),
        })
        .required();

    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState(null);

    const {
        register,
        getValues: getFormValues,
        setValue: setFormValue,
        formState: { errors },
        watch,
        handleSubmit,
    } = useForm({ resolver: yupResolver(schema), mode: "onChange" });

    const name = watch("name");
    useEffect(() => {
        if (name) {
            const nice = removeDiacritics(name.toLowerCase()).replace(/ /g, "_");
            setFormValue("technical_name", nice);
        }
    }, [name, setFormValue]);

    const onSubmit = () => {
        setError(null);
        setIsSending(true);

        const url = SymfonyRouting.generate("cartesgouvfr_contact_datastore_create_request");

        jsonFetch<{ success: boolean }>(url, { method: "POST" }, getFormValues())
            .then((response) => {
                if (response?.success === true) {
                    routes.datastore_create_request_confirm().push();
                }
            })
            .catch((error) => {
                setError(error.error);
            })
            .finally(() => setIsSending(false));
    };

    return (
        <Main title={t("title")}>
            <div className={fr.cx("fr-grid-row")}>
                <div className={fr.cx("fr-col-12")}>
                    <h1>{t("title")}</h1>
                    <p>Un espace de travail permet de disposer&nbsp;:</p>
                    <ul>
                        <li>
                            d’un entrepôt permettant le stockage de données, de fichiers statiques et de configurations pour la publication de
                            géoservices&nbsp;;
                        </li>
                        <li>
                            d’une communauté d’utilisateurs pour laquelle vous pourrez gérer les droits de ses membres suivant les modalités de{" "}
                            <a {...routes.offers().link} title="Offre - cartes.gouv.fr - Ouvre une nouvelle fenêtre" target="_blank" rel="norefferer">
                                l’offre «&nbsp;Essentielle&nbsp;»
                            </a>
                            .
                        </li>
                    </ul>
                    <p>{tCommon("mandatory_fields")}</p>
                    {error && <Alert title={t("form.error_title")} closable description={error} severity="error" />}
                    <div className={fr.cx("fr-col-12", "fr-col-md-12")}>
                        <Input
                            label={t("form.name")}
                            hintText={t("form.name_hint")}
                            state={errors.name ? "error" : "default"}
                            stateRelatedMessage={errors?.name?.message}
                            nativeInputProps={{
                                ...register("name"),
                            }}
                        />
                        <Input
                            label={t("form.information")}
                            hintText={t("form.information_hint")}
                            textArea
                            nativeTextAreaProps={{
                                ...register("information"),
                                rows: 3,
                            }}
                        />
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--right")}>
                            <Button onClick={handleSubmit(onSubmit)}>{t("form.send")}</Button>
                        </div>
                    </div>
                </div>
            </div>
            {isSending && (
                <Wait>
                    <div className={fr.cx("fr-container")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <div className={fr.cx("fr-col-2")}>
                                <i className={fr.cx("fr-icon-refresh-line", "fr-icon--lg") + " frx-icon-spin"} />
                            </div>
                            <div className={fr.cx("fr-col-10")}>
                                <h6 className={fr.cx("fr-h6", "fr-m-0")}>{t("is_sending")}</h6>
                            </div>
                        </div>
                    </div>
                </Wait>
            )}
        </Main>
    );
};

export default DatastoreCreationForm;
