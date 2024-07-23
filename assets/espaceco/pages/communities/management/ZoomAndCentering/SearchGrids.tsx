import { fr } from "@codegouvfr/react-dsfr";
import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";
import Autocomplete from "@mui/material/Autocomplete";
import { useQuery } from "@tanstack/react-query";
import { FC, ReactNode } from "react";
import { useDebounceValue } from "usehooks-ts";
import { GetResponse, SearchGridFilters } from "../../../../../@types/app_espaceco";
import { Grids } from "../../../../../@types/espaceco";
import { useTranslation } from "../../../../../i18n/i18n";
import RQKeys from "../../../../../modules/espaceco/RQKeys";
import api from "../../../../api";
import TextField from "@mui/material/TextField";
import { Extent } from "ol/extent";

export type SearchGridsProps = {
    label: ReactNode;
    hintText?: ReactNode;
    filters: SearchGridFilters;
    onChange: (value: Extent | null) => void;
};

const SearchGrids: FC<SearchGridsProps> = ({ label, hintText, filters, onChange }) => {
    const { t } = useTranslation("Search");

    const [text, setText] = useDebounceValue("", 500);

    const searchQuery = useQuery<GetResponse<Grids>>({
        queryKey: RQKeys.searchGrids(text),
        queryFn: async ({ signal }) => {
            return api.grid.search(text, filters, { signal });
        },
        staleTime: 1000 * 60,
        enabled: text.length >= 2,
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
                    getOptionLabel={(option) => `${option.name} : ${option.title}`}
                    options={searchQuery.data?.content ?? []}
                    filterOptions={(x) => x}
                    renderInput={(params) => <TextField {...params} />}
                    isOptionEqualToValue={(option, v) => option.name === v.name}
                    onInputChange={(_, v) => setText(v)}
                    onChange={(_, v) => {
                        if (v) onChange(v.extent);
                    }}
                />
            </MuiDsfrThemeProvider>
        </div>
    );
};

export default SearchGrids;
