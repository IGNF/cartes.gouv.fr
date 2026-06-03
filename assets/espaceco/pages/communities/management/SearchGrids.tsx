import { useQuery } from "@tanstack/react-query";
import { FC, ReactNode, useState } from "react";
import { useDebouncedState } from "@mantine/hooks";
import { GetResponse, SearchGridFilters } from "../../../../@types/app_espaceco";
import { GridDTO } from "../../../../@types/espaceco";
import AutocompleteSelect from "../../../../components/Input/AutocompleteSelect";
import { useTranslation } from "../../../../i18n/i18n";
import RQKeys from "../../../../modules/espaceco/RQKeys";
import api from "../../../api";

export type SearchGridsProps = {
    label: ReactNode;
    hintText?: ReactNode;
    disableClearable?: boolean;
    filters: SearchGridFilters;
    state?: "default" | "error" | "success";
    stateRelatedMessage?: string;
    onChange: (grid: GridDTO | null) => void;
};

const SearchGrids: FC<SearchGridsProps> = ({ label, hintText, disableClearable, filters, state, stateRelatedMessage, onChange }) => {
    const { t } = useTranslation("Search");

    const [search, setSearch] = useDebouncedState("", 500);
    const [value, setValue] = useState<GridDTO | null>(null);

    const searchQuery = useQuery<GetResponse<GridDTO>>({
        queryKey: RQKeys.searchGrids(search, filters),
        queryFn: ({ signal }) => {
            return api.grid.getAll(search, filters, { signal });
        },
        staleTime: 1000 * 60,
        enabled: search.length >= 2,
    });

    return (
        <AutocompleteSelect
            label={label}
            hintText={hintText}
            state={state}
            stateRelatedMessage={stateRelatedMessage}
            blurOnSelect={disableClearable !== true}
            disableClearable={disableClearable ? disableClearable : false}
            loading={searchQuery.isLoading}
            loadingText={t("loading")}
            noOptionsText={t("no_results")}
            getOptionLabel={(option) => `${option.name} : ${option.title}`}
            options={searchQuery.data?.content ?? []}
            filterOptions={(x) => x}
            isOptionEqualToValue={(option, v) => option.name === v.name}
            onInputChange={(_, v) => {
                setSearch(v);
            }}
            onChange={(_, selectedValue) => {
                onChange(selectedValue);
                setValue(null);
            }}
            value={value}
            multiple={false}
            freeSolo={false}
        />
    );
};

export default SearchGrids;
