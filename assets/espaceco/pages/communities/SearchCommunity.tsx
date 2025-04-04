import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { useQuery } from "@tanstack/react-query";
import { FC } from "react";
import { useDebounceValue } from "usehooks-ts";
import { CommunityListFilter } from "../../../@types/app_espaceco";
import { CommunityResponseDTO } from "../../../@types/espaceco";
import { useTranslation } from "../../../i18n/i18n";
import RQKeys from "../../../modules/espaceco/RQKeys";
import api from "../../api";
import { fr } from "@codegouvfr/react-dsfr";

type SearchCommunityProps = {
    filter: CommunityListFilter;
    label?: string;
    placeholder?: string;
    onChange: (value: CommunityResponseDTO | null) => void;
};

const SearchCommunity: FC<SearchCommunityProps> = ({ filter, onChange, label, placeholder }) => {
    const { t } = useTranslation("SearchCommunity");

    const [search, setSearch] = useDebounceValue("", 500);

    const searchQuery = useQuery<CommunityResponseDTO[]>({
        queryKey: RQKeys.searchCommunities(search, filter),
        queryFn: ({ signal }) => api.community.searchByName(search, filter, signal),
        enabled: search.length > 3,
    });

    return (
        <div>
            <div className={fr.cx("fr-mb-2v")}>
                <label>{label ? label : t("default_label")}</label>
            </div>
            <MuiDsfrThemeProvider>
                <Autocomplete
                    loading={searchQuery.isLoading}
                    loadingText={t("loading")}
                    noOptionsText={t("no_options")}
                    getOptionLabel={(option) => option.name}
                    options={searchQuery.data || []}
                    filterOptions={(x) => x}
                    renderInput={(params) => (
                        <TextField {...params} variant={"filled"} size={"small"} label={placeholder ? placeholder : t("default_placeholder")} />
                    )}
                    isOptionEqualToValue={(option, v) => option.id === v.id}
                    onInputChange={(_, v) => setSearch(v)}
                    onChange={(_, v) => onChange(v)}
                />
            </MuiDsfrThemeProvider>
        </div>
    );
};

export default SearchCommunity;
