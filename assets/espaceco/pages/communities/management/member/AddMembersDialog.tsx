import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { yupResolver } from "@hookform/resolvers/yup";
import { FC } from "react";
import { createPortal } from "react-dom";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { isUser } from "../../../../../@types/app_espaceco";
import { UserDTO } from "../../../../../@types/espaceco";
import { useTranslation } from "../../../../../i18n/i18n";
import SearchUsers from "./SearchUsers";

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
