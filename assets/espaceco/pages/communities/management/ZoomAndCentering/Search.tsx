import { useQuery } from "@tanstack/react-query";
import { Coordinate } from "ol/coordinate";
import { FC, ReactNode } from "react";
import { useDebounceValue } from "usehooks-ts";
import { SearchResult } from "../../../../../@types/app_espaceco";
import AutocompleteSelect from "../../../../../components/Input/AutocompleteSelect";
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
        <AutocompleteSelect
            label={label}
            hintText={hintText}
            loading={searchQuery.isLoading}
            loadingText={t("loading")}
            noOptionsText={t("no_results")}
            getOptionLabel={(option) => option.fulltext}
            options={searchQuery.data?.results ?? []}
            filterOptions={(x) => x}
            isOptionEqualToValue={(option, selectedValue) => option.fulltext === selectedValue.fulltext}
            onInputChange={(_, inputValue) => setText(inputValue)}
            onChange={(_, selectedValue) => {
                if (selectedValue) {
                    onChange([selectedValue.x, selectedValue.y]);
                    return;
                }

                onChange(null);
            }}
            multiple={false}
            freeSolo={false}
        />
    );
};

export default Search;
