import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Input from "@codegouvfr/react-dsfr/Input";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { ToggleSwitchGroup } from "@codegouvfr/react-dsfr/ToggleSwitchGroup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";
import { FC, useCallback } from "react";
import { createPortal } from "react-dom";
import { Controller, useForm } from "react-hook-form";
import { useStyles } from "tss-react";
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
    const { t: tRights } = useTranslation("Rights");

    const schema = (t: TranslationFunction<"AddMember", ComponentKey>) =>
        yup.object({
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

    // Formulaire
    const {
        control,
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

    const { reset: resetMutation } = addMemberMutation;

    const resetAll = useCallback(() => {
        resetMutation();
        reset({ user_id: "", user_rights: getRights() });
        addMemberModal.close();
    }, [reset, resetMutation]);

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

    const { css, cx } = useStyles();

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
                label={<strong>{t("user_id")}</strong>}
                state={errors.user_id ? "error" : "default"}
                stateRelatedMessage={errors.user_id?.message}
                nativeInputProps={{ ...register("user_id"), defaultValue: userId }}
            />

            <Controller
                control={control}
                name="user_rights"
                render={({ field }) => (
                    <div className={fr.cx("fr-input-group")}>
                        <div className={fr.cx("fr-label")}>
                            <strong>{t("rights_granted")}</strong>
                        </div>
                        <ToggleSwitchGroup
                            // @ts-expect-error on est sûr qu'il y a toujours au moins un toggle
                            toggles={rightTypes.map((right) => {
                                const upRight = right.toUpperCase();
                                return {
                                    label: tRights(right),
                                    checked: field.value?.includes?.(upRight),
                                    onChange: (checked) => {
                                        const oldRights = field.value ?? [];
                                        let newRights: string[] = [];
                                        if (checked) {
                                            newRights = Array.from(new Set([...oldRights, upRight]));
                                        } else {
                                            newRights = oldRights.filter((r: string) => r !== upRight);
                                        }
                                        field.onChange(newRights);
                                    },
                                };
                            })}
                            showCheckedHint={false}
                            labelPosition="left"
                            classes={{
                                li: cx(fr.cx("fr-m-0", "fr-py-4v"), css({ borderBottom: `1px solid ${fr.colors.decisions.border.default.grey.default}` })),
                            }}
                        />
                    </div>
                )}
            />
        </addMemberModal.Component>,
        document.body
    );
};

export { AddMember, addMemberModal };
