import { fr } from "@codegouvfr/react-dsfr";
import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { useQuery } from "@tanstack/react-query";
import { declareComponentKeys } from "i18nifty";
import { FC } from "react";
import { useDebounceValue } from "usehooks-ts";
import { SearchResult } from "../../../../@types/app_espaceco";
import { Translations, useTranslation } from "../../../../i18n/i18n";
import RQKeys from "../../../../modules/espaceco/RQKeys";
import { jsonFetch } from "../../../../modules/jsonFetch";

type SearchProps = {
    filter: Record<string, unknown>;
    onChange?: (value: string | null) => void;
};

const autocompleteUrl = "https://data.geopf.fr/geocodage/completion";

const Search: FC<SearchProps> = ({ filter, onChange }) => {
    const { t } = useTranslation("Search");

    const [text, setText] = useDebounceValue("", 500);

    const searchQuery = useQuery<SearchResult>({
        queryKey: RQKeys.searchAddress(text),
        queryFn: ({ signal }) => {
            const qParams = new URLSearchParams({ text: text, ...filter }).toString();
            return jsonFetch<SearchResult>(`${autocompleteUrl}?${qParams}`, { signal });
        },
        enabled: text.length >= 3,
        staleTime: 10 * 1000,
    });
    console.log(searchQuery.data);

    return (
        <div>
            <span className={fr.cx("fr-hint-text")}>{t("position_hint")}</span>
            <MuiDsfrThemeProvider>
                <Autocomplete
                    loading={searchQuery.isPending}
                    loadingText={t("loading")}
                    noOptionsText={t("no_results")}
                    getOptionLabel={(option) => option.fulltext}
                    options={searchQuery.data?.results ?? []}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            InputProps={{
                                ...params.InputProps,
                                type: "search",
                            }}
                        />
                    )}
                    isOptionEqualToValue={(option, v) => option.fulltext === v.fulltext}
                    onInputChange={(_, v) => setText(v)}
                    // onChange={(_, v) => onChange(v)}
                />
            </MuiDsfrThemeProvider>
        </div>
    );
};

export default Search;

// traductions
export const { i18n } = declareComponentKeys<"position_hint" | "no_results" | "loading">()("Search");

export const SearchFrTranslations: Translations<"fr">["Search"] = {
    position_hint: "Fixer la position et définissez le niveau de zoom (utilisez votre souris ou la barre de recherche ci-dessous",
    no_results: "Aucun résultat",
    loading: "Recherche en cours ...",
};

export const SearchEnTranslations: Translations<"en">["Search"] = {
    position_hint: "Fix the position and set the zoom level (use your mouse or the search bar below",
    no_results: "No results",
    loading: "Searching ...",
};
