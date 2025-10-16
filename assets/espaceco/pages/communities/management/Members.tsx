import { useCommunityContext } from "@/espaceco/contexts/CommunityContext";
import { useSearchMember } from "@/espaceco/hooks/useSearchMember";
import { usePagination } from "@/hooks/usePagination";
import { fr } from "@codegouvfr/react-dsfr";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";
import Select from "@codegouvfr/react-dsfr/Select";
import Table from "@codegouvfr/react-dsfr/Table";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import Pagination from "@mui/material/Pagination";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, ReactNode, useCallback, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { CommunityMember, GetResponse, Role } from "../../../../@types/app_espaceco";
import ConfirmDialog, { ConfirmDialogModal } from "../../../../components/Utils/ConfirmDialog";
import LoadingIcon from "../../../../components/Utils/LoadingIcon";
import LoadingText from "../../../../components/Utils/LoadingText";
import Wait from "../../../../components/Utils/Wait";
import { useTranslation } from "../../../../i18n/i18n";
import RQKeys from "../../../../modules/espaceco/RQKeys";
import { CartesApiException } from "../../../../modules/jsonFetch";
import { routes } from "../../../../router/router";
import "../../../../sass/pages/espaceco/member.scss";
import api from "../../../api";
import { AddMembersDialog, AddMembersDialogModal } from "./member/AddMembersDialog";
import { ManageGridsDialog, ManageGridsDialogModal } from "./member/ManageGridsDialog";

const maxFetchedMembers = 10;
const getName = (firstname: string | null, surname: string | null) => `${firstname ? firstname : ""} ${surname ? surname : ""}`;

