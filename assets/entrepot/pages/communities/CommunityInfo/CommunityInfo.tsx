import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import ToggleSwitch from "@codegouvfr/react-dsfr/ToggleSwitch";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { createPortal } from "react-dom";
import { Controller, useForm } from "react-hook-form";
import { useStyles } from "tss-react";
import isEmail from "validator/lib/isEmail";
import * as yup from "yup";

import { Datastore } from "@/@types/app";
import { CommunityDetailResponseDto, CommunityMemberDtoRightsEnum } from "@/@types/entrepot";
import DatastoreMain from "@/entrepot/components/DatastoreMain";
import DatastoreTertiaryNavigation from "@/entrepot/components/DatastoreTertiaryNavigation";
import PageTitle from "@/components/Layout/PageTitle";
import LoadingOverlay from "@/components/Utils/LoadingOverlay";
import { useCommunity } from "@/entrepot/contexts/community";
import api from "@/entrepot/api";
import { sandboxCommunityId } from "@/env";
import { datastoreQueryOptions } from "@/entrepot/hooks/queries/datastoreQueryOptions";
import { datastoreLabel } from "@/entrepot/utils/datastoreLabel";
import useUserQuery from "@/hooks/queries/useUserQuery";
import useMembership from "@/entrepot/hooks/useMembership";
import { isSandboxCommunity } from "@/utils";
import { getTranslation, useTranslation } from "@/i18n";
import RQKeys from "@/entrepot/modules/RQKeys";
import { CartesApiException } from "@/modules/jsonFetch";
import DeleteCommunity from "./DeleteCommunity/DeleteCommunity";
import { deleteCommunityModal } from "./DeleteCommunity/deleteCommunityModal";

type CommunityInfoFormType = {
    name: string;
    description?: string;
    contact: string;
    private: boolean;
};

const { t } = getTranslation("CommunityInfo");

const schema: yup.ObjectSchema<CommunityInfoFormType> = yup.object({
    name: yup
        .string()
        .required(t("form.name.error.required"))
        .transform((value) => (value ? value.trim() : value)),
    description: yup
        .string()
        .max(300, t("form.desc.info_max_length"))
        .transform((value) => (value ? value.trim() : value)),
    contact: yup
        .string()
        .email(t("form.contact.error.invalid_email"))
        .required(t("form.contact.error.required"))
        .test("is-email", t("form.contact.error.invalid_email"), (value) => {
            if (!value) return false;
            return isEmail(value);
        }),
    private: yup.boolean().required(),
});

const leaveCommunityModal = createModal({
    id: "community-leave-modal",
    isOpenedByDefault: false,
});

