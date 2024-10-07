import { UserSharedThemesDTO } from "../../@types/espaceco";
import { jsonFetch } from "../../modules/jsonFetch";
import SymfonyRouting from "../../modules/Routing";

const getSharedThemes = () => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_espaceco_user_shared_themes");
    return jsonFetch<UserSharedThemesDTO[]>(url);
};

const user = { getSharedThemes };

export default user;
