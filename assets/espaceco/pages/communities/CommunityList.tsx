import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { FC } from "react";
import { CommunityResponseDTO } from "../../../@types/espaceco";
import CommunityListItem from "./CommunityListItem";
import { CommunityListFilter } from "../../../@types/app_espaceco";
import { useTranslation } from "../../../i18n/i18n";

type CommunityListProps = {
    communities: CommunityResponseDTO[];
    filter: CommunityListFilter;
};

const CommunityList: FC<CommunityListProps> = ({ communities, filter }) => {
    const { t } = useTranslation("EspaceCoCommunities");

    return (
        <div>
            {communities.length === 0 ? (
                <div className={fr.cx("fr-my-2v")}>
                    <Alert severity={"info"} title={t("no_result", { filter: filter })} closable />
                </div>
            ) : (
                communities.map((community, index) => {
                    const className = index % 2 === 0 ? "frx-community-even" : "";
                    return <CommunityListItem key={community.id} className={className} community={community} />;
                })
            )}
        </div>
    );
};

export default CommunityList;
