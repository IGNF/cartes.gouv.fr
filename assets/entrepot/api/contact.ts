import SymfonyRouting from "../../modules/Routing";

import { jsonFetch } from "../../modules/jsonFetch";

const joinCommunity = (formData: object) => {
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

const requestDatastoreDeletion = (data: object) => {
    const url = SymfonyRouting.generate("cartesgouvfr_contact_datastore_deletion_request");
    return jsonFetch(
        url,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        },
        data
    );
};

const requestPrivateServicesAccess = (data: object) => {
    const url = SymfonyRouting.generate("cartesgouvfr_contact_accesses_request");
    return jsonFetch(
        url,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        },
        data
    );
};

const contact = { joinCommunity, requestDatastoreDeletion, requestPrivateServicesAccess };

export default contact;