const Members: FC = () => {
    const { t: tCommon } = useTranslation("Common");
    const { t } = useTranslation("EscoCommunityMembers");

    const context = useCommunityContext();
    const community = context.community!;

    const queryClient = useQueryClient();

    const [currentPage, setCurrentPage] = useState<number>(1);

    const [action, setAction] = useState<"remove" | "reject" | undefined>(undefined);
    const [currentMember, setCurrentMember] = useState<CommunityMember | undefined>(undefined);

    const [search, setSearch] = useState<string>("");

    // Les demandes d'affiliation
    const membershipRequestsQuery = useQuery<CommunityMember[], CartesApiException>({
        queryKey: RQKeys.communityMembershipRequests(community.id),
        queryFn: ({ signal }) => api.community.getCommunityMembershipRequests(community.id, signal),
        staleTime: 60000,
    });

    // Les membres non en demande d'affiliation
    const membersQuery = useQuery<CommunityMember[], CartesApiException>({
        queryKey: RQKeys.communityMembers(community.id),
        queryFn: ({ signal }) => api.community.getCommunityMembers(community.id, signal),
        staleTime: 60000,
    });

    /* Mise a jour du role de l'utilisateur */
    const updateRoleMutation = useMutation<CommunityMember, CartesApiException, { communityId: number; userId: number; role: Role }>({
        mutationFn: (params) => {
            return api.community.updateMemberRole(params.communityId, params.userId, params.role);
        },
        onSuccess(response) {
            /* Mise à jour des données de la requête membersQuery */
            queryClient.setQueryData<GetResponse<CommunityMember>>(RQKeys.communityMembers(community.id), (datas) => {
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

    const { mutate: updateRole } = updateRoleMutation;

    /* Mise a jour des grids  de l'utilisateur */
    const updateGridsMutation = useMutation<CommunityMember, CartesApiException, { communityId: number; userId: number; grids: string[] }>({
        mutationFn: (params) => {
            return api.community.updateMemberGrids(params.communityId, params.userId, params.grids);
        },
        onSuccess(response) {
            /* Mise à jour des données de la requête membersQuery */
            queryClient.setQueryData<GetResponse<CommunityMember>>(RQKeys.communityMembers(community.id), (datas) => {
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
            queryClient.setQueryData<GetResponse<CommunityMember>>(RQKeys.communityMembers(community.id), (datas) => {
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

    const { mutate: removeMember } = removeMemberMutation;

    const addMembersMutation = useMutation<CommunityMember[], CartesApiException, { communityId: number; members: (number | string)[] }>({
        mutationFn: ({ communityId, members }) => {
            return api.community.addMembers(communityId, members);
        },
        onSuccess() {
            queryClient.refetchQueries({ queryKey: RQKeys.communityMembers(community.id) });
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

    const { searchedItems } = useSearchMember(membersQuery.data ?? [], search);
    const { paginatedItems, totalPages } = usePagination(searchedItems, currentPage, maxFetchedMembers);

    const memberData: ReactNode[][] = useMemo(() => {
        const datas = paginatedItems ?? [];
        return (
            datas.map((m) => {
                const grids = m.grids.map((grid) => grid.name).join(", ");

                return [
                    m.username,
                    getName(m.firstname, m.surname),
                    <Select
                        label={null}
                        key={m.user_id}
                        nativeSelectProps={{
                            name: `role-${uuidv4()}`,
                            onChange: (e) => {
                                const value = e.currentTarget.value;
                                updateRole({ communityId: community.id, userId: m.user_id, role: value as Role });
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
                    <div key={m.user_id} className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                        <div className={cx(fr.cx("fr-col-10"), "frx-member-grids")} title={grids}>
                            {grids}
                        </div>
                        <div className={fr.cx("fr-col-2")}>
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
                            </Button>
                        </div>
                    </div>,
                    /*                     <Button
                        key={m.user_id}
                        title={t("manage_grids")}
                        priority={"secondary"}
                        onClick={() => {
                            setCurrentMember(m);
                            ManageGridsDialogModal.open();
                        }}
                    >
                        {t("manage_grids")}
                    </Button>, */
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
                ];
            }) ?? []
        );
    }, [community, t, paginatedItems, updateRole]);

    const pendingData: ReactNode[][] = useMemo(() => {
        const datas = membershipRequestsQuery.data ?? [];
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
                            removeMember({ communityId: community.id, userId: m.user_id });
                        }}
                    >
                        {t("reject")}
                    </Button>
                    <Button
                        title={t("accept_title")}
                        priority={"tertiary no outline"}
                        onClick={() => updateRole({ communityId: community.id, userId: m.user_id, role: "member" })}
                    >
                        {t("accept")}
                    </Button>
                </div>,
            ]) ?? []
        );
    }, [community, membershipRequestsQuery.data, updateRole, removeMember, t]);

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
            {membersQuery.isLoading && <LoadingText as={"h6"} message={t("loading_members")} />}
            {membershipRequestsQuery.isLoading && <LoadingText as={"h6"} message={t("loading_membership_requests")} />}
            {updateRoleMutation.isPending && displayWait(t("updating_role"))}
            {updateGridsMutation.isPending && displayWait(t("updating_grids"))}
            {addMembersMutation.isPending && displayWait(t("adding_members"))}
            {removeMemberMutation.isPending && displayWait(t("removing_action", { action: action }))}

            {membershipRequestsQuery.data && membershipRequestsQuery.data.length > 0 && (
                <Accordion label={t("membership_requests", { count: membershipRequestsQuery.data.length })} defaultExpanded={true}>
                    <Table headers={pendingHeaders} data={pendingData} fixed />
                </Accordion>
            )}
            {membersQuery.data && membersQuery.data.length > 0 && (
                <div>
                    <div className={fr.cx("fr-grid-row", "fr-mb-2v")}>
                        <div className={fr.cx("fr-col-7")}>
                            <Input
                                label={null}
                                addon={<Button title={tCommon("clear")} iconId={"fr-icon-close-line"} priority={"tertiary"} onClick={() => setSearch("")} />}
                                nativeInputProps={{
                                    placeholder: t("filter_placeholder"),
                                    value: search,
                                    onChange: (e) => {
                                        setSearch(e.currentTarget.value);
                                        setCurrentPage(1);
                                    },
                                }}
                            />
                        </div>
                        <div className={fr.cx("fr-col-5")}>
                            <div className={fr.cx("fr-grid-row", "fr-grid-row--right", "fr-mb-2v")}>
                                <Button iconId="fr-icon-add-circle-line" onClick={() => AddMembersDialogModal.open()}>
                                    {t("invite")}
                                </Button>
                            </div>
                        </div>
                    </div>
                    <Table headers={headers} data={memberData} fixed />
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--center", "fr-mt-2v")}>
                        <MuiDsfrThemeProvider>
                            <Pagination
                                count={totalPages}
                                page={currentPage}
                                variant="outlined"
                                shape="rounded"
                                showFirstButton
                                showLastButton
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
