import { fr } from "@codegouvfr/react-dsfr";
import AppLayout from "../../components/Layout/AppLayout";

import { Button } from "@codegouvfr/react-dsfr/Button";
import Translator from "../../modules/Translator";
import { routes } from "../../router/router";

const NewsletterConfirmEmail = () => {
    return (
        <AppLayout documentTitle="S’inscrire à la lettre d’information">
            <div className={fr.cx("fr-grid-row")}>
                <div className={fr.cx("fr-col-12", "fr-col-md-8")}>
                    <h1>S’inscrire à la lettre d’information</h1>

                    <p>Veuillez consultez vos emails pour confirmer votre inscription.</p>

                    <div className={fr.cx("fr-mt-10v")}>
                        <Button linkProps={routes.home().link}>{Translator.trans("pursue")}</Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default NewsletterConfirmEmail;