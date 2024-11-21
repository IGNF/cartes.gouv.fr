import { fr } from "@codegouvfr/react-dsfr";
import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { useQuery } from "@tanstack/react-query";
import { FC, ReactNode, useMemo } from "react";
import { useDebounceValue } from "usehooks-ts";
import { isUser } from "../../../../../@types/app_espaceco";
import { UserDTO } from "../../../../../@types/espaceco";
import { useTranslation } from "../../../../../i18n/i18n";
import RQKeys from "../../../../../modules/espaceco/RQKeys";
import api from "../../../../api";

import "../../../../../sass/components/autocomplete.scss";

export type SearchUsersProps = {
    label: ReactNode;
    hintText?: ReactNode;
    value?: (UserDTO | string)[];
    state?: "default" | "error" | "success";
    stateRelatedMessage?: string;
    onChange: (users: (UserDTO | string)[]) => void;
};

const SearchUsers: FC<SearchUsersProps> = ({ label, hintText, value, state, stateRelatedMessage, onChange }) => {
    const { t } = useTranslation("Search");

    const [search, setSearch] = useDebounceValue("", 500);

    const searchQuery = useQuery<UserDTO[]>({
        queryKey: RQKeys.searchUsers(search),
        queryFn: ({ signal }) => {
            return api.user.search(search, signal);
        },
        staleTime: 1000 * 60,
        enabled: search.length >= 3,
    });

    const usernames = useMemo(() => {
        return value?.map((v) => (isUser(v) ? v.username : v));
    }, [value]);

    return (
        <div className={fr.cx("fr-input-group", state === "error" && "fr-input-group--error")}>
            <label className={fr.cx("fr-mb-2v", "fr-label")}>
                {label}
                {hintText && <span className={"fr-hint-text"}>{hintText}</span>}
            </label>
            <MuiDsfrThemeProvider>
                <Autocomplete
                    disablePortal={true} // If true, the Popper content will be under the DOM hierarchy of the parent component.
                    freeSolo={true}
                    multiple={true}
                    value={value}
                    size={"small"}
                    loading={searchQuery.isLoading}
                    loadingText={t("loading")}
                    noOptionsText={t("no_results")}
                    getOptionLabel={(option) => (typeof option === "string" ? option : option.username)}
                    options={searchQuery.data?.filter((u) => !usernames?.includes(u.username)) ?? []}
                    renderInput={(params) => <TextField {...params} />}
                    isOptionEqualToValue={(option, v) => {
                        if (isUser(option) && isUser(v)) return option.username === v.username;
                        if (typeof option !== typeof v) return false;
                        return option === v;
                    }}
                    onInputChange={(_, v) => setSearch(v)}
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

export default SearchUsers;
