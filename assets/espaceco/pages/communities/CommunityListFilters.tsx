import { fr } from "@codegouvfr/react-dsfr";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { useQueries } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";

import { CommunityListFilter } from "@/@types/app_espaceco";
import { useTranslation } from "@/i18n/i18n";
import api from "@/espaceco/api";
import RQKeys from "@/modules/espaceco/RQKeys";
import SearchCommunity from "./SearchCommunity";

const routeApi = getRouteApi("/_private/contribuer-aux-donnees/guichets/_panneau/");

export default function CommunityListFilters() {
    const { t } = useTranslation("EspaceCoCommunityList");
    const { filter, community } = routeApi.useSearch();
    const navigate = routeApi.useNavigate();

    // guichet recherché lu dans l’URL : un rechargement remplit le champ, un retour arrière le vide
    const [searchedQuery] = useQueries({
        queries: (community === undefined ? [] : [community]).map((communityId) => ({
            queryKey: RQKeys.community(communityId),
            queryFn: ({ signal }: { signal: AbortSignal }) => api.community.getCommunity(communityId, signal),
            staleTime: 3600000,
        })),
    });

    const filters: { value: CommunityListFilter; label: string }[] = [
        { value: "iam_member", label: t("communities_as_member") },
        { value: "affiliation", label: t("pending_membership") },
        { value: "listed", label: t("all_public_communities") },
    ];

    return (
        <div className={fr.cx("fr-mr-md-8v")}>
            <div className={fr.cx("fr-mb-4v")}>
                {/* remonté à chaque filtre : la saisie s’efface avec le guichet recherché */}
                <SearchCommunity
                    key={filter}
                    filter={filter}
                    value={searchedQuery?.data ?? null}
                    onChange={(community) => void navigate({ search: (prev) => ({ ...prev, community: community?.id }) })}
                />
            </div>
            <RadioButtons
                legend={t("filters")}
                options={filters.map(({ value, label }) => ({
                    label,
                    nativeInputProps: {
                        checked: filter === value,
                        onChange: () => void navigate({ search: { filter: value } }),
                    },
                }))}
            />
        </div>
    );
}
