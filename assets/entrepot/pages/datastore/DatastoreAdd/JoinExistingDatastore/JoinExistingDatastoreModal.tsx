import { fr } from "@codegouvfr/react-dsfr";
import Input from "@codegouvfr/react-dsfr/Input";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import Success from "@codegouvfr/react-dsfr/picto/Success";
import { useMutation, useQuery } from "@tanstack/react-query";
import { DetailedHTMLProps, InputHTMLAttributes } from "react";
import { createPortal } from "react-dom";
import { FieldValues, RegisterOptions, useForm, UseFormRegister } from "react-hook-form";
import { tss } from "tss-react";

import { CommunityListResponseDto } from "@/@types/entrepot";
import LoadingIcon from "@/components/Utils/LoadingIcon";
import Wait from "@/components/Utils/Wait";
import api from "@/entrepot/api";
import { useTranslation } from "@/i18n";
import RQKeys from "@/modules/entrepot/RQKeys";
import { routes } from "@/router/router";
import { joinModal, successModal } from "./modal";

function getInputProps(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    field: any,
    register: UseFormRegister<FieldValues>,
    registerOptionsOverrides?: RegisterOptions<FieldValues>
): DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
    return {
        ...registerField(field, register, registerOptionsOverrides),
        type: (() => {
            switch (field["type"]) {
                case "number":
                case "integer":
                    return "number";
                case "boolean":
                    return "checkbox";
                case "email":
                    return "email";
                case "password":
                    return "password";
                case "string":
                default:
                    return "text";
            }
        })(),
    };
}

function registerField(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    field: any,
    register: UseFormRegister<FieldValues>,
    registerOptionsOverrides?: RegisterOptions<FieldValues>
) {
    return register(field["name"], {
        required: field["constraints"]?.required ? "Ce champ est requis" : false,
        minLength: field["constraints"]?.minLength
            ? {
                  value: field["constraints"]?.minLength,
                  message: `Ce champ a une longueur minimale de ${field["constraints"]?.minLength} caractères`,
              }
            : undefined,
        maxLength: field["constraints"]?.maxLength
            ? {
                  value: field["constraints"]?.maxLength,
                  message: `Ce champ a une longueur maximale de ${field["constraints"]?.maxLength} caractères`,
              }
            : undefined,
        min: field["constraints"]?.minimum
            ? {
                  value: field["constraints"]?.minimum,
                  message: `Ce champ a une valeur minimale de ${field["constraints"]?.minimum}`,
              }
            : undefined,
        max: field["constraints"]?.maximum
            ? {
                  value: field["constraints"]?.maximum,
                  message: `Ce champ a une valeur maximale de ${field["constraints"]?.maximum}`,
              }
            : undefined,
        validate: (value) => {
            if (field["type"] === "integer") {
                if (!Number.isInteger(Number(value))) {
                    return "Ce champ doit être un nombre entier";
                }
            }
            if (field["type"] === "number") {
                if (isNaN(Number(value))) {
                    return "Ce champ doit être un nombre";
                }
            }
            if (field["constraints"]?.pattern) {
                const regex = new RegExp(field["constraints"]?.pattern);
                if (!regex.test(value)) {
                    return "Ce champ ne correspond pas au format attendu";
                }
            }
            return true;
        },
        setValueAs(value) {
            value = value.trim();
            if (["number", "integer"].includes(field["type"])) {
                return Number(value);
            }
            return value;
        },
        ...registerOptionsOverrides,
    });
}

