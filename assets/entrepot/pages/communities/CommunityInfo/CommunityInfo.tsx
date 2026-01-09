import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import ToggleSwitch from "@codegouvfr/react-dsfr/ToggleSwitch";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPortal } from "react-dom";
import { Controller, useForm } from "react-hook-form";
import { useStyles } from "tss-react";
import isEmail from "validator/lib/isEmail";
import * as yup from "yup";

import { Community, Datastore } from "@/@types/app";
import { CommunityDetailResponseDto, CommunityMemberDtoRightsEnum } from "@/@types/entrepot";
import DatastoreMain from "@/components/Layout/DatastoreMain";
import DatastoreTertiaryNavigation from "@/components/Layout/DatastoreTertiaryNavigation";
import PageTitle from "@/components/Layout/PageTitle";
import LoadingIcon from "@/components/Utils/LoadingIcon";
import Wait from "@/components/Utils/Wait";
import { useCommunity } from "@/contexts/community";
import { useDatastore } from "@/contexts/datastore";
import api from "@/entrepot/api";
import useUserQuery from "@/hooks/queries/useUserQuery";
import { getTranslation, useTranslation } from "@/i18n";
import RQKeys from "@/modules/entrepot/RQKeys";
import { CartesApiException } from "@/modules/jsonFetch";
import { routes } from "@/router/router";
import { useAuthStore } from "@/stores/AuthStore";

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

const deleteCommunityModal = createModal({
    id: "community-delete-modal",
    isOpenedByDefault: false,
});

export default function CommunityInfo() {
    const { t } = useTranslation("CommunityInfo");
    const { t: tCommon } = useTranslation("Common");
    const { css } = useStyles();

    const user = useAuthStore((state) => state.user);
    const userQuery = useUserQuery();
    const { datastore } = useDatastore();
    const community: Community = useCommunity();

    const queryClient = useQueryClient();

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
            queryClient.setQueryData<[CommunityDetailResponseDto, Datastore | undefined]>(RQKeys.community(community._id), (oldData) => {
                if (!oldData || !oldData[0]) return oldData;
                const [oldCommunity, oldDatastore] = oldData;
                return [
                    { ...oldCommunity, ...newData },
                    oldDatastore
                        ? {
                              ...oldDatastore,
                              name: newData.name,
                              description: newData.description,
                              community: {
                                  ...oldDatastore?.community,
                                  ...newData,
                              },
                          }
                        : undefined,
                ] satisfies [CommunityDetailResponseDto, Datastore | undefined];
            });
            queryClient.setQueryData<Datastore>(RQKeys.datastore(datastore._id), (oldData) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    name: newData.name,
                    description: newData.description,
                    contact: newData.contact,
                    public: newData.public,
                    community: {
                        ...oldData.community,
                        contact: newData.contact,
                        public: newData.public,
                    },
                };
            });

            queryClient.invalidateQueries({ queryKey: RQKeys.user_me() });
            queryClient.refetchQueries({ queryKey: RQKeys.community(datastore.community._id) });
            queryClient.invalidateQueries({ queryKey: RQKeys.datastore(datastore._id) });

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

    const isSupervisor = community.supervisor._id === user?.id;
    const communityUserRights = user?.communities_member.find((member) => member.community?._id === community._id)?.rights ?? [];
    const hasCommunityRight = communityUserRights.includes(CommunityMemberDtoRightsEnum.COMMUNITY);

    const leaveCommunityMutation = useMutation({
        mutationFn: () => {
            if (!user) return Promise.reject(null);
            return api.user.leaveCommunity(community._id);
        },
        onSuccess: () => {
            userQuery.refetch();
            routes.datastore_selection().push();
        },
    });

    const deleteCommunityMutation = useMutation({
        mutationFn: () => {
            return api.contact.requestDatastoreDeletion({ datastoreId: community.datastore?._id, communityId: community._id });
        },
        onSuccess: () => {
            routes.datastore_selection().push();
        },
    });

    return (
        <DatastoreMain title={t("title", { datastoreName: datastore?.is_sandbox === true ? tCommon("sandbox") : datastore?.name })} datastoreId={datastore._id}>
            <PageTitle title={t("title", { datastoreName: datastore?.is_sandbox === true ? tCommon("sandbox") : datastore?.name })} />

            <DatastoreTertiaryNavigation datastoreId={datastore._id} communityId={datastore.community._id} />

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

                    {isSupervisor ? (
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
            {deleteCommunityMutation.error && <Alert title={deleteCommunityMutation.error.message} closable severity="error" />}

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
                        disabled={!hasCommunityRight}
                    />

                    <Input
                        label={t("form.desc.label")}
                        hintText={t("form.desc.hint")}
                        state={errors.description ? "error" : "info"}
                        stateRelatedMessage={errors.description?.message ?? t("form.desc.info_max_length")}
                        textArea={true}
                        nativeTextAreaProps={{ ...register("description"), rows: 3 }}
                        disabled={!hasCommunityRight}
                    />

                    <Input
                        label={t("form.contact.label")}
                        hintText={t("form.contact.hint")}
                        state={errors.contact ? "error" : "default"}
                        stateRelatedMessage={errors.contact?.message}
                        nativeInputProps={register("contact")}
                        disabled={!hasCommunityRight}
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
                                disabled={!isSupervisor || !hasCommunityRight}
                            />
                        )}
                    />

                    {hasCommunityRight && (
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

            {communityModifyMutation.isPending && (
                <Wait>
                    <div className={fr.cx("fr-container")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <div className={fr.cx("fr-col-2")}>
                                <LoadingIcon />
                            </div>
                            <div className={fr.cx("fr-col-10")}>
                                <h6 className={fr.cx("fr-h6", "fr-m-0")}>{tCommon("modifying")}</h6>
                            </div>
                        </div>
                    </div>
                </Wait>
            )}

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
                    {t("leave_modal.body", { datastoreName: community.is_sandbox === true ? tCommon("sandbox") : community?.name })}
                </leaveCommunityModal.Component>,
                document.body
            )}

            {leaveCommunityMutation.isPending && (
                <Wait>
                    <div className={fr.cx("fr-container")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <div className={fr.cx("fr-col-2")}>
                                <LoadingIcon />
                            </div>
                            <div className={fr.cx("fr-col-10")}>
                                <h6 className={fr.cx("fr-h6", "fr-m-0")}>{t("leave_community.in_progress")}</h6>
                            </div>
                        </div>
                    </div>
                </Wait>
            )}

            {/* supprimer la commu */}
            {createPortal(
                <deleteCommunityModal.Component
                    title={t("delete_community.modal.title")}
                    buttons={[
                        {
                            children: tCommon("cancel"),
                            priority: "secondary",
                        },
                        {
                            children: t("delete_community.modal.confirm"),
                            onClick: () => deleteCommunityMutation.mutate(),
                        },
                    ]}
                >
                    {t("delete_community.modal.body")}
                </deleteCommunityModal.Component>,
                document.body
            )}

            {deleteCommunityMutation.isPending && (
                <Wait>
                    <div className={fr.cx("fr-container")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <div className={fr.cx("fr-col-2")}>
                                <LoadingIcon />
                            </div>
                            <div className={fr.cx("fr-col-10")}>
                                <h6 className={fr.cx("fr-h6", "fr-m-0")}>{t("delete_community.in_progress")}</h6>
                            </div>
                        </div>
                    </div>
                </Wait>
            )}
        </DatastoreMain>
    );
}
