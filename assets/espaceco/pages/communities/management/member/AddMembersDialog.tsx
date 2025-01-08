import { fr } from "@codegouvfr/react-dsfr";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { yupResolver } from "@hookform/resolvers/yup";
import { FC } from "react";
import { createPortal } from "react-dom";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { UserDTO } from "../../../../../@types/espaceco";
import { declareComponentKeys, useTranslation } from "../../../../../i18n/i18n";
import SearchUsers from "./SearchUsers";
import { isUser } from "../../../../../@types/app_espaceco";
import { Translations } from "../../../../../i18n/types";

const AddMembersDialogModal = createModal({
    id: "add-esco-member-modal",
    isOpenedByDefault: false,
});

type AddMembersDialogProps = {
    onAdd: (ids: (string | number)[]) => void;
};

const AddMembersDialog: FC<AddMembersDialogProps> = ({ onAdd }) => {
    const { t: tCommon } = useTranslation("Common");
    const { t } = useTranslation("AddMembersDialog");

    const schema = yup.object({
        users: yup.array().of(yup.mixed().required()).min(1, t("min_users_error")).required(),
    });

    const {
        control,
        reset,
        getValues: getFormValues,
        formState: { errors },
        handleSubmit,
    } = useForm({
        mode: "onChange",
        resolver: yupResolver(schema),
        defaultValues: {
            users: [],
        },
    });

    const onSubmit = () => {
        AddMembersDialogModal.close();

        const values = getFormValues();
        const users = values.users as (UserDTO | string)[];

        const ids = Array.from(users, (u) => {
            return isUser(u) ? u.id : u;
        });
        onAdd(ids);
        reset({ users: [] });
    };

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
                            onClick: handleSubmit(onSubmit),
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
                                        hintText={t("users_hint")}
                                        value={value as (UserDTO | string)[]}
                                        state={errors.users ? "error" : "default"}
                                        stateRelatedMessage={errors?.users?.message?.toString()}
                                        onChange={(users) => onChange(users)}
                                    />
                                );
                            }}
                        />
                    </div>
                </AddMembersDialogModal.Component>,
                document.body
            )}
        </>
    );
};

export { AddMembersDialog, AddMembersDialogModal };

// traductions
const { i18n } = declareComponentKeys<"invite_title" | "invite" | { K: "users_hint"; R: JSX.Element } | "min_users_error">()("AddMembersDialog");
export type I18n = typeof i18n;

export const AddMembersDialogFrTranslations: Translations<"fr">["AddMembersDialog"] = {
    invite_title: "Inviter des membres",
    invite: "Inviter",
    users_hint: (
        <>
            <div>
                <ul className={fr.cx("fr-raw-list")}>
                    <li>Invitez un utilisateur de la géoplateforme par son login ou son nom d’utilisateur (autocomplétion).</li>
                    <li>
                        Invitez un utilisateur qui ne fait pas partie de la géoplateforme par son adresse email. Un message lui sera envoyé pour créer un compte
                    </li>
                    <li>Vous pouvez inviter plusieurs membres à ce guichet en une seule fois</li>
                </ul>
            </div>
            <br />
            <div>Une fois les membres invités, vous pourrez ensuite en désigner certains comme gestionnaires.</div>
        </>
    ),
    min_users_error: "Au minimum, un utilisateur ou un email est requis",
};

export const AddMembersDialogEnTranslations: Translations<"en">["AddMembersDialog"] = {
    invite_title: "Invite members",
    invite: "Invite",
    users_hint: undefined,
    min_users_error: undefined,
};
