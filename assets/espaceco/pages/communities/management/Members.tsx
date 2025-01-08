import { fr } from "@codegouvfr/react-dsfr";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";
import Select from "@codegouvfr/react-dsfr/Select";
import Table from "@codegouvfr/react-dsfr/Table";
import Pagination from "@mui/material/Pagination";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, ReactNode, useCallback, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { CommunityMember, GetResponse, Role } from "../../../../@types/app_espaceco";
import { CommunityResponseDTO } from "../../../../@types/espaceco";
import ConfirmDialog, { ConfirmDialogModal } from "../../../../components/Utils/ConfirmDialog";
import LoadingIcon from "../../../../components/Utils/LoadingIcon";
import LoadingText from "../../../../components/Utils/LoadingText";
import Wait from "../../../../components/Utils/Wait";
import { declareComponentKeys, useTranslation } from "../../../../i18n/i18n";
import RQKeys from "../../../../modules/espaceco/RQKeys";
import { CartesApiException } from "../../../../modules/jsonFetch";
import { routes } from "../../../../router/router";
import api from "../../../api";
import { AddMembersDialog, AddMembersDialogModal } from "./member/AddMembersDialog";
import { ManageGridsDialog, ManageGridsDialogModal } from "./member/ManageGridsDialog";
import { Translations } from "../../../../i18n/types";

export type membersQueryParams = {
    page: number;
    limit: number;
};

type MembersProps = {
    community: CommunityResponseDTO;
};

const maxFetchedMembers = 10;
const getName = (firstname: string | null, surname: string | null) => `${firstname ? firstname : ""} ${surname ? surname : ""}`;

