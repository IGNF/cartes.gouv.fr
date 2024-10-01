import SymfonyRouting from "../../modules/Routing";

import { CartesUser, Datastore, UserKeyDetailedWithAccessesResponseDto, UserKeyWithAccessesResponseDto } from "../../@types/app";
import { PermissionWithOfferingsDetailsResponseDto, UserKeyCreateDtoUserKeyInfoDto, UserKeyResponseDto, UserKeyUpdateDto } from "../../@types/entrepot";
import { jsonFetch } from "../../modules/jsonFetch";

const getMe = (otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_user_me");
    return jsonFetch<CartesUser>(url, { ...otherOptions });
};

const getDatastoresList = (otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_user_datastores_list");
    return jsonFetch<Datastore[]>(url, { ...otherOptions });
};

/* Retourne la cle detaillee de l'utilisateur courant avec ses access */
const getMyKeyDetailedWithAccesses = (keyId: string, otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_user_key_with_accesses", { keyId: keyId });
    return jsonFetch<UserKeyDetailedWithAccessesResponseDto>(url, {
        ...otherOptions,
    });
};

/* Retourne les cles de de l'utilisateur courant */
const getMyKeys = (otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_user_keys");
    return jsonFetch<UserKeyResponseDto[]>(url, {
        ...otherOptions,
    });
};

/* Retourne les cles de de l'utilisateur courant avec leur acces */
const getMyKeysDetailedWithAccesses = (otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_user_keys_detailed_with_accesses");
    return jsonFetch<UserKeyDetailedWithAccessesResponseDto[]>(url, {
        ...otherOptions,
    });
};

/* Retourne les permissions de l'utilisateur */
const getMyPermissions = (otherOptions: RequestInit = {}) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_user_permissions");
    return jsonFetch<PermissionWithOfferingsDetailsResponseDto[]>(url, {
        ...otherOptions,
    });
};

const addKey = (formData: UserKeyCreateDtoUserKeyInfoDto | object) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_user_add_key");
    return jsonFetch<UserKeyWithAccessesResponseDto>(
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

const updateKey = (keyId: string, formData: UserKeyUpdateDto | object) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_user_update_key", { keyId: keyId });
    return jsonFetch<null>(
        url,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        },
        formData
    );
};

const removeKey = (keyId: string) => {
    const url = SymfonyRouting.generate("cartesgouvfr_api_user_remove_key", { keyId: keyId });
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
    getMyKeyDetailedWithAccesses,
    getMyKeysDetailedWithAccesses,
    getMyPermissions,
    addKey,
    updateKey,
    removeKey,
    addToSandbox,
};

export default user;
