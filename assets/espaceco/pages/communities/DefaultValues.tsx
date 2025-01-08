import { DescriptionFormType, MembershipRequestType } from "../../../@types/app_espaceco";
import { CommunityResponseDTO } from "../../../@types/espaceco";

const getDescriptionDefaultValues = (community?: CommunityResponseDTO): DescriptionFormType => {
    const values = {
        name: community?.name || "",
        description: community?.description ?? "",
        keywords: community?.keywords ?? [],
        logo: null,
        listed: community?.listed ?? true,
    };

    let membershipRequest: MembershipRequestType | undefined;
    if (!community) {
        membershipRequest = "open";
    } else {
        const isOpenWithEmail = community.open_with_email !== null;
        membershipRequest = community.open_without_affiliation === true ? "open" : isOpenWithEmail ? "partially_open" : "not_open";
    }
    values["membershipRequest"] = membershipRequest;

    values["openWithEmail"] = [];
    // TODO Supprimer condition community.open_with_email
    if (community && community.open_with_email) {
        values["openWithEmail"] = community.open_with_email;
    }

    return values as DescriptionFormType;
};

export { getDescriptionDefaultValues };
