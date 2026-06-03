import { useQuery } from "@tanstack/react-query";
import { FC, ReactNode, useMemo } from "react";
import { useDebouncedState } from "@mantine/hooks";
import { isUser } from "../../../../../@types/app_espaceco";
import { UserDTO } from "../../../../../@types/espaceco";
import AutocompleteSelect from "../../../../../components/Input/AutocompleteSelect";
import { useTranslation } from "../../../../../i18n/i18n";
import RQKeys from "../../../../../modules/espaceco/RQKeys";
import api from "../../../../api";
import isEmail from "validator/lib/isEmail";

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

    const [search, setSearch] = useDebouncedState("", 500);

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
        <AutocompleteSelect
            label={label}
            hintText={hintText}
            state={state}
            stateRelatedMessage={stateRelatedMessage}
            freeSolo={true}
            multiple={true}
            value={value}
            loading={searchQuery.isLoading}
            loadingText={t("loading")}
            noOptionsText={t("no_results")}
            getOptionLabel={(option) => (typeof option === "string" ? option : option.username)}
            options={searchQuery.data?.filter((u) => !usernames?.includes(u.username)) ?? []}
            isOptionEqualToValue={(option, selectedValue) => {
                if (isUser(option) && isUser(selectedValue)) return option.username === selectedValue.username;
                if (typeof option !== typeof selectedValue) return false;
                return option === selectedValue;
            }}
            onInputChange={(_, inputValue) => setSearch(inputValue)}
            onChange={(_, selectedValue) => {
                const arr = Array.isArray(selectedValue) ? selectedValue : [];
                onChange(arr.filter((item) => isUser(item) || isEmail(item)));
            }}
        />
    );
};

export default SearchUsers;
