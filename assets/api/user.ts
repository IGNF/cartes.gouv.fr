import SymfonyRouting from "../modules/Routing";

import { jsonFetch } from "../modules/jsonFetch";
import { Datastore } from "../types/app";
import {
    PermissionWithOfferingsDetailsResponseDto,
    UserKeyCreateDtoUserKeyInfoDto,
    UserKeyDetailsResponseDtoUserKeyInfoDto,
    UserKeyResponseDto,
} from "../types/entrepot";

const getMe = () => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_user_me");
    return jsonFetch(url);
};

const getDatastoresList = (otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_user_datastores_list");
    return jsonFetch<Datastore[]>(url, { ...otherOptions });
};

const getMyKeys = (otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_user_keys");
    return jsonFetch<UserKeyResponseDto[]>(url, {
        ...otherOptions,
    });
};

const getMyPermissions = (otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_user_permissions");
    return jsonFetch<PermissionWithOfferingsDetailsResponseDto[]>(url, {
        ...otherOptions,
    });
};

const addKey = (formData: UserKeyCreateDtoUserKeyInfoDto | object) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_user_add_key");
    return jsonFetch<UserKeyDetailsResponseDtoUserKeyInfoDto>(
        url,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        },
        formData
    );
};

const removeKey = (key: string) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_user_remove_key", { key });
    return jsonFetch<null>(url, { method: "DELETE" });
};

const addToSandbox = () => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_user_add_to_sandbox");
    return jsonFetch<undefined>(url, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
    });
};

const user = {
    getMe,
    getDatastoresList,
    getMyKeys,
    getMyPermissions,
    addKey,
    removeKey,
    addToSandbox,
};

export default user;
