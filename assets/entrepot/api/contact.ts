import SymfonyRouting from "../../modules/Routing";

import { jsonFetch } from "../../modules/jsonFetch";

const joinCommunity = (formData: FormData | object) => {
    const url = SymfonyRouting.generate("cartesgouvfr_contact_join_community");
    return jsonFetch(
        url,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        },
        formData
    );
};

const contact = { joinCommunity };

export default contact;