const Members: FC<MembersProps> = ({ community }) => {
    const { t } = useTranslation("EscoCommunityMembers");

    const queryClient = useQueryClient();

    const [currentPage, setCurrentPage] = useState<number>(1);

    const [action, setAction] = useState<"remove" | "reject" | undefined>(undefined);
    const [currentMember, setCurrentMember] = useState<CommunityMember | undefined>(undefined);

    // Les demandes d'affiliation
    const membershipRequestsQuery = useQuery<GetResponse<CommunityMember>, CartesApiException>({
        queryKey: RQKeys.communityMembershipRequests(community.id),
        queryFn: ({ signal }) => api.community.getCommunityMembershipRequests(community.id, signal),
        staleTime: 60000,
    });

    // Les membres non en demande d'affiliation
    const membersQuery = useQuery<GetResponse<CommunityMember>, CartesApiException>({
        queryKey: RQKeys.communityMembers(community.id, currentPage, maxFetchedMembers),
        queryFn: ({ signal }) => api.community.getCommunityMembers(community.id, currentPage, maxFetchedMembers, signal),
        staleTime: 60000,
    });

    /* Mise a jour du role de l'utilisateur */
    const updateRoleMutation = useMutation<CommunityMember, CartesApiException, { communityId: number; userId: number; role: Role }>({
        mutationFn: (params) => {
            return api.community.updateMemberRole(params.communityId, params.userId, params.role);
        },
        onSuccess(response) {
            /* Mise à jour des données de la requête membersQuery */
            queryClient.setQueryData<GetResponse<CommunityMember>>(RQKeys.communityMembers(community.id, currentPage, maxFetchedMembers), (datas) => {
                if (datas) {
                    datas.content.forEach((member) => {
                        if (member.user_id === response.user_id) {
                            member.role = response.role; // Mise a jour du role
                        }
                    });
                }
                return datas;
            });

            /* Mise à jour des données de la requête membershipRequestsQuery */
            queryClient.setQueryData<CommunityMember[]>(RQKeys.communityMembershipRequests(community.id), (datas) => {
                if (datas) {
                    datas = datas.filter((member) => member.user_id !== response.user_id);
                }
                return datas;
            });
        },
    });

    /* Mise a jour des grids  de l'utilisateur */
    const updateGridsMutation = useMutation<CommunityMember, CartesApiException, { communityId: number; userId: number; grids: string[] }>({
        mutationFn: (params) => {
            return api.community.updateMemberGrids(params.communityId, params.userId, params.grids);
        },
        onSuccess(response) {
            /* Mise à jour des données de la requête membersQuery */
            queryClient.setQueryData<GetResponse<CommunityMember>>(RQKeys.communityMembers(community.id, currentPage, maxFetchedMembers), (datas) => {
                if (datas) {
                    datas.content.forEach((member) => {
                        if (member.user_id === response.user_id) {
                            member.grids = response.grids; // Mise a jour des grids
                        }
                    });
                }
                return datas;
            });
        },
    });

    /* Suppression d'un membre */
    const removeMemberMutation = useMutation<{ user_id: number }, CartesApiException, { communityId: number; userId: number }>({
        mutationFn: ({ communityId, userId }) => {
            return api.community.removeMember(communityId, userId);
        },
        onSuccess(response) {
            /* Mise à jour des données de la requête membersQuery */
            queryClient.setQueryData<GetResponse<CommunityMember>>(RQKeys.communityMembers(community.id, currentPage, maxFetchedMembers), (datas) => {
                if (datas) {
                    datas.content = datas.content.filter((member) => member.user_id !== response.user_id);
                }
                return datas;
            });

            /* Mise à jour des données de la requête membershipRequestsQuery */
            queryClient.setQueryData<CommunityMember[]>(RQKeys.communityMembershipRequests(community.id), (datas) => {
                if (datas) {
                    datas = datas.filter((member) => member.user_id !== response.user_id);
                }
                return datas;
            });
        },
        onSettled: () => {
            setAction(undefined);
        },
    });

    const addMembersMutation = useMutation<CommunityMember[], CartesApiException, { communityId: number; members: (number | string)[] }>({
        mutationFn: ({ communityId, members }) => {
            return api.community.addMembers(communityId, members);
        },
        onSuccess() {
            queryClient.refetchQueries({ queryKey: RQKeys.communityMembers(community.id, currentPage, maxFetchedMembers) });
        },
    });

    const alert = useCallback((title: string, error: string) => {
        return <Alert className={"fr-my-2w"} severity={"error"} closable={false} title={title} description={error} />;
    }, []);

    const displayWait = useCallback(
        (text) => (
            <Wait>
                <div className={fr.cx("fr-container")}>
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                        <div className={fr.cx("fr-col-2")}>
                            <LoadingIcon className={fr.cx("fr-mr-2v")} />
                        </div>
                        <div className={fr.cx("fr-col-10")}>
                            <h6 className={fr.cx("fr-h6", "fr-m-0")}>{text}</h6>
                        </div>
                    </div>
                </div>
            </Wait>
        ),
        []
    );

    const headers = useMemo(() => [t("username_header"), t("name_header"), t("status_header"), t("grids_header"), ""], [t]);
    const pendingHeaders = useMemo(() => [t("username_header"), t("name_header"), t("date_header"), ""], [t]);

    const memberData: ReactNode[][] = useMemo(() => {
        const datas = membersQuery.data?.content ?? [];
        return (
            datas.map((m) => [
                m.username,
                getName(m.firstname, m.surname),
                <Select
                    label={null}
                    key={m.user_id}
                    nativeSelectProps={{
                        name: `role-${uuidv4()}`,
                        onChange: (e) => {
                            const value = e.currentTarget.value;
                            updateRoleMutation.mutate({ communityId: community.id, userId: m.user_id, role: value as Role });
                        },
                        value: m.role,
                    }}
                >
                    {["member", "admin"].map((r) => (
                        <option key={r} value={r}>
                            {t("role", { role: r as Role })}
                        </option>
                    ))}
                </Select>,
                <Button
                    key={m.user_id}
                    title={t("manage_grids")}
                    priority={"secondary"}
                    onClick={() => {
                        setCurrentMember(m);
                        ManageGridsDialogModal.open();
                    }}
                >
                    {t("manage_grids")}
                </Button>,
                <div key={m.user_id} className={fr.cx("fr-grid-row", "fr-grid-row--right")}>
                    <Button
                        title={t("remove_title")}
                        priority={"tertiary no outline"}
                        iconId={"fr-icon-delete-line"}
                        onClick={() => {
                            setAction("remove");
                            setCurrentMember(m);
                            ConfirmDialogModal.open();
                        }}
                    />
                </div>,
            ]) ?? []
        );
    }, [community, t, membersQuery.data, updateRoleMutation]);

    const pendingData: ReactNode[][] = useMemo(() => {
        const datas = membershipRequestsQuery.data?.content ?? [];
        return (
            datas.map((m) => [
                m.username,
                getName(m.firstname, m.surname),
                m.date,
                <div key={m.user_id} className={fr.cx("fr-grid-row", "fr-grid-row--right")}>
                    <Button
                        title={t("reject_title")}
                        priority={"tertiary no outline"}
                        onClick={() => {
                            setAction("reject");
                            removeMemberMutation.mutate({ communityId: community.id, userId: m.user_id });
                        }}
                    >
                        {t("reject")}
                    </Button>
                    <Button
                        title={t("accept_title")}
                        priority={"tertiary no outline"}
                        onClick={() => updateRoleMutation.mutate({ communityId: community.id, userId: m.user_id, role: "member" })}
                    >
                        {t("accept")}
                    </Button>
                </div>,
            ]) ?? []
        );
    }, [community, membershipRequestsQuery.data, updateRoleMutation, removeMemberMutation, t]);

    return (
        <div>
            {/* les requêtes ont échoué */}
            {membersQuery.isError && (
                <Alert
                    severity="error"
                    closable={false}
                    title={t("fetch_members_failed")}
                    description={
                        <>
                            <p>{membersQuery.error.message}</p>
                            <Button linkProps={routes.espaceco_community_list().link}>{t("back_to_list")}</Button>
                        </>
                    }
                />
            )}

            {/* LES ERREURS */}
            {membershipRequestsQuery.isError && alert(t("fetch_affiliate_members_failed"), membershipRequestsQuery.error.message)}
            {updateRoleMutation.isError && alert(t("update_role_failed"), updateRoleMutation.error.message)}
            {updateGridsMutation.isError && alert(t("update_grids_failed"), updateGridsMutation.error.message)}
            {addMembersMutation.isError && alert(t("add_members_failed"), addMembersMutation.error.message)}
            {removeMemberMutation.isError && alert(t("remove_member_failed"), removeMemberMutation.error.message)}

            {/* LES ACTIONS EN COURS */}
            {(membershipRequestsQuery.isLoading || membersQuery.isLoading) && <LoadingText as={"h6"} />}
            {updateRoleMutation.isPending && displayWait(t("updating_role"))}
            {updateGridsMutation.isPending && displayWait(t("updating_grids"))}
            {addMembersMutation.isPending && displayWait(t("adding_members"))}
            {removeMemberMutation.isPending && displayWait(t("removing_action", { action: action }))}

            {membershipRequestsQuery.data?.content && membershipRequestsQuery.data.content.length > 0 && (
                <Accordion label={t("membership_requests", { count: membershipRequestsQuery.data.content.length })} defaultExpanded={true}>
                    <Table headers={pendingHeaders} data={pendingData} fixed />
                </Accordion>
            )}
            {membersQuery.data?.content && membersQuery.data.content.length > 0 && (
                <div>
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--right")}>
                        <Button iconId="fr-icon-add-circle-line" onClick={() => AddMembersDialogModal.open()}>
                            {t("invite")}
                        </Button>
                    </div>
                    <Table headers={headers} data={memberData} fixed />
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--center")}>
                        <MuiDsfrThemeProvider>
                            <Pagination
                                count={membersQuery.data.totalPages}
                                page={currentPage}
                                variant="outlined"
                                shape="rounded"
                                onChange={(_, v) => setCurrentPage(v)}
                            />
                        </MuiDsfrThemeProvider>
                    </div>
                </div>
            )}
            <ConfirmDialog
                title={t("confirm_remove")}
                onConfirm={() => {
                    if (currentMember !== undefined) {
                        removeMemberMutation.mutate({ communityId: community.id, userId: currentMember.user_id });
                    }
                }}
            />
            <AddMembersDialog onAdd={(ids) => addMembersMutation.mutate({ communityId: community.id, members: ids })} />
            <ManageGridsDialog
                communityGrids={community.grids}
                userGrids={currentMember?.grids ?? []}
                onApply={(grids) => {
                    if (currentMember !== undefined) {
                        updateGridsMutation.mutate({ communityId: community.id, userId: currentMember.user_id, grids });
                    }
                }}
            />
        </div>
    );
};

