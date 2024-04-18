import { FC } from "react";
import { getTranslation } from "../../../i18n/i18n";
import { CommunityUserResponseDtoRightsEnum } from "../../../@types/entrepot";

const { t } = getTranslation("Rights");

const rightTypes = ["community", "upload", "processing", "annex", "broadcast"] as const;

const getRights = () => {
    return rightTypes.map((type) => type.toUpperCase());
};

const getTranslatedRightTypes = () => {
    return rightTypes.map((type) => t(type));
};

const complete = (rights: CommunityUserResponseDtoRightsEnum[] | undefined): Record<string, boolean> => {
    const initRights = {};
    rightTypes.forEach((type) => {
        const upType = type.toUpperCase();
        initRights[upType] = false;
    });

    if (rights !== undefined) {
        rights.sort();
        rights.forEach((right) => (initRights[right] = true));
    }
    return initRights;
};

const UserRights: FC = () => {
    return (
        <ul>
            {rightTypes.map((type) => {
                const trans = t(type);
                const explain = t(`${type}_explain`);
                return <li key={type} dangerouslySetInnerHTML={{ __html: `<strong>${trans}</strong>&nbsp;:&nbsp;${explain}` }} />;
            })}
        </ul>
    );
};

export { rightTypes, getRights, getTranslatedRightTypes, complete, UserRights };