export default function CommunityInfo() {
    const { t } = useTranslation("CommunityInfo");
    const { t: tCommon } = useTranslation("Common");
    const { css } = useStyles();

    const userQuery = useUserQuery();
    const { data: user } = userQuery;
    const community: CommunityDetailResponseDto = useCommunity();
    const isSandbox = isSandboxCommunity(community, sandboxCommunityId);
    const { data: datastore } = useQuery<Datastore, CartesApiException>(datastoreQueryOptions(community.datastore?._id)); // communauté possiblement sans entrepôt

    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const form = useForm<CommunityInfoFormType>({
        resolver: yupResolver(schema),
        defaultValues: {
            name: community.name,
            description: community.description ?? "",
            contact: community.contact,
            private: community.public === false,
        },
    });

    const {
        formState: { errors, isDirty },
        register,
        control,
        handleSubmit,
    } = form;

    const communityModifyMutation = useMutation<CommunityDetailResponseDto, CartesApiException, object>({
        mutationFn: (data: object) => {
            return api.community.modify(community._id, data);
        },
        onSuccess: (newData: CommunityDetailResponseDto) => {
            // la réponse du PATCH fait foi pour la communauté ; le datastore est simplement invalidé
            queryClient.setQueryData<CommunityDetailResponseDto>(RQKeys.community(community._id), (oldData) => {
                if (!oldData) return oldData;
                return { ...oldData, ...newData };
            });
            if (datastore) {
                queryClient.invalidateQueries({ queryKey: RQKeys.datastore(datastore._id) });
            }
            queryClient.refetchQueries({ queryKey: RQKeys.user_me() });

            form.reset({
                name: newData.name,
                description: newData.description ?? "",
                contact: newData.contact,
                private: newData.public === false,
            });
        },
    });

    function onSubmit(formData: CommunityInfoFormType) {
        // prepare data as the API expects, send only modified fields
        const data = {};
        if (formData.name !== community.name) data["name"] = formData.name;
        if (formData.description !== (community.description ?? "")) data["description"] = formData.description;
        if (formData.contact !== community.contact) data["contact"] = formData.contact;
        if (formData.private === (community.public === false)) data["public"] = !formData.private;

        communityModifyMutation.mutate(data);
    }

    const member = useMembership({ communityId: community._id });
    const isSupervisor = community.supervisor._id === user?.id;
    const canModifyCommunity = isSupervisor || (member?.can(CommunityMemberDtoRightsEnum.COMMUNITY) ?? false);

    const leaveCommunityMutation = useMutation({
        mutationFn: () => {
            if (!user) return Promise.reject(null);
            return api.user.leaveCommunity(community._id);
        },
        onSuccess: async () => {
            await userQuery.refetch();
            navigate({ to: "/tableau-de-bord/entrepots" });
        },
    });

    return (
        <DatastoreMain title={t("title", { datastoreName: datastoreLabel(datastore?.name ?? community.name, isSandbox) })} datastoreId={datastore?._id}>
            <PageTitle title={t("title", { datastoreName: datastoreLabel(datastore?.name ?? community.name, isSandbox) })} />

            {datastore && <DatastoreTertiaryNavigation datastoreId={datastore._id} communityId={community._id} />}

            <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-mt-6v", "fr-mb-16v")}>
                <div
                    className={fr.cx("fr-col-12", "fr-py-0")}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <strong className={fr.cx("fr-text--xl", "fr-m-0")}>{t("section_title")}</strong>

                    {isSupervisor && datastore ? (
                        <Button priority="tertiary no outline" nativeButtonProps={deleteCommunityModal.buttonProps}>
                            {t("delete_community")}
                        </Button>
                    ) : (
                        <Button priority="tertiary no outline" nativeButtonProps={leaveCommunityModal.buttonProps}>
                            {t("leave_community")}
                        </Button>
                    )}
                </div>
            </div>

            {communityModifyMutation.error && <Alert title={communityModifyMutation.error.message} closable severity="error" />}
            {leaveCommunityMutation.error && <Alert title={leaveCommunityMutation.error.message} closable severity="error" />}

            {/* modification des infos de la commu */}
            <div className={fr.cx("fr-grid-row")}>
                <form
                    className={cx(
                        fr.cx("fr-col-12", "fr-col-sm-10", "fr-col-md-8", "fr-col-lg-6"),
                        css({
                            display: "flex",
                            flexDirection: "column",
                        })
                    )}
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <Input
                        label={t("form.name.label")}
                        state={errors.name ? "error" : "default"}
                        stateRelatedMessage={errors.name?.message}
                        nativeInputProps={register("name")}
                        disabled={!canModifyCommunity}
                    />

                    <Input
                        label={t("form.desc.label")}
                        hintText={t("form.desc.hint")}
                        state={errors.description ? "error" : "info"}
                        stateRelatedMessage={errors.description?.message ?? t("form.desc.info_max_length")}
                        textArea={true}
                        nativeTextAreaProps={{ ...register("description"), rows: 3 }}
                        disabled={!canModifyCommunity}
                    />

                    <Input
                        label={t("form.contact.label")}
                        hintText={t("form.contact.hint")}
                        state={errors.contact ? "error" : "default"}
                        stateRelatedMessage={errors.contact?.message}
                        nativeInputProps={register("contact")}
                        disabled={!canModifyCommunity}
                    />
                    <Controller
                        control={control}
                        name="private"
                        render={({ field }) => (
                            <ToggleSwitch
                                label={t("form.private.label")}
                                helperText={t("form.private.hint")}
                                labelPosition="left"
                                showCheckedHint={false}
                                className={fr.cx("fr-mb-6v")}
                                checked={field.value}
                                onChange={field.onChange}
                                disabled={!isSupervisor} // NOTE : action spéciale qui est réservée au superviseur
                            />
                        )}
                    />

                    {canModifyCommunity && (
                        <Button
                            type="submit"
                            disabled={!isDirty}
                            {...(() => (communityModifyMutation.isSuccess ? { iconId: "fr-icon-check-line", iconPosition: "right" } : {}))()}
                        >
                            {communityModifyMutation.isSuccess ? t("form.submit.label.saved") : t("form.submit.label")}
                        </Button>
                    )}
                </form>
            </div>

            {communityModifyMutation.isPending && <LoadingOverlay message={tCommon("modifying")} />}

            {/* la suppression passe par le nettoyage de l'entrepôt : sans entrepôt, pas de suppression */}
            {datastore && <DeleteCommunity datastore={datastore} />}

            {/* quitter la commu */}
            {createPortal(
                <leaveCommunityModal.Component
                    title={t("leave_modal.title")}
                    buttons={[
                        {
                            children: tCommon("cancel"),
                            priority: "secondary",
                        },
                        {
                            children: t("leave_modal.title"),
                            onClick: () => leaveCommunityMutation.mutate(),
                        },
                    ]}
                >
                    {t("leave_modal.body", { datastoreName: datastoreLabel(community?.name, isSandbox) })}
                </leaveCommunityModal.Component>,
                document.body
            )}

            {leaveCommunityMutation.isPending && <LoadingOverlay message={t("leave_community.in_progress")} />}
        </DatastoreMain>
    );
}
