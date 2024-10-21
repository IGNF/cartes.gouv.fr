import { UserDTO, UserSharedThemesDTO } from "../../@types/espaceco";
import { jsonFetch } from "../../modules/jsonFetch";
import SymfonyRouting from "../../modules/Routing";

const getSharedThemes = () => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_espaceco_user_shared_themes");
    return jsonFetch<UserSharedThemesDTO[]>(url);
};

const search = (search: string, signal: AbortSignal) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_espaceco_user_search", { search });
    return jsonFetch<UserDTO[]>(url, {
        method: "GET",
        signal: signal,
    });
};

const user = { search, getSharedThemes };

export default user;
