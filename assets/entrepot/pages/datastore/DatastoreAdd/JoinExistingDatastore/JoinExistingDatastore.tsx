import { fr } from "@codegouvfr/react-dsfr";
import Card from "@codegouvfr/react-dsfr/Card";
import SearchBar from "@codegouvfr/react-dsfr/SearchBar";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { CommunityListResponseDto } from "@/@types/entrepot";
import api from "@/entrepot/api";
import RQKeys from "@/modules/entrepot/RQKeys";
import { CartesApiException } from "@/modules/jsonFetch";
import { routes } from "@/router/router";
import { useAuthStore } from "@/stores/AuthStore";
import { regex, removeDiacritics } from "@/utils";
import { JoinExistingDatastoreModal } from "./JoinExistingDatastoreModal";
import { joinModal } from "./modal";

import placeholder16x9 from "@/img/placeholder.16x9.png";

export default function JoinExistingDatastore() {
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

    return (
        <>
            <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-grid-row--right")}>
                <div className={fr.cx("fr-col-12", "fr-col-md-4")}>
                    <SearchBar
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
                                    setTimeout(() => {
                                        joinModal.open();
                                    }, 0);
                                },
                            }}
                            endDetail="Rejoindre"
                            shadow
                        />
                    </div>
                ))}
            </div>

            {selectedCommunity && <JoinExistingDatastoreModal selectedCommunity={selectedCommunity} />}
        </>
    );
}
