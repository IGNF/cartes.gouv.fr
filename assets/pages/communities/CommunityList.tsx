import { FC, useEffect, useMemo, useRef, useState } from "react";
import api from "../../api";
import { useMutation, useQuery } from "@tanstack/react-query";
import LoadingText from "../../components/Utils/LoadingText";
import { fr } from "@codegouvfr/react-dsfr";
import { Table } from "@codegouvfr/react-dsfr/Table";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { Pagination } from "@codegouvfr/react-dsfr/Pagination";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import Translator from "../../modules/Translator";
import { datastoreNavItems } from "../../config/datastoreNavItems";
import AppLayout from "../../components/Layout/AppLayout";
import { routes, useRoute } from "../../router/router";
import { type CommunitiesReponse } from "../../api/catalogs";
import { createPortal } from "react-dom";
import Button from "@codegouvfr/react-dsfr/Button";
import { CommunityListResponseDto } from "../../types/entrepot";
import Input from "@codegouvfr/react-dsfr/Input";
import Wait from "../../components/Utils/Wait";
import { useAuthStore } from "../../stores/AuthStore";

const explainModal = createModal({
    id: "explain-modal",
    isOpenedByDefault: false,
});

const CommunityList: FC = () => {
    const { user } = useAuthStore();
    const route = useRoute();

    const refMsg = useRef<HTMLTextAreaElement>(null);

    // Communautes auxquelles l'utilisateur appartient
    const ids = useMemo(() => user?.communitiesMember.map((member) => member.community?._id), [user?.communitiesMember]);

    const [selectedCommunity, setSelectedCommunity] = useState<CommunityListResponseDto>();
    const [communities, setCommunities] = useState<CommunityListResponseDto[]>();

    const { isLoading, isError, error, data } = useQuery<CommunitiesReponse, Error>({
        queryKey: ["fetchCommunities", route.params["page"], route.params["limit"]],
        queryFn: () => api.catalogs.getPublicCommunities(route.params["page"], route.params["limit"]),
        refetchOnWindowFocus: false,
    });

    const mutation = useMutation<unknown, { error: string }, { message: string }>({
        mutationFn: (params) => {
            const formData = { community: selectedCommunity, message: params.message };
            return api.contact.joinCommunity(formData);
        },
    });
    /*const {
        isError: isJoinError,
        error: joinError,
        isSuccess: isJoinSuccess,
        mutate,
    } = useMutation<unknown, { error: string }, { message: string }>({
        mutationFn: (params) => {
            const formData = { community: selectedCommunity, message: params.message };
            return api.contact.joinCommunity(formData);
        },
    });*/

    const navItems = datastoreNavItems();

    useEffect(() => {
        if (data) {
            const communities = data.communities.filter((community) => !ids?.includes(community._id));
            setCommunities(communities);
        }
    }, [ids, data]);

    const handleClick = (community) => {
        setSelectedCommunity(community);
        explainModal.open();
    };

    const handleOk = () => {
        const message = refMsg.current?.value ?? "";
        mutation.mutate({ message: message }); // On lance la requete

        if (refMsg.current) {
            refMsg.current.value = "";
        }
    };

    return (
        <AppLayout navItems={navItems} documentTitle={Translator.trans("communities_list.title")}>
            <h1>{Translator.trans("communities_list.title")}</h1>
            <div className={fr.cx("fr-container", "fr-py-2w")}>
                {isLoading ? (
                    <LoadingText />
                ) : isError ? (
                    <Alert severity="error" closable title={error.message} />
                ) : mutation.isError ? (
                    <Alert severity="error" closable title={mutation.error.error} />
                ) : mutation.isSuccess ? (
                    <Alert
                        severity="success"
                        closable
                        title={Translator.trans("communities_list.success_message_title", { name: selectedCommunity?.name })}
                        description={Translator.trans("communities_list.success_message_description")}
                    />
                ) : (
                    <div />
                )}
                {communities?.length && (
                    <>
                        <div className={fr.cx("fr-grid-row")}>
                            <Table
                                data={communities.map((community) => [
                                    community.name,
                                    <Button key={community._id} size="small" onClick={() => handleClick(community)} priority="secondary">
                                        {Translator.trans("communities_list.join")}
                                    </Button>,
                                ])}
                                noCaption
                            />
                        </div>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--center", "fr-m-3w")}>
                            <Pagination
                                count={data?.numPages ?? 0}
                                defaultPage={route.params["page"]}
                                getPageLinkProps={(pageNumber) => routes.join_community({ page: pageNumber, limit: route.params["limit"] }).link}
                            />
                        </div>
                    </>
                )}
            </div>
            {mutation.isPending && (
                <Wait>
                    <div className={fr.cx("fr-container")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <div className={fr.cx("fr-col-2")}>
                                <i className={fr.cx("fr-icon-refresh-line", "fr-icon--lg") + " icons-spin"} />
                            </div>
                            <div className={fr.cx("fr-col-10")}>
                                <h6 className={fr.cx("fr-h6", "fr-m-0")}>{"Envoie de la demande ..."}</h6>
                            </div>
                        </div>
                    </div>
                </Wait>
            )}
            <>
                {createPortal(
                    <explainModal.Component
                        title={Translator.trans("communities_list.modal.title", { name: selectedCommunity?.name })}
                        buttons={[
                            {
                                children: Translator.trans("commons.cancel"),
                                doClosesModal: true,
                                priority: "secondary",
                            },
                            {
                                children: Translator.trans("send"),
                                onClick: handleOk,
                                doClosesModal: true,
                                priority: "primary",
                            },
                        ]}
                    >
                        <Input nativeTextAreaProps={{ ref: refMsg }} label={Translator.trans("communities_list.modal.message")} textArea />
                    </explainModal.Component>,
                    document.body
                )}
            </>
        </AppLayout>
    );
};

export default CommunityList;
