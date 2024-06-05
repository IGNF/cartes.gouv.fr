import { fr } from "@codegouvfr/react-dsfr";

import AppLayout from "../components/Layout/AppLayout";

const Offer = () => {
    return (
        <AppLayout documentTitle="Offre">
            <div className={fr.cx("fr-grid-row")}>
                <div className={fr.cx("fr-col-12", "fr-col-md-8")}>
                    <h1>Offre</h1>

                    <p>Contenu à rédiger</p>
                </div>
            </div>
        </AppLayout>
    );
};

export default Offer;
