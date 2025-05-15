import { fr } from "@codegouvfr/react-dsfr";
import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { useQuery } from "@tanstack/react-query";
import { FC, ReactNode, useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import { GetResponse, SearchGridFilters } from "../../../../@types/app_espaceco";
import { GridDTO } from "../../../../@types/espaceco";
import { useTranslation } from "../../../../i18n/i18n";
import RQKeys from "../../../../modules/espaceco/RQKeys";
import api from "../../../api";

import "../../../../sass/components/autocomplete.scss";

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

    const [search, setSearch] = useDebounceValue("", 500);
    const [value, setValue] = useState<GridDTO | null>(null);

    const searchQuery = useQuery<GetResponse<GridDTO>>({
        queryKey: RQKeys.searchGrids(search),
        queryFn: ({ signal }) => {
            return api.grid.search(search, filters, { signal });
        },
        staleTime: 1000 * 60,
        enabled: search.length >= 2,
    });

    return (
        <div className={fr.cx("fr-input-group", state === "error" && "fr-input-group--error")}>
            <label className={fr.cx("fr-mb-2v", "fr-label")}>
                {label}
                {hintText && <span className={"fr-hint-text"}>{hintText}</span>}
            </label>
            <MuiDsfrThemeProvider>
                <Autocomplete
                    disablePortal={true} // If true, the Popper content will be under the DOM hierarchy of the parent component.
                    /* renderOption={(props, option, state, ownerState) => {
                        return (
                            <Box
                                sx={{
                                    margin: 0,
                                    [`&.${autocompleteClasses.option}`]: {
                                        padding: 0,
                                        height: "20px",
                                    },
                                }}
                                component="li"
                                {...props}
                                key={option.name}
                            >
                                {ownerState.getOptionLabel(option)}
                            </Box>
                        );
                    }} */
                    size={"small"}
                    blurOnSelect={disableClearable !== true}
                    disableClearable={disableClearable ? disableClearable : false}
                    loading={searchQuery.isLoading}
                    loadingText={t("loading")}
                    noOptionsText={t("no_results")}
                    getOptionLabel={(option) => `${option.name} : ${option.title}`}
                    options={searchQuery.data?.content ?? []}
                    filterOptions={(x) => x}
                    renderInput={(params) => <TextField {...params} variant={"filled"} size={"small"} />}
                    isOptionEqualToValue={(option, v) => option.name === v.name}
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
            {state !== "default" && (
                <p
                    className={fr.cx(
                        (() => {
                            switch (state) {
                                case "error":
                                    return "fr-error-text";
                                case "success":
                                    return "fr-valid-text";
                            }
                        })(),
                        "fr-mb-1v"
                    )}
                >
                    {stateRelatedMessage}
                </p>
            )}
        </div>
    );
};

export default SearchGrids;
