import { DatabaseResponseDTO } from "@/@types/espaceco";
import api from "@/espaceco/api";
import AutocompleteSelect from "@/components/Input/AutocompleteSelect";
import { useTranslation } from "@/i18n/i18n";
import RQKeys from "@/modules/espaceco/RQKeys";
import { fr } from "@codegouvfr/react-dsfr";
import { useQuery } from "@tanstack/react-query";
import { FC, ReactNode, useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import { PartialDatabase } from "@/@types/app_espaceco";

export type SearchDatabasesProps = {
    label?: ReactNode;
    filter: number[];
    onChange: (database: PartialDatabase | null) => void;
};

const SearchDatabases: FC<SearchDatabasesProps> = ({ label, filter, onChange }) => {
    const { t: tSearch } = useTranslation("Search");
    const { t } = useTranslation("Databases");

    const [search, setSearch] = useDebounceValue("", 500);
    const [value, setValue] = useState<PartialDatabase | null>(null);

    const searchQuery = useQuery<DatabaseResponseDTO[]>({
        queryKey: RQKeys.searchDatabases("title", search, ["id", "title"]),
        queryFn: ({ signal }) => api.database.searchBy("title", search, ["id", "title"], signal),
        staleTime: 3600000,
        enabled: search.length > 3,
    });

    return (
        <div className={fr.cx("fr-col-12")}>
            <AutocompleteSelect
                label={label ? label : t("search.default_label")}
                hintText={t("search.default_placeholder")}
                blurOnSelect={true}
                clearOnBlur={true}
                loading={searchQuery.isLoading}
                loadingText={tSearch("loading")}
                noOptionsText={tSearch("no_results")}
                getOptionLabel={(option) => `${option.title}`}
                options={searchQuery.data ?? []}
                filterOptions={(availableOptions: PartialDatabase[]) => availableOptions.filter((option) => !filter.includes(option.id))}
                isOptionEqualToValue={(option, selectedValue) => option.id === selectedValue.id}
                onInputChange={(_, inputValue) => {
                    setSearch(inputValue);
                }}
                onChange={(_, selectedValue) => {
                    onChange(selectedValue);
                    setValue(null);
                }}
                value={value}
                multiple={false}
                freeSolo={false}
            />
        </div>
    );
};

export default SearchDatabases;
