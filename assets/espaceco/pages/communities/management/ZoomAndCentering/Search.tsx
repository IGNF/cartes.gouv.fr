import { fr } from "@codegouvfr/react-dsfr";
import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { useQuery } from "@tanstack/react-query";
import { Coordinate } from "ol/coordinate";
import { FC, ReactNode } from "react";
import { useDebounceValue } from "usehooks-ts";
import { SearchResult } from "../../../../../@types/app_espaceco";
import { useTranslation } from "../../../../../i18n/i18n";
import RQKeys from "../../../../../modules/espaceco/RQKeys";
import { jsonFetch } from "../../../../../modules/jsonFetch";

type SearchProps = {
    label: ReactNode;
    hintText?: ReactNode;
    filter: Record<string, unknown>;
    onChange: (value: Coordinate | null) => void;
};

const autocompleteUrl = "https://data.geopf.fr/geocodage/completion";

const Search: FC<SearchProps> = ({ label, hintText, filter, onChange }) => {
    const { t } = useTranslation("Search");

    const [text, setText] = useDebounceValue("", 500);

    const searchQuery = useQuery<SearchResult>({
        queryKey: RQKeys.searchAddress(text, filter),
        queryFn: async ({ signal }) => {
            const qParams = new URLSearchParams({ text: text, ...filter }).toString();
            return jsonFetch<SearchResult>(`${autocompleteUrl}?${qParams}`, { signal });
        },
        enabled: text.length >= 3,
    });

    return (
        <div>
            <label className={fr.cx("fr-label")}>
                {label}
                {hintText && <span className={"fr-hint-text"}>{hintText}</span>}
            </label>
            <MuiDsfrThemeProvider>
                <Autocomplete
                    loading={searchQuery.isLoading}
                    loadingText={t("loading")}
                    noOptionsText={t("no_results")}
                    getOptionLabel={(option) => option.fulltext}
                    options={searchQuery.data?.results ?? []}
                    filterOptions={(x) => x}
                    renderInput={(params) => <TextField {...params} variant={"filled"} size={"small"} />}
                    isOptionEqualToValue={(option, v) => option.fulltext === v.fulltext}
                    onInputChange={(_, v) => setText(v)}
                    onChange={(_, v) => {
                        if (v) onChange([v.x, v.y]);
                    }}
                />
            </MuiDsfrThemeProvider>
        </div>
    );
};

export default Search;
