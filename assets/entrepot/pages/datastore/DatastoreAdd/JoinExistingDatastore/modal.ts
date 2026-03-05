import { createModal } from "@codegouvfr/react-dsfr/Modal";

export const joinModal = createModal({
    id: "datastore-join-modal",
    isOpenedByDefault: false,
});

export const successModal = createModal({
    id: "datastore-join-success-modal",
    isOpenedByDefault: false,
});
