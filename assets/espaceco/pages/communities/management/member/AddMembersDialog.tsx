import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import Table from "@codegouvfr/react-dsfr/Table";
import { yupResolver } from "@hookform/resolvers/yup";
import { FC, ReactNode, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { Controller, useForm } from "react-hook-form";
import isEmail from "validator/lib/isEmail";
import * as yup from "yup";
import { isUser } from "../../../../../@types/app_espaceco";
import { UserDTO } from "../../../../../@types/espaceco";
import { declareComponentKeys, Translations, useTranslation } from "../../../../../i18n/i18n";
import SearchUsers from "./SearchUsers";

const AddMembersDialogModal = createModal({
    id: "add-esco-member-modal",
    isOpenedByDefault: false,
});

const AddMembersDialog: FC = () => {
    const { t: tCommon } = useTranslation("Common");
    const { t } = useTranslation("AddMembersDialog");

    const schema = yup.object({
        users: yup
            .array()
            .of(yup.mixed().required())
            .test({
                name: "check-entry",
                test: (values, context) => {
                    if (!values) return true;
                    for (const v of values) {
                        if (typeof v === "string") {
                            if (!isEmail(v)) return context.createError({ message: t("email_not_valid", { value: v }) });
                        }
                    }
                    return true;
                },
            }),
    });

    const {
        watch,
        control,
        getValues: getFormValues,
        setValue: setFormValue,
        formState: { errors },
    } = useForm({
        mode: "onChange",
        resolver: yupResolver(schema),
        defaultValues: {
            users: [],
        },
    });

    const users = watch("users");

    const handleRemove = useCallback(
        (user: UserDTO | string) => {
            const users = (getFormValues("users") as (UserDTO | string)[]) ?? [];
            const filtered = isUser(user)
                ? users.filter((u) => {
                      if (isUser(u)) return u.id !== user.id;
                      return true;
                  })
                : users.filter((u) => {
                      if (!isUser(u)) return u !== user;
                      return true;
                  });

            setFormValue("users", filtered);
        },
        [getFormValues, setFormValue]
    );

    const gpUsersData: ReactNode[][] = useMemo(() => {
        return (
            users
                ?.filter((u) => {
                    return isUser(u as UserDTO | string);
                })
                .map((u) => {
                    const user = u as UserDTO;
                    return [
                        user.username,
                        <div key={user.id} className={fr.cx("fr-grid-row", "fr-grid-row--right")}>
                            <Button title={""} priority={"tertiary no outline"} iconId={"fr-icon-delete-line"} onClick={() => handleRemove(user)} />
                        </div>,
                    ];
                }) ?? []
        );
    }, [users, handleRemove]);

    const newUsersData =
        useMemo(
            () =>
                users
                    ?.filter((u) => typeof u === "string")
                    .map((u) => {
                        return [
                            u,
                            <div key={u} className={fr.cx("fr-grid-row", "fr-grid-row--right")}>
                                <Button title={""} priority={"tertiary no outline"} iconId={"fr-icon-delete-line"} onClick={() => handleRemove(u)} />
                            </div>,
                        ];
                    }),
            [users, handleRemove]
        ) ?? [];

    return (
        <>
            {createPortal(
                <AddMembersDialogModal.Component
                    title={t("invite_title")}
                    size={"large"}
                    buttons={[
                        {
                            children: tCommon("cancel"),
                            priority: "secondary",
                            doClosesModal: false,
                            onClick: () => {
                                AddMembersDialogModal.close();
                            },
                        },
                        {
                            priority: "primary",
                            children: t("invite"),
                            doClosesModal: false,
                            // onClick: handleSubmit(onSubmit),
                        },
                    ]}
                >
                    <div>
                        <Controller
                            control={control}
                            name="users"
                            render={({ field: { value, onChange } }) => {
                                return (
                                    <SearchUsers
                                        label={null}
                                        value={value as (UserDTO | string)[]}
                                        state={errors.users ? "error" : "default"}
                                        stateRelatedMessage={errors?.users?.message?.toString()}
                                        onChange={(users) => onChange(users)}
                                    />
                                );
                            }}
                        />
                        <div>
                            <label className={fr.cx("fr-label")}>{t("gp_users_to_add")}</label>
                            {gpUsersData.length > 0 ? (
                                <Table caption={t("gp_users_to_add")} className={fr.cx("fr-table--sm")} noCaption bordered fixed data={gpUsersData} />
                            ) : (
                                <div>{t("none")}</div>
                            )}
                        </div>
                        <div className={fr.cx("fr-mt-2v")}>
                            <label className={fr.cx("fr-label")}>{t("users_to_add")}</label>
                            {newUsersData.length > 0 ? (
                                <Table caption={t("users_to_add")} className={fr.cx("fr-table--sm")} noCaption bordered fixed data={newUsersData} />
                            ) : (
                                <div>{t("none")}</div>
                            )}
                        </div>
                    </div>
                </AddMembersDialogModal.Component>,
                document.body
            )}
        </>
    );
};

export { AddMembersDialog, AddMembersDialogModal };

// traductions
export const { i18n } = declareComponentKeys<
    | "invite_title"
    | "invite"
    | "emails"
    | { K: "emails_hint"; R: JSX.Element }
    | { K: "email_not_valid"; P: { value: string }; R: string }
    | "gp_users_to_add"
    | "users_to_add"
    | "none"
>()("AddMembersDialog");

export const AddMembersDialogFrTranslations: Translations<"fr">["AddMembersDialog"] = {
    invite_title: "Inviter des membres",
    invite: "Inviter",
    emails: "Emails",
    emails_hint: (
        <>
            <div>
                <ul className={fr.cx("fr-raw-list")}>
                    <li>Invitez un utilisateur de la géoplateforme par son login ou son nom d’utilisateur.</li>
                    <li>
                        Invitez un utilisateur qui ne fait pas partie de la géoplateforme par son adresse email. Un message lui sera envoyé pour créer un compte
                        (séparez les adresses email par une virgule).
                    </li>
                    <li>Vous pouvez inviter plusieurs membres au groupe en une seule fois</li>
                </ul>
            </div>
            <br />
            <div>Une fois les membres invités au groupe, vous pourrez ensuite en désigner certains comme gestionnaires.</div>
        </>
    ),
    email_not_valid: ({ value }) => `La chaîne ${value} n'est pas un email valide`,
    gp_users_to_add: "Utilisateurs de la géoplateforme à ajouter",
    users_to_add: "Utilisateurs hors géoplateforme à ajouter",
    none: "Aucun",
};

export const AddMembersDialogEnTranslations: Translations<"en">["AddMembersDialog"] = {
    invite_title: "Invite members",
    invite: "Invite",
    emails: "Emails",
    emails_hint: undefined,
    email_not_valid: ({ value }) => `${value} is not valid email`,
    gp_users_to_add: undefined,
    users_to_add: undefined,
    none: "None",
};
