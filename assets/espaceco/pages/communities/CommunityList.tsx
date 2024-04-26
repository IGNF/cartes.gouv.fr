import { FC } from "react";
import { CommunityResponseDTO } from "../../../@types/espaceco";
import CommunityListItem from "./CommunityListItem";

type CommunityListProps = {
    communities: CommunityResponseDTO[];
};

const CommunityList: FC<CommunityListProps> = ({ communities }) => {
    return (
        <div>
            {communities.map((community, index) => {
                const className = index % 2 === 0 ? "frx-community-even" : "";
                return <CommunityListItem key={community.id} className={className} community={community} />;
            })}
        </div>
    );
};

export default CommunityList;
