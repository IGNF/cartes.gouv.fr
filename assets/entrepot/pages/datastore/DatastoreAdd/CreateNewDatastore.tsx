import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import { getLink } from "@codegouvfr/react-dsfr/link";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import Success from "@codegouvfr/react-dsfr/picto/Success";
import SelectNext from "@codegouvfr/react-dsfr/SelectNext";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { useStyles } from "tss-react";
import * as yup from "yup";

import LoadingIcon from "@/components/Utils/LoadingIcon";
import Wait from "@/components/Utils/Wait";
import { useTranslation } from "@/i18n";
import { ComponentKey } from "@/i18n/types";
import { jsonFetch } from "@/modules/jsonFetch";
import SymfonyRouting from "@/modules/Routing";
import { routes } from "@/router/router";
import { removeDiacritics } from "@/utils";

const successModal = createModal({
    id: "datastore-creation-success-modal",
    isOpenedByDefault: false,
});

const schema = (t: TranslationFunction<"DatastoreAdd", ComponentKey>) =>
    yup.object({
        name: yup
            .string()
            .required(t("create_new.form.name.error.required"))
            .min(10, t("create_new.form.name.error.min_length"))
            .trim()
            .transform((value) => (value ? value.trim() : value)),
        technical_name: yup.string(),
        offer: yup.string().required(t("create_new.form.offer.error.required")),
        information: yup.string(),
    });

type CreateNewDatastoreProps = {
    classes?: Record<"form", string>;
};
export default function CreateNewDatastore({ classes }: CreateNewDatastoreProps) {
    const { t } = useTranslation("DatastoreAdd");

    const { css } = useStyles();
    const { Link } = getLink();

    const {
        register,
        setValue: setFormValue,
        formState: { errors },
        watch,
        handleSubmit,
    } = useForm({ resolver: yupResolver(schema(t)), defaultValues: { offer: "essential" } });

    const name = watch("name");

    useEffect(() => {
        const { unsubscribe } = watch(({ name, technical_name }, { name: fieldName }) => {
            // si le champ name a été modifié, on synchronise le champ technical_name
            if (fieldName === "name" && name !== undefined) {
                const suggestedTechName = removeDiacritics(name.trim().toLowerCase()).replace(/ /g, "_");
                if (technical_name !== suggestedTechName) {
                    setFormValue("technical_name", suggestedTechName, { shouldValidate: true });
                }
            }
        });

        return () => unsubscribe();
    }, [watch, setFormValue]);

    const datastoreRequestMutation = useMutation<{ success: boolean }, string, object>({
        mutationFn: async (values: object) => {
            const url = SymfonyRouting.generate("cartesgouvfr_contact_datastore_create_request");

            return new Promise<{ success: boolean }>((resolve, reject) => {
                jsonFetch<{ success: boolean }>(url, { method: "POST" }, values)
                    .then((response) => {
                        resolve(response);
                    })
                    .catch((error) => {
                        reject(error.error);
                    });
            });
        },
        onSuccess() {
            successModal.open();
        },
    });

    useIsModalOpen(successModal, {
        onConceal() {
            // on close
            routes.datastore_selection().push();
        },
    });

    return (
        <>
            {datastoreRequestMutation.error && (
                <Alert title={"Votre demande n'a pas pu être envoyée"} closable description={datastoreRequestMutation.error} severity="error" />
            )}

            <form className={cx(classes?.form)} onSubmit={handleSubmit((data) => datastoreRequestMutation.mutate(data))}>
                <p className={fr.cx("fr-p-0")}>{t("create_new.lead")}</p>

                <p
                    className={fr.cx("fr-p-0", "fr-text--xs")}
                    style={{
                        color: fr.colors.decisions.text.mention.grey.default,
                    }}
                >
                    {t("mandatory_fields")}
                </p>

                <Input
                    label={t("create_new.form.name.label")}
                    state={errors.name ? "error" : "default"}
                    stateRelatedMessage={errors?.name?.message}
                    nativeInputProps={{
                        ...register("name"),
                    }}
                />

                <div className={fr.cx("fr-mb-6v")}>
                    <SelectNext
                        label={t("create_new.form.offer.label")}
                        options={[
                            {
                                label: t("create_new.form.offer.label.essential"),
                                value: "essential",
                            },
                            {
                                label: t("create_new.form.offer.label.premium"),
                                value: "premium",
                            },
                        ]}
                        state={errors.offer ? "error" : "default"}
                        stateRelatedMessage={errors?.offer?.message}
                        nativeSelectProps={{
                            ...register("offer"),
                        }}
                        className={fr.cx("fr-mb-4v")}
                    />
                    <Link {...routes.offers().link} target="_blank" className={fr.cx("fr-link", "fr-text--xs")}>
                        {t("disover_offers")}
                    </Link>
                </div>

                <Input
                    label={t("create_new.form.information.label")}
                    hintText={t("create_new.form.information.hint")}
                    textArea
                    nativeTextAreaProps={{
                        ...register("information"),
                        rows: 3,
                    }}
                    className={fr.cx("fr-mb-16v")}
                />

                <Button className={fr.cx("fr-ml-auto")} type="submit">
                    {t("create_new.form.send.label")}
                </Button>
            </form>

            {datastoreRequestMutation.isPending && (
                <Wait>
                    <div className={fr.cx("fr-container")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <div className={fr.cx("fr-col-2")}>
                                <LoadingIcon />
                            </div>
                            <div className={fr.cx("fr-col-10")}>
                                <h6 className={fr.cx("fr-h6", "fr-m-0")}>{t("is_sending")}</h6>
                            </div>
                        </div>
                    </div>
                </Wait>
            )}

            {createPortal(
                <successModal.Component
                    title={t("create_new.modal_success.title")}
                    concealingBackdrop={false}
                    buttons={[
                        {
                            children: "Fermer",
                            linkProps: routes.datastore_selection().link,
                        },
                    ]}
                >
                    <div
                        className={css({
                            display: "flex",
                            flexDirection: "column",
                            padding: "1rem",
                            alignItems: "center",
                            alignSelf: "stretch",
                            gap: "0.5rem",
                        })}
                    >
                        <Success color="blue-cumulus" width={"4rem"} height={"4rem"} />
                        <p className={cx(fr.cx("fr-m-0"), css({ textAlign: "center" }))}>{t("create_new.modal_success.request_sent", { name: name || "" })}</p>
                        <hr className={fr.cx("fr-mt-4v", "fr-pb-4v")} style={{ width: "100%" }} />
                        <p className={cx(fr.cx("fr-m-0"), css({ textAlign: "center" }))}>{t("create_new.modal_success.acknowledgement_sent")}</p>
                    </div>
                </successModal.Component>,
                document.body
            )}
        </>
    );
}
