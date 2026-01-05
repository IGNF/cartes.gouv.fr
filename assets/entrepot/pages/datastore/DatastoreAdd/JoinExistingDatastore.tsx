import { fr } from "@codegouvfr/react-dsfr";
import Card from "@codegouvfr/react-dsfr/Card";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import Success from "@codegouvfr/react-dsfr/picto/Success";
import SearchBar from "@codegouvfr/react-dsfr/SearchBar";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useStyles } from "tss-react";

import { CommunityListResponseDto } from "@/@types/entrepot";
import LoadingIcon from "@/components/Utils/LoadingIcon";
import Wait from "@/components/Utils/Wait";
import api from "@/entrepot/api";
import { useTranslation } from "@/i18n";
import RQKeys from "@/modules/entrepot/RQKeys";
import { CartesApiException } from "@/modules/jsonFetch";
import { routes } from "@/router/router";
import { useAuthStore } from "@/stores/AuthStore";
import { regex, removeDiacritics } from "@/utils";

import placeholder16x9 from "@/img/placeholder.16x9.png";

const joinModal = createModal({
    id: "datastore-join-modal",
    isOpenedByDefault: false,
});

const successModal = createModal({
    id: "datastore-join-success-modal",
    isOpenedByDefault: false,
});

export default function JoinExistingDatastore() {
    const { t } = useTranslation("DatastoreAdd");
    const { css } = useStyles();

    const user = useAuthStore((state) => state.user);
    const [searchText, setSearchText] = useState<string>("");

    const [selectedCommunity, setSelectedCommunity] = useState<CommunityListResponseDto>();

    // Communautes auxquelles l'utilisateur appartient
    const userCommunitiesIds = useMemo(() => user?.communities_member.map((member) => member.community?._id), [user?.communities_member]);

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
        if (!searchText || searchText?.length < 0) {
            return allPublicCommunities;
        }

        return allPublicCommunities.filter((community) => removeDiacritics(community.name.toLowerCase()).includes(removeDiacritics(searchText.toLowerCase())));
    }, [allPublicCommunities, searchText]);

    const joinCommunityMutation = useMutation<unknown, { error: string }, { community: CommunityListResponseDto }>({
        mutationFn: (data) => {
            return api.contact.joinCommunity({ ...data, message: null });
        },
        onSuccess() {
            successModal.open();
        },
    });

    return (
        <>
            <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-grid-row--right")}>
                <div className={fr.cx("fr-col-12", "fr-col-md-4")}>
                    <SearchBar
                        // onButtonClick={(text) => {
                        //     console.log(text);

                        //     setSearchText(text ?? "");
                        // }}
                        renderInput={(params) => (
                            <input
                                {...params}
                                value={searchText}
                                onChange={(e) => {
                                    setSearchText(e.currentTarget.value ?? "");
                                }}
                            />
                        )}
                    />
                </div>
            </div>

            <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
                {filteredCommunities.map((community) => (
                    <div key={community._id} className={fr.cx("fr-col-12", "fr-col-md-6", "fr-col-lg-4")}>
                        <Card
                            title={community.name}
                            size="small"
                            enlargeLink
                            imageUrl={placeholder16x9}
                            imageAlt=""
                            linkProps={{
                                href: routes.join_community().href, // href inutile mais pour avoir le style "lien étendu"
                                onClick: (e) => {
                                    e.preventDefault();
                                    setSelectedCommunity(community);
                                    joinModal.open();
                                },
                            }}
                            endDetail="Rejoindre"
                            shadow
                        />
                    </div>
                ))}
            </div>

            {createPortal(
                <joinModal.Component
                    title="Rejoindre une communauté"
                    buttons={[
                        {
                            children: "Annuler",
                            priority: "secondary",
                        },
                        {
                            children: "Rejoindre",
                            onClick: () => {
                                if (selectedCommunity) {
                                    joinModal.close();
                                    joinCommunityMutation.mutate({ community: selectedCommunity });
                                }
                            },
                            doClosesModal: false,
                        },
                    ]}
                >
                    <div
                        className={css({
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.75rem",
                        })}
                    >
                        <h6
                            className={css({
                                color: fr.colors.decisions.text.title.blueFrance.default,
                                margin: 0,
                            })}
                        >
                            {selectedCommunity?.name}
                        </h6>

                        <div
                            className={cx(
                                fr.cx("fr-text--xs", "fr-m-0"),
                                css({
                                    display: "flex",
                                    alignContent: "center",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    color: fr.colors.decisions.text.mention.grey.default,
                                })
                            )}
                        >
                            <span className={fr.cx("fr-icon--xs", "fr-icon-user-setting-line")} />
                            {selectedCommunity?.contact}
                        </div>

                        {selectedCommunity?.description && <p className={fr.cx("fr-m-0")}>{selectedCommunity?.description}</p>}
                    </div>
                </joinModal.Component>,
                document.body
            )}

            {createPortal(
                <successModal.Component
                    title={t("join_existing.modal_success.title")}
                    concealingBackdrop={false}
                    buttons={[
                        {
                            children: "Fermer",
                            linkProps: routes.datastore_selection().link,
                        },
                    ]}
                >
                    <div
                        className={css({
                            display: "flex",
                            flexDirection: "column",
                            padding: "1rem",
                            alignItems: "center",
                            alignSelf: "stretch",
                            gap: "0.5rem",
                        })}
                    >
                        <Success color="blue-cumulus" width={"4rem"} height={"4rem"} />
                        <p className={cx(fr.cx("fr-m-0"), css({ textAlign: "center" }))}>
                            {t("join_existing.modal_success.request_sent", { name: selectedCommunity?.name || "" })}
                        </p>
                        <hr className={fr.cx("fr-mt-4v", "fr-pb-4v")} style={{ width: "100%" }} />
                        <p className={cx(fr.cx("fr-m-0"), css({ textAlign: "center" }))}>{t("join_existing.modal_success.acknowledgement_sent")}</p>
                    </div>
                </successModal.Component>,
                document.body
            )}

            {joinCommunityMutation.isPending && (
                <Wait>
                    <div className={fr.cx("fr-container")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <div className={fr.cx("fr-col-2")}>
                                <LoadingIcon />
                            </div>
                            <div className={fr.cx("fr-col-10")}>
                                <h6 className={fr.cx("fr-h6", "fr-m-0")}>{t("is_sending")}</h6>
                            </div>
                        </div>
                    </div>
                </Wait>
            )}
        </>
    );
}
