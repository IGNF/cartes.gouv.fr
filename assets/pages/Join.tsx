import { fr } from "@codegouvfr/react-dsfr";

import AppLayout from "../components/Layout/AppLayout";

const Join = () => {
    return (
        <AppLayout documentTitle="Nous rejoindre">
            <div className={fr.cx("fr-grid-row")}>
                <div className={fr.cx("fr-col-12", "fr-col-md-8")}>
                    <h1>Nous rejoindre</h1>

                    <p>Contenu à rédiger</p>
                </div>
            </div>
        </AppLayout>
    );
};

export default Join;