type JoinExistingDatastoreModalProps = {
    selectedCommunity: CommunityListResponseDto;
};
export function JoinExistingDatastoreModal({ selectedCommunity }: JoinExistingDatastoreModalProps) {
    const { classes, css, cx } = useStyles();
    const { t } = useTranslation("DatastoreAdd");

    const joinCommunityMutation = useMutation<unknown, { error: string }, { community: CommunityListResponseDto; other_info?: Record<string, unknown> }>({
        mutationFn: (data) => {
            return api.contact.joinCommunity(data);
        },
        onSuccess() {
            joinModal.close();
            successModal.open();
        },
    });

    const { data: schema } = useQuery({
        queryKey: RQKeys.catalogs_communities_join_schema(selectedCommunity.technical_name),
        queryFn: async () => {
            if (selectedCommunity.technical_name) {
                // TODO : remplacer par un fetch quand le fichier sera hébergé dans les annexes, et supprimer le fichier en local
                return (await import(`../schema/${selectedCommunity.technical_name}/public/join.json`)).default;
            }
        },
        enabled: !!selectedCommunity.technical_name,
        retry: 1,
    });

    const {
        register,
        formState: { errors },
        handleSubmit,
        reset: resetForm,
    } = useForm({
        values: schema
            ? schema["fields"]?.reduce(
                  (acc, field) => {
                      acc[field["name"]] = "";
                      return acc;
                  },
                  {} as Record<string, unknown>
              )
            : undefined,
    });

    useIsModalOpen(joinModal, {
        onConceal: () => {
            resetForm();
        },
    });

    return (
        <>
            {createPortal(
                <joinModal.Component
                    title="Rejoindre une communauté"
                    buttons={[
                        {
                            children: "Annuler",
                            priority: "secondary",
                            onClick: () => {
                                resetForm();
                            },
                        },
                        {
                            children: "Rejoindre",
                            onClick: () => {
                                if (selectedCommunity) {
                                    handleSubmit((formData) => {
                                        const variables: typeof joinCommunityMutation.variables = {
                                            community: selectedCommunity,
                                        };
                                        if (schema && schema["fields"] && schema["fields"].length > 0) {
                                            variables["other_info"] = formData;
                                        }

                                        joinModal.close();
                                        joinCommunityMutation.mutate(variables);
                                    })();
                                }
                            },
                            doClosesModal: false,
                        },
                    ]}
                    concealingBackdrop={false}
                >
                    <div className={classes.root}>
                        <h6 className={classes.title}>{selectedCommunity?.name}</h6>

                        <div className={cx(fr.cx("fr-text--xs", "fr-m-0"), classes.contactContainer)}>
                            <span className={fr.cx("fr-icon--xs", "fr-icon-user-setting-line")} />
                            {selectedCommunity?.contact}
                        </div>

                        {selectedCommunity?.description && <p className={fr.cx("fr-m-0")}>{selectedCommunity?.description}</p>}

                        {schema && (
                            <div className={fr.cx("fr-grid-row")}>
                                <div className={fr.cx("fr-col")}>
                                    {schema?.["description"] && <p>{schema["description"]}</p>}

                                    {schema?.["fields"] &&
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        schema["fields"].map((field: any, i: number) => (
                                            <Input
                                                key={field["name"] ?? i}
                                                label={field["title"]}
                                                hintText={field["description"]}
                                                state={errors?.[field?.["name"]]?.message ? "error" : "default"}
                                                stateRelatedMessage={errors?.[field?.["name"]]?.message?.toString()}
                                                nativeInputProps={{
                                                    ...getInputProps(field, register),
                                                }}
                                            />
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>
                </joinModal.Component>,
                document.body
            )}

            {createPortal(
                <successModal.Component
                    title={t("join_existing.modal_success.title")}
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
                        <p className={cx(fr.cx("fr-m-0"), css({ textAlign: "center" }))}>
                            {t("join_existing.modal_success.request_sent", { name: selectedCommunity?.name || "" })}
                        </p>
                        <hr className={fr.cx("fr-mt-4v", "fr-pb-4v")} style={{ width: "100%" }} />
                        <p className={cx(fr.cx("fr-m-0"), css({ textAlign: "center" }))}>{t("join_existing.modal_success.acknowledgement_sent")}</p>
                    </div>
                </successModal.Component>,
                document.body
            )}

            {joinCommunityMutation.isPending && (
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
        </>
    );
}

const useStyles = tss.withName({ JoinExistingDatastoreModal }).create({
    root: {
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
    },
    title: {
        color: fr.colors.decisions.text.title.blueFrance.default,
        margin: 0,
    },
    contactContainer: {
        display: "flex",
        alignContent: "center",
        alignItems: "center",
        gap: "0.5rem",
        color: fr.colors.decisions.text.mention.grey.default,
    },
});
