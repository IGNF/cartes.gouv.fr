import SymfonyRouting from "../modules/Routing";

import { jsonFetch } from "../modules/jsonFetch";
import { Datastore, UserKeysWithAccessesResponseDto } from "../types/app";
import {
    PermissionDetailsResponseDto,
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

const getMyKeysWithAccesses = (otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_user_keys_with_accesses");
    return jsonFetch<UserKeysWithAccessesResponseDto[]>(url, {
        ...otherOptions,
    });
};

const getMyPermissions = (otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_user_permissions");
    return jsonFetch<PermissionWithOfferingsDetailsResponseDto[]>(url, {
        ...otherOptions,
    });
};

const getMyDetailedPermissions = (otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_user_permissions_detailed");
    return jsonFetch<PermissionDetailsResponseDto[]>(url, {
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
    getMyKeysWithAccesses,
    getMyPermissions,
    getMyDetailedPermissions,
    addKey,
    removeKey,
    addToSandbox,
};

export default user;
