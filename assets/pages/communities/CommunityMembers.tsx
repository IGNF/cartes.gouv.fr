import { FC, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../stores/AuthStore";
import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { ToggleSwitch } from "@codegouvfr/react-dsfr/ToggleSwitch";
import RQKeys from "../../modules/RQKeys";
import api from "../../api";
import { CommunityMemberDtoRightsEnum, CommunityUserResponseDto, UserDto } from "../../types/entrepot";
import { UserRightsResponseDto } from "../../types/app";
import { getTranslatedRightTypes, complete, UserRights } from "./UserRights";
import DatastoreLayout from "../../components/Layout/DatastoreLayout";
import LoadingText from "../../components/Utils/LoadingText";
import { Translations, declareComponentKeys, useTranslation } from "../../i18n/i18n";
import { CartesApiException } from "../../modules/jsonFetch";
import { AddMember, addMemberModal } from "./AddMember";
import Wait from "../../components/Utils/Wait";
import "../../sass/pages/community_members.scss";
import { routes } from "../../router/router";
import ConfirmDialog, { ConfirmDialogModal } from "../../components/Utils/ConfirmDialog";

type CommunityMembersProps = {
    datastoreId: string;
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

const CommunityMembers: FC<CommunityMembersProps> = ({ datastoreId, userId }) => {
    // Traductions
    const { t: tCommon } = useTranslation("Common");
    const { t } = useTranslation({ CommunityMembers });

    const { user } = useAuthStore();
    const [members, setMembers] = useState<Member[]>([]);
    const [currentMember, setCurrentMember] = useState<string | undefined>(undefined);

    // Le datastore
    const { data: datastore, isLoading: isLoadingDatastore } = useQuery({
        queryKey: RQKeys.datastore(datastoreId),
        queryFn: ({ signal }) => api.datastore.get(datastoreId, { signal }),
        staleTime: 3600000,
    });

    const communityId = useMemo(() => {
        return datastore?.community._id;
    }, [datastore]);

    // La communauté
    const { data: community, isLoading: isLoadingCommunity } = useQuery({
        queryKey: ["community", communityId],
        queryFn: () => {
            if (communityId) return api.community.get(communityId);
        },
        staleTime: communityId ? Infinity : 20000,
        enabled: !!communityId,
    });

    // Les droits sur cette communauté
    const userRights = useMemo(() => {
        const communityMember = user?.communitiesMember.filter((member) => member.community?._id === communityId);
        return communityMember?.length ? communityMember[0].rights : undefined;
    }, [user?.communitiesMember, communityId]);

    const communitySupervisor = useMemo(() => {
        return community?.supervisor._id;
    }, [community]);

    const isAuthorized = useMemo(() => {
        const isSupervisor = communitySupervisor === user?.id;
        return isSupervisor || userRights?.includes(CommunityMemberDtoRightsEnum.COMMUNITY);
    }, [communitySupervisor, user?.id, userRights]);

    // Les membres de cette communauté
    const { data: communityMembers, isLoading: isLoadingMembers } = useQuery({
        queryKey: ["community", "members", communityId],
        queryFn: () => {
            if (communityId) return api.community.getMembers(communityId);
        },
        staleTime: communityId ? Infinity : 20000,
        enabled: !!communityId,
    });

    const communityMemberIds = useMemo(() => {
        return communityMembers?.map((member) => member.user._id) ?? [];
    }, [communityMembers]);

    useEffect(() => {
        if (!communityMembers) {
            return;
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
        setMembers(members);
    }, [communityMembers, communitySupervisor, user?.id]);

    if (isAuthorized && userId && !isLoadingMembers && !communityMemberIds.includes(userId)) {
        addMemberModal.open();
    }

    const queryClient = useQueryClient();

    // Suppression d'un utilisateur
    const { isPending: isRemovePending, mutate: mutateRemove } = useMutation<{ user: string } | undefined, CartesApiException, string>({
        mutationFn: (user_id: string) => {
            if (communityId) return api.community.removeMember(communityId, user_id);
            return Promise.resolve(undefined);
        },
        onSuccess: (response) => {
            if (response) {
                queryClient.setQueryData(["community", "members", communityId], () => {
                    return communityMembers?.filter((member) => member.user._id !== response.user);
                });
            }
        },
    });

    // Modification des droits d'un utilisateur
    const { isPending: isModifyPending, mutate: mutateModify } = useMutation<UserRightsResponseDto | undefined, CartesApiException, updateMember>({
        mutationFn: (datas) => {
            if (communityId) return api.community.updateMember(communityId, datas);
            return Promise.resolve(undefined);
        },
        onSuccess: (response) => {
            if (response) {
                queryClient.setQueryData<CommunityUserResponseDto[]>(["community", "members", communityId], (communityMembers) => {
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
        <DatastoreLayout datastoreId={datastoreId} documentTitle="Membres">
            {(isLoadingDatastore || isLoadingCommunity || isLoadingMembers) && <LoadingText />}
            {!isLoadingMembers && userId && communityMemberIds.includes(userId) && (
                <Alert
                    className={fr.cx("fr-mb-1w")}
                    severity={"warning"}
                    title={t("already_member", { userId: userId })}
                    closable
                    onClose={() => {
                        routes.members_list({ datastoreId }).push();
                    }}
                />
            )}
            {!isLoadingMembers && isAuthorized === true && (
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
                                                            label={null}
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
            {isAuthorized === false && (
                <Alert className={fr.cx("fr-mb-2w")} title={tCommon("information")} closable description={t("no_necessary_rights")} severity={"info"} />
            )}
            <AddMember datastoreId={datastoreId} communityId={communityId} communityMemberIds={communityMemberIds} userId={userId} />
            <ConfirmDialog
                title={t("confirm_remove")}
                onConfirm={() => {
                    if (currentMember !== undefined) {
                        mutateRemove(currentMember);
                    }
                }}
            />
        </DatastoreLayout>
    );
};

export default CommunityMembers;

// traductions
export const { i18n } = declareComponentKeys<
    | { K: "community_members"; P: { communityName: string }; R: string }
    | { K: "already_member"; P: { userId: string }; R: string }
    | "rights"
    | "name"
    | "me"
    | "supervisor"
    | "add_user"
    | "remove_user"
    | "confirm_remove"
    | { K: "add_remove_right_title"; P: { right: string }; R: string }
    | "no_necessary_rights"
>()({
    CommunityMembers,
});

export const CommunityMembersFrTranslations: Translations<"fr">["CommunityMembers"] = {
    community_members: ({ communityName }) => `Membres de ${communityName}`,
    already_member: ({ userId }) => `l'utilisateur ${userId} est déjà membre de cet espace de travail`,
    rights: "Permissions du compte",
    name: "Nom",
    me: "moi",
    supervisor: "superviseur",
    add_user: "Ajouter un utilisateur",
    remove_user: "Supprimer cet utilisateur",
    confirm_remove: "Êtes-vous sûr de vouloir supprimer cet utilisateur ?",
    add_remove_right_title: ({ right }) => `Ajouter/supprimer le droit ${right}`,
    no_necessary_rights: "Vous n'avez pas les droits nécessaires pour visualiser les membres de cet espace de travail.",
};

export const CommunityMembersEnTranslations: Translations<"en">["CommunityMembers"] = {
    community_members: ({ communityName }) => `Members of ${communityName}`,
    already_member: ({ userId }) => `User ${userId} is already a member of this community`,
    rights: "User rights",
    name: "Name",
    me: "me",
    supervisor: "supervisor",
    add_user: "Add user",
    remove_user: "Remove this user",
    confirm_remove: "Are you sure you want to delete this user ?",
    add_remove_right_title: ({ right }) => `Add/remove right ${right} to user`,
    no_necessary_rights: "You do not have the necessary rights to view and modify the users of this community.",
};
