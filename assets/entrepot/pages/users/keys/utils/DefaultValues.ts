import { IPListName, KeyFormValuesType, UserKeyDetailedWithAccessesResponseDto, UserKeyInfoDtoTypeEnum } from "../../../../../@types/app";
import { BasicInfoDto, HashInfoDto, UserKeyDetailsResponseDtoUserKeyInfoDtoTypeEnum } from "../../../../../@types/entrepot";
import AccessesTransformer from "./AccessesTransformer";

const UserKeyDefaultValues: KeyFormValuesType = {
    name: "",
    type: UserKeyInfoDtoTypeEnum.HASH,
    type_infos: { hash: "" },
    ip_list_name: "none",
    ip_list_addresses: [],
    user_agent: "",
    referer: "",
    accesses: [
        /*{
            permission: "1eb4b782-7672-4ed1-8c4a-5172cfed4394",
            offerings: ["6c67e296-c399-456f-942f-8816a5766e2b", "17c8e804-4651-471b-8d08-410859307ccb"],
        },*/
    ],
};

const getDefaultValues = (editMode: boolean, key: UserKeyDetailedWithAccessesResponseDto): KeyFormValuesType => {
    if (!editMode) return UserKeyDefaultValues;

    let typeInfos = {};
    if (key.type === UserKeyDetailsResponseDtoUserKeyInfoDtoTypeEnum.HASH) {
        typeInfos = key.type_infos as HashInfoDto;
    } else if (key.type === UserKeyDetailsResponseDtoUserKeyInfoDtoTypeEnum.BASIC) {
        typeInfos = key.type_infos as BasicInfoDto;
    }

    const ipName = key.whitelist?.length !== 0 ? "whitelist" : key.blacklist?.length !== 0 ? "blacklist" : "none";
    const accesses = AccessesTransformer.transformToArray(key.accesses);

    return {
        name: key.name,
        type: key.type as unknown as UserKeyInfoDtoTypeEnum,
        type_infos: typeInfos,
        ip_list_name: ipName as IPListName,
        ip_list_addresses: (ipName !== "none" ? key[ipName] : []) ?? [],
        user_agent: key.user_agent ?? "",
        referer: key.referer ?? "",
        accesses: accesses,
    };
};

export { UserKeyDefaultValues, getDefaultValues };
