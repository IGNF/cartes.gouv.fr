import { fr } from "@codegouvfr/react-dsfr";
import AppLayout from "../components/Layout/AppLayout";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import Button from "@codegouvfr/react-dsfr/Button";
import { createPortal } from "react-dom";
import AddStyleForm from "../components/AddStyleForm/AddStyleForm";
// import { useQuery } from "@tanstack/react-query";
import api from "../api";

api.annexe.addCapabilities("190b714d-daa7-402b-8360-c75baa4c69cc", "18ff6dd1-8216-4f2f-8f91-6f84ba3f6727").then(() => {
    console.log("GetCapablities success");
});

const styleModal = createModal({
    id: "style-modal",
    isOpenedByDefault: false,
});

const Tries = () => {
    const handleClick = () => {
        styleModal.open();
    };
    return (
        <AppLayout documentTitle="Essais personnels">
            <div className={fr.cx("fr-grid-row")}>
                <div className={fr.cx("fr-col-12", "fr-col-md-8")}>
                    <h1>Essais personnels</h1>
                    <Button onClick={handleClick}>Ajouter un style</Button>
                </div>
            </div>
            <>
                {createPortal(
                    <styleModal.Component
                        title={"Ajouter un style"}
                        size={"large"}
                        // buttons={[
                        //     {
                        //         children: "Annuler",
                        //         doClosesModal: true,
                        //         priority: "secondary",
                        //     },
                        //     {
                        //         children: "Ajouter le style",
                        //         // onClick: handleOk,
                        //         doClosesModal: true,
                        //         priority: "primary",
                        //     },
                        // ]}
                    >
                        <AddStyleForm styleNames={[]} close={styleModal.close} />
                    </styleModal.Component>,
                    document.body
                )}
            </>
        </AppLayout>
    );
};

export default Tries;
