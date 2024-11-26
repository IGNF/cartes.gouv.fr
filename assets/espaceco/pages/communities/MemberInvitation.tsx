import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import CallOut from "@codegouvfr/react-dsfr/CallOut";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FC, useMemo } from "react";
import { CommunityMember, Role, UserMe } from "../../../@types/app_espaceco";
import { CommunityResponseDTO } from "../../../@types/espaceco";
import AppLayout from "../../../components/Layout/AppLayout";
import LoadingText from "../../../components/Utils/LoadingText";
import Wait from "../../../components/Utils/Wait";
import { datastoreNavItems } from "../../../config/datastoreNavItems";
import { declareComponentKeys, Translations, useTranslation } from "../../../i18n/i18n";
import RQKeys from "../../../modules/espaceco/RQKeys";
import { CartesApiException } from "../../../modules/jsonFetch";
import { routes } from "../../../router/router";
import api from "../../api";

import "../../../../assets/sass/pages/espaceco/member_invitation.scss";

type MemberInvitationProps = {
    communityId: number;
};

const MemberInvitation: FC<MemberInvitationProps> = ({ communityId }) => {
    const { t } = useTranslation("MemberInvitation");
    const { t: tBreadcrumb } = useTranslation("Breadcrumb");

    const navItems = useMemo(() => datastoreNavItems(), []);

    const query = useQuery<CommunityResponseDTO, CartesApiException>({
        queryKey: RQKeys.community(communityId),
        queryFn: () => api.community.getCommunity(communityId),
        staleTime: 3600000,
    });

    const meQuery = useQuery<UserMe>({
        queryKey: RQKeys.getMe(),
        queryFn: ({ signal }) => api.user.getMe(signal),
        staleTime: 3600000,
    });

    const myRole = useMemo<Role | undefined>(() => {
        let role: Role | undefined;
        if (meQuery.data) {
            const user_id = meQuery.data.id;
            const invitations = meQuery.data.communities_member.filter((m) => m.community_id === communityId && m.user_id === user_id);
            if (invitations.length === 1) {
                role = invitations[0].role;
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
        <AppLayout
            navItems={navItems}
            customBreadcrumbProps={{
                homeLinkProps: routes.home().link,
                segments: [],
                currentPageLabel: tBreadcrumb("espaceco_member_invitation"),
            }}
            documentTitle={t("document_title")}
        >
            <h1>{t("document_title")}</h1>
            {query.isLoading && <LoadingText as="h6" message={t("community_loading")} />}
            {meQuery.isLoading && <LoadingText as="h6" message={t("userme_loading")} />}

            {query.isError && <Alert severity="error" closable title={t("community_loading_failed")} />}
            {meQuery.isError && <Alert severity="error" closable title={t("userme_loading_failed")} />}

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

            {community && myRole === "invited" ? (
                <div>
                    <CallOut
                        title={
                            <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                                <img
                                    className={cx(fr.cx("fr-mr-2v"), "frx-invitation-img")}
                                    alt={t("logo")}
                                    src={community.logo_url ? community.logo_url : "https://www.systeme-de-design.gouv.fr/img/placeholder.1x1.png"}
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
                <p>{t("no_invitation")}</p>
            )}
        </AppLayout>
    );
};

export default MemberInvitation;

export const { i18n } = declareComponentKeys<
    | "document_title"
    | "community_loading"
    | "community_loading_failed"
    | "userme_loading"
    | "userme_loading_failed"
    | "logo"
    | { K: "community_name"; P: { name: string }; R: JSX.Element }
    | { K: "community_description"; P: { description: string | null }; R: JSX.Element }
    | { K: "invitation"; R: JSX.Element }
    | "already_member"
    | "no_invitation"
    | "accept"
    | "reject"
    | "inviting"
    | "rejecting"
>()("MemberInvitation");

export const MemberInvitationFrTranslations: Translations<"fr">["MemberInvitation"] = {
    document_title: "Invitation",
    community_loading: "Chargement du guichet en cours ...",
    community_loading_failed: "La récupération des informations du guichet a échoué.",
    userme_loading: "Chargement de vos données utilisateur en cours ...",
    userme_loading_failed: "La récupération de vous données d'utilisateur a échoué.",
    logo: "Logo du guichet",
    community_name: ({ name }) => (
        <div>
            Guichet <strong>{name}</strong>
        </div>
    ),
    community_description: ({ description }) => {
        return description ? <p dangerouslySetInnerHTML={{ __html: description }} /> : <p>Aucune description</p>;
    },
    invitation: <p>Vous avez reçu une invitation à rejoindre le guichet :</p>,
    already_member: "Vous êtes déjà membre de ce guichet",
    no_invitation: "Vous n'avez pas reçu d'invitation de ce guichet",
    accept: "Accepter et rejoindre le guichet",
    reject: "Refuser l'invitation",
    inviting: "Invitation en cours ...",
    rejecting: "Refus en cours ...",
};

export const MemberInvitationEnTranslations: Translations<"en">["MemberInvitation"] = {
    document_title: "Invitation",
    community_loading: "Community loading ...",
    community_loading_failed: undefined,
    userme_loading: undefined,
    userme_loading_failed: undefined,
    logo: undefined,
    community_name: ({ name }) => (
        <p>
            Community <strong>`${name}`</strong>
        </p>
    ),
    community_description: undefined,
    invitation: undefined,
    already_member: undefined,
    no_invitation: undefined,
    accept: undefined,
    reject: undefined,
    inviting: undefined,
    rejecting: undefined,
};
