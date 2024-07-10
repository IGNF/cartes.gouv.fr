import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { FC } from "react";
import { CommunityResponseDTO } from "../../../@types/espaceco";
import useToggle from "../../../hooks/useToggle";
import { useTranslation } from "../../../i18n/i18n";

import placeholder1x1 from "../../../img/placeholder.1x1.png";

import "../../../sass/pages/espaceco/community.scss";
import { routes } from "../../../router/router";

type CommunityListItemProps = {
    className?: string;
    community: CommunityResponseDTO;
};
const CommunityListItem: FC<CommunityListItemProps> = ({ className, community }) => {
    const { t } = useTranslation("CommunityList");
    const { t: tCommon } = useTranslation("Common");

    const [showDescription, toggleShowDescription] = useToggle(false);

    return (
        <>
            <div className={cx(fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-my-2v", "fr-my-2v", "fr-p-2v"), className ?? "")}>
                <div className={fr.cx("fr-col-5")}>
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-grid-row--left")}>
                        <Button
                            iconId={showDescription ? "ri-subtract-fill" : "ri-add-fill"}
                            size="small"
                            title={t("show_details")}
                            className={fr.cx("fr-mr-2v")}
                            priority="secondary"
                            onClick={toggleShowDescription}
                        />
                        <img
                            src={community.logo_url ? community.logo_url : placeholder1x1}
                            width={"48px"}
                            height={"48px"}
                            onError={({ currentTarget }) => {
                                currentTarget.onerror = null; // prevents looping
                                currentTarget.src = placeholder1x1;
                            }}
                        />
                        <span className={fr.cx("fr-ml-2v")}>{community.name}</span>
                    </div>
                </div>
                <div className={fr.cx("fr-col-5", "fr-px-2v")}>
                    <div dangerouslySetInnerHTML={{ __html: community.description ?? "" }} />
                </div>
                <div className={fr.cx("fr-grid-row", "fr-grid-row--right", "fr-col-1", "fr-px-2v")}>
                    <Button
                        title={tCommon("modify")}
                        priority="secondary"
                        iconId="fr-icon-edit-line"
                        size="small"
                        onClick={() => {
                            routes.espaceco_manage_community({ communityId: community.id }).push();
                        }}
                    />
                </div>
            </div>
            {community.detailed_description && <div className={fr.cx("fr-grid-row")} dangerouslySetInnerHTML={{ __html: community.detailed_description }} />}
        </>
    );
};

export default CommunityListItem;
