import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import Input from "@codegouvfr/react-dsfr/Input";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";
import { FC, useCallback } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import * as yup from "yup";

import type { UserRightsResponseDto } from "../../../../@types/app";
import LoadingIcon from "../../../../components/Utils/LoadingIcon";
import { useTranslation } from "../../../../i18n/i18n";
import { ComponentKey } from "../../../../i18n/types";
import RQKeys from "../../../../modules/entrepot/RQKeys";
import { CartesApiException } from "../../../../modules/jsonFetch";
import { routes } from "../../../../router/router";
import { regex } from "../../../../utils";
import api from "../../../api";
import { getRights, rightTypes } from "../UserRights";

const addMemberModal = createModal({
    id: "add-member-modal",
    isOpenedByDefault: false,
});

type AddMemberProps = {
    communityId: string;
    communityMemberIds: string[];
    userId?: string;
};

const AddMember: FC<AddMemberProps> = ({ communityId, communityMemberIds, userId }) => {
    const { t } = useTranslation({ AddMember });
    const { t: tCommon } = useTranslation("Common");
    const { t: translateRights } = useTranslation("Rights");

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

    const queryClient = useQueryClient();

    const addMemberMutation = useMutation<UserRightsResponseDto | undefined, CartesApiException, object>({
        mutationFn: (datas) => {
            if (communityId) return api.community.updateMember(communityId, datas);
            return Promise.resolve(undefined);
        },
        onSuccess: () => {
            resetAll();
            routes.members_list({ communityId }).push(); // Suppression du parametre userId de la requete
            queryClient.refetchQueries({ queryKey: RQKeys.community_members(communityId) });
        },
    });

    const resetAll = useCallback(() => {
        addMemberMutation.reset();
        reset({ user_id: "", user_rights: getRights() });
        addMemberModal.close();
    }, [reset, addMemberMutation]);

    // Annulation
    const handleOnCancel = () => {
        resetAll();
        routes.members_list({ communityId }).push();
    };

    // Ajout de l'utilisateur
    const onSubmit = () => {
        const values = getFormValues();
        values["user_creation"] = true;
        addMemberMutation.mutate(values);
    };

    return createPortal(
        <addMemberModal.Component
            title={
                addMemberMutation.isPending === true ? (
                    <>
                        {t("running")} <LoadingIcon />
                    </>
                ) : (
                    t("add_user_title")
                )
            }
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
            concealingBackdrop={true}
        >
            {addMemberMutation.error && (
                <Alert severity={"error"} title={tCommon("error")} description={addMemberMutation.error?.message} className={fr.cx("fr-my-3w")} />
            )}
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

export { AddMember, addMemberModal };
