import { DatabaseResponseDTO } from "@/@types/espaceco";
import api from "@/espaceco/api";
import { useTranslation } from "@/i18n/i18n";
import RQKeys from "@/modules/espaceco/RQKeys";
import { fr } from "@codegouvfr/react-dsfr";
import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { useQuery } from "@tanstack/react-query";
import { FC, ReactNode, useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import { PartialDatabase } from "@/@types/app_espaceco";
import "../../../../../sass/components/autocomplete.scss";

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
        <div className={fr.cx("fr-input-group", "fr-col-12")}>
            <label className={fr.cx("fr-mb-2v", "fr-label")}>{label ? label : t("search.default_label")}</label>
            <MuiDsfrThemeProvider>
                <Autocomplete
                    disablePortal={true}
                    size={"small"}
                    blurOnSelect={true}
                    clearOnBlur={true}
                    loading={searchQuery.isLoading}
                    loadingText={tSearch("loading")}
                    noOptionsText={tSearch("no_results")}
                    getOptionLabel={(option) => `${option.title}`}
                    options={searchQuery.data ?? []}
                    filterOptions={(options: PartialDatabase[]) => options.filter((option) => !filter.includes(option.id))}
                    renderInput={(params) => <TextField {...params} variant={"filled"} size={"small"} label={t("search.default_placeholder")} />}
                    isOptionEqualToValue={(option, v) => option.id === v.id}
                    onInputChange={(_, v) => {
                        setSearch(v);
                    }}
                    onChange={(_, v) => {
                        onChange(v);
                        setValue(null);
                    }}
                    value={value}
                />
            </MuiDsfrThemeProvider>
        </div>
    );
};

export default SearchDatabases;
