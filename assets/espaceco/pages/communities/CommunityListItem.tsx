import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { FC, useMemo } from "react";

import { CommunityResponseDTO } from "../../../@types/espaceco";
import useToggle from "../../../hooks/useToggle";
import { useTranslation } from "../../../i18n/i18n";
import placeholder1x1 from "../../../img/placeholder.1x1.png";
import { routes } from "../../../router/router";

import "../../../sass/pages/espaceco/community.scss";

type CommunityListItemProps = {
    className?: string;
    community: CommunityResponseDTO;
};

const CommunityListItem: FC<CommunityListItemProps> = ({ className, community }) => {
    const { t } = useTranslation("EspaceCoCommunityList");
    const { t: tCommon } = useTranslation("Common");

    const [showDescription, toggleShowDescription] = useToggle(false);
    const buttonProps = useMemo(() => {
        return community.active
            ? { link: routes.espaceco_manage_community({ communityId: community.id }).link, title: tCommon("modify") }
            : { link: routes.espaceco_create_community({ communityId: community.id }).link, title: t("append_community") };
    }, [community, t, tCommon]);

    return (
        <>
            <div className={cx(fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-my-2v", "fr-my-2v", "fr-p-2v"), className ?? "")}>
                <div className={fr.cx("fr-col-7")}>
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
                <div className={fr.cx("fr-grid-row", "fr-grid-row--right", "fr-col-5", "fr-px-2v")}>
                    <Button priority="secondary" size="small" linkProps={buttonProps.link}>
                        {buttonProps.title}
                    </Button>
                </div>
            </div>

            {showDescription && (
                <div style={{ backgroundColor: fr.colors.decisions.background.default.grey.default }}>
                    {community.description ? (
                        <p dangerouslySetInnerHTML={{ __html: community.description }} />
                    ) : (
                        "Aucune description n’a été renseignée sur ce guichet"
                    )}
                </div>
            )}
        </>
    );
};

export default CommunityListItem;