export default Members;

// traductions
const { i18n } = declareComponentKeys<
    | "fetch_members_failed"
    | "fetch_affiliate_members_failed"
    | "update_role_failed"
    | "update_grids_failed"
    | "add_members_failed"
    | "remove_member_failed"
    | "back_to_list"
    | "loading_members"
    | "loading_membership_requests"
    | { K: "membership_requests"; P: { count: number }; R: string }
    | "adding_members"
    | "username_header"
    | "name_header"
    | "status_header"
    | "grids_header"
    | { K: "role"; P: { role: Role }; R: string }
    | "date_header"
    | "updating_role"
    | "updating_grids"
    | { K: "removing_action"; P: { action: "remove" | "reject" | undefined }; R: string }
    | "confirm_remove"
    | "accept"
    | "accept_title"
    | "reject"
    | "reject_title"
    | "remove_title"
    | "manage_grids"
    | "invite"
>()("EscoCommunityMembers");
export type I18n = typeof i18n;

export const EscoCommunityMembersFrTranslations: Translations<"fr">["EscoCommunityMembers"] = {
    fetch_members_failed: "La récupération des membres du guichet a échoué",
    fetch_affiliate_members_failed: "La récupération des demandes d'affiliation pour ce guichet a échoué",
    update_role_failed: "La mise à jour du rôle de ce membre a échoué",
    update_grids_failed: "La mise à jour des emprises de ce membre a échoué",
    add_members_failed: "L'ajout de nouveaux membres a échoué",
    remove_member_failed: "La suppression d'un membre a échoué",
    back_to_list: "Retour à la liste des guichets",
    loading_members: "Chargement des membres du guichet ...",
    loading_membership_requests: "Chargement des demandes d’affiliation ...",
    membership_requests: ({ count }) => `Demandes d’affiliation (${count})`,
    adding_members: "Ajout de nouveaux membres en cours ...",
    username_header: "Nom de l'utilisateur",
    name_header: "Nom, prénom",
    status_header: "Statut",
    grids_header: "Emprises individuelles",
    role: ({ role }) => {
        switch (role) {
            case "admin":
                return "Gestionnaire";
            case "member":
                return "Membre";
            case "pending":
                return "En attente de demande d'affiliation";
            case "invited":
                return "Invité";
        }
    },
    date_header: "Date de la demande",
    updating_role: "Mise à jour du rôle de l'utilisateur en cours ...",
    updating_grids: "Mise à jour des emprises de l'utilisateur en cours ...",
    removing_action: ({ action }) => {
        switch (action) {
            case "remove":
                return "Suppression de l'utilisateur en cours ...";
            case "reject":
                return "Rejet de la demande d'affiliation en cours ...";
            default:
                return "";
        }
    },
    confirm_remove: "Êtes-vous sûr de vouloir supprimer cet utilisateur ?",
    accept: "Accepter",
    accept_title: "Accepter la demande",
    reject: "Rejeter",
    reject_title: "Rejeter la demande",
    remove_title: "Supprimer l'utilisateur",
    manage_grids: "Gérer",
    invite: "Inviter des membres",
};

export const EscoCommunityMembersEnTranslations: Translations<"en">["EscoCommunityMembers"] = {
    fetch_members_failed: undefined,
    fetch_affiliate_members_failed: undefined,
    update_role_failed: undefined,
    update_grids_failed: undefined,
    add_members_failed: undefined,
    remove_member_failed: undefined,
    back_to_list: undefined,
    loading_members: undefined,
    loading_membership_requests: undefined,
    membership_requests: ({ count }) => `Membership requests (${count})`,
    adding_members: "Adding new members ...",
    username_header: "username",
    name_header: undefined,
    status_header: "Status",
    grids_header: undefined,
    role: ({ role }) => `${role}`,
    date_header: undefined,
    updating_role: undefined,
    updating_grids: undefined,
    removing_action: ({ action }) => `${action}`,
    confirm_remove: undefined,
    accept: undefined,
    accept_title: undefined,
    reject: undefined,
    reject_title: undefined,
    remove_title: undefined,
    manage_grids: "Manage",
    invite: undefined,
};
