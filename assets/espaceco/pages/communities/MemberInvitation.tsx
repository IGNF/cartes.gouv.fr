import { fr } from "@codegouvfr/react-dsfr";
import Alert, { AlertProps } from "@codegouvfr/react-dsfr/Alert";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import CallOut from "@codegouvfr/react-dsfr/CallOut";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FC, useEffect, useMemo, useState } from "react";

import { CommunityMember, Role, UserMe } from "../../../@types/app_espaceco";
import { CommunityResponseDTO } from "../../../@types/espaceco";
import LoadingText from "../../../components/Utils/LoadingText";
import Wait from "../../../components/Utils/Wait";
import { useTranslation } from "../../../i18n/i18n";
import RQKeys from "../../../modules/espaceco/RQKeys";
import { CartesApiException } from "../../../modules/jsonFetch";
import { routes } from "../../../router/router";
import { useApiEspaceCoStore } from "../../../stores/ApiEspaceCoStore";
import api from "../../api";
import Main from "@/components/Layout/Main";

import "../../../../assets/sass/pages/espaceco/member_invitation.scss";

type MemberInvitationProps = {
    communityId: number;
};

type ErrorMessage = {
    message: string | JSX.Element;
    type: AlertProps.Severity;
};

const MemberInvitation: FC<MemberInvitationProps> = ({ communityId }) => {
    const { t } = useTranslation("MemberInvitation");
    const { t: tBreadcrumb } = useTranslation("Breadcrumb");

    const apiEspaceCoUrl = useApiEspaceCoStore((state) => state.api_espaceco_url);
    const espaceCoUrl = useMemo(() => (apiEspaceCoUrl ? apiEspaceCoUrl.replace("/gcms/api", "/login") : undefined), [apiEspaceCoUrl]);

    const [errorMessage, setErrorMessage] = useState<ErrorMessage | undefined>();

    const meQuery = useQuery<UserMe, CartesApiException>({
        queryKey: RQKeys.getMe(),
        queryFn: ({ signal }) => api.user.getMe(signal),
        staleTime: 3600000,
        retry: false,
    });

    useEffect(() => {
        if (meQuery.error) {
            if (meQuery.error.code === 403 && meQuery.error?.message.includes("CGU")) {
                setErrorMessage({
                    message: t("espaceco_accept_cgu", { url: espaceCoUrl }),
                    type: "warning",
                });
            } else
                setErrorMessage({
                    message: meQuery.error.message,
                    type: "warning",
                });
        }
    }, [espaceCoUrl, meQuery, t]);

    const query = useQuery<CommunityResponseDTO, CartesApiException>({
        queryKey: RQKeys.community(communityId),
        queryFn: () => api.community.getCommunity(communityId),
        staleTime: 3600000,
        enabled: meQuery.data !== undefined,
    });

    const myRole = useMemo<Role | undefined>(() => {
        let role: Role | undefined;
        if (meQuery.data) {
            const user_id = meQuery.data.id;
            const members = meQuery.data.communities_member.filter((m) => m.community_id === communityId && m.user_id === user_id);
            if (members.length === 1) {
                role = members[0].role;
            }
        }
        return role;
    }, [meQuery.data, communityId]);

    /* Invitation : role : "invited" => "member" */
    const updateRoleMutation = useMutation<CommunityMember | undefined, CartesApiException>({
        mutationFn: () => {
            if (meQuery.data?.id) {
                return api.community.updateMemberRole(communityId, meQuery.data.id, "member");
            }
            return Promise.resolve(undefined);
        },
    });

    /* Suppression du membre, Mais comme il a créé son compte, il reste inscrit sur cartes.gouv. */
    const removeMemberMutation = useMutation<{ user_id: number } | undefined, CartesApiException>({
        mutationFn: () => {
            if (meQuery.data?.id) {
                return api.community.removeMember(communityId, meQuery.data.id);
            }
            return Promise.resolve(undefined);
        },
        onSuccess: () => routes.espaceco_community_list().push(),
    });

    const community = useMemo(() => query.data, [query.data]);

    return (
        <Main
            customBreadcrumbProps={{
                homeLinkProps: routes.home().link,
                segments: [],
                currentPageLabel: tBreadcrumb("espaceco_member_invitation"),
            }}
            title={t("document_title")}
        >
            <h1>{t("document_title")}</h1>
            {meQuery.isLoading && <LoadingText as="h6" message={t("userme_loading")} />}

            {query.isLoading && <LoadingText as="h6" message={t("community_loading")} />}
            {query.isError && <Alert severity="error" closable title={t("community_loading_failed")} />}

            {updateRoleMutation.isError && <Alert severity="error" closable title={updateRoleMutation.error.message} />}
            {updateRoleMutation.isPending && (
                <Wait>
                    <div className={fr.cx("fr-grid-row")}>
                        <LoadingText as="h6" message={t("inviting")} withSpinnerIcon={true} />
                    </div>
                </Wait>
            )}

            {removeMemberMutation.isError && <Alert severity="error" closable title={removeMemberMutation.error.message} />}
            {removeMemberMutation.isPending && (
                <Wait>
                    <div className={fr.cx("fr-grid-row")}>
                        <LoadingText as="h6" message={t("rejecting")} withSpinnerIcon={true} />
                    </div>
                </Wait>
            )}

            {errorMessage ? (
                <Alert severity={errorMessage.type} closable title={errorMessage.message} />
            ) : (
                community &&
                (myRole === "invited" ? (
                    <div>
                        <CallOut
                            title={
                                <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                                    <img
                                        className={cx(fr.cx("fr-mr-2v"), "frx-invitation-img")}
                                        alt={t("logo")}
                                        src={community.logo_url ? community.logo_url : "https://www.systeme-de-des ign.gouv.fr/img/placeholder.1x1.png"}
                                    />
                                    {t("community_name", { name: community.name })}
                                </div>
                            }
                        >
                            <div>
                                {t("community_description", { description: community.description })}
                                <ButtonsGroup
                                    buttons={[
                                        {
                                            children: t("reject"),
                                            priority: "secondary",
                                            onClick: () => removeMemberMutation.mutate(),
                                        },
                                        {
                                            children: t("accept"),
                                            priority: "primary",
                                            onClick: () => updateRoleMutation.mutate(),
                                        },
                                    ]}
                                    inlineLayoutWhen="always"
                                    alignment="left"
                                    className={fr.cx("fr-mt-2w")}
                                />
                            </div>
                        </CallOut>
                    </div>
                ) : myRole !== undefined ? (
                    <p>{t("already_member")}</p>
                ) : (
                    <Alert severity={"warning"} closable title={t("not_member")} />
                ))
            )}
        </Main>
    );
};

export default MemberInvitation;
