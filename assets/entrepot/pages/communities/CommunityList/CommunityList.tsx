import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { Table } from "@codegouvfr/react-dsfr/Table";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FC, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { CommunityListResponseDto } from "../../../../@types/entrepot";
import LoadingText from "../../../../components/Utils/LoadingText";
import Wait from "../../../../components/Utils/Wait";
import { useTranslation } from "../../../../i18n";
import RQKeys from "../../../../modules/entrepot/RQKeys";
import { CartesApiException } from "../../../../modules/jsonFetch";
import { useAuthStore } from "../../../../stores/AuthStore";
import { regex, removeDiacritics } from "../../../../utils";
import api from "../../../api";

import "../../../../sass/pages/community_list.scss";
import Main from "../../../../components/Layout/Main";

const joinCommunityModal = createModal({
    id: "join-community-modal",
    isOpenedByDefault: false,
});

const CommunityList: FC = () => {
    const { t } = useTranslation("CommunityList");
    const { t: tCommon } = useTranslation("Common");
    const { user } = useAuthStore();

    const [searchText, setSearchText] = useState<string>();

    const refMsg = useRef<HTMLTextAreaElement>(null);

    // Communautes auxquelles l'utilisateur appartient
    const userCommunitiesIds = useMemo(() => user?.communities_member.map((member) => member.community?._id), [user?.communities_member]);

    const [selectedCommunity, setSelectedCommunity] = useState<CommunityListResponseDto>();

    const communitiesQuery = useQuery<CommunityListResponseDto[], CartesApiException>({
        queryKey: RQKeys.catalogs_communities(),
        queryFn: () => api.catalogs.getAllPublicCommunities(),
        refetchOnWindowFocus: false,
    });

    /* liste des communautés publiques auxquelles l'utilisateur n'appartient pas déjà
       On enleve les communauté dont l'email est foireux */
    const allPublicCommunities = useMemo(() => {
        if (communitiesQuery.data) {
            return communitiesQuery.data.filter((community) => !userCommunitiesIds?.includes(community._id) && regex.email.test(community.contact));
        }
        return [];
    }, [communitiesQuery.data, userCommunitiesIds]);

    const filteredCommunities = useMemo(() => {
        if (!searchText || searchText?.length < 2) {
            return allPublicCommunities;
        }

        return allPublicCommunities.filter((community) => removeDiacritics(community.name.toLowerCase()).includes(removeDiacritics(searchText.toLowerCase())));
    }, [allPublicCommunities, searchText]);

    const joinCommunityMutation = useMutation<unknown, { error: string }, { message: string }>({
        mutationFn: (params) => {
            const formData = { community: selectedCommunity, message: params.message };
            return api.contact.joinCommunity(formData);
        },
    });

    const handleClick = (community) => {
        setSelectedCommunity(community);
        joinCommunityModal.open();
    };

    const handleOk = () => {
        const message = refMsg.current?.value ?? "";
        joinCommunityMutation.mutate({ message: message }); // On lance la requete

        if (refMsg.current) {
            refMsg.current.value = "";
        }
    };

    return (
        <Main title={t("title")}>
            <h1>{t("title")}</h1>

            <div className={fr.cx("fr-container", "fr-py-2w")}>
                {communitiesQuery.isLoading ? (
                    <LoadingText />
                ) : (
                    <>
                        {communitiesQuery.isError && <Alert severity="error" closable title={communitiesQuery.error.message} />}

                        {joinCommunityMutation.isError && <Alert severity="error" closable title={joinCommunityMutation.error.error} />}

                        {joinCommunityMutation.isSuccess && (
                            <Alert
                                severity="success"
                                closable
                                title={t("success_message.title", { name: selectedCommunity?.name })}
                                description={t("success_message.description")}
                            />
                        )}

                        {allPublicCommunities.length > 0 && (
                            <div className={fr.cx("fr-grid-row", "fr-mb-2v")}>
                                <div className={fr.cx("fr-col-12", "fr-col-lg-6")}>
                                    <Input
                                        label={"Recherchez un espace de travail"}
                                        hintText={"Saisissez au moins 2 caractères pour filtrer par le nom"}
                                        nativeInputProps={{
                                            onChange(e) {
                                                setSearchText(e.target.value);
                                            },
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {filteredCommunities?.length > 0 ? (
                            <div className={fr.cx("fr-grid-row")}>
                                <div className={fr.cx("fr-col", "fr-col-lg-6")}>
                                    <Table
                                        className="frx-community-list"
                                        data={filteredCommunities.map((community) => [
                                            community.name,
                                            <Button key={community._id} size="small" onClick={() => handleClick(community)} priority="secondary">
                                                {t("join")}
                                            </Button>,
                                        ])}
                                        noCaption
                                    />
                                </div>
                            </div>
                        ) : (
                            <p>Aucune communauté publique trouvée</p>
                        )}
                    </>
                )}
            </div>

            {joinCommunityMutation.isPending && (
                <Wait>
                    <div className={fr.cx("fr-container")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <div className={fr.cx("fr-col-2")}>
                                <i className={fr.cx("fr-icon-refresh-line", "fr-icon--lg") + " frx-icon-spin"} />
                            </div>
                            <div className={fr.cx("fr-col-10")}>
                                <h6 className={fr.cx("fr-h6", "fr-m-0")}>{"Envoi de la demande en cours..."}</h6>
                            </div>
                        </div>
                    </div>
                </Wait>
            )}
            <>
                {createPortal(
                    <joinCommunityModal.Component
                        title={t("modal.title", { name: selectedCommunity?.name })}
                        buttons={[
                            {
                                children: tCommon("cancel"),
                                doClosesModal: true,
                                priority: "secondary",
                            },
                            {
                                children: tCommon("send"),
                                onClick: handleOk,
                                doClosesModal: true,
                                priority: "primary",
                            },
                        ]}
                    >
                        <Input nativeTextAreaProps={{ ref: refMsg }} label={t("modal.message")} textArea />
                    </joinCommunityModal.Component>,
                    document.body
                )}
            </>
        </Main>
    );
};

export default CommunityList;
