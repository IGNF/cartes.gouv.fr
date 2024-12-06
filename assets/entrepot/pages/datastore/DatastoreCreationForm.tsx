import { fr } from "@codegouvfr/react-dsfr";
import { FC, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Button } from "@codegouvfr/react-dsfr/Button";
import AppLayout from "../../../components/Layout/AppLayout";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import SymfonyRouting from "../../../modules/Routing";
import { routes } from "../../../router/router";
import Translator from "../../../modules/Translator";
import { jsonFetch } from "../../../modules/jsonFetch";
import { removeDiacritics } from "../../../utils";
import Wait from "../../../components/Utils/Wait";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { datastoreNavItems } from "../../../config/navItems/datastoreNavItems";

const DatastoreCreationForm: FC = () => {
    const schema = yup
        .object({
            name: yup
                .string()
                .required(Translator.trans("datastore_creation_request.form.name_error"))
                .min(10, Translator.trans("datastore_creation_request.form.name_minlength_error")),
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

    const navItems = datastoreNavItems();

    return (
        <AppLayout navItems={navItems} documentTitle={Translator.trans("datastore_creation_request.title")}>
            <div className={fr.cx("fr-grid-row")}>
                <div className={fr.cx("fr-col-12")}>
                    <h1>{Translator.trans("datastore_creation_request.title")}</h1>
                    <p>Un espace de travail permet de disposer&nbsp;:</p>
                    <ul>
                        <li>
                            d’un entrepôt permettant le stockage de données, de fichiers statiques et de configurations pour la publication de
                            géoservices&nbsp;;
                        </li>
                        <li>
                            d’une communauté d’utilisateurs pour laquelle vous pourrez gérer les droits de ses membres suivant les modalités de{" "}
                            <a {...routes.offer().link} title="Offre - cartes.gouv.fr - Ouvre une nouvelle fenêtre" target="_blank" rel="norefferer">
                                l’offre «&nbsp;Essentielle&nbsp;»
                            </a>
                            .
                        </li>
                    </ul>
                    <p>{Translator.trans("mandatory_fields")}</p>
                    {error && <Alert title={Translator.trans("datastore_creation_request.form.error_title")} closable description={error} severity="error" />}
                    <div className={fr.cx("fr-col-12", "fr-col-md-12")}>
                        <Input
                            label={Translator.trans("datastore_creation_request.form.name")}
                            hintText={Translator.trans("datastore_creation_request.form.name_hint")}
                            state={errors.name ? "error" : "default"}
                            stateRelatedMessage={errors?.name?.message}
                            nativeInputProps={{
                                ...register("name"),
                            }}
                        />
                        <Input
                            label={Translator.trans("datastore_creation_request.form.information")}
                            hintText={Translator.trans("datastore_creation_request.form.information_hint")}
                            textArea
                            nativeTextAreaProps={{
                                ...register("information"),
                                rows: 3,
                            }}
                        />
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--right")}>
                            <Button onClick={handleSubmit(onSubmit)}>{Translator.trans("datastore_creation_request.form.send")}</Button>
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
                                <h6 className={fr.cx("fr-h6", "fr-m-0")}>{Translator.trans("datastore_creation_request.is_sending")}</h6>
                            </div>
                        </div>
                    </div>
                </Wait>
            )}
        </AppLayout>
    );
};

export default DatastoreCreationForm;
