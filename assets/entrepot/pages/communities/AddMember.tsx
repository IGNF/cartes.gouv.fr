import { FC, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { fr } from "@codegouvfr/react-dsfr";
import { TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";
import { ComponentKey, Translations, declareComponentKeys, getTranslation, useTranslation } from "../../../i18n/i18n";
import Input from "@codegouvfr/react-dsfr/Input";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { regex } from "../../../utils";
import { getRights, rightTypes } from "./UserRights";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserRightsResponseDto } from "../../../@types/app";
import { CartesApiException } from "../../../modules/jsonFetch";
import api from "../../api";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { routes } from "../../../router/router";

const addMemberModal = createModal({
    id: "add-member-modal",
    isOpenedByDefault: false,
});

type AddMemberProps = {
    datastoreId: string;
    communityId?: string;
    communityMemberIds: string[];
    userId?: string;
};

const { t: tCommon } = getTranslation("Common");
const { t: translateRights } = getTranslation("Rights");

const AddMember: FC<AddMemberProps> = ({ datastoreId, communityId, communityMemberIds, userId }) => {
    const { t } = useTranslation({ AddMember });

    const schema = (t: TranslationFunction<"AddMember", ComponentKey>) => {
        return yup.object({
            user_id: yup
                .string()
                .matches(regex.uuid, t("id_must_be_uuid"))
                .required(t("id_mandatory"))
                .test(
                    "exists",
                    ({ value }) => t("already_member", { userId: value }),
                    (value) => !communityMemberIds.includes(value)
                ),
            user_rights: yup.array(),
        });
    };

    // Formulaire
    const {
        register,
        getValues: getFormValues,
        formState: { errors },
        reset,
        handleSubmit,
    } = useForm({ mode: "onSubmit", defaultValues: { user_rights: getRights() }, resolver: yupResolver(schema(t)) });

    const [error, setError] = useState<CartesApiException | undefined>(undefined);

    const resetAll = useCallback(() => {
        setError(undefined);
        reset({ user_id: "", user_rights: getRights() });
        addMemberModal.close();
    }, [reset]);

    const queryClient = useQueryClient();

    const { isPending, mutate } = useMutation<UserRightsResponseDto | undefined, CartesApiException, object>({
        mutationFn: (datas) => {
            if (communityId) return api.community.updateMember(communityId, datas);
            return Promise.resolve(undefined);
        },
        onSuccess: () => {
            resetAll();
            routes.members_list({ datastoreId }).push(); // Suppression du parametre userId de la requete
            queryClient.refetchQueries({ queryKey: ["community", "members", communityId] });
        },
        onError: (error) => {
            setError(error);
        },
    });

    // Annulation
    const handleOnCancel = () => {
        resetAll();
        routes.members_list({ datastoreId }).push();
    };

    // Ajout de l'utilisateur
    const onSubmit = () => {
        const values = getFormValues();
        values["user_creation"] = true;
        mutate(values);
    };

    let title = t("add_user_title");
    if (isPending) {
        title += `&nbsp;${t("running")}&nbsp;<i class="fr-icon-refresh-line frx-icon-spin" />`;
    }

    return createPortal(
        <addMemberModal.Component
            title={<span dangerouslySetInnerHTML={{ __html: title }} />}
            buttons={[
                {
                    children: tCommon("cancel"),
                    onClick: handleOnCancel,
                    doClosesModal: false,
                    priority: "secondary",
                },
                {
                    children: tCommon("add"),
                    onClick: handleSubmit(onSubmit),
                    doClosesModal: false,
                    priority: "primary",
                },
            ]}
        >
            {error && <Alert severity={"error"} title={tCommon("error")} description={error?.message} className={fr.cx("fr-my-3w")} />}
            <Input
                label={t("user_id")}
                state={errors.user_id ? "error" : "default"}
                stateRelatedMessage={errors.user_id?.message}
                nativeInputProps={{ ...register("user_id"), defaultValue: userId }}
            />
            <Checkbox
                legend={t("rights_granted")}
                options={rightTypes.map((right) => {
                    const explain = translateRights(`${right}_explain`);
                    const upRight = right.toUpperCase();
                    return {
                        label: translateRights(right),
                        hintText: explain,
                        nativeInputProps: {
                            ...register("user_rights"),
                            value: upRight,
                        },
                    };
                })}
            />
        </addMemberModal.Component>,
        document.body
    );
};

export { addMemberModal, AddMember };

// traductions
export const { i18n } = declareComponentKeys<
    "add_user_title" | "user_id" | "rights_granted" | "id_mandatory" | "id_must_be_uuid" | { K: "already_member"; P: { userId: string }; R: string } | "running"
>()({
    AddMember,
});

export const AddMemberFrTranslations: Translations<"fr">["AddMember"] = {
    add_user_title: "Ajouter un utilisateur",
    user_id: "Identifiant de l'utilisateur",
    rights_granted: "Permissions accordées",
    id_mandatory: "L'identifiant est obligatoire",
    id_must_be_uuid: "L'Identifiant doit être un UUID",
    already_member: ({ userId }) => `l'utilisateur ${userId} est déjà membre de cet espace de travail`,
    running: "en cours ...",
};

export const AddMemberEnTranslations: Translations<"en">["AddMember"] = {
    add_user_title: "Add user",
    user_id: "User identifier",
    rights_granted: "Rights granted",
    id_mandatory: "Identifier is mandatory",
    id_must_be_uuid: "Identifier must be an UUID",
    already_member: ({ userId }) => `User ${userId} is already a member of this community`,
    running: "running ...",
};
