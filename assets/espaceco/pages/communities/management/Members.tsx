import { fr } from "@codegouvfr/react-dsfr";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";
import Table from "@codegouvfr/react-dsfr/Table";
import Pagination from "@mui/material/Pagination";
import { useQuery } from "@tanstack/react-query";
import { FC, ReactNode, useMemo, useState } from "react";
import { CommunityMember, GetResponse } from "../../../../@types/app_espaceco";
import LoadingText from "../../../../components/Utils/LoadingText";
import { declareComponentKeys, Translations, useTranslation } from "../../../../i18n/i18n";
import RQKeys from "../../../../modules/espaceco/RQKeys";
import { CartesApiException } from "../../../../modules/jsonFetch";
import { routes } from "../../../../router/router";
import api from "../../../api";
import ToggleSwitch from "@codegouvfr/react-dsfr/ToggleSwitch";

export type membersQueryParams = {
    page: number;
    limit: number;
};

type MembersProps = {
    communityId: number;
};

const maxFetchedMembers = 10;
const getName = (firstname: string | null, surname: string | null) => `${firstname ? firstname : ""} ${surname ? surname : ""}`;

const Members: FC<MembersProps> = ({ communityId }) => {
    const { t } = useTranslation("EscoCommunityMembers");

    const [queryParams, setQueryParams] = useState<membersQueryParams>({ page: 1, limit: maxFetchedMembers });

    // Les demandes d'affiliation
    const membershipRequestsQuery = useQuery<CommunityMember[], CartesApiException>({
        queryKey: RQKeys.communityMembershipRequests(communityId),
        queryFn: () => api.community.getCommunityMembershipRequests(communityId),
        staleTime: 60000,
    });

    // Les membres non en demande d'affiliation
    const membersQuery = useQuery<GetResponse<CommunityMember>, CartesApiException>({
        queryKey: RQKeys.communityMembers(communityId, queryParams.page, queryParams.limit),
        queryFn: ({ signal }) => api.community.getCommunityMembers(communityId, queryParams.page, queryParams.limit, signal),
        staleTime: 60000,
    });

    const headers = useMemo(() => [t("username_header"), t("name_header"), t("status_header"), t("grids_header"), ""], [t]);
    const data: ReactNode[][] = useMemo(() => {
        return (
            membersQuery.data?.content.map((m) => [
                m.username,
                getName(m.firstname, m.surname),
                <ToggleSwitch key={m.user_id} label={"Gestionnaire"} inputTitle={""} defaultChecked={m.role === "admin"} />,
                "titi",
                <div key={m.user_id} className={fr.cx("fr-grid-row", "fr-grid-row--right")}>
                    <Button title={""} priority={"tertiary no outline"} iconId={"fr-icon-delete-line"} onClick={() => console.log("clicekd")} />
                </div>,
            ]) ?? []
        );
    }, [membersQuery.data]);

    return (
        <div>
            {membershipRequestsQuery.isError && (
                <Alert
                    severity="error"
                    closable={false}
                    title={t("fetch_failed")}
                    description={
                        <>
                            <p>{membershipRequestsQuery.error?.message}</p>
                            <Button linkProps={routes.espaceco_community_list().link}>{t("back_to_list")}</Button>
                        </>
                    }
                />
            )}
            {membersQuery.isError && (
                <Alert
                    severity="error"
                    closable={false}
                    title={t("fetch_failed")}
                    description={
                        <>
                            <p>{membersQuery.error?.message}</p>
                            <Button linkProps={routes.espaceco_community_list().link}>{t("back_to_list")}</Button>
                        </>
                    }
                />
            )}
            {membershipRequestsQuery.isLoading || membersQuery.isLoading ? (
                <LoadingText />
            ) : membershipRequestsQuery.data && membershipRequestsQuery.data.length > 0 ? (
                <Accordion label={t("membership_requests", { count: membershipRequestsQuery.data.length })} defaultExpanded={true}>
                    contenu
                </Accordion>
            ) : (
                membersQuery.data?.content &&
                membersQuery.data.content.length > 0 && (
                    <div>
                        <Table headers={headers} data={data} fixed />
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--center")}>
                            <MuiDsfrThemeProvider>
                                <Pagination
                                    count={membersQuery.data.totalPages}
                                    page={queryParams.page}
                                    variant="outlined"
                                    shape="rounded"
                                    onChange={(_, v) => setQueryParams({ ...queryParams, page: v })}
                                />
                            </MuiDsfrThemeProvider>
                        </div>
                    </div>
                )
            )}
        </div>
    );
};

export default Members;

// traductions
export const { i18n } = declareComponentKeys<
    | "fetch_failed"
    | "back_to_list"
    | "loading_members"
    | "loading_membership_requests"
    | { K: "membership_requests"; P: { count: number }; R: string }
    | "username_header"
    | "name_header"
    | "status_header"
    | "grids_header"
>()("EscoCommunityMembers");

export const EscoCommunityMembersFrTranslations: Translations<"fr">["EscoCommunityMembers"] = {
    fetch_failed: "La récupération des membres du guichet a échoué",
    back_to_list: "Retour à la liste des guichets",
    loading_members: "Chargement des membres du guichet",
    loading_membership_requests: "Chargement des demandes d’affiliation",
    membership_requests: ({ count }) => `Demandes d’affiliation (${count})`,
    username_header: "Nom de l'utilisateur",
    name_header: "Nom, prénom",
    status_header: "Statut",
    grids_header: "Emprises individuelles",
};

export const EscoCommunityMembersEnTranslations: Translations<"en">["EscoCommunityMembers"] = {
    fetch_failed: undefined,
    back_to_list: undefined,
    loading_members: undefined,
    loading_membership_requests: undefined,
    membership_requests: ({ count }) => `Membership requests (${count})`,
    username_header: "username",
    name_header: undefined,
    status_header: "Status",
    grids_header: undefined,
};
