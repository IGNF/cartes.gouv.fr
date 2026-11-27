import { useQuery } from "@tanstack/react-query";
import { FC } from "react";
import { useDebouncedState } from "@mantine/hooks";
import { CommunityListFilter } from "../../../@types/app_espaceco";
import { CommunityResponseDTO } from "../../../@types/espaceco";
import AutocompleteSelect from "../../../components/Input/AutocompleteSelect";
import { useTranslation } from "../../../i18n/i18n";
import RQKeys from "../../../modules/espaceco/RQKeys";
import api from "../../api";

type SearchCommunityProps = {
    filter: CommunityListFilter;
    label?: string;
    // guichet affiché ; absent, le champ n’est pas contrôlé
    value?: CommunityResponseDTO | null;
    onChange: (value: CommunityResponseDTO | null) => void;
};

const SearchCommunity: FC<SearchCommunityProps> = ({ filter, onChange, label, value }) => {
    const { t } = useTranslation("SearchCommunity");

    const [search, setSearch] = useDebouncedState("", 500);

    const searchQuery = useQuery<CommunityResponseDTO[]>({
        queryKey: RQKeys.searchCommunities(search, filter),
        queryFn: ({ signal }) => api.community.searchByName(search, filter, signal),
        enabled: search.length > 3,
    });

    return (
        <AutocompleteSelect
            label={label ? label : t("default_label")}
            hintText={t("default_placeholder")}
            loading={searchQuery.isLoading}
            loadingText={t("loading")}
            noOptionsText={t("no_options")}
            getOptionLabel={(option) => option.name}
            options={searchQuery.data || []}
            filterOptions={(x) => x}
            isOptionEqualToValue={(option, v) => option.id === v.id}
            onInputChange={(_, v) => setSearch(v)}
            value={value}
            onChange={(_, selectedValue) => onChange(selectedValue)}
            multiple={false}
            freeSolo={false}
        />
    );
};

export default SearchCommunity;
