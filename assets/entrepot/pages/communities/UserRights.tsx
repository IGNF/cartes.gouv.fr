import { fr } from "@codegouvfr/react-dsfr";
import Tooltip from "@codegouvfr/react-dsfr/Tooltip";
import { FC, Fragment } from "react";

import { CommunityUserResponseDtoRightsEnum } from "../../../@types/entrepot";
import { getTranslation } from "../../../i18n/i18n";

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
        <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
            <div
                className={fr.cx("fr-col-12", "fr-text--xs")}
                style={{
                    display: "flex",
                    alignItems: "center",
                }}
            >
                <strong className={fr.cx("fr-mr-2v")}>Droits</strong>

                {rightTypes.map((type) => (
                    <Fragment key={type}>
                        <Tooltip kind="click" title={t(`${type}_explain`)} />
                        <span className={fr.cx("fr-mr-2v")}> {t(type)}</span>
                    </Fragment>
                ))}
            </div>
        </div>
    );
};

export { complete, getRights, getTranslatedRightTypes, rightTypes, UserRights };
