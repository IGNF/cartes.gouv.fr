import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { ToggleSwitch } from "@codegouvfr/react-dsfr/ToggleSwitch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import { UserRightsResponseDto } from "../../../../@types/app";
import { CommunityUserResponseDto, UserDto } from "../../../../@types/entrepot";
import ConfirmDialog, { ConfirmDialogModal } from "../../../../components/Utils/ConfirmDialog";
import LoadingText from "../../../../components/Utils/LoadingText";
import Wait from "../../../../components/Utils/Wait";
import { useTranslation } from "../../../../i18n/i18n";
import RQKeys from "../../../../modules/entrepot/RQKeys";
import { CartesApiException } from "../../../../modules/jsonFetch";
import { routes } from "../../../../router/router";
import { useAuthStore } from "../../../../stores/AuthStore";
import api from "../../../api";
import { AddMember, addMemberModal } from "../AddMember/AddMember";
import { complete, getTranslatedRightTypes, UserRights } from "../UserRights";

import "../../../../sass/pages/community_members.scss";
import { useCommunity } from "../../../../contexts/community";
import Main from "../../../../components/Layout/Main";
import { useDatastore } from "../../../../contexts/datastore";

type CommunityMembersProps = {
    userId?: string;
};

type Member = {
    id: string;
    name: string;
    rights: Record<string, boolean>;
    isSupervisor: boolean;
    isMe: boolean;
};

type updateMember = {
    user_id: string;
    user_rights: string[];
};

const tableContainerClassName = fr.cx("fr-table", "fr-table--bordered", "fr-table--no-caption", "fr-mt-2w") + " frx-table-member";

const getName = (member: UserDto) => {
    const lastName = member.last_name ?? "";
    const firstname = member.first_name ?? "";

    const name = `${firstname} ${lastName}`;
    return name.replace(/\s+/g, "") === "" ? member.email : name;
};

