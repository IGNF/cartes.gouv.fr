import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { FC } from "react";
import { CommunityResponseDTO } from "../../../@types/espaceco";
import useToggle from "../../../hooks/useToggle";
import { useTranslation } from "../../../i18n/i18n";

import placeholder1x1 from "../../../img/placeholder.1x1.png";

import "../../../sass/pages/espaceco/community.scss";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";

type CommunityListItemProps = {
    className?: string;
    community: CommunityResponseDTO;
};
const CommunityListItem: FC<CommunityListItemProps> = ({ className, community }) => {
    const { t } = useTranslation("EspaceCoCommunities");

    const [showDescription, toggleShowDescription] = useToggle(false);

    /*const dataUsesQuery = useQuery({
        queryKey: RQKeys.datastore_stored_data_uses(datastoreId, vectorDb._id),
        queryFn: ({ signal }) => api.storedData.getUses(datastoreId, vectorDb._id, { signal }),
        staleTime: 600000,
    }); */

    return (
        <>
            <div className={cx(fr.cx("fr-grid-row", "fr-my-2v", "fr-py-2v"), className ?? "")}>
                <div className={fr.cx("fr-col-5")}>
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--left", "fr-grid-row--middle")}>
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
                <div className={fr.cx("fr-col-7", "fr-px-2v")}>
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")} dangerouslySetInnerHTML={{ __html: community.description ?? "" }} />
                </div>
            </div>
            {community.detailed_description && <div className={fr.cx("fr-grid-row")} dangerouslySetInnerHTML={{ __html: community.detailed_description }} />}
        </>
    );
};

export default CommunityListItem;
