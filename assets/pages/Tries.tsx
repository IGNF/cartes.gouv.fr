import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { useState } from "react";

import AppLayout from "../components/Layout/AppLayout";

const Tries = () => {
    const [count, setCount] = useState(0);

    return (
        <AppLayout documentTitle="Essais personnels">
            <div className={fr.cx("fr-grid-row")}>
                <div className={fr.cx("fr-col-12", "fr-col-md-8")}>
                    <h1>Essais personnels</h1>
                    <Button onClick={() => setCount(count + 1)}>Incrémenter </Button>
                    <span>Compteur : {count}</span>
                </div>
            </div>
        </AppLayout>
    );
};

export default Tries;