function CommunityMembers({ userId }: CommunityMembersProps) {
    // Traductions
    const { t: tCommon } = useTranslation("Common");
    const { t } = useTranslation({ CommunityMembers });
    const { t: tBreadcrumb } = useTranslation("Breadcrumb");

    const { user } = useAuthStore();
    // const [members, setMembers] = useState<Member[]>([]);
    const [currentMember, setCurrentMember] = useState<string | undefined>(undefined);

    // Data
    const community = useCommunity();
    const { datastore } = useDatastore();

    // Les membres de cette communauté
    const { data: communityMembers, isLoading: isLoadingMembers } = useQuery({
        queryKey: RQKeys.community_members(community._id),
        queryFn: ({ signal }) => api.community.getMembers(community._id, { signal }),
        staleTime: 20000,
    });

    const communitySupervisor = useMemo(() => {
        return community?.supervisor._id;
    }, [community]);

    const communityMemberIds = useMemo(() => {
        return communityMembers?.map((member) => member.user._id) ?? [];
    }, [communityMembers]);

    const members: Member[] = useMemo(() => {
        if (!communityMembers) {
            return [];
        }
        const members: Member[] = [];
        communityMembers.forEach((member) => {
            members.push({
                id: member.user._id,
                name: getName(member.user),
                rights: complete(member.rights),
                isSupervisor: member.user._id === communitySupervisor,
                isMe: member.user._id === user?.id,
            });
        });
        members.sort((m1, m2) => {
            if (m1.name.toLowerCase() < m2.name.toLowerCase()) return -1;
            if (m1.name.toLowerCase() > m2.name.toLowerCase()) return 1;
            return 0;
        });

        return members;
    }, [communityMembers, communitySupervisor, user?.id]);

    useEffect(() => {
        if (userId && !isLoadingMembers && !communityMemberIds.includes(userId)) {
            addMemberModal.open();
        }
    }, [communityMemberIds, isLoadingMembers, userId]);

    const queryClient = useQueryClient();

    // Suppression d'un utilisateur
    const { isPending: isRemovePending, mutate: mutateRemove } = useMutation<{ user: string } | undefined, CartesApiException, string>({
        mutationFn: (user_id: string) => {
            if (community._id) return api.community.removeMember(community._id, user_id);
            return Promise.resolve(undefined);
        },
        onSuccess: (response) => {
            if (response) {
                queryClient.setQueryData(RQKeys.community_members(community._id), () => {
                    return communityMembers?.filter((member) => member.user._id !== response.user);
                });
            }
        },
    });

    // Modification des droits d'un utilisateur
    const { isPending: isModifyPending, mutate: mutateModify } = useMutation<UserRightsResponseDto | undefined, CartesApiException, updateMember>({
        mutationFn: (datas) => {
            if (community._id) return api.community.updateMember(community._id, datas);
            return Promise.resolve(undefined);
        },
        onSuccess: (response) => {
            if (response) {
                queryClient.setQueryData<CommunityUserResponseDto[]>(RQKeys.community_members(community._id), (communityMembers) => {
                    communityMembers?.forEach((member) => {
                        if (member.user._id === response.user) {
                            member.rights = response.rights; // Mise a jour des droits
                        }
                    });
                    return communityMembers;
                });
            }
        },
    });

    // Modification d'un droit d'un utilisateur
    const handleToggleChanged = (user_id: string, right: string, checked: boolean) => {
        const m = JSON.parse(JSON.stringify(members)); // Vraie copie

        const user = m.find((member) => member.id === user_id);
        if (!user) {
            return;
        }

        user.rights[right] = checked;
        Object.keys(user.rights).forEach((k) => user.rights[k] === false && delete user.rights[k]); // Suppression des droits a false
        mutateModify({ user_id: user_id, user_rights: Object.keys(user.rights) });
    };

    return (
        <Main
            customBreadcrumbProps={{
                homeLinkProps: routes.home().link,
                segments: [
                    { label: tBreadcrumb("dashboard_pro"), linkProps: routes.dashboard_pro().link },
                    { label: datastore?.name, linkProps: routes.datasheet_list({ datastoreId: datastore?._id ?? "XXXX" }).link },
                ],
                currentPageLabel: tBreadcrumb("members_list"),
            }}
            title="Membres"
        >
            {isLoadingMembers && <LoadingText />}
            {!isLoadingMembers && userId && communityMemberIds.includes(userId) && (
                <Alert
                    className={fr.cx("fr-mb-1w")}
                    severity={"warning"}
                    title={t("already_member", { userId: userId })}
                    closable
                    onClose={() => {
                        routes.members_list({ communityId: community._id }).push();
                    }}
                />
            )}
            {!isLoadingMembers && (
                <>
                    <h1>{t("community_members", { communityName: community?.name ?? "" })}</h1>
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--right")}>
                        <Button priority={"primary"} iconId={"fr-icon-add-circle-line"} onClick={() => addMemberModal.open()}>
                            {t("add_user")}
                        </Button>
                    </div>
                    <div className={tableContainerClassName}>
                        <table>
                            <thead>
                                <tr>
                                    <th />
                                    <th colSpan={5}>{t("rights")}</th>
                                    <th />
                                </tr>
                                <tr>
                                    <th>{t("name")}</th>
                                    {getTranslatedRightTypes().map((right) => (
                                        <th key={right}>{right}</th>
                                    ))}
                                    <th />
                                </tr>
                            </thead>
                            <tbody>
                                {members.map((member) => {
                                    return (
                                        <tr key={member.id}>
                                            <td>
                                                {member.name} {member.isMe === true ? " (" + t("me") + ")" : ""}{" "}
                                                {member.isSupervisor === true ? " (" + t("supervisor") + ")" : ""}
                                            </td>
                                            {Object.keys(member.rights).map((r) => {
                                                return (
                                                    <td key={r}>
                                                        <ToggleSwitch
                                                            defaultChecked={member.rights[r] === true}
                                                            disabled={member.isMe === true || member.isSupervisor === true}
                                                            inputTitle={t("add_remove_right_title", { right: r })}
                                                            label={" "}
                                                            showCheckedHint={false}
                                                            onChange={(checked) => handleToggleChanged(member.id, r, checked)}
                                                        />
                                                    </td>
                                                );
                                            })}
                                            {member.isMe === false && member.isSupervisor === false ? (
                                                <td>
                                                    <Button
                                                        title={t("remove_user")}
                                                        priority={"tertiary no outline"}
                                                        iconId={"fr-icon-delete-line"}
                                                        onClick={() => {
                                                            setCurrentMember(member.id);
                                                            ConfirmDialogModal.open();
                                                        }}
                                                    />
                                                </td>
                                            ) : (
                                                <td />
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <UserRights />
                    {(isRemovePending || isModifyPending) && (
                        <Wait>
                            <div className={fr.cx("fr-container")}>
                                <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                                    <i className={fr.cx("fr-icon-refresh-line", "fr-icon--lg", "fr-mr-2v") + " frx-icon-spin"} />
                                    <h6 className={fr.cx("fr-m-0")}>{isRemovePending ? tCommon("removing") : tCommon("modifying")}</h6>
                                </div>
                            </div>
                        </Wait>
                    )}
                </>
            )}
            <AddMember communityId={community._id} communityMemberIds={communityMemberIds} userId={userId} />
            <ConfirmDialog
                title={t("confirm_remove")}
                onConfirm={() => {
                    if (currentMember !== undefined) {
                        mutateRemove(currentMember);
                    }
                }}
            />
        </Main>
    );
}

export default CommunityMembers;
