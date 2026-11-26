import { fr } from "@codegouvfr/react-dsfr";
import { FC } from "react";

import { CommunityResponseDTO } from "../../../@types/espaceco";
import CommunityListItem from "./CommunityListItem";

type CommunityListProps = {
    communities: CommunityResponseDTO[];
};

const CommunityList: FC<CommunityListProps> = ({ communities }) => {
    return (
        <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters")}>
            {communities.map((community) => (
                <div className={fr.cx("fr-col-12")} key={community.id}>
                    <CommunityListItem community={community} />
                </div>
            ))}
        </div>
    );
};

export default CommunityList;
