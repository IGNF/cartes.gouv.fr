import { fr } from "@codegouvfr/react-dsfr";
import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";
import Autocomplete, { autocompleteClasses } from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { useQuery } from "@tanstack/react-query";
import { FC, ReactNode } from "react";
import { useDebounceValue } from "usehooks-ts";
import { GetResponse, SearchGridFilters } from "../../../../../@types/app_espaceco";
import { Grid } from "../../../../../@types/espaceco";
import { useTranslation } from "../../../../../i18n/i18n";
import RQKeys from "../../../../../modules/espaceco/RQKeys";
import api from "../../../../api";

export type SearchGridsProps = {
    label: ReactNode;
    hintText?: ReactNode;
    filters: SearchGridFilters;
    state?: "default" | "error" | "success";
    stateRelatedMessage?: string;
    onChange: (grid: Grid | null) => void;
};

const SearchGrids: FC<SearchGridsProps> = ({ label, hintText, filters, state, stateRelatedMessage, onChange }) => {
    const { t } = useTranslation("Search");

    const [text, setText] = useDebounceValue("", 500);

    const searchQuery = useQuery<GetResponse<Grid>>({
        queryKey: RQKeys.searchGrids(text),
        queryFn: async ({ signal }) => {
            return api.grid.search(text, filters, { signal });
        },
        staleTime: 1000 * 60,
        enabled: text.length >= 2,
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
                    renderOption={(props, option, state, ownerState) => {
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
                    }}
                    size={"small"}
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
                        onChange(v);
                    }}
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
